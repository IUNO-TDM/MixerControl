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

const payment_connector = require('../adapter/payment_service_adapter');


const configurationPersist = require('../global/configuration_persist');

const CONFIG = require('../config/config_loader');

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

router.get('/wallet/balance', function (req, res, next) {
    payment_connector.getWalletBalance(function (e, balance) {
        if (e) {
            res.status(500).send(e);
        } else if (!balance) {
            res.sendStatus(500);
        } else {
            res.status(200).send(balance);
        }
    });
});

router.get('/startbutton', function (req, res, next) {
    res.send(pumpcontrol_service.hasStartButtonIllumination());
});

router.get('/pumps', function (req, res, next) {

    jms_connector.getAllComponents(function (e, components) {
        if (!e && components) {
            var componentNameForId = function (components, id) {
                for (var i = 0; i < components.length; i++) {
                    if (components[i].id === id) {
                        return components[i].name;
                    }
                }
                return undefined;
            };
            var comps = [];
            const pumps = pumpcontrol_service.getPumpNumbers();
            async.eachSeries(pumps, function (pumpNr, callback) {
                const comp = pumpcontrol_service.getStorageIngredient(pumpNr);
                comps.push({nr: pumpNr, component: {id: comp, name: componentNameForId(components, comp)}});
                callback();
            }, function (err) {

                if (!err) {
                    res.json(comps)
                } else {
                    console.log(err);
                    res.sendStatus(500);
                }
            });
        } else {
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

    pumpcontrol_service.setIngredient(id, componentId, function (err) {
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
    var amounts = {};
    const pumps = pumpcontrol_service.getPumpNumbers();
    async.forEach(pumps, function (pumpNr, callback) {
        amounts[pumpNr] = pumpcontrol_service.getPumpStandardAmount(pumpNr);
        callback();
    }, function (err) {
        if (!err) {
            res.json(amounts);
        } else {
            res.sendStatus(500);
        }
    });


});


router.post('/pumps/:id/active', function (req, res, next) {
    if (!req.body || (req.body !== 'true' && req.body !== 'false')) {
        res.sendStatus(400);
        return;
    }
    const id = req.params['id'];
    if (req.body === 'true') {
        pumpcontrol_service.setServicePump(id, true);
    } else {
        pumpcontrol_service.setServicePump(id, false);
    }


    res.sendStatus(200);

});


router.post('/pumps/service', function (req, res, next) {
    if (!req.body || (req.body !== 'true' && req.body !== 'false')) {
        res.sendStatus(400);
        return;
    }
    if (req.body === 'true') {
        pumpcontrol_service.setServiceMode(true);
    } else {
        pumpcontrol_service.setServiceMode(false);
    }


    res.sendStatus(200);

});

router.post('/program', function (req, res, next) {
    const machineProgramString = JSON.stringify(req.body);

    pumpcontrol_service.startProgram(production_queue, machineProgramString, 0);

    res.sendStatus(200);
});

router.get('/statistics/enabled', function (req, res, next) {
    res.send(configurationPersist.getKey(CONFIG.STATISTICS_ENABLED_KEY, CONFIG.STATISTICS_ENABLED_DEFAULT));
});

router.put('/statistics/enabled', function (req, res, next) {

    if (req.body === 'true') {
        configurationPersist.setKey(CONFIG.STATISTICS_ENABLED_KEY, true);
        res.sendStatus(201);
    } else if (req.body === 'false') {
        configurationPersist.setKey(CONFIG.STATISTICS_ENABLED_KEY, false);
        res.sendStatus(201);
    } else {
        res.sendStatus(400);
    }


});


module.exports = router;
