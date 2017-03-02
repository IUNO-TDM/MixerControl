var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var drinks = require('./routes/drinks');
var users = require('./routes/users');
var orders = require('./routes/orders');
var admin = require('./routes/admin');
var components = require('./routes/components');
var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/js', express.static(__dirname + '/public/js'));
app.use('/app', express.static(__dirname + '/public/app'));
app.use('/img', express.static(__dirname + '/public/img'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/partials', express.static(__dirname + '/public/partials'));
app.use('/templates', express.static(__dirname + '/public/templates'));
app.use('/scripts', express.static(__dirname + '/public/scripts'));

app.use('/api/drinks', drinks);
app.use('/api/users', users);
app.use('/api/orders', orders);
app.use('/api/admin', admin);
app.use('/api/components', components);

app.all('/api/*', function(req, res, next) {
  res.sendStatus(404);
});

app.all('*', function(req, res, next) {
  // Just send the index.html for other files to support HTML5Mode
  res.sendFile('public/index.html', { root: __dirname });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
} else {
  app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
}

module.exports = app;
