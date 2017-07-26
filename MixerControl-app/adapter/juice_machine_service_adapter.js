/**
 * Created by beuttlerma on 27.02.17.
 */


var self = {};

var request = require('request');
var logger = require('../global/logger');
var CONFIG = require('../config/config_loader');
var helper = require('../services/helper_service');
var component_uuids = require('../config/config_loader').STD_INGREDIENT_CONFIGURATION;

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


self.getAllRecipes = function (callback) {

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
        {'components': component_uuids},
        function (err, options) {
            if (err) {
                return callback(err);
            }
            request(options, function (e, r, jsonData) {
                var err = logger.logRequestAndResponse(e, options, r, jsonData);
                var recipes;
                if (helper.isArray(jsonData)) {
                    //TODO: Parse json data into objects to validate the content
                    recipes = jsonData;
                }

                callback(err, recipes);
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
            request(options, function (e, r, jsonData) {

                var err = logger.logRequestAndResponse(e, options, r, jsonData);
                var components;

                if (helper.isArray(jsonData)) {
                    //TODO: Parse json data into objects to validate the content
                    components = jsonData;
                }

                callback(err, components);
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
            request(options, function (e, r, jsonData) {
                logger.logRequestAndResponse(e, options, r, jsonData);

                var recipe;
                if (helper.isObject(jsonData)) {
                    //TODO: Parse json data into objects to validate the content
                    recipe = jsonData;
                }


                callback(err, recipe);
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

            request(options, function (e, r, data) {
                var err = logger.logRequestAndResponse(e, options, r, data);

                callback(err, {
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

    var options = buildOptionsForRequest(
        'GET',
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.PROTOCOL,
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
        CONFIG.HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
        '/users/' + id,
        {},
        function (err, options) {
            request(options, function (e, r, jsonData) {
                var err = logger.logRequestAndResponse(e, options, r, jsonData);
                var user;
                if (helper.isObject(jsonData)) {
                    //TODO: Parse json data into objects to validate the content
                    user = jsonData;
                }

                callback(err, user);
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

            request(options, function (e, r, data) {
                var err = logger.logRequestAndResponse(e, options, r.data);

                callback(err, {
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

            request(options, function (e, r, jsonData) {
                var err = logger.logRequestAndResponse(e, options, r, jsonData);
                var offer;

                if (helper.isObject(jsonData)) {
                    //TODO: Parse json data into objects to validate the content
                    offer = jsonData;
                }

                callback(err, offer);
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
            request(options, function (e, r, jsonData) {
                var err = logger.logRequestAndResponse(e, options, r, jsonData);
                var offer;
                if (helper.isObject(jsonData)) {
                    //TODO: Parse json data into objects to validate the content
                    offer = jsonData;
                }

                callback(err, offer);
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

            request(options, function (e, r, jsonData) {
                var err = logger.logRequestAndResponse(e, r, jsonData);

                callback(err);
            });
        }
    );
};

module.exports = self;