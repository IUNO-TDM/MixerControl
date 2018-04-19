/**
 * Created by goergch on 07.03.17.
 */

const config = require('../config/config_loader');
const logger = require('../global/logger');
const request = require('request');
const paymentWsClient = require('../websocket/payment_client');

const self = {};


// ---------------------------------------------
// -------------- REST-CALLS -------------------
// ---------------------------------------------

self.createLocalInvoiceForOrder = function (stateMachine, order) {

    const invoice = order.invoice;

    if (!invoice) {
        logger.crit('[payment_service_adapter]: Missing invoice in order.');
        return stateMachine.error(order);
    }

    const options = buildOptionsForRequest('POST', {}, invoice);

    request(options, function (e, r, data) {

        const err = logger.logRequestAndResponse(e, options, r, data);

        if (err || !data) {
            return stateMachine.error(order);
        }

        paymentWsClient.registerStateChangeUpdates(data.invoiceId);

        order.invoice = data;
        self.getBip21(data, function (e, bip21) {
            if (e || !bip21) {
                logger.crit(e);
                logger.crit('[payment_service_adapter] Error when retrieving BIP21 from payment service');
                return stateMachine.error(order);
            }
            order.paymentRequest = bip21;
            stateMachine.paymentRequestReceived(order);
        })

    });

};


self.getBip21 = function (invoice, callback) {
    if (!invoice) {
        return callback(new Error('Missing function argument invoice: ' + invoice));
    }

    if (typeof(callback) !== 'function') {
        callback = function () {
            logger.info('[payment_service_adapter] Callback not registered');
        }
    }

    const options = buildOptionsForRequest('GET', {}, null, '/v1/invoices/' + invoice.invoiceId + '/bip21');

    request(options, function (e, r, data) {

        const err = logger.logRequestAndResponse(e, options, r, data);
        if (err || !data) {
            callback(err, null);
        } else {
            const bip21 = data.toString();
            callback(null, bip21);
        }


    });
};

self.getWalletBalance = function (callback) {

    if (typeof(callback) !== 'function') {
        callback = function () {
            logger.info('[payment_service_adapter] Callback not registered');
        }
    }

    const options = buildOptionsForRequest('GET', {}, null, '/v1/wallet/balance');

    request(options, function (e, r, data) {

        const err = logger.logRequestAndResponse(e, options, r, data);
        if (err || !data) {
            callback(err, null);
        } else {

            callback(null, data);
        }
    });
};


self.redeemCoupon = function (invoice, couponKey, callback) {
    if (!invoice || !couponKey) {
        return callback(new Error('Missing function arguments: Invoice: ' + invoice + ' CouponKey: ' + couponKey));
    }
    const options = buildOptionsForRequest(
        'POST',
        {},
        {"coupon": couponKey},
        '/v1/invoices/' + invoice.invoiceId + '/coupons'
    );

    request(options, function (e, r, data) {

        const err = logger.logRequestAndResponse(e, options, r, data);
        if (err || !data) {
            callback(err, r, data);
        } else {
            callback(null, r, data);
        }
    });
};

self.getInvoice = function (invoiceId, callback) {
    const options = buildOptionsForRequest(
        'POST',
        {},
        null,
        '/v1/invoices/' + invoiceId
    );

    request(options, function (e, r, data) {

        const err = logger.logRequestAndResponse(e, options, r, data);

        callback(err, data);
    });
};

function buildOptionsForRequest(method, qs, body, path) {

    if (!path) {
        path = '/v1/invoices/';
    }

    return {
        method: method,
        url: config.HOST_SETTINGS.PAYMENT_SERVICE.PROTOCOL +
        '://' + config.HOST_SETTINGS.PAYMENT_SERVICE.HOST + ':' + config.HOST_SETTINGS.PAYMENT_SERVICE.PORT + path,
        json: true,
        headers: {
            'Content-Type': 'application/json'
        },
        qs: qs,
        body: body
    }
}


module.exports = self;
