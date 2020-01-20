// 新增token
const jwt = require('jsonwebtoken');
const secret = 'token'; // 秘钥，不能丢
const expiresIn = 60 * 60; // 过期时间，如：60="60ms","2 days","10h","7d"

// 创建token并导出
module.exports = (params = {}) => {
  const token = jwt.sign(
    params,
    secret,
    { expiresIn }
  )
  return { token, expires: expiresIn * 1000 };
}