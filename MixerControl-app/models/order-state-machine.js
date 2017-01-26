/**
 * Created by goergch on 25.01.17.
 */

var machina = require('machina');
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
            }.bind( this ), 15000 );
            //getOfferAtTDM
          },
          offerReceived: "waitingPaymentRequest"
        },
        waitingPaymentRequest: {
          _onEnter: function (client) {
            console.log("Ordernumber " + client.orderNumber + " is now state waitingPaymentRequest ");
            this.timer = setTimeout( function() {
              this.handle(client, "paymentRequestReceived" );
            }.bind( this ), 30000 );
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
            }.bind( this ), 15000 );
          },
          licenseArrived: "enqueuedForProduction"
        },
        enqueuedForProduction: {
          _onEnter: function (client) {
            //enqueueForProduction
            this.timer = setTimeout( function() {
              this.handle(client, "dequeued" );
            }.bind( this ), 30000 );
          },
          dequeued: "readyForProduction",
          pause: "orderPaused"
        },
        readyForProduction: {
          _onEnter: function (client) {
            //startPumpControl
            this.timer = setTimeout( function() {
              this.handle(client, "productionStarted" );
            }.bind( this ), 60000 );
          },
          productionStarted: "inProduction"
        },
        inProduction: {
          _onEnter: function (client) {
            //startPumpControl
            this.timer = setTimeout( function() {
              this.handle(client, "productionFinished" );
            }.bind( this ), 120000 );
          },
          productionFinished: "productionFinished"
        },
        productionFinished: {
          onEnter: function (client) {
            //dequeue next order
          }
        },
        orderPaused: {
          _onEnter: function (client) {
            //remove from ProductionQueue
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
    dequeued: function (client) {
      this.handle(client, "dequeued");
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

module.exports = stateMachine;
