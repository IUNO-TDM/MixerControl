/**
 * Created by beuttlerma on 02.12.16.
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
        fatal: 0,
        crit: 1,
        warn: 2,
        info: 3,
        debug: 4,
        trace: 5
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
    if (!msg) {
        msg = level;
        level = 'info';
    }
    origLog.call(logger, level, msg);
};

var origFatal = logger.fatal;
logger.fatal = function (msg) {
    origFatal.call(logger, msg);
};

var origCrit = logger.crit;
logger.crit = function (msg) {
    origCrit.call(logger, msg);
};

var origWarn = logger.warn;
logger.warn = function (msg) {
    origWarn.call(logger, msg);
};

var origInfo = logger.info;
logger.info = function (msg) {
    origInfo.call(logger, msg);
};

var origDebug = logger.debug;
logger.debug = function (msg) {
    origDebug.call(logger, msg);
};

// Always log the error trace when tracing
var origTrace = logger.trace;
logger.trace = function (msg) {
    var objType = Object.prototype.toString.call(msg);
    if (objType === '[object Error]') {
        origTrace.call(logger, msg);
    } else {
        origTrace.call(logger, new Error(msg));
    }
};


/**
 * Custom log function for the request module.
 * Logs the output and error messages from responses.
 *
 * Wraps the logger output within an error object in case of a unsuccessful request.
 *
 * @param err
 * @param options
 * @param res
 * @param data
 * @returns {Error}
 */
logger.logRequestAndResponse = function (err, options, res, data) {

    var loggerOutput = {};

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
        return new Error(loggerOutput);
    }
    else if (res && res.statusCode > 201) {
        logger.warn(loggerOutput);
        return new Error(loggerOutput);
    }
    else {
        logger.debug(loggerOutput);
    }


    return null;
};


/**
 Exports an instance of a winston logger with the additional members described below.
 @see {@link https://github.com/winstonjs/winston}
 */
module.exports = logger;