// 检查token
const jwt = require("jsonwebtoken");
const secret = "token"; // 秘钥，不能丢

// 检查token是否过期
module.exports = (token) => {
  return new Promise(async (resolve,reject) => {
    let tokenContent = "";
    try{
      tokenContent = await jwt.verify(token.includes('Bearer') ? token.split(' ')[1] : token, secret); // 如果token过期或验证失败，将抛出错误
      // console.log('tokenContent：', tokenContent);
      resolve(tokenContent)
    } catch(err) {
      reject(err.message);
    }
  })
}