var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var rootCas = require('ssl-root-cas/latest').create();
require('https').globalAgent.options.ca = rootCas;
const storage = require('node-persist');storage.initSync();
var drinks = require('./routes/drinks');
var users = require('./routes/users');
var orders = require('./routes/orders');
var admin = require('./routes/admin');
var components = require('./routes/components');

var app = express();

var ifttt_controller = require('./controller/ifttt_controller');

// view engine setup
app.set('views', path.join(__dirname, 'views'));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

var CACHE_MAX_AGE = 60*60*24;

app.use(express.static(path.join(__dirname, 'dist')));


//app.use(express.static(path.join(__dirname, 'public'), {maxAge: CACHE_MAX_AGE}));
//app.use('/js', express.static(__dirname + '/public/js', {maxAge: CACHE_MAX_AGE}));
//app.use('/app', express.static(__dirname + '/public/app', {maxAge: CACHE_MAX_AGE}));
app.use('/img', express.static(__dirname + '/public/img', {maxAge: CACHE_MAX_AGE}));
//app.use('/css', express.static(__dirname + '/public/css', {maxAge: CACHE_MAX_AGE}));
//app.use('/partials', express.static(__dirname + '/public/partials', {maxAge: CACHE_MAX_AGE}));
//app.use('/templates', express.static(__dirname + '/public/templates', {maxAge: CACHE_MAX_AGE}));
//app.use('/scripts', express.static(__dirname + '/public/scripts', {maxAge: CACHE_MAX_AGE}));

app.use('/api/drinks', drinks);
app.use('/api/users', users);
app.use('/api/orders', orders);
app.use('/api/admin', admin);
app.use('/api/components', components);

app.all('/api/*', function (req, res, next) {
    res.sendStatus(404);
});

app.all('*', function (req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
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
        res.status = 500;
        res.send('Something broke!')
    });
}

module.exports = app;
