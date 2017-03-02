/**
 * Created by beuttlerma on 27.02.17.
 */


var self = {};

var request = require('request');
var logger = require('../global/logger');
var HOST_SETTINGS = require('../global/constants').HOST_SETTINGS;
var helper = require('../services/helper_service');
var ingredientConfiguration = require('../global/ingredient_configuration').INGREDIENT_CONFIGURATION;

const components = [
    {
        id: 1,
        name: 'Sprudel'
    },
    {
        id: 2,
        name: 'Orangensaft'
    },

    {
        id: 3,
        name: 'Apfelsaft'
    },

    {
        id: 4,
        name: 'Kirschsaft'
    },

    {
        id: 5,
        name: 'Bananensaft'
    },
    {
        id: 6,
        name: 'Johannisbeersaft'
    },
    {
        id: 7,
        name: 'Cola'
    },
    {
        id: 8,
        name: 'Fanta'
    },
    {
        id: 9,
        name: 'Ginger Ale'
    },
];

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
    var ingredients = [];
    for(var i=0; i< ingredientConfiguration.length;i++){
        var key = Object.keys(ingredientConfiguration[i])[0];
        ingredients.push(ingredientConfiguration[i][key]);
    }

    var options = buildOptionsForRequest(
        'GET',
        'http',
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
        '/recipes',
        {'ingredients': ingredients}
    );

    request(options, function (e, r, jsonData) {
        logger.debug('Response:' + jsonData);

        if (e) {
            console.error(e);
            if (typeof(callback) == 'function') {

                callback(e);
            }
        }

        if (r.statusCode != 200) {
            logger.warn('Call not successful');
            var err = {
                status: r.statusCode,
                message: jsonData
            };
            logger.warn(err);
            callback(err);

            return;
        }

        if (!helper.isArray(jsonData)) {
            callback({
                status: 500,
                message: 'Expected object. But did get something different: ' + jsonData
            });
            return;
        }

        //TODO: Parse json data into objects to validate the content
        if (typeof(callback) == 'function') {

            callback(null, jsonData);
        }
    });
};


self.getAllComponents = function (callback) {
    // var options = buildOptionsForRequest(
    //     'GET',
    //     'http',
    //     HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
    //     HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
    //     '/recipes',
    //     {'ingredients': ingredients}
    // );
    //
    // request(options, function (e, r, jsonData) {
    //     logger.debug('Response:' + jsonData);
    //
    //     if (e) {
    //         console.error(e);
    //         if (typeof(callback) == 'function') {
    //
    //             callback(e);
    //         }
    //     }
    //
    //     if (r.statusCode != 200) {
    //         logger.warn('Call not successful');
    //         var err = {
    //             status: r.statusCode,
    //             message: jsonData
    //         };
    //         logger.warn(err);
    //         callback(err);
    //
    //         return;
    //     }
    //
    //     if (!helper.isArray(jsonData)) {
    //         callback({
    //             status: 500,
    //             message: 'Expected object. But did get something different: ' + jsonData
    //         });
    //         return;
    //     }
    //
    //     //TODO: Parse json data into objects to validate the content
    //     if (typeof(callback) == 'function') {
    //
    //         callback(null, jsonData);
    //     }
    // });
    callback(null,components);
};

self.getRecipeForId = function (id, callback) {
    var options = buildOptionsForRequest(
        'GET',
        'http',
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
        '/recipes/' + id
    );

    request(options, function (e, r, jsonData) {
        logger.debug('Response:' + jsonData);

        if (e) {
            console.error(e);
            if (typeof(callback) == 'function') {

                callback(e);
            }
        }

        if (r.statusCode >= 400) {
            logger.warn('Call not successful');
            var err = {
                status: r.statusCode,
                message: jsonData
            };
            logger.warn(err);
            callback(err);

            return;
        }

        if (!helper.isObject(jsonData)) {
            callback({
                status: 500,
                message: 'Expected object. But did get something different: ' + jsonData
            });
            return;
        }

        //TODO: Parse json data into objects to validate the content
        if (typeof(callback) == 'function') {

            callback(null, jsonData);
        }
    });
};

self.getUserForId = function (id, callback) {
    var options = buildOptionsForRequest(
        'GET',
        'http',
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
        '/users/' + id
    );

    request(options, function (e, r, jsonData) {
        logger.debug('Response:' + jsonData);

        if (e) {
            console.error(e);
            if (typeof(callback) == 'function') {

                callback(e);
            }
        }

        if (r.statusCode >= 400) {
            logger.warn('Call not successful');
            var err = {
                status: r.statusCode,
                message: jsonData
            };
            logger.warn(err);
            callback(err);

            return;
        }

        if (!helper.isObject(jsonData)) {
            callback({
                status: 500,
                message: 'Expected object. But did get something different: ' + jsonData
            });
            return;
        }

        //TODO: Parse json data into objects to validate the content
        if (typeof(callback) == 'function') {

            callback(null, jsonData);
        }
    });
};


self.requestOfferForOrders = function (hsmId,orderList, callback) {
    var options = buildOptionsForRequest(
        'POST',
        'http',
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
        '/offers'
    );


    options.body = {
        items: orderList,
        hsmId: hsmId
    };

    request(options, function (e, r, jsonData) {
        logger.debug('Response:' + jsonData);

        if (e) {
            console.error(e);
            if (typeof(callback) == 'function') {

                callback(e);
            }
        }

        if (r.statusCode >= 400) {
            logger.warn('Call not successful');
            var err = {
                status: r.statusCode,
                message: jsonData
            };
            logger.warn(err);
            callback(err);

            return;
        }

        if (!helper.isObject(jsonData)) {
            callback({
                status: 500,
                message: 'Expected object. But did get something different: ' + jsonData
            });
            return;
        }

        //TODO: Parse json data into objects to validate the content
        if (typeof(callback) == 'function') {

            callback(null, jsonData);
        }
    });
};

self.getOfferForId = function (id, callback) {
    var options = buildOptionsForRequest(
        'GET',
        'http',
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
        '/offers/' + id
    );

    request(options, function (e, r, jsonData) {
        logger.debug('Response:' + jsonData);

        if (e) {
            console.error(e);
            if (typeof(callback) == 'function') {

                callback(e);
            }
        }

        if (r.statusCode >= 400) {
            logger.warn('Call not successful');
            var err = {
                status: r.statusCode,
                message: jsonData
            };
            logger.warn(err);
            callback(err);

            return;
        }

        if (!helper.isObject(jsonData)) {
            callback({
                status: 500,
                message: 'Expected object. But did get something different: ' + jsonData
            });
            return;
        }

        //TODO: Parse json data into objects to validate the content
        if (typeof(callback) == 'function') {

            callback(null, jsonData);
        }
    });
};

self.savePaymentForOffer = function (offerId, bip70, callback) {
    var options = buildOptionsForRequest(
        'POST',
        'http',
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
        '/offers/' + offerId + '/payment'
    );


    options.body = {
        paymentBIP70: bip70
    };

    request(options, function (e, r, jsonData) {
        logger.debug('Response:' + jsonData);

        if (e) {
            console.error(e);
            if (typeof(callback) == 'function') {

                callback(e);
            }
        }

        if (r.statusCode >= 400) {
            logger.warn('Call not successful');
            var err = {
                status: r.statusCode,
                message: jsonData
            };
            logger.warn(err);
            callback(err);

            return;
        }

        if (typeof(callback) == 'function') {

            callback(null);
        }
    });
};

module.exports = self;