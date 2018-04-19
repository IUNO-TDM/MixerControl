/**
 * Created by goergch on 17.03.17.
 */

var IFTTT = require('node-ifttt-maker'),
    ifttt = new IFTTT('xxx');


var pumpcontrol_service = require('../services/pumpcontrol_service');

pumpcontrol_service.on('amountWarning', function (warning) {
    if (!warning.warningCleared) {
        // ifttt.request({
        //     event: 'iuno_amountWarning',
        //     method: 'PUT',
        //     params: {
        //         'value1': warning.pumpNr,
        //         'value2': warning.ingredient,
        //         'value3': warning.amountWarningLimit
        //
        //     }
        // }, function (err) {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         console.log('OK');
        //     }
        // });
    }

});