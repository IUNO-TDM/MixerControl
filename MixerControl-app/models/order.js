/**
 * Created by goergch on 25.01.17.
 */
/**
 * Created by goergch on 24.01.17.
 */
var timer = require('timers');

// Constructor
function Order(number, orderName, drinkId, recipe) {
    // always initialize all instance properties
    this.orderNumber = number;
    this.orderName = orderName;
    this.drinkId = drinkId;
    this.recipe = recipe;
    this.stringify = function () {
        return JSON.stringify(this.strip());
    }
    this.strip = function () {
        var order = {};
        order.orderNumber = this.orderNumber;
        order.orderName = this.orderName;
        order.drinkId = this.drinkId;
        return order;
    }
}

// export the class
module.exports = Order;

