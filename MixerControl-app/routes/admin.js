/**
 * Created by goergch on 23.01.17.
 */
const express = require('express');
const router = express.Router();
const logger = require('../global/logger');
const production_queue = require('../models/production_queue');
const pumpcontrol_service = require('../services/pumpcontrol_service');
const programConverter = require('../services/program_converter');
const async = require('async');
const jms_connector = require('../adapter/juice_machine_service_adapter');

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

router.post('/program', function(req, res, next) {

    // req.body = {
    //     "amount-per-millisecond": 0.01,
    //     "sequences": [
    //         {
    //             "ingredient-id": "4cfa2890-6abd-4e21-a7ab-17613ed9a5c9",
    //             "phases": [
    //                 {
    //                     "start": 0,
    //                     "amount": 50,
    //                     "throughput": 100
    //                 }
    //             ]
    //         },
    //         {
    //             "ingredient-id": "570a5df0-a044-4e22-b6e6-b10af872d75c",
    //             "phases": [
    //                 {
    //                     "start": 0,
    //                     "amount": 50,
    //                     "throughput": 100
    //                 }
    //             ]
    //         }
    //     ]
    // };

    const machineProgram = programConverter.convertProgramToMachineProgram(req.body);
    const machineProgramString = JSON.stringify(machineProgram);

    pumpcontrol_service.startProgram(production_queue, {
        productCode: 0,
        program: machineProgramString
    });

    res.sendStatus(200);
});

module.exports = router;
