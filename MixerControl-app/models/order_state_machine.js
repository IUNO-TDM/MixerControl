/**
 * Created by goergch on 25.01.17.
 */

var machina = require('machina');
var production_queue = require('../models/production_queue');
var stateMachine = new machina.BehavioralFsm({
    initialize: function( options ) {
        // your setup code goes here...
    },

    namespace: "order-states",

    initialState: "uninitialized",

    states: {
        uninitialized: {
            _init: "waitingOffer"
        },

        waitingOffer: {
          _onEnter: function (client) {
            console.log("Ordernumber " + client.orderNumber + " is now state waitingOffer ");
            this.timer = setTimeout( function() {
              this.handle(client, "offerReceived" );
            }.bind( this ), 5000 );
            //getOfferAtTDM
          },
          offerReceived: "waitingPaymentRequest"
        },
        waitingPaymentRequest: {
          _onEnter: function (client) {
            console.log("Ordernumber " + client.orderNumber + " is now state waitingPaymentRequest ");
            this.timer = setTimeout( function() {
              this.handle(client, "paymentRequestReceived" );
            }.bind( this ), 5000 );
          },
          paymentRequestReceived: "waitingPayment"
        },
        waitingPayment: {
          _onEnter: function (client) {
            console.log("Ordernumber " + client.orderNumber + " is now state waitingPayment ");
            this.timer = setTimeout( function() {
              this.handle(client, "paymentArrived" );
            }.bind( this ), 5000 );
            //display PR QR Code
          },
          paymentArrived: "waitingLicense"
        },
        waitingLicense: {
          _onEnter: function (client) {
            //??sendPaymentToMarketplace??
            this.timer = setTimeout( function() {
              this.handle(client, "licenseArrived" );
            }.bind( this ), 5000 );
          },
          licenseArrived: "enqueuedForProduction"
        },
        enqueuedForProduction: {
          _onEnter: function (client) {
            //enqueueForProduction
            production_queue.addOrderToQueue(client);
          },
          readyForProduction: "readyForProduction",
          pause: "orderPaused"
        },
        readyForProduction: {
          _onEnter: function (client) {
          },
          productionStarted: "inProduction"
        },
        inProduction: {
          _onEnter: function (client) {
          },
          productionFinished: "productionFinished"
        },
        productionFinished: {
          onEnter: function (client) {
          }
        },
        orderPaused: {
          _onEnter: function (client) {
            production_queue.removeOrderFromQueue(client);
          },
          resume: "enqueuedForProduction"
        }
    },
    init: function (client) {
        this.handle(client, "_init");
    },
    offerReceived: function (client) {
      this.handle(client, "offerReceived");
    },
    paymentRequestReceived: function (client) {
      this.handle(client, "paymentRequestReceived");
    },
    paymentArrived: function (client) {
      this.handle(client, "paymentArrived");
    },
    licenseArrived: function (client) {
      this.handle(client, "licenseArrived");
    },
    readyForProduction: function (client) {
      this.handle(client, "readyForProduction");
    },
    productionStarted: function (client) {
      this.handle(client, "productionStarted");
    },
    productionFinished: function (client) {
      this.handle(client, "productionFinished");
    },
    pause: function (client) {
      this.handle(client, "pause");
    },
    resume: function (client) {
      this.handle(client, "resume");
  }

});

production_queue.on('state', function (state, order) {
  if (typeof order !== 'undefined'){
    if(state == 'waitingStart'){
      stateMachine.readyForProduction(order);
    }else if(state == 'processingOrder'){
      stateMachine.productionStarted(order);
    }else if(state == 'finished'){
      stateMachine.productionFinished(order);
    }
  }
});



module.exports = stateMachine;
