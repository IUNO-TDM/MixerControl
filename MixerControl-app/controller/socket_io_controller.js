/**
 * Created by beuttlerma on 08.02.17.
 */

var logger = require('../global/logger');
var pumpControl_service = require('../services/pumpcontrol_service');
var production_queue = require('../models/production_queue');
var OSM = require('../models/order_state_machine');
var OrderDB = require('../database/orderDB');
const async = require('async');
var licenseService = require('../websocket/license_client');
let lastProgress = 0;
var licenseManagerAdapter = require('../adapter/license_manager_adapter');

function onOrderNamespaceConnect(socket) {
  logger.info('[socket_io_controller] a user connected: ' + socket.id);

  socket.on('room', function (orderId) {
    socket.join(orderId);

    if (orderId == 'allOrders') {
      const orderDict = OrderDB.getOrders();
      for (var key in orderDict) {
        var order = orderDict[key];
        if (typeof order !== 'undefined') {
          socket.emit("add", order.strip());
          var state = OSM.compositeState(order);
          socket.emit("state", {"orderNumber": order.orderNumber, "toState": state});

          if (typeof  order.progress !== 'undefined') {

            socket.emit("progress", {"orderNumber": order.orderNumber, "progress": order.progress})
          }
        }
      }
    } else {
      var order = OrderDB.getOrder(orderId);
      // If order already exists send the current state and progress to client
      if (typeof order !== 'undefined') {

        var state = OSM.compositeState(order);
        socket.emit("state", {"orderNumber": order.orderNumber, "toState": state});

        if (typeof  order.progress !== 'undefined') {

          socket.emit("progress", {"orderNumber": order.orderNumber, "progress": order.progress})
        }
      }
    }
  });

  socket.on('leave', function (orderId) {
    socket.leave(orderId);
  });

  socket.on('disconnect', function () {
    logger.info('a user disconnected: ' + socket.id);
  });
}

function onProductionNamespaceConnect(socket) {
  logger.info('[socket_io_controller] a user connected: ' + socket.id);

  socket.on('room', function (roomId) {
    socket.join(roomId);

    if (roomId == "queue") {
      socket.emit("queue", production_queue.getStrippedQueue());
    } else if (roomId == "state") {
      socket.emit("state", production_queue.getState());
    } else if (roomId == "pumpControlMode") {
      socket.emit("pumpControlMode", pumpControl_service.getMode());
    } else if (roomId == "pumpControlService") {
      socket.emit("pumpControlServiceState", pumpControl_service.getServiceState());
    } else if (roomId == "amountWarning") {
      const warnings = pumpControl_service.getAmountWarnings();
      async.each(warnings, function iterate(item, callback) {
        socket.emit("amountWarning", item);
      });
    } else if (roomId == "pumpControl") {
      socket.emit("progress", lastProgress);
    }

  });

  socket.on('leave', function (roomId) {
    socket.leave(roomId);
  });


  socket.on('disconnect', function () {
    logger.info('a user disconnected: ' + socket.id);
  });
}


function registerPumpControlEvents(orderNamespace, productionNamespace) {


  pumpControl_service.on('pumpControlState', function (state) {
    logger.info("New PumpControl state: " + state);
  });
  pumpControl_service.on('pumpControlProgress', function (progUpdate) {
    logger.info("PumpControl Progress: " + progUpdate.progress + "\% (" + progUpdate.orderName + ")");
    lastProgress = progUpdate.progress;
    productionNamespace.to('pumpControl').emit('progress', lastProgress);
  });
  pumpControl_service.on('pumpControlProgramEnd', function (progName) {
    logger.info("PumpControl Program end: " + progName.orderName);
  });

  pumpControl_service.on('pumpControlError', function (error) {
    logger.info("PumpControl error: " + JSON.stringify(error));
  });
  pumpControl_service.on('serviceState', function (state) {
    logger.info("PumpControlService has new state: " + state);
  });

  production_queue.on('state', function (state, order) {
    var orderNumber = 'X';
    if (order) {
      orderNumber = order.orderNumber;
    }
    logger.info("ProductionQueue statechange: " + state + " ordernumber: " + orderNumber);
  });

  production_queue.on('progress', function (order, progress) {
    orderNamespace.to(order.orderNumber).emit("progress", {"orderNumber": order.orderNumber, "progress": progress});
    orderNamespace.to('allOrders').emit("progress", {"orderNumber": order.orderNumber, "progress": progress});
  });

  production_queue.init();
}

