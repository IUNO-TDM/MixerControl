/**
 * Created by goergch on 23.01.17.
 */
var express = require('express');
var router = express.Router();
var logger = require('../global/logger');
var production_queue = require('../models/production_queue');
var pumpcontrol_service = require('../services/pumpcontrol_service');
var ingredient_configuration = require('../global/ingredient_configuration');

var jms_connector = require('../connectors/juice_machine_service_connector');
router.post('/production/startConfirm', function (req, res, next) {
    production_queue.startConfirmed();
    res.sendStatus(200);
});

router.post('/production/pause', function (req, res, next) {
    production_queue.pauseProduction();
    res.sendStatus(200);

});
router.post('/production/resume', function (req, res, next) {
    production_queue.resumeProduction();
    res.sendStatus(200);

});

router.get('/pumps', function (req, res, next) {

    jms_connector.getAllComponents(function (e, components) {
        if (!e) {
            var componentNameForId = function(components,id){
                for(var i = 0 ; i < components.length; i++)
                {
                    if(components[i].id == id){
                        return components[i].name;
                    }
                }
                return undefined;
            };
            var comps =[];
            const ingr = ingredient_configuration.INGREDIENT_CONFIGURATION;
            for(var i = 0; i < ingr.length;i++) {
                const key = Object.keys(ingr[i])[0];
                const val = ingr[i][key];
                comps.push({nr: key,component:{id: val, name: componentNameForId(components,val)}});
            }
            res.json(comps);

        }else{
            res.sendStatus(500);
        }
    });

});

router.put('/pumps/:id', function (req, res, next) {
    if (!req.body) {
        res.sendStatus(400);
        return;
    }
    const id = req.params['id'];
    var componentId = Number.parseInt(req.body);
    // var ingredientId = Number.parseInt(req.body;);
    pumpcontrol_service.setIngredient(id,componentId,function(){
        res.sendStatus(200);
    });
});

router.post('/pumps/:id/active', function (req, res, next) {
    if (!req.body || (req.body != 'true' &&req.body != 'false')) {
        res.sendStatus(400);
        return;
    }
    const id = req.params['id'];
    if(req.body == 'true'){
        pumpcontrol_service.setServicePump(id,true);
    }else {
        pumpcontrol_service.setServicePump(id,false);
    }


    res.sendStatus(200);

});


router.post('/pumps/service', function (req, res, next) {
    if (!req.body || (req.body != 'true' && req.body != 'false')) {
        res.sendStatus(400);
        return;
    }
    if(req.body == 'true'){
        pumpcontrol_service.setServiceMode(true);
    }else {
        pumpcontrol_service.setServiceMode(false);
    }


    res.sendStatus(200);

});
module.exports = router;
