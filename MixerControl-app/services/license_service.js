/**
 * Created by goergch on 09.03.17.
 */

const EventEmitter = require('events').EventEmitter;
const util = require('util');
var logger = require('../global/logger');

var io = require('socket.io-client');
const constants = require('../global/constants');
var LicenseService = function () {};
const license_service = new LicenseService();
util.inherits(LicenseService, EventEmitter);

license_service.socket = io.connect(constants.HOST_SETTINGS.JUICE_MACHINE_SERVICE
        .METHOD+'://' + constants.HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST
    + ":" + constants.HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT +  "/licenses");

license_service.socket.on('connect', function(){
    logger.debug("connected to license SocketIO at Marketplace");
});
license_service.socket.on('connect_error', function(error){
    logger.debug("Conncetion Error at license SocketIO at Marketplace: " + error);
});

license_service.socket.on('disconnect', function () {
    logger.debug("disconnected from license SocketIO at Marketplace");
});

license_service.socket.on('updateAvailable', function (data) {
    logger.debug("License update available for " + JSON.stringify(data));
    license_service.emit('updateAvailable', data.offerId, data.hsmId);
});


license_service.registerUpdates = function (hsmId) {
    license_service.socket.emit('room',hsmId);
};

license_service.unregisterUpdates = function (hsmId) {
    license_service.socket.emit('leave',hsmId);
};
module.exports = license_service;