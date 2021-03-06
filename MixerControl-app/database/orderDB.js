/**
 * Created by goergch on 25.01.17.
 */

const EventEmitter = require('events').EventEmitter;
const util = require('util');

var OrderDB = function () {
};

const orderDB = new OrderDB();
util.inherits(OrderDB, EventEmitter);

orderDB.orderDict = {};
orderDB.addOrder = function (order) {
    orderDB.orderDict[order.orderNumber] = order;
    orderDB.emit('add', order);
};

orderDB.getOrder = function (orderNumber) {
    return orderDB.orderDict[orderNumber];
};

orderDB.getOrders = function () {
    return orderDB.orderDict;
};

orderDB.getOrderByInvoiceId = function (invoiceId) {
    const orderDict = orderDB.getOrders();
    for (var key in orderDict) {
        const order = orderDict[key];

        if (order && order.invoice && (order.invoice.invoiceId === invoiceId)) {
            return order;
        }
    }

    return undefined;
};

orderDB.getOrderByOfferId = function (offerId) {
    const orderDict = orderDB.getOrders();
    for (var key in orderDict) {
        const order = orderDict[key];

        if (order.offerId === offerId) {
            return order;
        }
    }

    return undefined;
};


orderDB.generateNewOrderNumber = function () {
    var i = 0;
    while (typeof orderDB.orderDict[i] !== "undefined") {
        i++;
    }
    return i;
};


module.exports = orderDB;
