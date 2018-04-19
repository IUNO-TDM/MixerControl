const storage = require('node-persist');

var self = {};

self.getKey = function (persistKey, defaultValue) {
    if (storage.keys().includes(persistKey)) {
        return storage.getItemSync(persistKey);
    } else {
        return defaultValue;
    }
};

self.setKey = function (persistKey, value) {
    return storage.setItemSync(persistKey, value);
};

module.exports = self;
