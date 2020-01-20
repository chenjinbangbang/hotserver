module.exports = {
  // 检查字段是否存在或者是否为空，paramsArr：必传参数，params：客户端传过来的参数，res：请求响应
  checkParams(paramsArr, params, res) {
    // console.log(paramsArr); // ['js_code']
    // console.log(params);
  
    let paramsKeys = Object.keys(params); // ['code']
    for(let item of paramsArr){
      if(paramsKeys.includes(item)){
        if(!params[item]){
          res.json({ success: false, msg: `${item}不能为空`, data: null });
          return false;
        }
      } else {
        res.json({ success: false, msg: `${item}不存在`, data: null });
          return false;
      }
    }
    return true;
  }
}