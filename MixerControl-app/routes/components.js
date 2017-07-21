var express = require('express');
var router = express.Router();
var logger = require('../global/logger');
var helper = require('../services/helper_service');
var cache = require('../services/cache_middleware');


var jms_connector = require('../adapter/juice_machine_service_adapter');

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

        res.json(components);

    });

});


module.exports = router;
