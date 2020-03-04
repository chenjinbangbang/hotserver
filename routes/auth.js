/**
 * 登录注册相关接口
 */
const express = require('express');
const router = express.Router();
const md5 = require('js-md5');
const dateformat = require('dateformat');

const createToken = require("../token/createToken"); // 创建token
const {
  checkParams
} = require('../modules/global'); // 公共方法

/**
 * 用户登录
 * username 用户名
 * password 密码
 */
router.post('/login', async (req, res, next) => {
  // console.log(req.headers);

  // 必传参数，检查字段是否存在或者是否为空
  let paramsArr = ['username', 'password'];
  if (!checkParams(paramsArr, req.body, res)) return

  let {
    username,
    password
  } = req.body;
  password = md5(password + '_hot');

  let sql = `select * from user where username = '${username}' and password = '${password}'`;
  let user = await db(sql);
  console.log(user)

  if (user.length > 0) {
    let {
      token,
      expires
    } = createToken({
      username: user[0].username,
      password: user[0].password
    }); // 返回token

    // 把token存入数据库
    let tokenSql = `update user set token = '${token}', last_login_time = '${dateformat(new Date(), "yyyy-mm-dd HH:MM:ss")}' where username = '${username}'`;
    await db(tokenSql);

    res.json({
      success: true,
      msg: "登录成功",
      data: {
        access_token: token,
        expires
      }
    })
  } else {
    res.json({
      success: false,
      msg: "账号或密码错误，请重新输入",
      data: null
    })
  }
});


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

  let {
    role,
    referrer_user_id,
    username,
    password,
    email,
    qq,
    mobile,
    password_security
  } = req.body;
  password = md5(password + '_hot')
  password_security = md5(password_security + '_hot')

  // 验证用户名是否存在
  let usernameSql = `select * from user where username = '${username}'`;
  let usernameData = await db(usernameSql);

  if (usernameData.length > 0) {
    res.json({
      success: false,
      msg: '此用户名已存在',
      data: null
    })
    return
  }

  // 验证邮箱是否存在
  let emailSql = `select * from user where email = '${email}'`;
  let emailData = await db(emailSql);

  if (emailData.length > 0) {
    res.json({
      success: false,
      msg: '此邮箱已存在',
      data: null
    })
    return
  }

  // 验证QQ是否存在
  let qqSql = `select * from user where qq = '${qq}'`;
  let qqData = await db(qqSql);

  if (qqData.length > 0) {
    res.json({
      success: false,
      msg: '此QQ已存在',
      data: null
    })
    return
  }

  let sql = `insert into user set role = ${role}, referrer_user_id = ${referrer_user_id || ''}, username = '${username}', password = '${password}', email = '${email}', qq = '${qq}', mobile = '${mobile}', password_security = '${password_security}'`
  let data = await db(sql);
  console.log(data)

  if (data.affectedRows > 0) {

    // 注册成功后，自动登录，并且更新token
    let {
      token,
      expires
    } = createToken({
      id: data.insertId,
      username,
      password
    }); // 返回token
    // console.log(token)
    // console.log(expires)

    // 把token存入数据库
    let tokenSql = `update user set token = '${token}', last_login_time = '${dateformat(new Date(), "yyyy-mm-dd HH:MM:ss")}' where id = '${data.insertId}'`;
    await db(tokenSql);

    res.json({
      success: true,
      msg: "注册用户成功",
      data: {
        access_token: token,
        expires
      }
    })
  } else {
    res.json({
      success: false,
      msg: '注册用户失败',
      data: null
    })
  }
});


/**
 * 验证用户名是否存在
 */
router.get('/check/username', async (req, res) => {

  let paramsArr = ['username'];
  if (!checkParams(paramsArr, req.query, res)) return

  const {
    username
  } = req.query

  let sql = `select * from user where username = '${username}'`;
  let data = await db(sql);

  if (data.length > 0) {
    res.json({
      success: false,
      msg: '此用户名已存在',
      data: null
    })
  } else {
    res.json({
      success: true,
      msg: '此用户名可使用',
      data: null
    })
  }
});


/**
 * 验证邮箱是否存在
 */
router.get('/check/email', async (req, res) => {

  let paramsArr = ['email'];
  if (!checkParams(paramsArr, req.query, res)) return

  const {
    email
  } = req.query

  let sql = `select * from user where email = '${email}'`;
  let data = await db(sql);

  if (data.length > 0) {
    res.json({
      success: false,
      msg: '此邮箱已存在',
      data: null
    })
  } else {
    res.json({
      success: true,
      msg: '此邮箱可使用',
      data: null
    })
  }
});


/**
 * 验证QQ是否存在
 */
router.get('/check/qq', async (req, res) => {

  let paramsArr = ['qq'];
  if (!checkParams(paramsArr, req.query, res)) return

  const {
    qq
  } = req.query

  let sql = `select * from user where qq = '${qq}'`;
  let data = await db(sql);

  if (data.length > 0) {
    res.json({
      success: false,
      msg: '此QQ已存在',
      data: null
    })
  } else {
    res.json({
      success: true,
      msg: '此QQ可使用',
      data: null
    })
  }
});

module.exports = router;