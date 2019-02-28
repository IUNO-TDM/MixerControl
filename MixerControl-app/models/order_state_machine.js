/**
 * Created by goergch on 25.01.17.
 */

const machina = require('machina');
const production_queue = require('../models/production_queue');
const logger = require('../global/logger');
const payment_service = require('../adapter/payment_service_adapter');
const offerService = require('../services/offer_service');
const jms = require('../adapter/juice_machine_service_adapter');
const config = require('../config/config_loader');

const stateMachine = new machina.BehavioralFsm({
    initialize: function (options) {

    },

    namespace: "order-states",

    initialState: "uninitialized",

    states: {
        uninitialized: {
            _init: "waitingOffer"
        },

        waitingOffer: {
            _onEnter: function (order) {
                logger.info("Ordernumber " + order.orderNumber + " is now state waitingOffer ");

                offerService.requestOfferForOrder(this, order);
            },
            offerReceived: "waitingPaymentRequest",
            onError: function (client) {
                this.transition(client, "error");
            }
        },
        waitingPaymentRequest: {
            _onEnter: function (order) {
                logger.info("Ordernumber " + order.orderNumber + " is now state waitingPaymentRequest ");

                payment_service.createLocalInvoiceForOrder(this, order);
            },
            paymentRequestReceived: "waitingPayment",
            onError: function (client) {
                this.transition(client, "error");
            }
        },
        waitingPayment: {
            _onEnter: function (client) {
                logger.info("Ordernumber " + client.orderNumber + " is now state waitingPayment ");
            },
            paymentArrived: "waitingLicenseAvailable",

            licenseAvailable: function (client) {
                this.deferUntilTransition(client);
                this.transition(client, 'waitingLicenseAvailable');

            },
            licenseArrived: function (client) {
                this.deferUntilTransition(client);
                this.transition(client, 'waitingLicenseAvailable');

            },
            onError: function (client) {
                this.transition(client, "error");
            }
        },
        waitingLicenseAvailable: {
            _onEnter: function (order) {
                order.license_poll_retries = config.MAX_RETRIES_LICENSE_POLL;
                order.licenseTimeout = setInterval(() => {
                    offerService.requestLicenseUpdateForOrder(this, order);

                    order.license_poll_retries -= 1;

                    if (order.license_poll_retries <= 0) {
                        this.transition(order, "error");
                    }

                }, 10000);
            },
            licenseAvailable: function (order) {
                clearInterval(order.licenseTimeout);
                this.transition(order, 'waitingLicense');
            },
            licenseArrived: function (order) {
                clearInterval(order.licenseTimeout);
                this.deferUntilTransition(order);
                this.transition(order, 'waitingLicense');

            },
            onError: function (order) {
                clearInterval(order.licenseTimeout);
                this.transition(order, "error");
            }
        },
        waitingLicense: {
            licenseArrived: function (order) {
                //TODO: Maybe we should introduce a new state for downloading the encrypted recipe
                logger.debug('[order_state_machine] License arrived => Now downloading the encrypted recipe');
                jms.getRecipeProgramForId(order.drinkId, order.offerId, (err, program) => {

                    if (err) {
                        return this.transition(order, "error");
                    }

                    order.recipe['program'] = program;

                    this.transition(order, "enqueueForProduction");
                });
            },
            onError: function (client) {
                this.transition(client, "error");
            }
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
            },
            onError: function (client) {
                this.transition(client, "error");
            }

        },
        waitForProduction: {
            readyForProduction: "readyForProduction",
            pause: "orderPaused",
            onError: function (client) {
                this.transition(client, "error");
            }
        },
        readyForProduction: {
            _onEnter: function (client) {
            },
            productionStarted: "inProduction",
            productionPaused: "waitForProduction",
            onError: function (client) {
                this.transition(client, "error");
            }
        },
        inProduction: {
            _onEnter: function (client) {

            },
            productionFinished: "productionFinished",
            onError: function (client) {
                this.transition(client, "error");
            }
        },
        productionFinished: {
            onEnter: function (client) {

            },
            onError: function (client) {
                this.transition(client, "error");
            }
        },
        orderPaused: {
            _onEnter: function (client) {
                production_queue.removeOrderFromQueue(client);
            },
            resume: "enqueueForProduction",
            onError: function (client) {
                this.transition(client, "error");
            }
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
        this.handle(client, "onError");
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

module.exports = stateMachine;
