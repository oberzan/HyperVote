let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let i18n = require('i18n');

let jwt = require('jsonwebtoken');
let ejwt = require('express-jwt');

let config = require('./config.json');

let composerClient = require('./src/composer-client');
let index = require('./src/routes/index');
let api = require('./src/routes/api');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(ejwt({
  secret: config.secret.jwt,
  credentialsRequired: false,
  getToken: req => req.cookies.token 
}));

/** STATIC CONTENT **/
app.use(
  express.static(
    path.join(__dirname, 'src', 'public')
  )
);

composerClient.connect('BNadmin-org1@voting-network', 'voting-network', () => {console.log('Connection established')});

app.locals.moment = require('moment');

// Locales
i18n.configure({
  locales:['si'],
  directory: path.join(__dirname, 'src', 'locales'),
  defaultLocale: 'si'
});
app.use(i18n.init);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/', index);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  if(err.message.indexOf('expired') > -1)
    res.status(401)
       .clearCookie("token")
       .redirect('/authenticate');
  if(err.status == 403)
    res.status(403)
       .redirect('/authenticate');

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
