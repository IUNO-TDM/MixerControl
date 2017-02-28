/**
 * Created by goergch on 25.01.17.
 */
/**
 * Created by goergch on 24.01.17.
 */
var timer = require('timers');
var osm = require('./order_state_machine');
// Constructor
function Order(number, orderName, drinkId, offerId) {
  // always initialize all instance properties
  this.orderNumber = number;
  this.orderName = orderName;
  this.drinkId = drinkId;
  this.offerId = offerId;

  osm.init(this);
}
// export the class
module.exports = Order;

