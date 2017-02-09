/**
 * Created by goergch on 23.01.17.
 */
var express = require('express');
var router = express.Router();
var logger = require('../global/logger');
var production_queue = require('../models/production_queue');


router.post('/startConfirm', function (req, res, next) {
  production_queue.startConfirmed();
  res.sendStatus(200);
});

//
// router.post('/', function (req, res, next) {
//   // Validation
//   if (!req.body || !helper.isObject(req.body) || !Object.keys(req.body).length) {
//     res.sendStatus(400);
//     return;
//   }
//   var data = req.body;
//   logger.debug(data);
//   var jsonData = JSON.parse(data);
//   //generate order
//
//   var orderNumber = OrderDB.generateNewOrderNumber();
//   var order = new Order(orderNumber);
//   order.customerName = jsonData.customerName;
//   order.drinkID = jsonData.drinkID;
//   OrderDB.addOrder(order);
//   OSM.init(order);
//   var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
//   res.set('Location', fullUrl + orderNumber);
//   res.sendStatus(201);
// });
//
//
// router.get('/:id/state', function (req, res, next) {
//
//   var orderId = req.params['id'];
//   res.send('hereCouldBeYourOrderState')
// });
//
//
// router.get('/:id/paymentRequest', function (req, res, next) {
//
//   var orderId = req.params['id'];
//
//   res.send('bitcoin:n1Q5Tpn5gqD8EwjT3tUsydpSct86eZsRAQ?amount=0.05000000')
// });


module.exports = router;
