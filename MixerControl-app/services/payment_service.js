/**
 * Created by goergch on 07.03.17.
 */

const EventEmitter = require('events').EventEmitter;
const util = require('util');
const http = require('http');

var logger = require('../global/logger');
var io = require('socket.io-client');

var registeredInvoiceIds = [];

socket = io('http://localhost:8080/invoices',{transports: ['websocket']});

socket.connect();
socket.on('connect', function(){
    logger.debug("connected to paymentservice");
    for(var invoiceId in registeredInvoiceIds){
        socket.emit('room', registeredInvoiceIds);
    }


});

socket.on('StateChange', function(data){
    logger.debug("StateChange",data);
    payment_service.emit('StateChange', JSON.parse(data));
});


socket.on('disconnect', function(){
    logger.debug("disconnect");
});
var PaymentService = function () {
    console.log('a new instance of PaymentService');

};

const payment_service = new PaymentService();
util.inherits(PaymentService, EventEmitter);

payment_service.createLocalInvoice = function(invoice, callback){
    body = JSON.stringify(invoice);
    var options = {
        hostname: 'localhost',
        port: 8080,
        path: '/v1/invoices/',
        agent: false,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    var req = http.request(options, function (res) {
            console.log(res.statusCode + ' ' + res.statusMessage);
            res.on('data', function(data){
                var invoice = JSON.parse(data);
                payment_service.registerStateChangeUpdates(invoice.invoiceId);
                callback(null, invoice);
            });
        }
    ).end(body);
};

payment_service.getBip21 = function(invoice, callback){
    var options = {
        hostname: 'localhost',
        port: 8080,
        path: '/v1/invoices/' + invoice.invoiceId + '/bip21',
        agent: false,
        method: 'GET'
    };
    var req = http.request(options, function (res) {
            console.log(res.statusCode + ' ' + res.statusMessage);
            res.on('data', function(data){
                var bip21 = data.toString();
                callback(null, bip21);
            });
        }
    ).end();
};

addInvoiceIdToList = function(invoiceId){
    if(registeredInvoiceIds.findIndex(invoiceId) != -1){
        registeredInvoiceIds.push(invoiceId);
    }
};

removeInvoiceIdFromList = function (invoiceId) {
    var index = registeredInvoiceIds.findIndex(invoiceId);
    if(index != -1){
        registeredInvoiceIds.splice(index,1);
    }
};

payment_service.registerStateChangeUpdates = function(invoiceId){
    socket.emit('room',invoiceId);
    addInvoiceIdToList(invoiceId);
};
payment_service.unregisterStateChangeUpdates = function(invoiceId){
    socket.emit('leave',invoiceId);
    removeInvoiceIdFromList(invoiceId);
};

module.exports = payment_service;