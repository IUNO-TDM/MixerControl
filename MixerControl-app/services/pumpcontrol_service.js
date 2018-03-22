/**
 * Created by goergch on 07.02.17.
 */

const WebSocketClient = require('websocket').client;
const machina = require('machina');
const CONFIG = require('../config/config_loader');

const EventEmitter = require('events').EventEmitter;
const util = require('util');
const http = require('http');
const async = require('async');
const helper = require('../services/helper_service');
const logger = require('../global/logger');
const request = require('request');

const jms_connector = require('../adapter/juice_machine_service_adapter');
const storage = require('node-persist');


const pumpAmountWarnings = {};
const clearAmountWarning = function (item) {
    pumpAmountWarnings[item] = {'pumpNr': item, 'warningCleared': true}
};

const pumpNumbers = [1, 2, 3, 4, 5, 6, 7, 8];

pumpNumbers.forEach(clearAmountWarning);


const PumpControlService = function () {
    console.log('a new instance of pumpControlservice');
    initStorage();
};

const initStorage = function () {


    async.each(pumpNumbers, function iterate(item, callback) {
        storage.getItem('component' + item).then(
            function (value) {
                if (!value) {
                    if (CONFIG.STD_INGREDIENT_CONFIGURATION && CONFIG.STD_INGREDIENT_CONFIGURATION.length) {
                        storage.setItem('component' + item, CONFIG.STD_INGREDIENT_CONFIGURATION[item - 1]);
                        console.log("Set Component UUID for " + item + ": " + CONFIG.STD_INGREDIENT_CONFIGURATION[item - 1]);
                    }
                } else {
                    console.log("Component UUID for " + item + ": " + value);
                }
            });
        storage.getItem('amount' + item).then(
            function (value) {
                if (!value) {
                    if (CONFIG.STD_INGREDIENT_CONFIGURATION && CONFIG.STD_INGREDIENT_CONFIGURATION.length) {
                        storage.setItem('amount' + item, CONFIG.STD_INGREDIENT_AMOUNT[item - 1]);
                        console.log("Set Amount for " + item + ": " + CONFIG.STD_INGREDIENT_AMOUNT[item - 1]);
                    }
                } else {
                    console.log("Amount for " + item + ": " + value);
                }
            });
    });

};

const sendProtocol = function(){
  async.mapSeries(pumpNumbers,function(item, callback){
    storage.getItem('component' + item).then(function(compId){
      callback(null, compId);
    });
  }, function(err, components){
    const protocol = {
      eventType: 'components',
      timestamp: new Date().toISOString(),
      payload: {
        components: components
      }
    };
    jms_connector.createProtocol(protocol, function(err, cb){
      //TODO: React
    })
  })
}

const pumpcontrol_service = new PumpControlService();
util.inherits(PumpControlService, EventEmitter);

const wsclient = new WebSocketClient();
pumpcontrol_service.websocketclient = wsclient;

let hasStartButton = false;
let hasCabinetSwitch = false;
let hasJuiceDoorSwitch = false;
let hasStartButtonIllumination = false;

pumpcontrol_service.hasStartButton = function () {
  return hasStartButton;
};

pumpcontrol_service.hasCabinetSwitch = function () {
  return hasCabinetSwitch;
};

pumpcontrol_service.hasJuiceDoorSwitch = function () {
  return hasJuiceDoorSwitch;
};

pumpcontrol_service.hasStartButtonIllumination = function () {
  return hasStartButtonIllumination;
};

pumpcontrol_service.setStartButtonIllumination = function (enabled) {
  pumpcontrol_service.setGpioOutputEnabled('start_button_illumination',enabled);
};

const initIngredients = function () {
    jms_connector.getAllComponents(function (e, components) {
        if (!e) {
            async.mapSeries(pumpNumbers, function (item, callback) {
                storage.getItem('component' + item).then(
                    function (compId) {
                        if (!componentExists(components, compId)) {
                            storage.removeItem('component' + item);
                            callback();
                        }
                        else {
                            updateIngredient(item, compId, function () {
                                callback(null,compId);
                            });
                        }
                    });
            }, function(err, comps){
              const protocol = {
                eventType: 'components',
                timestamp: new Date().toISOString(),
                payload: {
                  components: comps
                }
              };
              jms_connector.createProtocol(protocol, function(err, cb){
                //TODO: React
              })
            });
        }
    });
};



const componentExists = function (components, id) {
    for (var i = 0; i < components.length; i++) {
        if (components[i].id === id) {
            return true;
        }
    }
    return false;
};

