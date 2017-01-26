/**
 * Created by goergch on 25.01.17.
 */
/**
 * Created by goergch on 24.01.17.
 */
var timer = require('timers');
var osm = require('./order-state-machine');
// Constructor
function order(number) {
  // always initialize all instance properties
  this.orderNumber = number;

  osm.init(this);
}
// export the class
module.exports = order;

