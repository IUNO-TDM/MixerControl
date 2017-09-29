

let self = require('./license_manager_strategy/default');

try {
    self = require('./license_manager_strategy/' + process.env.NODE_ENV);
}
catch (err) {

}

module.exports = self;