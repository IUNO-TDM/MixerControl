/**
 * Created by beuttlerma on 27.02.17.
 */


var self = {};

var request = require('request');
var logger = require('../global/logger');
var HOST_SETTINGS = require('../global/constants').HOST_SETTINGS;
var helper = require('../services/helper_service');
var ingredients = require('../global/ingredient_configuration').INGREDIENT_IDS;


self.getAllRecipes = function (callback) {
    var options = {
        method: 'GET',
        url: 'http://' + HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST + ':' + HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT +'/recipes',
        qs: {'ingredients': ingredients},
        json: true,
        headers: {
            'Content-Type': 'application/json'
        }
    };

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
            logger.crit(jsonData);
            callback({
                status: 500,
                message: 'Expected array. But did get something different.'
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
    var options = {
        method: 'GET',
        url: 'http://' + HOST_SETTINGS.JUICE_MACHINE_SERVICE.HOST + ':' + HOST_SETTINGS.JUICE_MACHINE_SERVICE.PORT +'/recipes/' + id,
        json: true,
        headers: {
            'Content-Type': 'application/json'
        }
    };

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
            console.log(jsonData[0]);
            callback({
                status: 500,
                message: 'Expected object. But did get something different.'
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