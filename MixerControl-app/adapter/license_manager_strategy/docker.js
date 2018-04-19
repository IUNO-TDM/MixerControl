const logger = require('../../global/logger');

const self = require('./default');

logger.warn('[license_manager_adapter] RUNNING DOCKER (SIMULATION) MODE. License manager calls will be skipped!');

self.getContextForHsmId = function (hsmId, callback) {
    callback(null, new Buffer('SIMULATION').toString('base64'));
};

self.updateHsm = function (hsmId, update, callback) {
    callback(null, true);
};

self.getLicenseInformationForProductCodeOnHsm = function (productCode, hsmId, callback) {
    callback(null, 9999);
};

self.getHsmId = function (callback) {
    callback(null, '9-9999999');
};

module.exports = self;