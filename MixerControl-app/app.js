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
var app = express();

var OSM = require('./models/order_state_machine');
var OrderDB = require('./database/orderDB');
// view engine setup
app.set('views', path.join(__dirname, 'views'));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
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

var pumpcontrol_service = require('./services/pumpcontrol_service');

pumpcontrol_service.on('pumpControlState', function (state) {
  console.log("New PumpControl state: " + state);
});
pumpcontrol_service.on('pumpControlProgress', function (progUpdate) {
  console.log("PumpControl Progress: " + progUpdate.progress + "\% ("+progUpdate.orderName + ")");
});
pumpcontrol_service.on('pumpControlProgramEnd', function (progName) {
  console.log("PumpControl Program end: " + progName.orderName);
});

pumpcontrol_service.on('pumpControlError', function (error) {
    console.log("PumpControl error: " + JSON.stringify(error));
});
pumpcontrol_service.on('serviceState', function (state) {
  console.log("PumpControlService has new state: " + state);
});

var production_queue = require('./models/production_queue');
production_queue.on('state', function (state) {
  console.log("ProductionQueue statechange: " + state);
});
production_queue.init();

var io = require('socket.io')();
app.io = io;
var orderNamespace = io.of('/orders');

orderNamespace.on('connection', onIOConnect);

OSM.on("transition", function (data) {
  console.log("sent statechange " + data.toState + " for OrderNumber " + data.client.orderNumber);
  orderNamespace.to(data.client.orderNumber).emit("state",{"fromState": data.fromState, "toState": data.toState});
});
production_queue.on('progress', function (order, progress) {
  orderNamespace.to(order.orderNumber).emit("progress",{"progress":progress});
});



function onIOConnect(socket){
  console.log('a user connected: ' + socket.id);
  socket.on('room', function(room){
    socket.join(room);
    var order = OrderDB.getOrder(room);
    if (typeof order !== 'undefined'){

      var state = OSM.compositeState(order);
      orderNamespace.to(order.orderNumber).emit("state",{"toState": state});
      if (typeof  order.progress !== 'undefined'){
        orderNamespace.to(order.orderNumber).emit("progress",{"progress":order.progress})
      }
    }
  });


  socket.on('disconnect', function () {
    console.log('a user disconnected: ' + socket.id);
  });
}

module.exports = app;
