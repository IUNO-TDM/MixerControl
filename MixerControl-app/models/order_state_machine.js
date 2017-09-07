/**
 * Created by goergch on 25.01.17.
 */

const CONFIG = require('../config/config_loader');

const machina = require('machina');
const production_queue = require('../models/production_queue');
const juiceMachineService = require('../adapter/juice_machine_service_adapter');
const logger = require('../global/logger');
const payment_service = require('../services/payment_service');
const orderDB = require('../database/orderDB');
const license_service = require('../services/license_service');
const licenseManager = require('../adapter/license_manager_adapter');
const stateMachine = new machina.BehavioralFsm({
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
                const self = this;
                console.log("Ordernumber " + client.orderNumber + " is now state waitingOffer ");
                licenseManager.getHsmId(function (err, hsmId) {
                    if (!err && hsmId) {
                        license_service.registerUpdates(hsmId);
                        juiceMachineService.requestOfferForOrders(hsmId, [
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

                            client.offerId = offer.id;
                            client.invoice = offer.invoice;

                            let totalAmount = 0;
                            for (let key in client.invoice.transfers) {
                                let transfer = client.invoice.transfers[key];
                                totalAmount += transfer.coin;
                            }
                            client.invoice.totalAmount = payment_service.calculateRetailPriceForInvoice(client.invoice);
                            client.invoice.referenceId = client.orderNumber;


                            self.handle(client, "offerReceived");


                        });
                    }
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
          paymentArrived: "waitingLicenseAvailable",

          licenseAvailable: function (client) {
              this.deferUntilTransition(client);
              this.transition(client, 'waitingLicenseAvailable');

            },
          licenseArrived: function (client) {
              this.deferUntilTransition(client);
              this.transition(client, 'waitingLicenseAvailable');

            }
        },
        waitingLicenseAvailable: {
          _onEnter: function (client) {
            payment_service.unregisterStateChangeUpdates(client.invoice.invoiceId);
          },
          licenseAvailable: "waitingLicense",
          licenseArrived: function (client) {
            this.deferUntilTransition(client);
            this.transition(client, 'waitingLicense');

          }
        },
        waitingLicense: {

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
            resume: "enqueueForProduction"
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
    licenseAvailable: function (client) {
      this.handle(client, "licenseAvailable");
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
        if (state === 'waitingStart') {
            stateMachine.readyForProduction(order);
        } else if (state === 'processingOrder') {
            stateMachine.productionStarted(order);
        } else if (state === 'finished') {
            stateMachine.productionFinished(order);
        } else if (state === 'error') {
            stateMachine.productionFinished(order);
        } else if (state === 'waitingPump' || state === 'productionPaused' || state === 'pumpControlServiceMode') {
            stateMachine.productionPaused(order);
        } else if (state === 'errorProcessing') {
            stateMachine.error(order);
        }
    }
});

payment_service.on('StateChange', function (state) {
    if (state.state === 'pending' || state.state === 'building') {
        const orderNumber = state.referenceId;
        const order = orderDB.getOrder(orderNumber);
        if (order !== undefined) {
            stateMachine.paymentArrived(order);
        }

    }

});

const getOrderWithOfferId = function (offerId) {
    const orderDict = orderDB.getOrders();
    for (var key in orderDict) {
        const order = orderDict[key];

        if (order.offerId === offerId) {
            return order;
        }
    }

    return undefined;
};


//TODO: Move this into the license service module and inject a order state machine reference
license_service.on('updateAvailable', function (offerId, hsmId) {

    const order = getOrderWithOfferId(offerId);
    stateMachine.licenseAvailable(order);
    if (order) {
        updateCMDongle(hsmId, function (err) {
            if (err) {
                return;
            }

            stateMachine.licenseArrived(order);
        });

    }
});


// TODO: Move this into the license service when refactoring the order state machine.
function updateCMDongle(hsmId, callback) {
    if (license_service.isUpdating) {
        logger.warn('[order_state_machine] Update cycle is already running.');
        return callback(new Error('Update cycle already running'));
    }

    license_service.isUpdating = true;
    logger.debug('[order_state_machine] Starting update cycle for hsmId: ' + hsmId);

    licenseManager.getContextForHsmId(hsmId, function (err, context) {
        if (err || !context) {
            logger.crit('[order_state_machine] could not get context from license manager');
            license_service.isUpdating = false;
            return callback(err);
        }

        juiceMachineService.getLicenseUpdate(hsmId, context, function (err, update, isOutOfDate) {
            if (err || !context) {
                logger.crit('[order_state_machine] could not get license update from webservice');
                license_service.isUpdating = false;
                return callback(err);
            }

            licenseManager.updateHsm(hsmId, update, function (err, success) {
                if (err || !success) {
                    logger.crit('[order_state_machine] could not update hsm on license manager');

                    juiceMachineService.confirmLicenseUpdate(hsmId, context, function (err) {
                        license_service.isUpdating = false;

                        if (err) {
                            logger.crit('[order_state_machine] could not confirm update on license manager');
                            return callback(err);
                        }

                        logger.warn('[order_state_machine] CM-Dongle context is out of date. Restarting update cycle');
                        return updateCMDongle(hsmId, callback)
                    });
                }
                else {
                    licenseManager.getContextForHsmId(hsmId, function (err, context) {
                        if (err || !context) {
                            logger.crit('[order_state_machine] could not get context from license manager');
                            license_service.isUpdating = false;
                            return callback(err);
                        }

                        juiceMachineService.confirmLicenseUpdate(hsmId, context, function (err) {
                            license_service.isUpdating = false;

                            if (err) {
                                logger.crit('[order_state_machine] could not confirm update on license manager');
                                return callback(err);
                            }

                            // Restart the update process as long the returned context is out of date
                            if (isOutOfDate) {
                                logger.warn('[order_state_machine] CM-Dongle context is out of date. Restarting update cycle');
                                return updateCMDongle(hsmId, callback)
                            }

                            callback(null)
                        });
                    });
                }
            });
        });
    });
}

module.exports = stateMachine;
