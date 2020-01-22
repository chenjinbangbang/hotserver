/**
 * 公共接口
 */
const express = require('express');
const router = express.Router();
// const dateFormat = require('dateformat');
const check = require('express-validator/check').check;
const validationResult = require('express-validator/check').validationResult;

const db = require('../modules/mysql'); // mysql
const { checkParams } = require('../modules/global'); // 公共方法

// var iconv = require('iconv-lite');
// var fs = require('fs');
// var fileStr = fs.readFileSync('input.txt', {encoding:'binary'});
// var buf = new Buffer(fileStr, 'binary');
// var str = iconv.decode(buf,'utf8');
// console.log(str);

// 上传图片
const multer = require('multer');
// const iconv = require('iconv-lite'); // 解决上传文件名中文乱码问题（暂时无法解决）
// const fs = require('fs')
const imgSrc = 'uploads_backup'; // 文件路径，在public文件夹下
// const upload = multer({dest: 'public/uploads'})
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, `public/${imgSrc}`);
  },
  filename(req, file, cb) {
    console.log(file);

    // let fileStr = fs.readFileSync(`public/${imgSrc}`, { encoding: 'binary' });
    // let buf = new Buffer(fileStr, 'binary');
    // let str = iconv.decode(buf, 'utf8');
    // console.log(str);

    cb(null, `${Date.now()}_${file.originalname}`);
  }
});
const upload = multer({ storage })


/**
 * 获取字典表
 * dict_code：字典码（wealth_dict：财务类型字典表，bank_dict：银行卡字典表，share_dict_toutiao：今日头条分享字典表，share_dict_douyin：抖音短视频分享字典表，share_dict_huoshan：火山小视频分享字典表，share_dict_kuaishou：快手分享字典表）。
 */
router.get('/dict', async (req, res, next) => {
  console.log(req.query)

  // 必传参数，检查字段是否存在或者是否为空
  let paramsArr = ['dict_code'];
  if (!checkParams(paramsArr, req.query, res)) return

  const { dict_code } = req.query;

  const dictArr = ['wealth_dict', 'bank_dict', 'share_dict_toutiao', 'share_dict_douyin', 'share_dict_huoshan', 'share_dict_kuaishou']; // 所有字典表

  if (dictArr.includes(dict_code)) {
    let sql = `select * from ${dict_code}`;
    let data = await db(sql);
    res.json({ success: true, msg: '', data })
  } else {
    res.json({ success: true, msg: '', data: [] })
  }
});


/**
 * 获取省市区
 */
router.get('/area', async (req, res, next) => {
  console.log(req.query)

  let sql = `select * from area`;
  let data = await db(sql);

  let provinceSql = `select * from area where level = '1'`;
  let provinceData = await db(provinceSql);
  let citySql = `select * from area where level = '2'`;
  let cityData = await db(citySql);
  let areaSql = `select * from area where level = '3'`;
  let areaData = await db(areaSql);

  // 处理省市区数据
  provinceData.forEach(item => {
    item.children = []
    cityData.forEach(item1 => {

      // 添加区域
      item1.children = []
      areaData.forEach(item2 => {
        if(item1.id === item2.pid) {
          item1.children.push({
            areaId: item2.id,
            areaName: item2.name,
            children: []
          })
        }
      })

      // 添加城市
      if(item.id === item1.pid) {
        item.children.push({
          areaId: item1.id,
          areaName: item1.name,
          children: item1.children
        })
      }
    })
  })

  res.json({ success: true, msg: '', data: provinceData })

  // data = [
  //   {
  //     areaId: 1,
  //     areaName: '北京',
  //     children: [
  //       {
  //         areaId: 2,
  //         areaName: '北京市',
  //         children: [
  //           {
  //             areaId: 3,
  //             areaName: '东城区',
  //             children: []
  //           },
  //           ...
  //         ]
  //       },
  //       ...
  //     ]
  //   },
  //   ...
  // ]
  
});


/**
 * 上传文件
 * file：file文件
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  const token = req.headers.authorization;

  // console.log(token);
  // console.log(req.file);
  const host = `${req.protocol}://${req.headers.host}`;
  const file = `${host}/${imgSrc}/${req.file.filename}`

  res.json({ success: true, msg: "", data: file })

  // let sql = `update users set headimg = '${file}'`;
  // let user = await db(sql)

  // if (user.affectedRows > 0) {
  //   res.json({ success: true, msg: "", data: { headimg } })
  // } else {
  //   res.json({ success: false, msg: "上传文件失败", data: null })
  // }
});

module.exports = router;
