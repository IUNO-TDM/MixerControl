const express = require('express');
const router = express.Router();
const logger = require('../global/logger');
const helper = require('../services/helper_service');
const cache = require('../services/cache_middleware');
const async = require('async');
const pumpcontrol_service = require('../services/pumpcontrol_service');

const jms_connector = require('../adapter/juice_machine_service_adapter');

/**
 * Functions
 */

String.prototype.format = function () {
    var args = [].slice.call(arguments);
    return this.replace(/(\{\d+\})/g, function (a) {
        return args[+(a.substr(1, a.length - 2)) || 0];
    });
};

function getLanguageFromRequest(req) {
    var language = req.query['lang']
    if (!language) {
        language = 'en'
    }
    return language
}

router.get('/', function (req, res, next) {
    const language = getLanguageFromRequest(req)
    jms_connector.getAllComponents(language, function (e, components) {
        if (e) {
            logger.crit(e);
            next(e);
            return;
        }

        var result = {};

        // all components
        result["available"] = components;

        // installed components
        var installed = [];
        const pumps = pumpcontrol_service.getPumpNumbers();
        pumps.forEach(pumpNr => {
            installed.push(pumpcontrol_service.getStorageIngredient(pumpNr))
        })
        result["installed"] = installed;

        // recommended components
        result["recommended"] = [
            "570a5df0-a044-4e22-b6e6-b10af872d75c", // Testing: Mineralwasser
            "198f1571-4846-4467-967a-00427ab0208d", // Testing: Apfelsaft
            "f6d361a9-5a6f-42ad-bff7-0913750809e4", // Testing: Orangensaft
            "fac1ee6f-185f-47fb-8c56-af57cd428aa8", // Testing: Mangosaft
            "0425393d-5b84-4815-8eda-1c27d35766cf", // Testing: Kirschsaft
            "4cfa2890-6abd-4e21-a7ab-17613ed9a5c9", // Testing: Bananensaft
            "14b72ce5-fec1-48ec-83ff-24b124f98dc8", // Testing: Maracuijasaft
            "bf2cfd66-5b6f-4655-8e7f-04090308f6db", // Testing: Ananassaft
            "d5a0e575-5767-4496-bac5-0d661ed5b5ee", // Production: Mineralwasser
            "f391d4bf-5b88-4583-9be7-15f029f525f5", // Production: Apfelsaft
            "db46f436-2068-4650-af65-46e504aaa238", // Production: Orangensaft
            "1f6a7ae1-f6f7-4613-adda-4cfdba28b167", // Production: Mangosaft
            "cfc32d53-a386-4023-ba43-bc6996e11b72", // Production: Kirschsaft
            "18851cce-2526-4365-8381-c39c33f95542", // Production: Bananensaft
            "eade7f3b-ec8c-4658-9a84-a98ddca4a352", // Production: Maracuijasaft
            "6c3e5356-b8e0-4978-9f68-c5f7f59ce2f4", // Production: Ananassaft
        ].filter(id => { // remove recommended which are not in available
            return components.find(component => {
                return component.id === id
            })
        })

        res.json(result)

        // if (req.query['filtered']) {

        //     const componentUUIDs = [];

        //     const pumps = pumpcontrol_service.getPumpNumbers();
        //     async.eachSeries(pumps, function(pumpNr, callback){
        //         componentUUIDs.push(pumpcontrol_service.getStorageIngredient(pumpNr));
        //         callback();
        //     },function(err){
        //         if (!err){
        //             const filteredComponents = [];

        //             for (let i in components) {
        //                 const component = components[i];
        //                 if (componentUUIDs.indexOf(component.id) !== -1){
        //                     filteredComponents.push(component);
        //                 }
        //             }

        //             return res.json(filteredComponents);

        //         }else{
        //             logger.crit(err);
        //             return res.sendStatus(500);
        //         }
        //     });
        // }
        // else {
        //     res.json(components);
        // }

    });

});


module.exports = router;
