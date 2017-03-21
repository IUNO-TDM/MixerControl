/**
 * Created by goergch on 23.01.17.
 */
var express = require('express');
var router = express.Router();
var logger = require('../global/logger');
var helper = require('../services/helper_service');
var Order = require('../models/order');
var OrderDB = require('../database/orderDB');
var pumpcontrol_service = require('../services/pumpcontrol_service');
var osm = require('../models/order_state_machine');
var production_queue = require('../models/production_queue');
var jms_connector = require('../connectors/juice_machine_service_connector');
var payment_service = require('../services/payment_service');

router.post('/', function (req, res, next) {
    //TODO: Validate body using json schema

    // Validation
    if (!req.body || !helper.isObject(req.body) || !Object.keys(req.body).length) {
        res.sendStatus(400);
        return;
    }
    var data = req.body;
    logger.debug(data);

    jms_connector.getRecipeForId(data.drinkId, function (e, recipe) {
        if(e){
            res.sendStatus(500);
        }else{
            var orderNumber = OrderDB.generateNewOrderNumber();
            var order = new Order(orderNumber, data.orderName, data.drinkId, recipe);
            OrderDB.addOrder(order);

            osm.init(order);

            var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
            res.set('Location', fullUrl + orderNumber);
            res.sendStatus(201);
        }

    });
});

router.get('/:id', function (req, res, next) {

    var orderId = req.params['id'];
    var order = OrderDB.getOrder(orderId);

    if (typeof  order !== 'undefined') {
        var cleanedOrder = {};
        cleanedOrder['orderNumber'] = order['orderNumber'];
        cleanedOrder['orderName'] = order['orderName'];
        cleanedOrder['drinkId'] = order['drinkId'];
        res.send(JSON.stringify(cleanedOrder));
    } else {
        res.sendStatus(404);
    }
});


router.get('/:id/paymentRequest', function (req, res, next) {

    var orderId = req.params['id'];
    var order = OrderDB.getOrder(orderId);

    if (!order) {
        res.sendStatus(404);
        return;
    }

    if(order.paymentRequest != undefined){
        res.send(order.paymentRequest);
    }else {
        res.sendStatus(404);
    }

    // jms_connector.getOfferForId(order.offerId, function (e, offer) {
    //     if (!helper.isObject(offer) || !Object.keys(offer).length) {
    //         res.sendStatus(404);
    //         return;
    //     }
    //
    //     //TODO: Call the payment service to generate the payment request.
    //     res.send('bitcoin:n1Q5Tpn5gqD8EwjT3tUsydpSct86eZsRAQ?amount=0.05000000')
    // });


});


router.put('/:id/payment', function (req, res, next) {

    var orderId = req.params['id'];
    var order = OrderDB.getOrder(orderId);
    const invoice = order.invoice;
    //TODO remove this logging later
    logger.debug("PaymentString: " + req.body);

    const data = req.body;
    if (invoice != undefined){
        if(data != undefined){
            payment_service.redeemCoupon(invoice,data, function(statusCode){
                res.sendStatus(statusCode);
            });
        }else{
            res.sendStatus(400);
        }
    }else {
        res.sendStatus(400);
    }


});


router.put('/:id/productionStart', function (req, res, next) {

    var orderId = req.params['id'];

    var order = OrderDB.getOrder(orderId);
    if (order) {
        var success = production_queue.startConfirmed(order);
        if (success) {
            res.sendStatus(200);
        } else {
            res.sendStatus(500);
        }
    } else {
        res.sendStatus(404);
    }


});


router.put('/:id/resume', function (req, res, next) {

    var orderId = req.params['id'];

    var order = OrderDB.getOrder(orderId);
    if(order){
        var success = osm.resume(order);
        res.sendStatus(201);
    }else {
        res.sendStatus(404);
    }


});

module.exports = router;
