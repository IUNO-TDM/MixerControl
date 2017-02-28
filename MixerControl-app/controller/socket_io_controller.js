/**
 * Created by beuttlerma on 08.02.17.
 */

var logger = require('../global/logger');
var pumpControl_service = require('../services/pumpcontrol_service');
var production_queue = require('../models/production_queue');
var OSM = require('../models/order_state_machine');
var OrderDB = require('../database/orderDB');


function onIOConnect(socket) {
    logger.info('a user connected: ' + socket.id);

    socket.on('room', function (orderId) {
        socket.join(orderId);

        var order = OrderDB.getOrder(orderId);
        if (typeof order !== 'undefined') {

            var state = OSM.compositeState(order);
            orderNamespace.to(order.orderNumber).emit("state", {"toState": state});

            if (typeof  order.progress !== 'undefined') {

                orderNamespace.to(order.orderNumber).emit("progress", {"progress": order.progress})
            }
        }
    });

    socket.on('disconnect', function () {
        logger.info('a user disconnected: ' + socket.id);
    });
}


function registerPumpControlEvents(orderNamespace) {


    pumpControl_service.on('pumpControlState', function (state) {
        logger.info("New PumpControl state: " + state);
    });
    pumpControl_service.on('pumpControlProgress', function (progUpdate) {
        logger.info("PumpControl Progress: " + progUpdate.progress + "\% (" + progUpdate.orderName + ")");
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
        orderNamespace.to(order.orderNumber).emit("progress", {"progress": progress});
    });

    production_queue.init();
}

function registerStateMachineEvents(orderNamespace) {
    OSM.on("transition", function (data) {
        logger.info("sent statechange " + data.toState + " for OrderNumber " + data.client.orderNumber);
        orderNamespace.to(data.client.orderNumber).emit("state", {
            "fromState": data.fromState,
            "toState": data.toState
        });
    });
}

module.exports = function (io) {
    var orderNamespace = io.of('/orders');
    orderNamespace.on('connection', onIOConnect);

    registerPumpControlEvents(orderNamespace);
    registerStateMachineEvents(orderNamespace);

};
