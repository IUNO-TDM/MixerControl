/**
 * Created by beuttlerma on 27.02.17.
 */


var self = {};

var request = require('request');
var logger = require('../global/logger');
var HOST_SETTINGS = require('../config/config_loader').HOST_SETTINGS;
var helper = require('../services/helper_service');
var component_uuids = require('../config/config_loader').STD_INGREDIENT_CONFIGURATION;

function buildOptionsForRequest(method, protocol, host, port, path, qs) {

    return {
        method: method,
        url: protocol + '://' + host + ':' + port + path,
        qs: qs,
        json: true,
        headers: {
            'Content-Type': 'application/json'
        }
    }
}


self.getAllRecipes = function (callback) {

    if (typeof(callback) === 'function') {

        callback = function () {
            logger.info('Callback not registered');
        }
    }

    var options = buildOptionsForRequest(
        'GET',
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.METHOD,
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
        '/recipes',
        {'ingredients': component_uuids}
    );

    request(options, function (e, r, jsonData) {
        var err = logger.logRequestAndResponse(e, options, r, jsonData);
        var recipes;
        if (helper.isArray(jsonData)) {
            //TODO: Parse json data into objects to validate the content
            recipes = jsonData;
        }

        callback(err, recipes);
    });
};


self.getAllComponents = function (callback) {

    if (typeof(callback) === 'function') {

        callback = function () {
            logger.info('Callback not registered');
        }
    }

    var options = buildOptionsForRequest(
        'GET',
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.METHOD,
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
        '/components'
    );

    request(options, function (e, r, jsonData) {

        var err = logger.logRequestAndResponse(e, options, r, jsonData);
        var components;

        if (helper.isArray(jsonData)) {
            //TODO: Parse json data into objects to validate the content
            components = jsonData;
        }

        callback(err, components);
    });
};

self.getRecipeForId = function (id, callback) {

    if (typeof(callback) === 'function') {
        callback = function () {
            logger.info('Callback not registered');
        }
    }

    var options = buildOptionsForRequest(
        'GET',
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.METHOD,
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
        '/recipes/' + id
    );

    request(options, function (e, r, jsonData) {
        logger.logRequestAndResponse(e, options, r, jsonData);

        var recipe;
        if (helper.isObject(jsonData)) {
            //TODO: Parse json data into objects to validate the content
            recipe = jsonData;
        }


        callback(err, recipe);
    });
};

self.getRecipeImageForId = function (id, callback) {
    if (typeof(callback) === 'function') {
        callback = function () {
            logger.info('Callback not registered');
        }
    }

    var options = buildOptionsForRequest(
        'GET',
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.METHOD,
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
        '/recipes/' + id + '/image'
    );

    options.encoding = null;

    request(options, function (e, r, data) {
        var err = logger.logRequestAndResponse(e, options, r, data);

        callback(err, {
            imageBuffer: data,
            contentType: r.headers['content-type']
        });
    });
};

self.getUserForId = function (id, callback) {
    if (typeof(callback) === 'function') {
        callback = function () {
            logger.info('Callback not registered');
        }
    }

    var options = buildOptionsForRequest(
        'GET',
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.METHOD,
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
        '/users/' + id
    );

    request(options, function (e, r, jsonData) {
        var err = logger.logRequestAndResponse(e, options, r, jsonData);
        var user;
        if (helper.isObject(jsonData)) {
            //TODO: Parse json data into objects to validate the content
            user = jsonData;
        }

        callback(err, user);
    });
};

self.getUserImageForId = function (id, callback) {
    if (typeof(callback) === 'function') {
        callback = function () {
            logger.info('Callback not registered');
        }
    }

    var options = buildOptionsForRequest(
        'GET',
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.METHOD,
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
        '/users/' + id + '/image'
    );

    options.encoding = null;

    request(options, function (e, r, data) {
        var err = logger.logRequestAndResponse(e, options, r. data);

        callback(err, {
            imageBuffer: data,
            contentType: r.headers['content-type']
        });
    });
};

self.requestOfferForOrders = function (hsmId, orderList, callback) {
    if (typeof(callback) === 'function') {
        callback = function () {
            logger.info('Callback not registered');
        }
    }

    var options = buildOptionsForRequest(
        'POST',
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.METHOD,
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
        '/offers'
    );


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
};

self.getOfferForId = function (id, callback) {
    if (typeof(callback) === 'function') {
        callback = function () {
            logger.info('Callback not registered');
        }
    }

    var options = buildOptionsForRequest(
        'GET',
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.METHOD,
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
        '/offers/' + id
    );

    request(options, function (e, r, jsonData) {
        var err = logger.logRequestAndResponse(e, options, r, jsonData);
        var offer;
        if (helper.isObject(jsonData)) {
            //TODO: Parse json data into objects to validate the content
            offer = jsonData;
        }

        callback(err, offer);
    });
};

self.savePaymentForOffer = function (offerId, bip70, callback) {
    if (typeof(callback) === 'function') {
        callback = function () {
            logger.info('Callback not registered');
        }
    }

    var options = buildOptionsForRequest(
        'POST',
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.METHOD,
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
        '/offers/' + offerId + '/payment'
    );

    options.body = {
        paymentBIP70: bip70
    };

    request(options, function (e, r, jsonData) {
        var err = logger.logRequestAndResponse(e, r, jsonData);

        callback(err);
    });
};

module.exports = self;