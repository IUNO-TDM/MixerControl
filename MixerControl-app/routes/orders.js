/**
 * Created by goergch on 23.01.17.
 */
var express = require('express');
var router = express.Router();
var logger = require('../global/logger');
var helper = require('../services/helper_service');
var Order = require('../models/order');
var OSM = require('../models/order-state-machine');
var OrderDB = require('../database/orderDB');



router.post('/', function (req, res, next) {
  // Validation
  if (!req.body || !helper.isObject(req.body) || !Object.keys(req.body).length) {
    res.sendStatus(400);
    return
  }
  var data = req.body;
  logger.debug(data);

  //generate order

  var orderNumber = OrderDB.generateNewOrderNumber();
  var order = new Order(orderNumber);
  OrderDB.addOrder(order);
  OSM.init(order);
  var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  res.set('Location', fullUrl + orderNumber);
  res.sendStatus(201);
});


router.get('/:id/state', function (req, res, next) {

  var orderId = req.params['id'];

  res.send('hereCouldBeYourOrderState')
});


router.get('/:id/state', function (req, res, next) {

  var orderId = req.params['id'];

  res.send('hereCouldBeYourOrderState')
});


router.get('/:id/paymentRequest', function (req, res, next) {

  var orderId = req.params['id'];

  res.send('bitcoin:n1Q5Tpn5gqD8EwjT3tUsydpSct86eZsRAQ?amount=0.05000000')
});


module.exports = router;
