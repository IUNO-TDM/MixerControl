/**
 * Created by beuttlerma on 09.03.16.
 */

var self = {
    clone: function clone(a) {
        return JSON.parse(JSON.stringify(a));
    },
    isObject: function isObject(a) {
        return (!!a) && (a.constructor === Object);
    },
    isArray: function isArray(a) {
        return (!!a) && (a.constructor === Array);
    }
};


module.exports = self;