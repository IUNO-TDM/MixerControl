/**
 * Created by beuttlerma on 27.02.17.
 */


var self = {};

var request = require('request');
var logger = require('../global/logger');
var HOST_SETTINGS = require('../global/constants').HOST_SETTINGS;
var helper = require('../services/helper_service');
var component_config = require('../global/ingredient_configuration').INGREDIENT_CONFIGURATION;

var component_uuids = [
    '8f0bc514-7219-46d2-999d-c45c930c3e7c',
    '570a5df0-a044-4e22-b6e6-b10af872d75c',
    '198f1571-4846-4467-967a-00427ab0208d',
    'f6d361a9-5a6f-42ad-bff7-0913750809e4',
    'fac1ee6f-185f-47fb-8c56-af57cd428aa8',
    '0476e3d6-ab8e-4d38-9348-4a308c2b5fc0',
    '0425393d-5b84-4815-8eda-1c27d35766cf',
    '4cfa2890-6abd-4e21-a7ab-17613ed9a5c9'
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

    var options = buildOptionsForRequest(
        'GET',
        'http',
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
        '/recipes',
        {'ingredients': component_uuids}
    );

    request(options, function (e, r, jsonData) {
        logger.debug('Response:' + JSON.stringify(jsonData));

        if (e) {
            console.error(e);
            if (typeof(callback) == 'function') {

                callback(e);
                return;
            }
        }

        if (r && r.statusCode != 200) {
            var err = {
                status: r.statusCode,
                message: jsonData
            };
            logger.warn('Options: ' + JSON.stringify(options) + ' Error: ' + JSON.stringify(err));
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
    //     logger.debug('Response:' + JSON.stringify(jsonData));
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
    //
    //         var err = {
    //             status: r.statusCode,
    //             message: jsonData
    //         };
    //         logger.warn('Options: ' + JSON.stringify(options) + ' Error: ' + JSON.stringify(err));
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
    callback(null, [
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
    ]);
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
        logger.debug('Response:' + JSON.stringify(jsonData));

        if (e) {
            console.error(e);
            if (typeof(callback) == 'function') {

                callback(e);
            }
        }

        if (r && r.statusCode >= 400) {
            var err = {
                status: r.statusCode,
                message: jsonData
            };
            logger.warn('Options: ' + JSON.stringify(options) + ' Error: ' + JSON.stringify(err));
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
        logger.debug('Response:' + JSON.stringify(jsonData));

        if (e) {
            console.error(e);
            if (typeof(callback) == 'function') {

                callback(e);
            }
        }

        if (r && r.statusCode >= 400) {
            var err = {
                status: r.statusCode,
                message: jsonData
            };
            logger.warn('Options: ' + JSON.stringify(options) + ' Error: ' + JSON.stringify(err));
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


self.requestOfferForOrders = function (hsmId, orderList, callback) {
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
        logger.debug('Response:' + JSON.stringify(jsonData));

        if (e) {
            console.error(e);
            if (typeof(callback) == 'function') {

                callback(e);
            }
        }

        if (r && r.statusCode >= 400) {
            var err = {
                status: r.statusCode,
                message: jsonData
            };
            logger.warn('Options: ' + JSON.stringify(options) + ' Error: ' + JSON.stringify(err));
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
        logger.debug('Response:' + JSON.stringify(jsonData));

        if (e) {
            console.error(e);
            if (typeof(callback) == 'function') {

                callback(e);
            }
        }

        if (r && r.statusCode >= 400) {
            var err = {
                status: r.statusCode,
                message: jsonData
            };
            logger.warn('Options: ' + JSON.stringify(options) + ' Error: ' + JSON.stringify(err));
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
        logger.debug('Response:' + JSON.stringify(jsonData));

        if (e) {
            console.error(e);
            if (typeof(callback) == 'function') {

                callback(e);
            }
        }

        if (r && r.statusCode >= 400) {
            var err = {
                status: r.statusCode,
                message: jsonData
            };
            logger.warn('Options: ' + JSON.stringify(options) + ' Error: ' + JSON.stringify(err));
            callback(err);

            return;
        }

        if (typeof(callback) == 'function') {

            callback(null);
        }
    });
};

module.exports = self;