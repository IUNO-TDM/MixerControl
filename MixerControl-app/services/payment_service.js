/**
 * Created by goergch on 07.03.17.
 */

const EventEmitter = require('events').EventEmitter;
const util = require('util');
const http = require('http');
const config = require('../config/config_loader');
const helper = require('../services/helper_service');

const logger = require('../global/logger');
const io = require('socket.io-client');


const registeredInvoiceIds = [];


const PaymentService = function () {
    console.log('a new instance of PaymentService');
};

const payment_service = new PaymentService();
util.inherits(PaymentService, EventEmitter);

payment_service.socket = io.connect(helper.formatString(
    '{0}://{1}:{2}/invoices',
    config.HOST_SETTINGS.PAYMENT_SERVICE.PROTOCOL,
    config.HOST_SETTINGS.PAYMENT_SERVICE.HOST,
    config.HOST_SETTINGS.PAYMENT_SERVICE.PORT), {transports: ['websocket']});

payment_service.socket.on('connect', function () {
    logger.debug("connected to paymentservice");
    for (var invoiceId in registeredInvoiceIds) {
        payment_service.socket.emit('room', invoiceId);
    }


});

payment_service.socket.on('StateChange', function (data) {
    logger.debug("StateChange: " + data);
    payment_service.emit('StateChange', JSON.parse(data));
});


payment_service.socket.on('disconnect', function () {
    logger.debug("disconnect");
});

payment_service.createLocalInvoice = function (invoice, callback) {
    try {
        const body = JSON.stringify(invoice);
        const options = {
            hostname: config.HOST_SETTINGS.PAYMENT_SERVICE.HOST,
            port: config.HOST_SETTINGS.PAYMENT_SERVICE.PORT,
            path: '/v1/invoices/',
            agent: false,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        const req = http.request(options, function (res) {
                try {
                    console.log(res.statusCode + ' ' + res.statusMessage);
                    res.on('data', function (data) {
                        const invoice = JSON.parse(data);
                        payment_service.registerStateChangeUpdates(invoice.invoiceId);
                        callback(null, invoice);
                    });
                }
                catch (err) {
                    logger.crit('[payment_service] Error while creating invoice');
                    logger.crit(err);
                    callback(err);
                }
            }
        ).end(body);
    }
    catch (err) {
        logger.crit('[payment_service] Error while creating invoice');
        logger.crit(err);
        callback(err);
    }
};

payment_service.getBip21 = function (invoice, callback) {
    const options = {
        hostname: config.HOST_SETTINGS.PAYMENT_SERVICE.HOST,
        port: config.HOST_SETTINGS.PAYMENT_SERVICE.PORT,
        path: '/v1/invoices/' + invoice.invoiceId + '/bip21',
        agent: false,
        method: 'GET'
    };
    const req = http.request(options, function (res) {
            console.log(res.statusCode + ' ' + res.statusMessage);
            res.on('data', function (data) {
                var bip21 = data.toString();
                callback(null, bip21);
            });
        }
    ).end();
};

payment_service.redeemCoupon = function (invoice, couponKey, callback) {
    const options = {
        hostname: config.HOST_SETTINGS.PAYMENT_SERVICE.HOST,
        port: config.HOST_SETTINGS.PAYMENT_SERVICE.PORT,
        path: '/v1/invoices/' + invoice.invoiceId + '/coupons',
        agent: false,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    const body = {"coupon": couponKey};
    //TODO remove this logging later
    logger.debug("Redeem Coupon: " + JSON.stringify(body));
    const req = http.request(options, function (res) {
            logger.log('[paymentservice] ' + res.statusCode + ' ' + res.statusMessage);
            callback(res.statusCode);
        }
    ).end(JSON.stringify(body));
};


addInvoiceIdToList = function (invoiceId) {
    if (registeredInvoiceIds.indexOf(invoiceId) !== -1) {
        registeredInvoiceIds.push(invoiceId);
    }
};

const removeInvoiceIdFromList = function (invoiceId) {
    const index = registeredInvoiceIds.indexOf(invoiceId);
    if (index !== -1) {
        registeredInvoiceIds.splice(index, 1);
    }
};

payment_service.registerStateChangeUpdates = function (invoiceId) {
    payment_service.socket.emit('room', invoiceId);
    addInvoiceIdToList(invoiceId);
};
payment_service.unregisterStateChangeUpdates = function (invoiceId) {
    payment_service.socket.emit('leave', invoiceId);
    removeInvoiceIdFromList(invoiceId);
};

payment_service.calculateRetailPriceForInvoice = function(invoice) {
    if (!invoice) {
        return 0;
    }

    let retailPrice = 0;
    for (let key in invoice.transfers) {
        retailPrice += config.RETAIL_PRICE; //TODO: Make this configurable by the machine operator
    }
    return retailPrice;
};

module.exports = payment_service;