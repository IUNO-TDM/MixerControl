const express = require('express');
const router = express.Router();
const logger = require('../global/logger');
const helper = require('../services/helper_service');
const cache = require('../services/cache_middleware');
const config = require('../config/config_loader');


const pumpControl = require('../services/pumpcontrol_service');
const juiceMachineService = require('../adapter/juice_machine_service_adapter');
const backgroundColorBuffer = require('../database/background_color_buffer');
const vibrantService = require('../services/vibrant_service');

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

  let components = pumpControl.getConfiguredComponents();

  juiceMachineService.getAllRecipes(components, function (e, recipes) {

    if (e) {
      logger.crit(e);
      next(e);
      return;
    }
    for(let i in recipes){
      recipes[i].retailPrice = config.RETAIL_PRICE;
    }

    res.json(recipes);

  });
});


router.get('/:id', function (req, res, next) {
  var recipeId = req.params['id'];

  juiceMachineService.getRecipeForId(recipeId, function (e, recipe) {
    if (e) {
      logger.crit(e);
      next(e);
      return;
    }

    recipe.retailPrice = config.RETAIL_PRICE;
    res.json(recipe);
  });
});

router.get('/:id/image', function (req, res, next) {
  var recipeId = req.params['id'];

  juiceMachineService.getRecipeImageForId(recipeId, function (err, data) {
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

router.get('/:id/image/backgroundColor', function (req, res, next) {
  var recipeId = req.params['id'];
  var color = backgroundColorBuffer.getColor(recipeId);
  if (color) {
    res.send(color);
  } else {
    juiceMachineService.getRecipeImageForId(recipeId, function (err, data) {
      if (err) {
        next(err);
        return;
      }

      if (!data) {
        res.sendStatus(404);
        return;
      }
      vibrantService.calculate(data.imageBuffer).then(color => {
        backgroundColorBuffer.addColor(recipeId, color);
        res.send(color);
      }).catch(err => {
        console.error(err);
        res.sendStatus(500);
      })


    });
  }


});


module.exports = router;
