let self = {};

try {
    self = require('./license_manager_strategy/' + process.env.NODE_ENV);
}
catch (err) {
    self = require('./license_manager_strategy/default');
}

module.exports = self;