/**
 * Created by goergch on 23.01.17.
 */
var express = require('express');
var router = express.Router();
var logger = require('../global/logger');
var production_queue = require('../models/production_queue');
var pumpcontrol_service = require('../services/pumpcontrol_service');

const async = require('async');
var jms_connector = require('../adapter/juice_machine_service_adapter');
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
        if (!e && components) {
            var componentNameForId = function(components,id){
                for(var i = 0 ; i < components.length; i++)
                {
                    if(components[i].id === id){
                        return components[i].name;
                    }
                }
                return undefined;
            };
            var comps =[];
            const pumps = pumpcontrol_service.getPumpNumbers();
            async.eachSeries(pumps, function(pumpNr, callback){
                const comp =  pumpcontrol_service.getStorageIngredient(pumpNr);
                comps.push({nr: pumpNr, component:{id:comp, name:  componentNameForId(components,comp)}});
                callback();
            },function(err){

                if (!err){
                    res.json(comps)
                }else{
                    console.log(err);
                    res.sendStatus(500);
                }
            });
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
    var componentId = req.body;

    pumpcontrol_service.setIngredient(id,componentId,function(err){
        if (err) {
            return next(err);
        }

        res.sendStatus(200);
    });
});


router.put('/pumps/:id/amount', function (req, res, next) {
    if (!req.body) {
        res.sendStatus(400);
        return;
    }
    const id = req.params['id'];
    var amount = Number.parseInt(req.body);
    pumpcontrol_service.setPumpAmount(id, amount, function (err) {
        if (err) {
            return next(err);
        }
        else {
            res.sendStatus(200);
        }
    });
});

router.put('/pumps/:id/standardAmount', function (req, res, next) {
    if (!req.body) {
        res.sendStatus(400);
        return;
    }
    const id = req.params['id'];
    var amount = Number.parseInt(req.body);
    pumpcontrol_service.setPumpStandardAmount(id, amount);
    res.sendStatus(200);
});

router.get('/pumps/:id/standardAmount', function (req, res, next) {
    const id = req.params['id'];
    res.send(pumpcontrol_service.getPumpStandardAmount(id).toString());

});

router.get('/pumps/standardAmount', function (req, res, next) {
    var amounts ={};
    const pumps = pumpcontrol_service.getPumpNumbers();
    async.forEach(pumps, function(pumpNr,callback){
        amounts[pumpNr] = pumpcontrol_service.getPumpStandardAmount(pumpNr);
        callback();
    },function (err) {
        if(!err){
            res.json(amounts);
        }else{
            res.sendStatus(500);
        }
    });


});



router.post('/pumps/:id/active', function (req, res, next) {
    if (!req.body || (req.body !== 'true' &&req.body !== 'false')) {
        res.sendStatus(400);
        return;
    }
    const id = req.params['id'];
    if(req.body === 'true'){
        pumpcontrol_service.setServicePump(id,true);
    }else {
        pumpcontrol_service.setServicePump(id,false);
    }


    res.sendStatus(200);

});


router.post('/pumps/service', function (req, res, next) {
    if (!req.body || (req.body !== 'true' && req.body !== 'false')) {
        res.sendStatus(400);
        return;
    }
    if(req.body === 'true'){
        pumpcontrol_service.setServiceMode(true);
    }else {
        pumpcontrol_service.setServiceMode(false);
    }


    res.sendStatus(200);

});
module.exports = router;
