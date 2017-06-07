/**
 * Created by beuttlerma on 18.04.17.
 */


/**
 * To use a custom config file use the config_default as a template.
 * Save the custom config file in the same directory. All files starting with private* will be ignored by git.
 *
 * Set the file name as environment variable for TDM_MIXER_CONFIG.
 *
 * Example: TDM_MIXER_CONFIG='private_config_local' node bin/www
 *
 * If the custom config is missing any variables, the default variables will be used.
 * If no custom config is defined, the default configuration will be loaded.
 *
 * @returns {config}
 */

var ENV_NAME = 'TDM_MIXER_CONFIG';
var config = require('./config_defaults');

if (process.env[ENV_NAME]) {
    console.info('Loading configuration file: ' + process.env[ENV_NAME]);

    var customConfig = require('./' + process.env[ENV_NAME]);

    // override default values from custom configuration
    for (var key in customConfig) {
        config[key] = customConfig[key];
    }
}
else {
    console.warn('ENV Variable: ' + ENV_NAME + ' not specified. Loading defaults only.');
}

module.exports = config;
