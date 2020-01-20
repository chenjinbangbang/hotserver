const express = require('express');
const router = express.Router();

const { checkParams } = require('../modules/global'); // 公共方法

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
const upload = multer({ storage })

const db = require('../modules/mysql'); // mysql

/**
 * @api {get} /users 查询所有用户
 * @apiDescription 查询所有用户
 * @apiName users
 * @apiGroup user
 * @apiHeader {string} authorization 用户token
 * @apiParam {number} page 当前页
 * @apiParam {number} pageNum 一页的条数
 * @apiSuccess {boolean} success 成功：true，失败：false
 * @apiSuccess {string} msg 提示信息
 * @apiSuccess {json} data 返回结果
 * @apiSuccessExample {json} Success-Response:
 * {
 *    "success": true,
 *    "msg": "",
 *    "data": {}
 * }
 * @apiSampleRequest http://192.168.1.5:3000/users
 * @apiVersion 1.0.0
 */
router.get('/', async (req, res) => {
  // console.log(req.headers);

  // 必传参数，检查字段是否存在或者是否为空
  let paramsArr = ['page', 'pageNum'];
  if (!checkParams(paramsArr, req.query, res)) return

  let { page, pageNum } = req.query; // page：当前页，pageNum：一页的条数

  let sql = 'select * from users';
  // 分页
  if (page || pageNum) {
    page = Number(page);
    pageNum = Number(pageNum);
    sql += ` limit ${(page - 1) * pageNum},${pageNum}`;
  }

  // 获取用户总数
  let userTotalSql = 'select count(id) count from users';
  let count = await db(userTotalSql);

  // 获取所有用户
  let users = await db(sql);
  // console.log(users);

  res.json({
    success: true, msg: "", data: {
      data: users,
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
    res.json({ success: true, msg: "", data: users[0] })
  } else {
    res.json({ success: false, msg: "无此用户信息", data: null })
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
    res.json({ success: true, msg: "修改头像成功", data: { headimg } })
  } else {
    res.json({ success: false, msg: "修改头像失败", data: null })
  }
});

module.exports = router;
