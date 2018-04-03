/**
 * Created by beuttlerma on 27.02.17.
 */


const self = {};

const request = require('request');
const logger = require('../global/logger');
const CONFIG = require('../config/config_loader');
const helper = require('../services/helper_service');
const authServer = require('./auth_service_adapter');


function buildOptionsForRequest(method, protocol, host, port, path, qs, callback) {

    authServer.getAccessToken(function (err, token) {

        if (err) {
            logger.crit(err);
        }

        callback(err, {
            method: method,
            url: protocol + '://' + host + ':' + port + path,
            qs: qs,
            json: true,
            headers: {
                'Authorization': 'Bearer ' + (token ? token.accessToken : ''),
                'Content-Type': 'application/json'
            }
        });
    })
}

function doRequest(options, callback) {
    request(options, function (e, r, data) {
        if (r && (r.statusCode === 401)) {
            authServer.invalidateToken();
        }
        const err = logger.logRequestAndResponse(e, options, r, data);

        callback(err, r, data);
    });
}


self.getAllRecipes = function (components, callback) {

    if (typeof(callback) !== 'function') {

        callback = function () {
            logger.info('Callback not registered');
        }
    }

    buildOptionsForRequest(
        'GET',
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.PROTOCOL,
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
        '/recipes',
        {'components': components},
        function (err, options) {
            if (err) {
                return callback(err);
            }
            doRequest(options, function (e, r, jsonData) {

                let recipes;
                if (!e && jsonData) {
                    if (helper.isArray(jsonData)) {
                        //TODO: Parse json data into objects to validate the content
                        recipes = jsonData;
                    }
                }

                callback(e, recipes);
            });
        }
    );
};


self.getAllComponents = function (callback) {

    if (typeof(callback) !== 'function') {

        callback = function () {
            logger.info('Callback not registered');
        }
    }

    buildOptionsForRequest(
        'GET',
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.PROTOCOL,
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
        '/components',
        {},
        function (err, options) {
            doRequest(options, function (e, r, jsonData) {
                let components;

                if (helper.isArray(jsonData)) {
                    //TODO: Parse json data into objects to validate the content
                    components = jsonData;
                }

                callback(e, components);
            });
        }
    );
};

self.getRecipeForId = function (id, callback) {

    if (typeof(callback) !== 'function') {
        callback = function () {
            logger.info('Callback not registered');
        }
    }

    buildOptionsForRequest(
        'GET',
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.PROTOCOL,
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
        '/recipes/' + id,
        {},
        function (err, options) {
            doRequest(options, function (e, r, jsonData) {
                let recipe;
                if (helper.isObject(jsonData)) {
                    //TODO: Parse json data into objects to validate the content
                    recipe = jsonData;
                }

                callback(e, recipe);
            });
        }
    );
};

self.getRecipeImageForId = function (id, callback) {
    if (typeof(callback) !== 'function') {
        callback = function () {
            logger.info('Callback not registered');
        }
    }

    buildOptionsForRequest(
        'GET',
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.PROTOCOL,
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
        '/recipes/' + id + '/image',
        {},
        function (err, options) {
            options.encoding = null;

            doRequest(options, function (e, r, data) {

                callback(e, {
                    imageBuffer: data,
                    contentType: r.headers['content-type']
                });
            });
        }
    );
};

self.getUserForId = function (id, callback) {
    if (typeof(callback) !== 'function') {
        callback = function () {
            logger.info('Callback not registered');
        }
    }

    buildOptionsForRequest(
        'GET',
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.PROTOCOL,
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
        '/users/' + id,
        {},
        function (err, options) {
            doRequest(options, function (e, r, jsonData) {
                let user;
                if (!e && helper.isObject(jsonData)) {
                    //TODO: Parse json data into objects to validate the content
                    user = jsonData;
                }

                callback(e, user);
            });

        }
    );
};

