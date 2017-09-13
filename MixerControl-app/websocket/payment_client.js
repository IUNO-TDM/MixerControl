/**
 * Created by goergch on 07.03.17.
 */

const config = require('../config/config_loader');
const helper = require('../services/helper_service');
const logger = require('../global/logger');
const io = require('socket.io-client');
const orderDB = require('../database/orderDB');

const PaymentService = function () {
    logger.info('[payment_updated] New instance');
    this.registeredInvoiceIds = {};

    this.addInvoiceIdToList = function (invoiceId) {
        if (!this.registeredInvoiceIds[invoiceId]) {
            this.registeredInvoiceIds[invoiceId] = true;
        }
    };
    this.removeInvoiceIdFromList = function (invoiceId) {
        if (this.registeredInvoiceIds[invoiceId]) {
            delete this.registeredInvoiceIds[invoiceId];
        }
    }
};

const payment_service = new PaymentService();

payment_service.socket = io.connect(helper.formatString(
    '{0}://{1}:{2}/invoices',
    config.HOST_SETTINGS.PAYMENT_SERVICE.PROTOCOL,
    config.HOST_SETTINGS.PAYMENT_SERVICE.HOST,
    config.HOST_SETTINGS.PAYMENT_SERVICE.PORT), {transports: ['websocket']});

payment_service.socket.on('connect', function () {
    const paymentREST = require('../adapter/payment_service_adapter');
    const orderStateMachine = require('../models/order_state_machine');

    logger.debug("[payment_client] connected to paymentservice");

    // Register on existing invoice ids if the connection got lost.
    Object.keys(payment_service.registeredInvoiceIds).forEach(function (invoiceId) {
        paymentREST.getInvoice(invoiceId, function (err, invoice) {
            if (!err && invoice) {
                logger.info('[payment_client] register for invoice updates after reconnect. invoiceId: ' + invoiceId);
                payment_service.socket.emit('room', invoiceId);
            }
            else {
                const order = orderDB.getOrderByInvoiceId(invoiceId);
                logger.info('[payment_client] Setting error state for order after payment service reconnect. invoiceId: ' + invoiceId);
                orderStateMachine.error(order);
            }
        });
    });

});
payment_service.socket.on('StateChange', function (data) {
    const orderStateMachine = require('../models/order_state_machine');
    const state = JSON.parse(data);

    if (state.state === 'pending' || state.state === 'building') {
        const orderNumber = state.referenceId;
        const order = orderDB.getOrder(orderNumber);
        if (order !== undefined) {
            payment_service.unregisterStateChangeUpdates(order.invoice.invoiceId);
            orderStateMachine.paymentArrived(order);
        }
    }
});

payment_service.socket.on('connect_error', function (error) {
    logger.debug("[payment_client] Connection Error: " + error);
});

payment_service.socket.on('disconnect', function () {
    logger.debug("[payment_client] Disconnected from paymentservice");
});

payment_service.registerStateChangeUpdates = function (invoiceId) {
    payment_service.socket.emit('room', invoiceId);
    payment_service.addInvoiceIdToList(invoiceId);
};
payment_service.unregisterStateChangeUpdates = function (invoiceId) {
    payment_service.socket.emit('leave', invoiceId);
    payment_service.removeInvoiceIdFromList(invoiceId);
};


module.exports = payment_service;
