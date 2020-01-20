const express = require('express');
const router = express.Router();
const md5 = require('js-md5');
const dateFormat = require('dateformat');

const request = require('request'); // 处理node request请求
const wx = require('../utils/wxconfig.json'); // 微信小程序设置，appid和secret

const db = require('../modules/mysql'); // mysql
const createToken = require("../token/createToken"); // 创建token
const checkToken = require('../token/checkToken'); // 检查token

const { checkParams } = require('../modules/global'); // 公共方法

const whileArr = ['/login', '/register', '/wxlogin', '/qqlogin']; // 免检查token白名单

// 路由中间件，验证token是否过期
router.use(async (req, res, next) => {
  // console.log(req.headers);
  // console.log(req.headers.host);
  // console.log(req.protocol);
  // console.log(req.baseUrl);
  // console.log(req.hostname);
  // console.log(req.route);
  let token = req.headers.authorization;

  if (whileArr.includes(req.path)) {
    next();
  } else {
    try {
      let result = await checkToken(token);
      // console.log('验证：', result);
      // console.log(Boolean(result))

      let sql = `select id from users where token = '${token}'`;
      let users = await db(sql);
      // console.log(users);

      if (users.length > 0) {
        next();
      } else {
        res.json({ success: false, msg: "你的账号在另一个地方登录，请重新登录或修改密码", data: null })
      }
    } catch (err) {
      // console.log('验证：', err)
      res.json({ success: false, msg: '登录信息已过期，请重新登录', data: null })
    }
  }
});

/**
 * @api {post} /login 用户登录
 * @apiDescription 用户登录
 * @apiName login
 * @apiGroup user
 * @apiParam {string} username 用户名
 * @apiParam {string} password 密码
 * @apiSuccess {json} data
 * @apiSuccessExample {json} Success-Response:
 * {
 *    "success": true,
 *    "msg": "",
 *    "data": {}
 * }
 * @apiSampleRequest http://192.168.1.5:3000/login
 * @apiVersion 1.0.0
 */
router.post('/login', async (req, res, next) => {
  // console.log(req.headers);

  // 必传参数，检查字段是否存在或者是否为空
  let paramsArr = ['username', 'password'];
  if (!checkParams(paramsArr, req.body, res)) return

  let { username, password } = req.body; // username：用户名，password：密码
  password = md5(password + '_hot')

  let sql = `select * from user where username = '${username}' and password = '${password}'`;
  let user = await db(sql);

  if (user.length > 0) {
    let { token, expires } = createToken({ username: user[0].username, password: user[0].password }); // 返回token

    // 把token存入数据库
    let tokenSql = `update user set token = '${token}', last_login_time = '${dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")}' where username = '${username}'`;
    await db(tokenSql);

    res.json({ success: true, msg: "登录成功", data: { access_token: token, expires } })
  } else {
    res.json({ success: false, msg: "账号或密码错误，请重新输入", data: null })
  }
});

/**
 * @api {post} /register 用户注册
 * @apiDescription 用户注册
 * @apiName register
 * @apiGroup user
 * @apiParam {string} username 用户名
 * @apiParam {string} password 密码
 * @apiSuccess {json} data
 * @apiSuccessExample {json} Success-Response:
 * {
 *    "success": true,
 *    "msg": "",
 *    "data": {}
 * }
 * @apiSampleRequest http://192.168.1.5:3000/register
 * @apiVersion 1.0.0
 */
router.post('/register', async (req, res, next) => {

  // 必传参数，检查字段是否存在或者是否为空
  let paramsArr = ['username', 'password', 'password_confirm', 'email', 'qq', 'mobile', 'password_security', 'password_security_confirm'];
  if (!checkParams(paramsArr, req.body, res)) return

  let { username, password, password_confirm, email, qq, mobile, password_security, password_security_confirm } = req.body;
  password = md5(password + '_hot')

  // 判断用户是否存在，存在则提示已存在，不存在则添加
  let userSql = `select * from users where username = '${username}'`;
  let userArr = await db(userSql);
  if (userArr.length > 0) {
    res.json({ success: false, msg: "用户名已被注册", data: null })
    return;
  }

  let sql = `insert into users set username = '${username}', password = '${password}'`;
  let user = await db(sql);
  // console.log(user)
  // console.log(user.affectedRows)

  // 判断是否添加成功
  if (user.affectedRows > 0) {
    let { token, expires } = createToken({ username, password }); // 返回token

    // 把token存入数据库
    let tokenSql = `update users set token = '${token}', last_logintime = '${dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")}' where username = '${username}'`;
    await db(tokenSql);

    res.json({ success: true, msg: "注册成功", data: { access_token: token, expires } })
  } else {
    res.json({ success: false, msg: "注册失败，请检查", data: null })
  }
});

