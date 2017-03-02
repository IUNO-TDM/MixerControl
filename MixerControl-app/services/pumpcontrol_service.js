/**
 * Created by goergch on 07.02.17.
 */

var WebSocketClient = require('websocket').client;
var machina = require('machina');
var ingredient_configuration = require('../global/ingredient_configuration');
const EventEmitter = require('events').EventEmitter;
const util = require('util');
const http = require('http');
var jms_connector = require('../connectors/juice_machine_service_connector');
const async = require('async');

var PumpControlService = function () {
    console.log('a new instance of pumpControlservice');
};

const pumpcontrol_service = new PumpControlService();
util.inherits(PumpControlService, EventEmitter);

var wsclient = new WebSocketClient();
pumpcontrol_service.websocketclient = wsclient;

var initIngredients = function () {
    jms_connector.getAllComponents(function (e, components) {
        if (!e) {
            async.eachSeries(ingredient_configuration.INGREDIENT_CONFIGURATION, function iterate(item, callback) {
                const key = Object.keys(item)[0]
                updateIngredient(key, componentNameForId(components,item[key]), callback);
            });
        }
    });
};

var componentNameForId = function(components,id){
    for(var i = 0 ; i < components.length; i++)
    {
        if(components[i].id == id){
            return components[i].name;
        }
    }
    return undefined;
};

var updateIngredient = function(pumpNumber, ingredient, callback){
    var options = {
        hostname: 'localhost',
        port: 9002,
        path: '/ingredients/' + pumpNumber,
        agent: false,
        method: 'PUT'
    };
    var req = http.request(options, function (res) {
            console.log(res.statusCode + ' ' + res.statusMessage);
            callback();
        }
    ).end(ingredient);
}

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
                wsclient.connect('http://localhost:9002', null, null, null);
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

    if (message.type == 'utf8') {
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
    console.log('Got HTTP Response: ' + response);
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
    ;
    var options = {
        hostname: 'localhost',
        port: 9002,
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
    ;
    var options = {
        hostname: 'localhost',
        port: 9002,
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
        hostname: 'localhost',
        port: 9002,
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
        hostname: 'localhost',
        port: 9002,
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
    const ingr = ingredient_configuration.INGREDIENT_CONFIGURATION;
    for(var i = 0; i < ingr; i++ ){
        const key = ingr[i].keys()[0];
        if(key == pumpNumber){
            ingr[i][key] = ingredient;
            break;
        }
    }
    // ingredient_configuration.INGREDIENT_CONFIGURATION[pumpNumber] = ingredient;
    jms_connector.getAllComponents(function (e, components) {
        if (!e) {
            updateIngredient(pumpNumber,componentNameForId(components,ingredient),callback);
        }
    });

};
pumpcontrol_service.startProgram = function (program) {
    var options = {
        hostname: 'localhost',
        port: 9002,
        path: '/program',
        agent: false,
        method: 'PUT'
    };
    var req = http.request(options, function (res) {
            console.log(res.statusCode + ' ' + res.statusMessage);
        }
    ).end(JSON.stringify(program));
};


pumpcontrol_service.getMode = function(){
    return pumpcontrol_service.pumpcontrolmode;
};

pumpcontrol_service.getServiceState = function(){
    return state_machine.compositeState();
};

module.exports = pumpcontrol_service;
