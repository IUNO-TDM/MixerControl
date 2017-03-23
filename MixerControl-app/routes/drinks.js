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
            next(e);
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
            next(e);
            return;
        }

        res.json(recipe);
    });
});

router.get('/:id/image', function (req, res, next) {
    var recipeId = req.params['id'];

    jms_connector.getRecipeImageForId(recipeId, function (err, data) {
        if (err) {
            next(err);
            return;
        }

        if (!data) {
            res.sendStatus(404);
            return;
        }

        res.set('Content-Type', data.contentType);
        res.send(data.imageBuffer);
    });
});


module.exports = router;
