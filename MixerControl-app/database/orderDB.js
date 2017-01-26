/**
 * Created by goergch on 25.01.17.
 */

// var Order = require('./order');
var orderDB = new Object();
orderDB.orderDict = {};
orderDB.addOrder = function (order) {
    orderDB.orderDict[order.orderNumber] = order;
};

orderDB.getOrder = function(orderNumber) {
    return orderDB.orderDict[orderNumber];
};

orderDB.generateNewOrderNumber = function() {
  var i = 0;
  while(typeof orderDB.orderDict[i] !== "undefined"){
    i++;
  }
  return i;
};


module.exports = orderDB;
