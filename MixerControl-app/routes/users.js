var express = require('express');
var router = express.Router();
var logger = require('../global/logger');
var helper = require('../services/helper_service');
var jms_connector = require('../adapter/juice_machine_service_adapter');
var cache = require('../services/cache_middleware');

/**
 * Functions
 */

String.prototype.format = function () {
    var args = [].slice.call(arguments);
    return this.replace(/(\{\d+\})/g, function (a) {
        return args[+(a.substr(1, a.length - 2)) || 0];
    });
};



router.get('/:id', function (req, res, next) {
    var userId = req.params['id'];

    jms_connector.getUserForId(userId, function (e, user) {
        if (e) {
            logger.crit(e);
            res.sendStatus(500);
            return;
        }

        res.json(user);
    });
});


router.get('/:id/image', cache(60*60), function (req, res, next) {
    var userId = req.params['id'];

    jms_connector.getUserImageForId(userId, function (err, data) {
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
