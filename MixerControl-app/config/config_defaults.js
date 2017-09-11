/**
 * Created by beuttlerma on 18.04.17.
 */


const self = {};


// ---- CONFIGURATION EXPORT ----

self.DATABASE_NAME = 'MIXERCONTROL_DB';
self.LOG_LEVEL = 'debug';
self.HOST_SETTINGS = {
    JUICE_MACHINE_SERVICE: {
        HOST: 'localhost',
        PORT: 3001,
        PROTOCOL: 'http'
    },
    OAUTH_SERVER: {
        HOST: 'localhost',
        PORT: 3005,
        PROTOCOL: 'http'
    },
    PAYMENT_SERVICE: {
        HOST: 'localhost',
        PORT: 8080,
        PROTOCOL: 'http'
    },
    PUMP_CONTROL: {
        HOST: 'localhost',
        PORT: 9002,
        PROTOCOL: 'http'
    },
    LICENSE_MANAGER: {
        HOST: 'localhost',
        PORT: 11432,
        PROTOCOL: 'http'
    }
};

// ---- INGREDIENT CONFIGURATION ----
self.STD_INGREDIENT_CONFIGURATION = [
    "570a5df0-a044-4e22-b6e6-b10af872d75c",
    "198f1571-4846-4467-967a-00427ab0208d",
    "f6d361a9-5a6f-42ad-bff7-0913750809e4",
    "fac1ee6f-185f-47fb-8c56-af57cd428aa8",
    "0425393d-5b84-4815-8eda-1c27d35766cf",
    "4cfa2890-6abd-4e21-a7ab-17613ed9a5c9",
    "14b72ce5-fec1-48ec-83ff-24b124f98dc8",
    "bf2cfd66-5b6f-4655-8e7f-04090308f6db"
];

self.STD_INGREDIENT_AMOUNT = [
    1500,
    1500,
    1500,
    1000,
    1000,
    1000,
    1000,
    1000
];

self.OAUTH_CREDENTIALS = {
    CLIENT_ID: 'adb4c297-45bd-437e-ac90-9179eea41746',
    CLIENT_SECRET: 'IsSecret'
};

self.RETAIL_PRICE = 2 * 100000; //1 IUNO = 100.000 satoshi


module.exports = self;