/**
 * @api {post} /wxlogin 微信登录
 * @apiDescription 微信登录
 * @apiName wxlogin
 * @apiGroup user
 * @apiParam {string} js_code 微信code
 * @apiParam {string} openId 微信openId
 * @apiParam {string} unionId 微信unionId
 * @apiParam {string} username 用户名
 * @apiParam {string} headimg 用户头像
 * @apiParam {string} gender 性别
 * @apiParam {string} country 国家
 * @apiParam {string} province 省份
 * @apiParam {string} city 城市
 * @apiSuccess {json} data
 * @apiSuccessExample {json} Success-Response:
 * {
 *    "success": true,
 *    "msg": "",
 *    "data": {}
 * }
 * @apiSampleRequest http://192.168.1.5:3000/wxlogin
 * @apiVersion 1.0.0
 */
router.post('/wxlogin', async (req, res, next) => {
  // console.log(req.headers);

  // 必传参数，检查字段是否存在或者是否为空
  // let paramsArr = ['username', 'headimg', 'gender', 'country', 'province', 'city']; // 微信小程序有js_code，app有openId，unionId
  // if (!checkParams(paramsArr, req.body, res)) return

  console.log(req.body);
  let { js_code, openId, unionId, username, headimg, gender, country, province, city } = req.body;

  // app有openid，unionid，说明不用调用登录凭证校验，已经登录了
  if (openId && unionId) {
    // console.log()
    let { token, expires } = createToken({ unionId, openId }); // 返回token
    loginData(openId, token, expires, username, headimg, gender, country, province, city, res);
    return;
  }

  // 微信小程序
  let options = {
    method: 'POST',
    url: 'https://api.weixin.qq.com/sns/jscode2session?',
    formData: {
      appid: wx.appid,
      secret: wx.secret,
      js_code, // 只能使用一次
      grant_type: 'authorization_code'
    }
  }

  request(options, async (err, response, body) => {
    if (err) {
      res.json({ success: false, msg: "微信登录失败", data: null });
    } else {
      // console.log(body); // body返回session_key，expires_in，openid（同一个微信用户，返回都一样）
      let data = JSON.parse(body);
      console.log(data);
      if (data.openid) {
        let { token, expires } = createToken({ js_code, openid: data.openid, session_key: data.session_key }); // 返回token

        loginData(openid, token, expires, username, headimg, gender, country, province, city, res);
      } else {
        res.json({ success: false, msg: '微信code失效，请重新获取', data: null });
      }

    }
  })
});

/**
 * @api {post} /qqlogin QQ登录
 * @apiDescription QQ登录
 * @apiName qqlogin
 * @apiGroup user
 * @apiParam {string} openId qq的openId
 * @apiParam {string} username 用户名
 * @apiParam {string} headimg 用户头像
 * @apiParam {string} gender 性别
 * @apiParam {string} province 省份
 * @apiParam {string} city 城市
 * @apiSuccess {json} data
 * @apiSuccessExample {json} Success-Response:
 * {
 *    "success": true,
 *    "msg": "",
 *    "data": {}
 * }
 * @apiSampleRequest http://192.168.1.5:3000/qqlogin
 * @apiVersion 1.0.0
 */
router.post('/qqlogin', async (req, res, next) => {
  // console.log(req.headers);

  // 必传参数，检查字段是否存在或者是否为空
  let paramsArr = ['openId'];
  if (!checkParams(paramsArr, req.body, res)) return

  console.log(req.body);
  let { openId, username, headimg, gender, province, city } = req.body;

  let { token, expires } = createToken({ openId }); // 返回token
  loginData(openId, token, expires, username, headimg, gender, '', province, city, res);
  return;
});

// 把登录信息存到数据库
async function loginData(openid, token, expires, username, headimg, gender, country, province, city, res) {
  // 当数据库中没有该openid时，插入数据，否则就更新token
  let sql = `select openid from users where openid = '${openid}'`;
  let users = await db(sql);
  let user = {};
  if (users.length === 0) {
    // 插入数据
    // console.log(username)
    let insertSql = `insert into users set openid = '${openid}', token = '${token}', username = '${username}', headimg = '${headimg}', gender = '${gender}', country = '${country}', province = '${province}', city = '${city}', last_logintime = '${dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")}'`;
    user = await db(insertSql);
  } else {
    // 更新token
    let updateSql = `update users set token = '${token}', last_logintime = '${dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")}' where openid = '${openid}'`;
    user = await db(updateSql);
  }

  // console.log(dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss"));
  // 判断是否添加，更新成功
  if (user.affectedRows > 0) {
    res.json({ success: true, msg: "", data: { access_token: token, expires } });
  } else {
    res.json({ success: false, msg: "微信登录失败", data: null });
  }
}

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;