/**
 * 公共接口
 */
const express = require('express');
const router = express.Router();
// const dateFormat = require('dateformat');
// const check = require('express-validator/check').check;
// const validationResult = require('express-validator/check').validationResult;

const db = require('../modules/mysql'); // mysql
const { checkParams } = require('../modules/global'); // 公共方法


/**
 * 获取充值记录
 */
router.get('/list', async (req, res, next) => {
  console.log(req.query)

  let sql = `select * from pay`;
  let data = await db(sql);
  // console.log(data)
  res.json({ success: true, msg: '', data })
});


/**
 * 用户充值
 * user_id：用户编号
 * account：交易方
 * deal_num：交易号
 * pay_type：充值类型
 * wealth：充值金额
 */
router.post('/wealth', async (req, res, next) => {
  console.log(req.body)

  let user_id = new Date().getTime() // 存储在token里面

  let paramsArr = ['account', 'deal_num', 'pay_type', 'wealth'];
  if (!checkParams(paramsArr, req.body, res)) return

  const { account, deal_num, pay_type, wealth } = req.body

  let sql = `insert into pay set user_id = '${user_id}', account = '${account}', deal_num = '${deal_num}', pay_type = ${pay_type}, wealth = ${wealth}`;
  let data = await db(sql);
  // console.log(data)

  if (data.affectedRows > 0) {
    res.json({ success: true, msg: '已充值，待到账', data: null })
  } else {
    res.json({ success: false, msg: '充值失败', data: null })
  }
  
});


/**
 * 充值审核
 * id：充值编号
 * status：状态（0 已充值，待到账，1 充值失败，2 充值成功）
 */
router.post('/status', async (req, res, next) => {
  console.log(req.body)
  // console.log(req.query)
  // console.log(req.params)

  let paramsArr = ['id', 'status'];
  if (!checkParams(paramsArr, req.body, res)) return
  
  const { id, status } = req.body

  let statusArr = {
    0: '已充值，待到账',
    1: '充值失败',
    2: '充值成功'
  }

  // status校验
  let keys = Object.keys(statusArr); // 索引是string类型
  if(!keys.includes(status)){
    res.json({ success: false, msg: 'status传参有误', data: null })
    return
  }

  let sql = `update pay set status = ${status} where id = ${id}`;
  let data = await db(sql);
  // console.log(data)

  if (data.affectedRows > 0) {
    res.json({ success: true, msg: statusArr[status], data: null })
  } else {
    res.json({ success: false, msg: '更改充值状态失败', data: null })
  }
});

module.exports = router;
