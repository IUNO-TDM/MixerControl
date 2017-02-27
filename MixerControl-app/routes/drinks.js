var express = require('express');
var router = express.Router();
var logger = require('../global/logger');
var helper = require('../services/helper_service');
var jms_connector = require('../connectors/juice_machine_service_connector');


/**
 * Functions
 */

String.prototype.format = function () {
    var args = [].slice.call(arguments);
    return this.replace(/(\{\d+\})/g, function (a) {
        return args[+(a.substr(1, a.length - 2)) || 0];
    });
};

router.get('/', function (req, res, next) {
    jms_connector.getAllRecipes(function (e, recipes) {

        if (e) {
            logger.crit(e);
            res.sendStatus(500);
            return;
        }

        res.json(recipes);

    });
});


router.get('/:id', function (req, res, next) {
    var recipeId = req.params['id'];

    jms_connector.getRecipeForId(recipeId, function (e, recipe) {
        if (e) {
            logger.crit(e);
            res.sendStatus(500);
            return;
        }

        res.json(recipe);
    });
});


module.exports = router;
