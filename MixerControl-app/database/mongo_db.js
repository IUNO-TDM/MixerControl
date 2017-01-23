/**
 * Created by beuttlerma on 02.12.16.
 */

var logger = require('../global/logger');
const CONSTANTS = require("../global/constants.js");

var db = require('mongojs')(CONSTANTS.CONFIG.DATABASE_NAME, []);


function validateArgument(arg, defaultValue) {
    if (!arg || arg == 0 || typeof (arg) == 'function') {
        return defaultValue;
    }
    return arg;
}

var self = {
    COLLECTIONS: CONSTANTS.COLLECTIONS,
    getDocuments: function getDocuments(collectionName, identifier, selector, limit, next) {
        next = arguments[arguments.length - 1];

        identifier = validateArgument(identifier, {});
        selector = validateArgument(selector, {});
        limit = validateArgument(limit, 100);

        var collection = db.collection(collectionName);

        collection.find(replacePlaceholder(identifier), selector).limit(limit, function (err, doc) {
            if (next && typeof(next) == 'function') {
                next(err, doc);
            }
        });
    },
    getDocument: function getDocument(collectionName, identifier, selector, next) {
        next = arguments[arguments.length - 1];

        identifier = validateArgument(identifier, {});
        selector = validateArgument(selector, {});

        var collection = db.collection(collectionName);

        logger.debug(identifier);
        collection.findOne(replacePlaceholder(identifier), selector, function (err, doc) {
            if (next && typeof(next) == 'function') {
                next(err, doc);
            }
        });
    },
    deleteDocument: function deleteDocument(collectionName, identifier) {
        var collection = db.collection(collectionName);

        collection.remove(replacePlaceholder(identifier));
    },
    updateDocument: function updateDocument(collectionName, identifier, data, next) {

        var collection = db.collection(collectionName);

        collection.findAndModify({
            query: replacePlaceholder(identifier),
            update: {
                $set: data
            }
        }, function (err, doc, lastErrorObject) {
            if (err) {
                logger.crit(err);
            }
            if (next && typeof(next) == 'function') {
                next(err, doc);
            }
        });
    },
    saveDocument: function saveDocument(collectionName, data, next) {
        next = arguments[arguments.length - 1];

        var collection = db.collection(collectionName);

        collection.save(data, function (err, doc) {
            if (next && typeof(next) == 'function') {
                next(err, doc);
            }
        });
    }
};

function replacePlaceholder(object) {
    try {
        if (object._id) {
            object._id = new db.ObjectId(object._id);
        }
        return object;
    }
    catch(ex) {
        return object;
    }
}


module.exports = self;