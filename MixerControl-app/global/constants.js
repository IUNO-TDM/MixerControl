/**
 * Created by beuttlerma on 05.12.16.
 */

const self = {
    CONFIG: {
        DATABASE_NAME: 'MIXERCONTROL_DB',
        LOG_LEVEL: 'debug'
    },
    HOST_SETTINGS: {
        JUICE_MACHINE_SERVICE: {
            HOST: 'tdm-jms.axoom.cloud',
            PORT: 443,
            METHOD: 'https'
        }
    }
};


module.exports = self;

