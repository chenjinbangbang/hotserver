var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');




// app.use()

var indexRouter = require('./routes/index');
var publicRouter = require('./routes/public');
var authRouter = require('./routes/auth');
var userRouter = require('./routes/user');
var payRouter = require('./routes/pay');

var app = express();

// const bodyParser = require('body-parser');
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
//   extended: false
// }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json()); // application/json
app.use(express.urlencoded({ // application/x-www-form-urlencoded
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter); // 路由中间件
app.use('/api/basic', publicRouter); // 公共接口
app.use('/api/auth', authRouter); // 登录注册相关接口
app.use('/api/user', userRouter); // 用户相关接口
app.use('/api/pay', payRouter); // 充值相关接口


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;