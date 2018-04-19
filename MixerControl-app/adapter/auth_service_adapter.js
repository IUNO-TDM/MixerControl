/**
 * Created by beuttlerma on 02.06.17.
 */


const logger = require('../global/logger');
const CONFIG = require('../config/config_loader');
const request = require('request');
const self = {};

function buildOptionsForRequest(method, protocol, host, port, path, qs) {

    return {
        method: method,
        url: protocol + '://' + host + ':' + port + path,
        qs: qs,
        json: true,
        headers: {
            'Authorization': 'Basic ' + new Buffer(CONFIG.OAUTH_CREDENTIALS.CLIENT_ID + ':' + CONFIG.OAUTH_CREDENTIALS.CLIENT_SECRET).toString('base64')
        }
    }
}


self.getAccessToken = function (callback) {

    // Only request new access token if the old has expired
    if (self.token && new Date(self.token.accessTokenExpiresAt) > new Date()) {
        return callback(null, self.token);
    }

    logger.info('Requesting new access token from the oauth server');

    if (typeof(callback) !== 'function') {
        callback = function (err, data) {
            logger.warn('Callback not handled by caller');
        };
    }

    var options = buildOptionsForRequest(
        'POST',
        CONFIG.HOST_SETTINGS.OAUTH_SERVER.PROTOCOL,
        CONFIG.HOST_SETTINGS.OAUTH_SERVER.HOST,
        CONFIG.HOST_SETTINGS.OAUTH_SERVER.PORT,
        '/oauth/token',
        {}
    );

    options.form = {
        grant_type: 'client_credentials'
    };

    request(options, function (e, r, jsonData) {
        logger.debug('Response from OAUTH Server: ' + JSON.stringify(jsonData));
        if (e) {
            logger.crit(e);

            callback(e);
            return;
        }

        if (r && r.statusCode !== 200) {
            var err = {
                status: r.statusCode,
                message: jsonData
            };
            logger.warn(err);
            callback(err);

            return;
        }

        self.token = jsonData.access_token;
        callback(null, self.token);
    });

};

self.invalidateToken = function () {
    self.token = null;
};
module.exports = self;