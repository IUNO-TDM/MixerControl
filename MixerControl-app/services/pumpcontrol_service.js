/**
 * Created by goergch on 07.02.17.
 */

var WebSocketClient = require('websocket').client;
var machina = require('machina');
var CONFIG = require('../config/config_loader');

const EventEmitter = require('events').EventEmitter;
const util = require('util');
const http = require('http');
const async = require('async');
const helper = require('../services/helper_service');

var jms_connector = require('../adapter/juice_machine_service_adapter');
var storage = require('node-persist');


var pumpAmountWarnings = {};
const clearAmountWarning = function (item) {
    pumpAmountWarnings[item] = {'pumpNr':item, 'warningCleared':true}
};

const pumpNumbers = [ 1, 2, 3, 4, 5, 6, 7, 8];

pumpNumbers.forEach(clearAmountWarning );




var PumpControlService = function () {
    console.log('a new instance of pumpControlservice');
    initStorage();


};

var initStorage = function(){


    async.each(pumpNumbers, function iterate(item, callback){
        storage.getItem('component' + item).then(
            function (value) {
                if(!value){
                    storage.setItem('component' + item,CONFIG.STD_INGREDIENT_CONFIGURATION[item-1]);
                    console.log("Set Component UUID for " + item + ": " + CONFIG.STD_INGREDIENT_CONFIGURATION[item-1]);
                }else{
                    console.log("Component UUID for " + item + ": " + value);
                }
            });
        storage.getItem('amount' + item).then(
            function (value) {
                if(!value){
                    storage.setItem('amount' + item,CONFIG.STD_INGREDIENT_AMOUNT[item-1]);
                    console.log("Set Amount for " + item + ": " + CONFIG.STD_INGREDIENT_AMOUNT[item-1]);
                }else{
                    console.log("Amount for " + item + ": " + value);
                }
            });
    });

};

const pumpcontrol_service = new PumpControlService();
util.inherits(PumpControlService, EventEmitter);

var wsclient = new WebSocketClient();
pumpcontrol_service.websocketclient = wsclient;

var initIngredients = function () {
    jms_connector.getAllComponents(function (e, components) {
        if (!e) {
            async.eachSeries(pumpNumbers, function (item, callback) {
                storage.getItem('component' + item).then(
                    function (compId) {
                        const compName = componentNameForId(components,compId);
                        if (!compName) {
                            storage.removeItem('component' + item);
                        }
                        else {
                            updateIngredient(item, compName, function () {
                                storage.getItem('amount' + item).then(
                                    function (amount) {
                                        pumpcontrol_service.setPumpAmount(item,amount, function () {
                                            callback();
                                        });
                                    });
                            });
                        }
                    });
            });
        }
    });
};

var componentNameForId = function(components,id){
    for(var i = 0 ; i < components.length; i++)
    {
        if(components[i].id === id){
            return components[i].name;
        }
    }
    return undefined;
};

var updateIngredient = function(pumpNumber, ingredient, callback){
    var options = {
        hostname: CONFIG.HOST_SETTINGS.PUMP_CONTROL.HOST,
        port: CONFIG.HOST_SETTINGS.PUMP_CONTROL.PORT,
        path: '/ingredients/' + pumpNumber,
        agent: false,
        method: 'PUT'
    };
    var req = http.request(options, function (res) {
            console.log(res.statusCode + ' ' + res.statusMessage);
            callback();
        }
    ).end(ingredient);
};
var updatePumpAmount = function (pumpNumber, amount, callback) {
    var options = {
        hostname: CONFIG.HOST_SETTINGS.PUMP_CONTROL.HOST,
        port: CONFIG.HOST_SETTINGS.PUMP_CONTROL.PORT,
        path: '/ingredients/' + pumpNumber + '/amount',
        agent: false,
        method: 'PUT'
    };
    var req = http.request(options, function (res) {
            console.log(res.statusCode + ' ' + res.statusMessage);
            callback();
        }
    ).end(amount.toString());

};

