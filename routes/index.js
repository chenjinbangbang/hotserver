const express = require('express');
const router = express.Router();
const md5 = require('js-md5');
const dateFormat = require('dateformat');

const db = require('../modules/mysql'); // mysql
const createToken = require("../token/createToken"); // 创建token
const checkToken = require('../token/checkToken'); // 检查token
const isCheck = true // 是否校验token

// const { checkParams } = require('../modules/global'); // 公共方法

const whileArr = ['/api/user/login', '/api/user/register', '/api/user/check/username', '/api/user/check/email', '/api/user/check/qq']; // 免检查token白名单

// 路由中间件，验证token是否过期
router.use(async (req, res, next) => {
  // console.log(req.headers);
  // console.log(req.headers.host);
  // console.log(req.protocol);
  // console.log(req.baseUrl);
  // console.log(req.hostname);
  // console.log(req.route);
  let token = req.headers.authorization;

  if(!isCheck) {
    next();
    return;
  }

  if (whileArr.includes(req.path)) {
    next();
  } else {
    try {
      let result = await checkToken(token);
      // console.log('验证：', result);
      // console.log(Boolean(result))

      let sql = `select id from user where token = '${token}'`;
      let data = await db(sql);
      // console.log(data);

      if (data.length > 0) {
        next();
      } else {
        res.json({ success: false, msg: "你的账号在另一个地方登录，请重新登录", data: null })
      }
    } catch (err) {
      // console.log('验证：', err)
      res.json({ success: false, msg: '登录信息已过期，请重新登录', data: null })
    }
  }
});

/* GET home page. */
router.get('/', function (req, res, next) {
  // res.render('index', { title: 'Express' });
  res.json({ success: true, msg: '测试接口是否正常', data: null })
});

module.exports = router;
