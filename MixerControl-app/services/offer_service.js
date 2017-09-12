const logger = require('../global/logger');
const licenseManager = require('../adapter/license_manager_adapter');
const juiceMachineService = require('../adapter/juice_machine_service_adapter');
const config = require('../config/config_loader');


const self = {};


self.requestOfferForOrder = function (stateMachine, order) {
    licenseManager.getHsmId(function (err, hsmId) {
        if (err || !hsmId) {
            logger.crit(err);
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

                order.invoice.totalAmount = calculateRetailPriceForInvoice(offer.invoice);
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

function calculateRetailPriceForInvoice(invoice) {
    if (!invoice) {
        return 0;
    }

    let retailPrice = 0;
    for (let key in invoice.transfers) {
        retailPrice += config.RETAIL_PRICE; //TODO: Make this configurable by the machine operator
    }
    return retailPrice;
}


module.exports = self;