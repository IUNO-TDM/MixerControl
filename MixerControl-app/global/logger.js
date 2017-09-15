/**
 * Created by beuttlerma on 02.12.16.
 *
 * Example usage:
 *  var logger = require('../global/logger');
 *  logger.debug('Foo');
 */
var winston = require('winston');
var config = require('../config/config_loader');

// Set up logger
var customColors = {
    trace: 'white',
    debug: 'green',
    info: 'green',
    warn: 'yellow',
    crit: 'red',
    fatal: 'red'
};

var logger = new (winston.Logger)({
    colors: customColors,
    levels: {
        fatal: 1,
        crit: 2,
        warn: 3,
        info: 4,
        debug: 5,
        trace: 6
    },
    transports: [
        new (winston.transports.Console)({
            level: config.LOG_LEVEL,
            colorize: true,
            timestamp: true
        })
        // new (winston.transports.File)({ filename: 'somefile.log' })
    ]
});

winston.addColors(customColors);

//Logging wrapper, to remove "unknown function" warnings
var origLog = logger.log;
logger.log = function (level, msg) {
    if (arguments.length > 2) {
        for (var i = 2; i < arguments.length; i++) {
            msg += ' ' + JSON.stringify(arguments[i]);
        }
    }
    if (!msg) {
        msg = level;
        level = 'info';
    }
    origLog.call(logger, level, msg);
};

var origFatal = logger.fatal;
logger.fatal = function (msg) {
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            msg += ' ' + JSON.stringify(arguments[i]);
        }
    }
    origFatal.call(logger, msg);
};

var origCrit = logger.crit;
logger.crit = function (msg) {
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            msg += ' ' + JSON.stringify(arguments[i]);
        }
    }
    origCrit.call(logger, msg);
};

var origWarn = logger.warn;
logger.warn = function (msg) {
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            msg += ' ' + JSON.stringify(arguments[i]);
        }
    }
    origWarn.call(logger, msg);
};

var origInfo = logger.info;
logger.info = function (msg) {
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            msg += ' ' + JSON.stringify(arguments[i]);
        }
    }
    origInfo.call(logger, msg);
};

var origDebug = logger.debug;
logger.debug = function (msg) {
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            msg += ' ' + JSON.stringify(arguments[i]);
        }
    }
    origDebug.call(logger, msg);
};

// Always log the error trace when tracing
var origTrace = logger.trace;
logger.trace = function (msg) {
    var objType = Object.prototype.toString.call(msg);
    if (objType === '[object Error]') {
        origTrace.call(logger, msg);
    } else {
        if (arguments.length > 1) {
            for (var i = 1; i < arguments.length; i++) {
                msg += ' ' + JSON.stringify(arguments[i]);
            }
        }
        origTrace.call(logger, new Error(msg));
    }
};


// Custom log method for request responses
logger.logRequestAndResponse = function (err, options, res, data) {

    let loggerOutput = {};

    if (options) {
        loggerOutput.options = options;
    }

    if (res) {
        loggerOutput.statusCode = res.statusCode;
        loggerOutput.statusMessage = res.statusMessage;
    }

    if (data) {
        loggerOutput.data = data;
    }

    if (err) {
        loggerOutput.err = err;
        logger.crit(loggerOutput);
        return new Error(JSON.stringify(loggerOutput, null, 4));
    }
    else if (res && res.statusCode === 500) {
        logger.crit(loggerOutput);
        return new Error(JSON.stringify(loggerOutput, null, 4));
    }
    else if (res && res.statusCode >= 400) {
        logger.warn(loggerOutput);
        return new Error(res.statusMessage);
    }
    else if (res && res.statusCode > 201) {
        logger.warn(loggerOutput);
    }
    else {
        logger.debug(loggerOutput);
    }


    return null;
};

module.exports = logger;