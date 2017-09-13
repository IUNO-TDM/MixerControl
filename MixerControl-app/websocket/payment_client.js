/**
 * Created by goergch on 07.03.17.
 */

const config = require('../config/config_loader');
const helper = require('../services/helper_service');
const logger = require('../global/logger');
const io = require('socket.io-client');
const orderDB = require('../database/orderDB');
const orderStateMachine = require('../models/order_state_machine');


const registeredInvoiceIds = [];


const PaymentService = function () {
    logger.info('[payment_updated] New instance');
};

const payment_service = new PaymentService();

payment_service.socket = io.connect(helper.formatString(
    '{0}://{1}:{2}/invoices',
    config.HOST_SETTINGS.PAYMENT_SERVICE.PROTOCOL,
    config.HOST_SETTINGS.PAYMENT_SERVICE.HOST,
    config.HOST_SETTINGS.PAYMENT_SERVICE.PORT), {transports: ['websocket']});

payment_service.socket.on('connect', function () {
    logger.debug("[payment_client] connected to paymentservice");
    for (let invoiceId in registeredInvoiceIds) {
        payment_service.socket.emit('room', invoiceId);
    }

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
    addInvoiceIdToList(invoiceId);
};
payment_service.unregisterStateChangeUpdates = function (invoiceId) {
    payment_service.socket.emit('leave', invoiceId);
    removeInvoiceIdFromList(invoiceId);
};

function addInvoiceIdToList(invoiceId) {
    if (registeredInvoiceIds.indexOf(invoiceId) !== -1) {
        registeredInvoiceIds.push(invoiceId);
    }
}
function removeInvoiceIdFromList(invoiceId) {
    const index = registeredInvoiceIds.indexOf(invoiceId);
    if (index !== -1) {
        registeredInvoiceIds.splice(index, 1);
    }
}


module.exports = payment_service;
