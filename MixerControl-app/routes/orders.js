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
var jms_connector = require('../adapter/juice_machine_service_adapter');
var payment_service = require('../adapter/payment_service_adapter');
var cache = require('../services/cache_middleware');

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
        if (e) {
            res.sendStatus(500);
        } else {
            var orderNumber = OrderDB.generateNewOrderNumber();
            var order = new Order(orderNumber, recipe.title, data.drinkId, recipe);
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

    if (order.paymentRequest !== undefined) {
        res.send({PaymentRequest:order.paymentRequest});
    } else {
        res.sendStatus(404);
    }
});


router.put('/:id/payment', function (req, res, next) {

    const orderId = req.params['id'];
    const order = OrderDB.getOrder(orderId);
    const invoice = order.invoice;


    let data = req.body;
    if (invoice !== undefined) {
        if (data !== undefined) {
            if (data.startsWith("http://iuno.axoom.cloud/?") || data.startsWith("http://iuno.axoom.cloud/#")) {
                data = data.substring(25);
            }

            payment_service.redeemCoupon(invoice, data, function (err, paymentResponse, data) {
                if (paymentResponse) {
                    res.statusMessage = paymentResponse.statusMessage;
                    res.status(paymentResponse.statusCode);
                }

                if (data) {
                    res.json(data);
                }
                else if(err) {
                    res.json(err);
                }
                else {
                    res.sendStatus(500);
                }

            });
        } else {
            res.sendStatus(400);
        }
    } else {
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
    if (order) {
        var success = osm.resume(order);
        res.sendStatus(201);
    } else {
        res.sendStatus(404);
    }


});

module.exports = router;
