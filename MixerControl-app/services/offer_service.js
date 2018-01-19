const logger = require('../global/logger');
const licenseManager = require('../adapter/license_manager_adapter');
const juiceMachineService = require('../adapter/juice_machine_service_adapter');
const config = require('../config/config_loader');


const self = {};


self.requestOfferForOrder = function (stateMachine, order) {
    licenseManager.getHsmId(function (err, hsmId) {
        if (err || !hsmId) {
            logger.crit('[offer_service] Could not get the hsmId from the dongle. Setting error state for order');
            return stateMachine.error(order);
        }

        juiceMachineService.requestOfferForOrders(hsmId, [
            {
                recipeId: order.drinkId,
                amount: 1
            }
        ], function (err, offer) {
            logger.debug(offer);
            if (err) {
                logger.crit(err);
                return stateMachine.error(order);
            }
            try {
                order.offerId = offer.id;
                order.invoice = offer.invoice;

                let totalAmount = 0;
                for (let key in order.invoice.transfers) {
                    let transfer = order.invoice.transfers[key];
                    totalAmount += transfer.coin;
                }

                order.invoice.totalAmount = calculateRetailPriceForeOffer(offer);
                order.invoice.referenceId = order.orderNumber;

                stateMachine.offerReceived(order);
            }
            catch (err) {
                logger.crit(err);
                return stateMachine.error(order);
            }
        });
    });
};

function calculateRetailPriceForeOffer(offer) {
    //Here could be a fancy algorithm
    // But as every Drink costs the same at the moment, we just take the config value
    let retailPrice = 0;
    retailPrice = config.RETAIL_PRICE;
    return retailPrice;
}


module.exports = self;
