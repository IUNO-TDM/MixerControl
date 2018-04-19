const fs = require('fs');
const path = require('path');
const jms = require('../adapter/juice_machine_service_adapter');


const cmDongleId = '3-4019154';
const contextFilePath = path.resolve(__dirname, cmDongleId + '.WibuCmRaC');
const updateFilePath = path.resolve(__dirname, cmDongleId + '.WibuCmRaU');
const context = new Buffer(fs.readFileSync(contextFilePath)).toString('base64');


jms.getLicenseUpdate(cmDongleId, context, function (err, update) {
    if (err) {
        console.error(err);
    }

    if (update) {
        fs.writeFileSync(updateFilePath, update, 'base64');
    }
});