var state_machine = new machina.Fsm({

    namespace: "pumpcontrol",
    intialState: "uninitialized",

    states: {
        uninitialized: {
            "*": function () {
                this.transition("connecting");
            }
        },
        connecting: {
            _onEnter: function () {
                wsclient.connect(helper.formatString('{0}://{1}:{2}',
                    CONFIG.HOST_SETTINGS.PUMP_CONTROL.PROTOCOL,
                    CONFIG.HOST_SETTINGS.PUMP_CONTROL.HOST,
                    CONFIG.HOST_SETTINGS.PUMP_CONTROL.PORT), null, null, null);
            },
            connectFail: "connectionFailed",
            connectSuccess: "connected",
            disconnect: function () {
                this.deferUntilTransition();
            }
        },
        connected: {
            _onEnter: function () {
                initIngredients();
            },
            connectionLoss: "connectionLost",
            disconnect: "stopped"
        },
        stopped: {
            _onEnter: function () {
                pumpcontrol_service.wsconnection.close();
            },
            connect: "connecting"
        },
        connectionFailed: {
            _onEnter: function () {
                this.transition('waitingReconnection')
            },
            disconnect: function () {
                this.deferUntilTransition();
            }
        },
        connectionLost: {
            _onEnter: function () {
                this.transition('waitingReconnection')
            },
            disconnect: function () {
                this.deferUntilTransition();
            }
        },
        waitingReconnection: {
            _onEnter: function () {
                this.timer = setTimeout(function () {
                    this.handle("timeout");
                }.bind(this), 5000);
            },
            timeout: "connecting",
            disconnect: "stopped"
        }
    },
    disconnect: function () {
        this.handle("disconnect");
    },
    connectFail: function () {
        this.handle("connectFail");
    },
    connectSuccess: function () {
        this.handle("connectSuccess");
    },
    connectionLoss: function () {
        this.handle("connectionLoss");
    },
    connect: function () {
        this.handle("connect");
    }

});

pumpcontrol_service.pumpcontrolmode = "";


var onWebSocketMessage = function (message) {

    if (message.type === 'utf8') {
        var messageObject = JSON.parse(message.utf8Data);
        if (messageObject.hasOwnProperty('mode')) {
            pumpcontrol_service.emit('pumpControlMode', messageObject.mode);
            pumpcontrol_service.pumpcontrolmode = messageObject.mode;
        } else if (messageObject.hasOwnProperty('progressUpdate')) {
            pumpcontrol_service.emit('pumpControlProgress', messageObject.progressUpdate);
        } else if (messageObject.hasOwnProperty('programEnded')) {
            pumpcontrol_service.emit('pumpControlProgramEnd', messageObject.programEnded);
        } else if (messageObject.hasOwnProperty('error')) {
            pumpcontrol_service.emit('pumpControlError', messageObject.error);
        } else if (messageObject.hasOwnProperty('amountWarning')) {
            pumpcontrol_service.emit('amountWarning', messageObject.amountWarning);
            pumpAmountWarnings[messageObject.amountWarning.pumpNr] = messageObject.amountWarning;
        } else {
            console.log("Unrecognized message from PumpControl: " + message);
        }
    } else {
        console.log("Got non text message from PumpControl");
    }
    pumpcontrol_service.emit('message', message.utf8Data);
};

wsclient.on('connect', function (webSocketConnection) {
    // console.log('Connection successful');
    pumpcontrol_service.wsconnection = webSocketConnection;
    state_machine.connectSuccess();
    webSocketConnection.on('message', onWebSocketMessage);
    webSocketConnection.on('close', function (reasonCode, description) {
        // console.log('Connection closed: ' + reasonCode + " : " + description);
        state_machine.connectionLoss();
    });
    webSocketConnection.on('error', function (error) {
        // console.log('Error: ' + error);
        state_machine.connectionLoss();
    });
});

wsclient.on('connectFailed', function (errorDescription) {
    // console.log('Connection failed: ' + errorDescription);
    state_machine.connectFail();
});
wsclient.on('httpResponse', function (response, webSocketClient) {
    console.log('[PumpControl] Got HTTP Response: ' + response);
});

state_machine.on('transition', function (data) {
    // console.log("PumpControl statechange " + data.toState );
    pumpcontrol_service.emit('serviceState', data.toState);
});

