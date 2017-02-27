/**
 * Created by beuttlerma on 27.02.17.
 */


var self = {};

var request = require('request');
var logger = require('../global/logger');
var HOST_SETTINGS = require('../global/constants').HOST_SETTINGS;
var helper = require('../services/helper_service');
var ingredients = require('../global/ingredient_configuration').INGREDIENT_IDS;


function buildOptionsForRequest (method, protocol, host, port, path, qs) {

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
        {'ingredients': ingredients}
    );

    request.get(options, function(e, r, jsonData) {
        logger.info('Response:' + jsonData);

        if (e) {
            console.error(e);
            if (typeof(callback) == 'function') {

                callback(e);
            }
        }

        if (r.statusCode != 200) {
            logger.crit('Call not successful');
            var err = {
                status: r.statusCode,
                message: jsonData
            };
            logger.crit(err);
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

self.getRecipeForId = function(id, callback) {
    var options = buildOptionsForRequest(
        'GET',
        'http',
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
        '/recipes/' + id
    );

    request.get(options, function(e, r, jsonData) {
        logger.info('Response:' + jsonData);

        if (e) {
            console.error(e);
            if (typeof(callback) == 'function') {

                callback(e);
            }
        }

        if (r.statusCode != 200) {
            logger.crit('Call not successful');
            var err = {
                status: r.statusCode,
                message: jsonData
            };
            logger.crit(err);
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

self.getUserForId = function(id, callback) {
    var options = buildOptionsForRequest(
        'GET',
        'http',
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST,
        HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT,
        '/users/' + id
    );

    request.get(options, function(e, r, jsonData) {
        logger.info('Response:' + jsonData);

        if (e) {
            console.error(e);
            if (typeof(callback) == 'function') {

                callback(e);
            }
        }

        if (r.statusCode != 200) {
            logger.crit('Call not successful');
            var err = {
                status: r.statusCode,
                message: jsonData
            };
            logger.crit(err);
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

module.exports = self;