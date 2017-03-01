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


module.exports = router;