pumpcontrol_service.init = function () {
    state_machine.connect();
};
pumpcontrol_service.setServiceMode = function (on) {
    var body;
    if (on) {
        body = 'true';
    } else {
        body = 'false';
    }

    var options = {
        hostname: CONFIG.HOST_SETTINGS.PUMP_CONTROL.HOST,
        port: CONFIG.HOST_SETTINGS.PUMP_CONTROL.PORT,
        path: '/service',
        agent: false,
        method: 'PUT'
    };
    var req = http.request(options, function (res) {
            console.log(res.statusCode + ' ' + res.statusMessage);
        }
    ).end(body);
};
pumpcontrol_service.setServicePump = function (pumpNumber, on) {
    var body;
    if (on) {
        body = 'true';
    } else {
        body = 'false';
    }

    var options = {
        hostname: CONFIG.HOST_SETTINGS.PUMP_CONTROL.HOST,
        port: CONFIG.HOST_SETTINGS.PUMP_CONTROL.PORT,
        path: '/service/pumps/' + pumpNumber,
        agent: false,
        method: 'PUT'
    };
    var req = http.request(options, function (res) {
            console.log(res.statusCode + ' ' + res.statusMessage);
        }
    ).end(body);
};
pumpcontrol_service.getPumpList = function (callback) {
    var options = {
        hostname: CONFIG.HOST_SETTINGS.PUMP_CONTROL.HOST,
        port: CONFIG.HOST_SETTINGS.PUMP_CONTROL.PORT,
        path: '/pumps',
        agent: false,
        method: 'GET'
    };
    var req = http.request(options, function (res) {

            res.on('data', function (chunk) {
                console.log('Got pumps: ' + chunk);
                callback(chunk);
            });
        }
    ).end();
};
pumpcontrol_service.getIngredient = function (pumpNumber, callback) {
    var options = {
        hostname: CONFIG.HOST_SETTINGS.PUMP_CONTROL.HOST,
        port: CONFIG.HOST_SETTINGS.PUMP_CONTROL.PORT,
        path: '/ingredients/' + pumpNumber,
        agent: false,
        method: 'GET'
    };
    var req = http.request(options, function (res) {

            res.on('data', function (chunk) {
                console.log('Got ingredient for pump ' + pumpNumber + ': ' + chunk);
                callback(chunk);
            });
        }
    ).end();
};
pumpcontrol_service.setIngredient = function (pumpNumber, ingredient, callback) {
    storage.setItemSync('component' + pumpNumber, ingredient);
    jms_connector.getAllComponents(function (e, components) {
        if (!e) {
            updateIngredient(pumpNumber,componentNameForId(components,ingredient),callback);
        }
    });

};
pumpcontrol_service.getStorageIngredient = function (pumpNumber) {
    return storage.getItemSync('component' + pumpNumber);

};

pumpcontrol_service.getPumpNumbers = function () {
    return pumpNumbers;

};
pumpcontrol_service.setPumpAmount = function (pumpNumber, amount, callback) {
    clearAmountWarning(pumpNumber);
    pumpcontrol_service.emit('amountWarning', pumpAmountWarnings[pumpNumber]);
    updatePumpAmount(pumpNumber,amount,callback);

};
pumpcontrol_service.setPumpStandardAmount = function (pumpNumber, amount) {
    storage.setItemSync('amount' + pumpNumber, amount);
};

pumpcontrol_service.getPumpStandardAmount = function (pumpNumber) {
    return storage.getItemSync('amount' + pumpNumber);
};

pumpcontrol_service.startProgram = function (program) {
    var options = {
        hostname: CONFIG.HOST_SETTINGS.PUMP_CONTROL.HOST,
        port: CONFIG.HOST_SETTINGS.PUMP_CONTROL.PORT,
        path: '/program',
        agent: false,
        method: 'PUT'
    };
    try {
        var req = http.request(options, function (res) {
                console.log(res.statusCode + ' ' + res.statusMessage);
            }
        ).end(JSON.stringify(program));
    }
    catch (err) {
        logger.crit(err);
    }
};


pumpcontrol_service.getMode = function(){
    return pumpcontrol_service.pumpcontrolmode;
};

pumpcontrol_service.getServiceState = function(){
    return state_machine.compositeState();
};

pumpcontrol_service.getAmountWarnings = function () {
    return pumpAmountWarnings;
};



module.exports = pumpcontrol_service;
