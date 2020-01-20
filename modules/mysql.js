// 连接mysql数据库
const mysql = require('mysql');
// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: 'root',
//   port: '3306',
//   database: 'hot'
// });
// connection.connect();

const pool = mysql.createPool({
  // host: 'localhost',
  host: 'localhost',
  user: 'root',
  password: 'root',
  port: '3306',
  database: 'hot'
});

// 在数据池中进行会话操作
let myMysql = sql => {
  return new Promise(resolve => {
    pool.getConnection((err, connection) => {
      connection.query(sql, (err, result) => {
        if (err) throw err;

        resolve(result);

        // 结束会话
        connection.release();
      });
    });
  });
}

module.exports = myMysql;