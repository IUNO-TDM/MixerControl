/**
 * Created by goergch on 09.03.17.
 */

const logger = require('../global/logger');
const io = require('socket.io-client');
const CONFIG = require('../config/config_loader');
const orderDB = require('../database/orderDB');
const licenseManager = require('../adapter/license_manager_adapter');
const juiceMachineService = require('../adapter/juice_machine_service_adapter');

const LicenseService = function () {
    logger.info('[license_client] new instance');
};

const license_service = new LicenseService();

license_service.socket = io.connect(CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE
        .PROTOCOL + '://' + CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST
    + ":" + CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT + "/licenses");

license_service.socket.on('connect', function () {
    logger.debug("[license_client] Connected to JMS");
});
license_service.socket.on('connect_error', function (error) {
    logger.debug("[license_client] Connection Error: " + error);
});

license_service.socket.on('disconnect', function () {
    logger.debug("[license_client] Disconnected from JMS");
});

license_service.socket.on('updateAvailable', function (data) {
    logger.debug("[license_client] License update available for " + JSON.stringify(data));
    const orderStateMachine = require('../models/order_state_machine');

    if (data) {
        const order = getOrderWithOfferId(data.offerId);
        if (!order) {
            return;
        }
        orderStateMachine.licenseAvailable(order);
        if (order) {
            updateCMDongle(data.hsmId, function (err) {
                if (err) {
                    orderStateMachine.error(order)
                }

                orderStateMachine.licenseArrived(order);
            });

        }
    }
});

module.exports = license_service;



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


function updateCMDongle(hsmId, callback) {
    if (license_service.isUpdating) {
        logger.warn('[license_service] Update cycle is already running.');
        return callback(new Error('Update cycle already running'));
    }

    license_service.isUpdating = true;
    logger.debug('[license_service] Starting update cycle for hsmId: ' + hsmId);

    licenseManager.getContextForHsmId(hsmId, function (err, context) {
        if (err || !context) {
            logger.crit('[license_service] could not get context from license manager');
            license_service.isUpdating = false;
            return callback(err);
        }

        juiceMachineService.getLicenseUpdate(hsmId, context, function (err, update, isOutOfDate) {
            if (err || !context) {
                logger.crit('[license_service] could not get license update from webservice');
                license_service.isUpdating = false;
                return callback(err);
            }

            licenseManager.updateHsm(hsmId, update, function (err, success) {
                if (err || !success) {
                    logger.crit('[license_service] could not update hsm on license manager');

                    juiceMachineService.confirmLicenseUpdate(hsmId, context, function (err) {
                        license_service.isUpdating = false;

                        if (err) {
                            logger.crit('[license_service] could not confirm update on license manager');
                            return callback(err);
                        }

                        logger.warn('[license_service] CM-Dongle context is out of date. Restarting update cycle');
                        return updateCMDongle(hsmId, callback)
                    });
                }
                else {
                    licenseManager.getContextForHsmId(hsmId, function (err, context) {
                        if (err || !context) {
                            logger.crit('[license_service] could not get context from license manager');
                            license_service.isUpdating = false;
                            return callback(err);
                        }

                        juiceMachineService.confirmLicenseUpdate(hsmId, context, function (err) {
                            license_service.isUpdating = false;

                            if (err) {
                                logger.crit('[license_service] could not confirm update on license manager');
                                return callback(err);
                            }

                            // Restart the update process as long the returned context is out of date
                            if (isOutOfDate) {
                                logger.warn('[license_service] CM-Dongle context is out of date. Restarting update cycle');
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
