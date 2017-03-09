/**
 * Created by goergch on 09.03.17.
 */

const EventEmitter = require('events').EventEmitter;
const util = require('util');
var logger = require('../global/logger');
var io = require('socket.io-client');
const constants = require('../global/constants');

const license_service = new LicenseService();
util.inherits(LicenseService, EventEmitter);

socket =  io('http://' + constants.HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST
    + ":" + constants.HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT +  "/licenses",{transports: ['websocket']});
socket.connect();
socket.on('connect', function(){
    logger.debug("connected to license SocketIO at Marketplace");
});

socket.on('disconnect', function () {
    logger.debug("disconnected from license SocketIO at Marketplace");
});

socket.on('updateAvailable', function (data) {
    license_service.emit('updateAvailable', data.offerId, data.hsmId);
});


license_service.registerUpdates = function (hsmId) {
    socket.emit('room',hsmId);
};

license_service.unregisterUpdates = function (hsmId) {
    socket.emit('leave',hsmId);
};