const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const i18n = require('i18n');

const jwt = require('jsonwebtoken');
const ejwt = require('express-jwt');

const config = require('./config.json');
const logger = require('./log.js')(module);

let composerClient = require('./src/composer-client');
const index = require('./src/routes/index');
const api = require('./src/routes/api');

let app = express();
app.locals.moment = require('moment');

// view engine setup
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(ejwt({
  secret: config.secret.jwt,
  credentialsRequired: false,
  getToken: req => req.cookies.token 
}));

app.use(function(err, req, res, next) {
  if(err.status == 401 && err.message.indexOf('expired') > -1) {
    logger.debug('Token expired, clearing token');
    logger.debug(req.cookies);
    res.status(401).clearCookie("token");
  }
  next();
});

/** STATIC CONTENT **/
app.use(
  express.static(
    path.join(__dirname, 'src', 'public')
  )
);

composerClient.connect('BNadmin-org1@voting-network', 'voting-network', () => logger.info('Connection established'));

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
  // if(err.status == err.message.indexOf('expired') > -1)
  //   logger.debug('Token expired, redirecting to /authenticate');
  //   logger.debug(req.cookies);
  //   return res.status(401)
  //             .clearCookie("token")
  //             .redirect('/authenticate');
  if(err.status == 403)
    logger.debug('Access forbidden, redirecting to /authenticate');
    return res.status(403)
              .redirect('/authenticate');

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
