/**
 * 用户相关接口
 */
const express = require('express');
const router = express.Router();
const md5 = require('js-md5');
const dateformat = require('dateformat');

const createToken = require("../token/createToken"); // 创建token
const {
  checkParams
} = require('../modules/global'); // 公共方法

// 上传图片
const multer = require('multer');
// const upload = multer({dest: 'public/uploads'})
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename(req, file, cb) {
    // console.log(file);
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});
const upload = multer({
  storage
})

const db = require('../modules/mysql');

/**
 * 根据uid查询推荐人
 * referrer_user_id 上级的user_id（必填）
 */
router.get('/referrer_username', async (req, res) => {
  console.log(req.query)

  let paramsArr = ['referrer_user_id'];
  if (!checkParams(paramsArr, req.query, res)) return

  const {
    referrer_user_id
  } = req.query

  let sql = `select username from user where id = '${referrer_user_id}'`;
  let data = await db(sql);

  res.json({
    success: true,
    msg: null,
    data: data[0].username
  })
});

/**
 * 获取用户列表
 * page 当前页
 * pageNum 一页的条数
 * 模糊搜索：编号(id)，用户名(username)，师傅(referrer_username)，E-mail(email)，QQ(qq)，手机号(mobile)，冻结原因(freeze_reason)，真实姓名(name)，身份证号码(idcardno)（非必填）
 * 精准搜索：角色(role)，是否被冻结(freeze_status)，vip(isVip)，实名状态(real_status)，是否绑定了平台账号(isPlatform)，注册时间(create_time)，最后登录时间(last_login_time)（非必填）
 */
router.post('/list', async (req, res) => {
  // console.log(req.headers);
  // console.log(req.body);
  // console.log(req.body.create_time);
  // return;

  // 必传参数，检查字段是否存在或者是否为空
  let paramsArr = ['page', 'pageNum'];
  if (!checkParams(paramsArr, req.body, res)) return;
  // console.log(req.query)

  // 注意：get请求的参数传过来都是字符串类型，post请求的application/x-www-form-urlencoded传过来都是字符串类型
  let {
    page,
    pageNum,
    searchVal = '',
    role,
    freeze_status,
    isVip,
    real_status,
    isPlatform,
    create_time,
    last_login_time
  } = req.body;

  // 使用左连接，查询referrer_user_id对应的id的username(referrer_username)师傅
  let sql = `select a.*, b.username referrer_username, (select count(*) from user where a.id = referrer_user_id) referrer_num from user a left join user b on a.referrer_user_id = b.id`;

  // 模糊搜索：编号(id)，用户名(username)，E-mail(email)，QQ(qq)，手机号(mobile)，冻结原因(freeze_reason)，真实姓名(name)，身份证号码(idcardno)（一定要为''空字符串，不能为undefined，否则报错）
  sql += ` where (a.id like '%${searchVal}%' or a.username like '%${searchVal}%' or a.email like '%${searchVal}%' or a.qq like '%${searchVal}%' or a.mobile like '%${searchVal}%' or a.freeze_reason like '%${searchVal}%' or a.name like '%${searchVal}%' or a.idcardno like '%${searchVal}%')`;

  // 精准搜索：角色(role)，是否被冻结(freeze_status)，vip(isVip)，实名状态(real_status)，是否绑定了平台账号(isPlatform)，注册时间(create_time)，最后登录时间(last_login_time)
  // 不传是undefined，传空字符串则也查找0的数据，所以不传和传空都不处理，传了则进行查询（可以不需要数字类型，可以是字符串类型，因为查询结果一样）
  let searchObj = {
    role,
    freeze_status,
    isVip,
    real_status,
    isPlatform
  };

  for (let key in searchObj) {
    // console.log(key, searchObj[key])
    if (searchObj[key] !== undefined && searchObj[key] !== '') {
      if (sql.includes('where')) {
        sql += ` and`;
      } else {
        sql += ` where`;
      }
      sql += ` ${key} = ${searchObj[key]}`;
    }
  }
  console.log(sql);

  // 查询注册时间
  if (create_time) {
    sql += ` and a.create_time between '${create_time[0]}' and '${create_time[1]}'`;
  }
  // 查询最后登录时间
  if (last_login_time) {
    sql += ` and a.last_login_time between '${last_login_time[0]}' and '${last_login_time[1]}'`;
  }

  // sql += ' group by a.referrer_user_id';

  // 分页（需要数字类型）
  if (page || pageNum) {
    page = Number(page);
    pageNum = Number(pageNum);

    // page校验
    if (page < 1) {
      res.json({
        success: false,
        msg: 'page必须大于0',
        data: null
      })
      return
    }
    sql += ` limit ${(page - 1) * pageNum},${pageNum}`;
  }

  // 获取用户总数
  let userTotalSql = 'select count(id) count from user';
  let count = await db(userTotalSql);

  // 获取所有用户
  let data = await db(sql);

  // 筛选password，password_security，token不返回
  data.forEach(item => {
    delete item.password
    delete item.password_security
    delete item.token
  })

  res.json({
    success: true,
    msg: '',
    data: {
      lists: data,
      total: count[0].count
    }
  })
});


/**
 * 实名认证审核
 * id 用户编号
 * real_status 实名状态/审核状态 （必填，0 未实名，1 待审核，2 审核不通过，3 已实名）
 * real_reason 实名审核不通过原因（非必填，real_status为2时必填）
 */
router.post('/identity/status', async (req, res) => {
  // 必传参数，检查字段是否存在或者是否为空
  let paramsArr = ['id', 'real_status'];
  if (!checkParams(paramsArr, req.body, res)) return;

  // let {
  //   id,
  //   real_status,
  //   real_reason
  // }

  let sql = `update user set real_status = '${real_status}' where id = ${id}`;

});


/**
 * 查询用户信息
 */
router.get('/userinfo', async (req, res) => {
  const token = req.headers.authorization;
  // console.log(token)

  let sql = `select * from users where token = '${token}'`;
  let users = await db(sql)

  if (users.length > 0) {
    res.json({
      success: true,
      msg: "",
      data: users[0]
    })
  } else {
    res.json({
      success: false,
      msg: "无此用户信息",
      data: null
    })
  }
});



/**
 * 修改用户图片
 */
router.post('/update/headimg', upload.single('headimg'), async (req, res) => {
  const token = req.headers.authorization;

  // console.log(token);
  // console.log(req.file);
  const host = `${req.protocol}://${req.headers.host}`;
  const headimg = `${host}/uploads/${req.file.filename}`

  let sql = `update users set headimg = '${headimg}' where token = '${token}'`;
  let user = await db(sql)

  if (user.affectedRows > 0) {
    res.json({
      success: true,
      msg: "修改头像成功",
      data: {
        headimg
      }
    })
  } else {
    res.json({
      success: false,
      msg: "修改头像失败",
      data: null
    })
  }
});


/**
 * 购买金币
 */
router.post('/gold/buy', async (req, res) => {

});

module.exports = router;