self.getUserImageForId = function (id, callback) {
    if (typeof(callback) !== 'function') {
        callback = function () {
            logger.info('Callback not registered');
        }
    }

    buildOptionsForRequest(
        'GET',
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.PROTOCOL,
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
        '/users/' + id + '/image',
        {},
        function (err, options) {
            options.encoding = null;

            doRequest(options, function (e, r, data) {

                callback(e, {
                    imageBuffer: data,
                    contentType: r.headers['content-type']
                });
            });
        }
    );
};

self.requestOfferForOrders = function (hsmId, orderList, callback) {
    if (typeof(callback) !== 'function') {
        callback = function () {
            logger.info('Callback not registered');
        }
    }

    buildOptionsForRequest(
        'POST',
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.PROTOCOL,
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
        '/offers',
        {},
        function (err, options) {
            options.body = {
                items: orderList,
                hsmId: hsmId
            };

            doRequest(options, function (e, r, jsonData) {
                let offer;

                if (!e && helper.isObject(jsonData)) {
                    //TODO: Parse json data into objects to validate the content
                    offer = jsonData;
                }

                callback(e, offer);
            });
        }
    );
};

self.getOfferForId = function (id, callback) {
    if (typeof(callback) !== 'function') {
        callback = function () {
            logger.info('Callback not registered');
        }
    }

    buildOptionsForRequest(
        'GET',
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.PROTOCOL,
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
        '/offers/' + id,
        {},
        function (err, options) {
            doRequest(options, function (e, r, jsonData) {
                let offer;
                if (helper.isObject(jsonData)) {
                    //TODO: Parse json data into objects to validate the content
                    offer = jsonData;
                }

                callback(e, offer);
            });
        }
    );
};

self.savePaymentForOffer = function (offerId, bip70, callback) {
    if (typeof(callback) !== 'function') {
        callback = function () {
            logger.info('Callback not registered');
        }
    }

    buildOptionsForRequest(
        'POST',
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.PROTOCOL,
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
        '/offers/' + offerId + '/payment',
        {},
        function (err, options) {
            options.body = {
                paymentBIP70: bip70
            };

            doRequest(options, function (e, r, jsonData) {
                callback(e);
            });
        }
    );
};

self.getLicenseUpdate = function (hsmId, context, callback) {
    if (typeof(callback) !== 'function') {
        return logger.info('[juice_machine_service_adapter] Callback not registered');
    }

    if (!hsmId || !context) {
        return logger.info('[juice_machine_service_adapter] Missing function arguments');
    }

    buildOptionsForRequest(
        'POST',
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.PROTOCOL,
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
        '/cmdongle/' + hsmId + '/update',
        {},
        function (err, options) {

            options.body = {
                RAC: context
            };

            doRequest(options, function (e, r, jsonData) {
                callback(e, jsonData['RAU'], jsonData['isOutOfDate']);
            });
        }
    );
};

self.confirmLicenseUpdate = function (hsmId, context, callback) {
    if (typeof(callback) !== 'function') {
        return logger.info('[juice_machine_service_adapter] Callback not registered');
    }

    if (!hsmId || !context) {
        return logger.info('[juice_machine_service_adapter] Missing function arguments');
    }

    buildOptionsForRequest(
        'POST',
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.PROTOCOL,
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
        '/cmdongle/' + hsmId + '/update/confirm',
        {},
        function (err, options) {

            options.body = {
                RAC: context
            };

            doRequest(options, function (e, r, jsonData) {
                callback(e);
            });
        }
    );
};

self.createProtocol = function (protocol, callback) {
    if (typeof(callback) !== 'function') {
        callback = function () {
            logger.info('Callback not registered');
        }
    }

    buildOptionsForRequest(
        'POST',
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.PROTOCOL,
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
        '/protocols/' + CONFIG.OAUTH_CREDENTIALS.CLIENT_ID,
        {},
        function (err, options) {
            options.body = protocol;
            doRequest(options, function (e, r, jsonData) {
                callback(e, jsonData);
            });
        }
    );
};

module.exports = self;