const state_machine = new machina.Fsm({

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
                pumpcontrol_service.getGpio((err, data)=>{
                  hasJuiceDoorSwitch = false;
                  hasStartButtonIllumination = false;
                  hasCabinetSwitch = false;
                  hasStartButton = false;
                  if(!err){
                    for(let io of data){
                      switch (io.name){
                        case 'cabinet_door_switch':
                          hasCabinetSwitch = true;
                          break;
                        case 'juice_door_switch':
                          hasJuiceDoorSwitch = true;
                          break;
                        case 'start_button':
                          hasStartButton = true;
                          break;
                        case 'start_button_illumination':
                          hasStartButtonIllumination = true;
                          pumpcontrol_service.setStartButtonIllumination(false);
                          break;
                        default:
                          console.debug('unknown pin:' + io)
                      }
                    }
                  }
                });
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


const onWebSocketMessage = function (message) {

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
        } else if (messageObject.hasOwnProperty('input')){
            pumpcontrol_service.emit('input', messageObject.input);
        } else {
            console.log("Unrecognized message from PumpControl: " + JSON.stringify(message));
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

pumpcontrol_service.setIngredient = function (pumpNumber, ingredient, callback) {
    storage.setItemSync('component' + pumpNumber, ingredient);

    updateIngredient(pumpNumber, ingredient, callback);
    sendProtocol();

};
pumpcontrol_service.getStorageIngredient = function (pumpNumber) {
    return storage.getItemSync('component' + pumpNumber);

};
pumpcontrol_service.get

pumpcontrol_service.getConfiguredComponents = function () {
    const components = [];
    for (let i in pumpNumbers) {
        components.push(storage.getItemSync('component' + pumpNumbers[i]));
    }
    return components;
};

pumpcontrol_service.getPumpNumbers = function () {
    return pumpNumbers;

};
pumpcontrol_service.setPumpAmount = function (pumpNumber, amount, callback) {
    clearAmountWarning(pumpNumber);
    pumpcontrol_service.emit('amountWarning', pumpAmountWarnings[pumpNumber]);
    updatePumpAmount(pumpNumber, amount, callback);

};
pumpcontrol_service.setPumpStandardAmount = function (pumpNumber, amount) {
    storage.setItemSync('amount' + pumpNumber, amount);
};

pumpcontrol_service.getPumpStandardAmount = function (pumpNumber) {
    return storage.getItemSync('amount' + pumpNumber);
};

pumpcontrol_service.getMode = function () {
    return pumpcontrol_service.pumpcontrolmode;
};

pumpcontrol_service.getServiceState = function () {
    return state_machine.compositeState();
};

pumpcontrol_service.getAmountWarnings = function () {
    return pumpAmountWarnings;
};

// ------------------------------------
// ------------REST CALLS -------------
// ------------------------------------


const updateIngredient = function (pumpNumber, componentUUID, callback) {
    const options = buildOptionsForRequest(
        'PUT',
        {},
        componentUUID,
        '/ingredients/' + pumpNumber
    );

    request(options, function (e, r, data) {
        const err = logger.logRequestAndResponse(e, options, r, data);

        callback(err);
    });
};



const updatePumpAmount = function (pumpNumber, amount, callback) {
    const options = buildOptionsForRequest(
        'PUT',
        {},
        amount.toString(),
        '/ingredients/' + pumpNumber + '/amount'
    );

    request(options, function (e, r, data) {
        const err = logger.logRequestAndResponse(e, options, r, data);

        callback(err);
    });
};

pumpcontrol_service.startProgram = function (productionQueue, recipe) {

    // Make sure all components are set on the pumpcontrol before running the program
    async.eachSeries(pumpNumbers, function (item, callback) {
        storage.getItem('component' + item).then(
            function (compId) {
                if (compId) {
                    updateIngredient(item, compId, function () {
                        callback();
                    });
                }
            });
    }, function done() {
        const options = buildOptionsForRequest(
            'PUT',
            {},
            recipe.program,
            '/program/' + recipe['productCode']
        );

        request(options, function (e, r, data) {
            const err = logger.logRequestAndResponse(e, options, r, data);

            if (err) {
                pumpcontrol_service.emit('pumpControlError', err);
            }
        });
    });
};

pumpcontrol_service.getIngredient = function (pumpNumber, callback) {

    const options = buildOptionsForRequest(
        'GET',
        {},
        null,
        '/ingredients/' + pumpNumber
    );

    request(options, function (e, r, data) {
        const err = logger.logRequestAndResponse(e, options, r, data);

        callback(err, data);
    });
};

pumpcontrol_service.getPumpList = function (callback) {
    const options = buildOptionsForRequest(
        'GET',
        {},
        null,
        '/pumps'
    );

    request(options, function (e, r, data) {
        const err = logger.logRequestAndResponse(e, options, r, data);

        callback(err, data);
    });
};

pumpcontrol_service.setServiceMode = function (on) {
    const options = buildOptionsForRequest(
        'PUT',
        {},
        on ? 'true' : 'false',
        '/service'
    );

    request(options, function (e, r, data) {
        logger.logRequestAndResponse(e, options, r, data);
    });
};
pumpcontrol_service.setServicePump = function (pumpNumber, on) {

    const options = buildOptionsForRequest(
        'PUT',
        {},
        on ? 'on' : 'off',
        '/service/pumps/' + pumpNumber
    );

    request(options, function (e, r, data) {
        logger.logRequestAndResponse(e, options, r, data);
    });
};

pumpcontrol_service.getGpio = function (callback) {
  const options = buildOptionsForRequest(
    'GET',
    {},
    null,
    '/io-description'
  );

  options.json = true;

  request(options, function (e, r, data) {
    const err = logger.logRequestAndResponse(e, options, r, data);
    callback(err, data);
  });
};


pumpcontrol_service.setGpioOutputEnabled = function (name, enabled) {
  const options = buildOptionsForRequest(
    'PUT',
    {},
    enabled ? 'on' : 'off',
    '/io/' + name
  );

  request(options, function (e, r, data) {
    logger.logRequestAndResponse(e, options, r, data);
  });
};

function buildOptionsForRequest(method, qs, body, path) {

    return {
        method: method,
        url: CONFIG.HOST_SETTINGS.PUMP_CONTROL.PROTOCOL +
        '://' + CONFIG.HOST_SETTINGS.PUMP_CONTROL.HOST + ':' + CONFIG.HOST_SETTINGS.PUMP_CONTROL.PORT + path,
        headers: {
            'Content-Type': 'application/json'
        },
        qs: qs,
        body: body
    }
}

module.exports = pumpcontrol_service;