function registerOrderStateEvents(orderNamespace) {
  OSM.on("transition", function (data) {
    logger.info("[socket_io_controller] sent statechange " + data.toState + " for OrderNumber " + data.client.orderNumber);
    orderNamespace.to(data.client.orderNumber).emit("state", {
      "orderNumber": data.client.orderNumber,
      "fromState": data.fromState,
      "toState": data.toState
    });
    orderNamespace.to('allOrders').emit("state", {
      "orderNumber": data.client.orderNumber,
      "fromState": data.fromState,
      "toState": data.toState
    });
  });
}

function registerOrderDbEvents(orderNamespace) {
  OrderDB.on("add", function (order) {
    orderNamespace.to('allOrders').emit("add", order.strip());
  })
}


function registerProductionEvents(productionNamespace) {
  production_queue.on('state', function (state, topOrder) {
    productionNamespace.to('state').emit("state", state);
  });

  production_queue.on('queueChange', function (queue) {
    productionNamespace.to('queue').emit("queue", queue);
  });

  pumpControl_service.on('serviceState', function (state) {
    productionNamespace.to('pumpControlService').emit("pumpControlServiceState", state);
  });
  pumpControl_service.on('pumpControlMode', function (state) {
    productionNamespace.to('pumpControlMode').emit("pumpControlMode", state);
  });
  pumpControl_service.on('amountWarning', function (warning) {
    productionNamespace.to('amountWarning').emit("warning", warning);
  });

}

function registerInternetConnectionEvents(connectionNamespace) {
  licenseService.on('connectionState', function (state) {
    connectionNamespace.to('connectionState').emit('connectionState', state);
  });

  licenseContainerState = false;

  //TODO Polling is not ideal. A Websocket interface to licensemanager would be better
  const intervalObj = setInterval(() => {
    licenseManagerAdapter.getHsmId((err, hsmId)=>{
      if(err || !hsmId || hsmId === "" ){
        if(licenseContainerState == true){
          licenseContainerState = false;
          connectionNamespace.to("licenseContainerState").emit("licenseContainerState", false);
        }
      }else {
        if(licenseContainerState == false){
          licenseContainerState = true;
          connectionNamespace.to("licenseContainerState").emit("licenseContainerState", true);
        }
      }
    });
  }, 20000);

}

function onInternetConnectionNamespaceConnect(socket) {
  logger.info('[socket_io_controller] a user connected: ' + socket.id);

  socket.on('room', function (roomId) {
    socket.join(roomId);

    if (roomId == "connectionState") {
      socket.emit("connectionState", licenseService.getConnectionStatus());
    } else if (roomId == "licenseContainerState") {
      licenseManagerAdapter.getHsmId((err, hsmId)=>{
        if(err || !hsmId || hsmId === "" ){
          socket.emit("licenseContainerState", false);
        }else {
          socket.emit("licenseContainerState", true);
        }

      });

    }

  });

  socket.on('leave', function (roomId) {
    socket.leave(roomId);
  });


  socket.on('disconnect', function () {
    logger.info('a user disconnected: ' + socket.id);
  });
}

module.exports = function (io) {
  var orderNamespace = io.of('/orders');
  orderNamespace.on('connection', onOrderNamespaceConnect);


  var productionNamespace = io.of('/production');
  productionNamespace.on('connection', onProductionNamespaceConnect);


  var connectionNameSpace = io.of('/connectionState');
  connectionNameSpace.on('connection', onInternetConnectionNamespaceConnect);

  registerPumpControlEvents(orderNamespace, productionNamespace);
  registerOrderStateEvents(orderNamespace);
  registerOrderDbEvents(orderNamespace);
  registerProductionEvents(productionNamespace);
  registerInternetConnectionEvents(connectionNameSpace);

};
