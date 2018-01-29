const express = require('express');
const router = express.Router();
const logger = require('../global/logger');
const helper = require('../services/helper_service');
const cache = require('../services/cache_middleware');
const async = require('async');
const pumpcontrol_service = require('../services/pumpcontrol_service');

const jms_connector = require('../adapter/juice_machine_service_adapter');

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
    jms_connector.getAllComponents(function (e, components) {
        if (e) {
            logger.crit(e);
            next(e);
            return;
        }

        if (req.query['filtered']) {

            const componentUUIDs = [];

            const pumps = pumpcontrol_service.getPumpNumbers();
            async.eachSeries(pumps, function(pumpNr, callback){
                componentUUIDs.push(pumpcontrol_service.getStorageIngredient(pumpNr));
                callback();
            },function(err){
                if (!err){
                    const filteredComponents = [];

                    for (let i in components) {
                        const component = components[i];
                        if (componentUUIDs.indexOf(component.id) !== -1){
                            filteredComponents.push(component);
                        }
                    }

                    return res.json(filteredComponents);

                }else{
                    logger.crit(err);
                    return res.sendStatus(500);
                }
            });
        }

        res.json(components);

    });

});


module.exports = router;
