/**
 * Created by goergch on 25.01.17.
 */

var machina = require('machina');
var production_queue = require('../models/production_queue');
var jms_connector = require('../connectors/juice_machine_service_connector');
var logger = require('../global/logger');
var payment_service = require('../services/payment_service');
var orderDB = require('../database/orderDB');
var license_service = require('../services/license_service');
var stateMachine = new machina.BehavioralFsm({
    initialize: function (options) {
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
                license_service.registerUpdates('TW552HSM');
                var self = this;
                jms_connector.requestOfferForOrders("TW552HSM", [
                    {
                        recipeId: client.drinkId,
                        amount: 1
                    }
                ], function (e, offer) {
                    logger.debug(offer);
                    if (e) {
                        logger.crit(e);

                        return;
                    }
                    //TODO: Parse result into object before using it
                    client.offerId = offer.id;
                    client.invoice = offer.invoice;
                    var totalAmount = 0;
                    for (var key in client.invoice.transfers) {
                        var transfer = client.invoice.transfers[key];
                        totalAmount += transfer.coin;
                    }
                    client.invoice.totalAmount = totalAmount * 1.5;
                    client.invoice.referenceId = client.orderNumber;

                    //TODO replace, when marketplace api and paymentservice api are synchronous
                    // var expDate = new Date();
                    // expDate.setHours(expDate.getHours()+1);
                    // const inv = {
                    //     totalAmount: 100000,
                    //     expiration: expDate,
                    //     referenceId: client.orderNumber,
                    //     transfers:[{
                    //         address: 'mvGXYeuze85kyK1HJ443rVjotMCCvAaYkb',
                    //         coin: 90000
                    //     }]
                    //
                    // };
                    // client.invoice = inv;

                    self.handle(client, "offerReceived");


                });
            },
            offerReceived: "waitingPaymentRequest"
        },
        waitingPaymentRequest: {
            _onEnter: function (client) {
                var self = this;
                payment_service.createLocalInvoice(client.invoice, function (e, invoice) {
                    client.invoice = invoice;
                    payment_service.getBip21(invoice, function (e, bip21) {
                        client.paymentRequest = bip21;
                        self.handle(client, 'paymentRequestReceived')
                    })
                });
                // console.log("Ordernumber " + client.orderNumber + " is now state waitingPaymentRequest ");
                // this.timer = setTimeout(function () {
                //     this.handle(client, "paymentRequestReceived");
                // }.bind(this), 5000);


            },
            paymentRequestReceived: "waitingPayment"
        },
        waitingPayment: {
            _onEnter: function (client) {
                console.log("Ordernumber " + client.orderNumber + " is now state waitingPayment ");
                // this.timer = setTimeout( function() {
                //   this.handle(client, "paymentArrived" );
                // }.bind( this ), 5000 );
                //display PR QR Code
            },
            paymentArrived: "waitingLicense",
            licenseArrived: function (client) {
                this.deferUntilTransition(client,'waitingLicense');
                this.transition(client,'waitingLicense' );

            }
        },
        waitingLicense: {
            _onEnter: function (client) {
                //??sendPaymentToMarketplace??
                payment_service.unregisterStateChangeUpdates(client.invoice.invoiceId);
                this.timer = setTimeout(function () {
                    this.handle(client, "licenseArrived");
                }.bind(this), 5000);
            },
            licenseArrived: "enqueueForProduction"
        },

        enqueueForProduction: {
            _onEnter: function (client) {
                if (production_queue.addOrderToQueue(client)) {
                    this.transition(client, "waitForProduction");
                } else {
                    this.transition(client, "error");
                }
            },
            readyForProduction: function (client) {
                this.deferUntilTransition(client, "waitForProduction");
            }

        },
        waitForProduction: {

            readyForProduction: "readyForProduction",
            pause: "orderPaused"
        },
        readyForProduction: {
            _onEnter: function (client) {
            },
            productionStarted: "inProduction",
            productionPaused: "waitForProduction",
            error: "error"
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
            resume: "enqueueForProduction"
        },
        error: {
            resume: "waitForProduction"
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
    },
    error: function (client) {
        this.handle(client, "error");
    },
    productionPaused: function (client) {
        this.handle(client, "productionPaused");
    }

});

production_queue.on('state', function (state, order) {
    if (typeof order !== 'undefined') {
        if (state == 'waitingStart') {
            stateMachine.readyForProduction(order);
        } else if (state == 'processingOrder') {
            stateMachine.productionStarted(order);
        } else if (state == 'finished') {
            stateMachine.productionFinished(order);
        } else if (state == 'error') {
            stateMachine.productionFinished(order);
        } else if (state == 'waitingPump' || state == 'productionPaused' || state == 'pumpControlServiceMode') {
            stateMachine.productionPaused(order);
        } else if (state == 'errorProcessing') {
            stateMachine.error(order);
        }
    }
});

payment_service.on('StateChange', function (state) {
    if (state.state == 'pending' || state.state == 'building') {
        var orderNumber = state.referenceId;
        var order = orderDB.getOrder(orderNumber);
        if (order != undefined) {
            stateMachine.paymentArrived(order);
        }

    }

});
var getOrderWithOfferId = function (offerId) {
    var orderDict = orderDB.getOrders();
    for (var key in orderDict) {
        var order = orderDict[key];

        if (order.offerId == offerId) {
            return order;
        }
    }

    return undefined;
};

//TODO change, when licenses can be downloaded. This is too early...
license_service.on('updateAvailable', function (offerId, hsmId) {
    var order = getOrderWithOfferId(offerId);
    if (order) {
        stateMachine.licenseArrived(order);
    }

});

module.exports = stateMachine;
