const express = require('express');
const router = express.Router();

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
 * 用户注册
 * role 角色
 * referrer_user_id 推荐人（非必填）
 * username 用户名
 * password 密码
 * email E-mail
 * qq 联系QQ
 * mobile 手机号
 * password_security 安全密码
 */
router.post('/register', async (req, res) => {
  // console.log(req.headers);

  // 必传参数，检查字段是否存在或者是否为空
  let paramsArr = ['role', 'username', 'password', 'email', 'qq', 'mobile', 'password_security'];
  if (!checkParams(paramsArr, req.body, res)) return

  let { role, referrer_user_id, username, password, email, qq, mobile, password_security } = req.body;
  password = md5(password + '_hot')
  password_security = md5(password_security + '_hot')

  // 验证用户名是否存在
  let usernameSql = `select * from user where username = '${username}'`;
  let usernameData = await db(usernameSql);

  if(usernameData.length > 0) {
    res.json({ success: false, msg: '此用户名已存在', data: null })
    return
  }

  // 验证邮箱是否存在
  let emailSql = `select * from user where email = '${email}'`;
  let emailData = await db(emailSql);

  if(emailData.length > 0) {
    res.json({ success: false, msg: '此邮箱已存在', data: null })
    return
  }

  // 验证QQ是否存在
  let qqSql = `select * from user where qq = '${qq}'`;
  let qqData = await db(qqSql);

  if(qqData.length > 0) {
    res.json({ success: false, msg: '此QQ已存在', data: null })
    return
  }

  // let sql = `select * from user where username = '${username}' and password = '${password}'`;
  // let user = await db(sql);

  // if (user.length > 0) {
  //   let { token, expires } = createToken({ username: user[0].username, password: user[0].password }); // 返回token

  //   // 把token存入数据库
  //   let tokenSql = `update user set token = '${token}', last_login_time = '${dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")}' where username = '${username}'`;
  //   await db(tokenSql);

  //   res.json({ success: true, msg: "登录成功", data: { access_token: token, expires } })
  // } else {
  //   res.json({ success: false, msg: "账号或密码错误，请重新输入", data: null })
  // }
});


/**
 * 验证用户名是否存在
 */
router.get('/check/username', async (req,res) => {

  let paramsArr = ['username'];
  if (!checkParams(paramsArr, req.query, res)) return

  const { username } = req.query

  let sql = `select * from user where username = '${username}'`;
  let data = await db(sql);

  if(data.length > 0) {
    res.json({ success: false, msg: '此用户名已存在', data: null })
  } else {
    res.json({ success: true, msg: '此用户名可使用', data: null })
  }
});


/**
 * 验证邮箱是否存在
 */
router.get('/check/email', async (req,res) => {

  let paramsArr = ['email'];
  if (!checkParams(paramsArr, req.query, res)) return

  const { email } = req.query

  let sql = `select * from user where email = '${email}'`;
  let data = await db(sql);

  if(data.length > 0) {
    res.json({ success: false, msg: '此邮箱已存在', data: null })
  } else {
    res.json({ success: true, msg: '此邮箱可使用', data: null })
  }
});


/**
 * 验证QQ是否存在
 */
router.get('/check/qq', async (req,res) => {

  let paramsArr = ['qq'];
  if (!checkParams(paramsArr, req.query, res)) return

  const { qq } = req.query

  let sql = `select * from user where qq = '${qq}'`;
  let data = await db(sql);

  if(data.length > 0) {
    res.json({ success: false, msg: '此QQ已存在', data: null })
  } else {
    res.json({ success: true, msg: '此QQ可使用', data: null })
  }
});



/**
 * 获取用户列表
 * page 当前页
 * pageNum 一页的条数
 */
router.get('/list', async (req, res) => {
  // console.log(req.headers);

  // 必传参数，检查字段是否存在或者是否为空
  let paramsArr = ['page', 'pageNum'];
  if (!checkParams(paramsArr, req.query, res)) return

  let {
    page,
    pageNum
  } = req.query;

  let sql = 'select * from user';

  // 分页
  if (page || pageNum) {
    page = Number(page);
    pageNum = Number(pageNum);

    // page校验
    if(page < 1) {
      res.json({ success: false, msg: 'page必须大于0', data: null })
      return
    }
    sql += ` limit ${(page - 1) * pageNum},${pageNum}`;
  }

  // 获取用户总数
  let userTotalSql = 'select count(id) count from user';
  let count = await db(userTotalSql);

  // 获取所有用户
  let data = await db(sql);

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
 * @api {get} /users/userinfo 查询用户信息
 * @apiDescription 查询用户信息
 * @apiName userinfo
 * @apiGroup user
 * @apiHeader {string} authorization 用户token
 * @apiSuccess {boolean} success 成功：true，失败：false
 * @apiSuccess {string} msg 提示信息
 * @apiSuccess {json} data 返回结果
 * @apiSuccessExample {json} Success-Response:
 * {
 *    "success": true,
 *    "msg": "",
 *    "data": {}
 * }
 * @apiSampleRequest http://192.168.1.5:3000/users/userinfo
 * @apiVersion 1.0.0
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
 * @api {post} /users/update/headimg 修改用户图片
 * @apiDescription 修改用户图片
 * @apiName updateheadimg
 * @apiGroup user
 * @apiHeader {string} authorization 用户token
 * @apiSuccess {boolean} success 成功：true，失败：false
 * @apiSuccess {string} msg 提示信息
 * @apiSuccess {json} data 返回结果
 * @apiSuccessExample {json} Success-Response:
 * {
 *    "success": true,
 *    "msg": "",
 *    "data": {}
 * }
 * @apiSampleRequest http://192.168.1.5:3000/users/update/headimg
 * @apiVersion 1.0.0
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