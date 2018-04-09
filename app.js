var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var i18n = require('i18n');

var jwt = require('jsonwebtoken');

var composerClient = require('./src/composer-client');
var index = require('./src/routes/index');
var api = require('./src/routes/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/admin', (req, res, next) => {
    console.log("Cookie: " + req.cookies.token);
    
    clearTokenAndRedirect = () => {
      console.log("Clearing the cookie");
      res.status(401)
         .clearCookie("token")
         .redirect("/authenticate");
    }

    if(!process.env.JWT_SECRET) {
      console.error("JWT_SECRET not set");
    }

    jwt.verify(req.cookies.token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        clearTokenAndRedirect();
        return;
      };

      if (decodedToken.exp <= Date.now() / 1000) {
        clearTokenAndRedirect();
        return;
      }

      console.log("User: ");
      console.log(decodedToken.user);

      if(decodedToken.user !== "admin")
        clearTokenAndRedirect();
      else
        next();
    });    
  }
);

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
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
