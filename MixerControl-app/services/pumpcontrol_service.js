/**
 * Created by goergch on 07.02.17.
 */

var WebSocketClient = require('websocket').client;
var machina = require('machina');
const EventEmitter = require('events').EventEmitter;
const util = require('util');
const http = require('http');

var PumpControlService = function(){
  console.log('a new instance of pumpControlservice');
};

const pumpcontrol_service =  new PumpControlService();
util.inherits(PumpControlService,EventEmitter);

var wsclient = new WebSocketClient();
pumpcontrol_service.websocketclient = wsclient;

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
        wsclient.connect('http://localhost:9002',null,null,null);
      },
      connectFail: "connectionFailed",
      connectSuccess: "connected",
      disconnect: function () {
        this.deferUntilTransition();
      }
    },
    connected: {
      _onEnter: function () {
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
    connectionFailed:{
      _onEnter: function () {
        this.transition('waitingReconnection')
      },
      disconnect: function () {
        this.deferUntilTransition();
      }
    },
    connectionLost:{
      _onEnter: function () {
        this.transition('waitingReconnection')
      },
      disconnect: function () {
        this.deferUntilTransition();
      }
    },
    waitingReconnection:{
      _onEnter: function () {
        this.timer = setTimeout( function() {
          this.handle( "timeout" );
        }.bind( this ), 5000 );
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


wsclient.on('connect',function (webSocketConnection) {
  // console.log('Connection successful');
  pumpcontrol_service.wsconnection = webSocketConnection;
  state_machine.connectSuccess();
  webSocketConnection.on('message', function (message) {
    // console.log('New message: ' + message.utf8Data);
    pumpcontrol_service.emit('message',message.utf8Data);
  });
  webSocketConnection.on('close', function (reasonCode, description) {
    // console.log('Connection closed: ' + reasonCode + " : " + description);
  });
  webSocketConnection.on('error', function (error) {
    // console.log('Error: ' + error);
    state_machine.connectionLoss();
  });
});
wsclient.on('connectFailed',function (errorDescription) {
  // console.log('Connection failed: ' + errorDescription);
  state_machine.connectFail();
});
wsclient.on('httpResponse',function (response, webSocketClient) {
  console.log('Got HTTP Response: ' + response);
});

state_machine.on('transition', function (data) {
  // console.log("PumpControl statechange " + data.toState );
  pumpcontrol_service.emit('state',data.toState);
});

pumpcontrol_service.init = function () {
  state_machine.connect();
};
pumpcontrol_service.setServiceMode = function(on) {
  var body;
  if(on){
    body = 'true';
  } else {
    body = 'false';
  };
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

pumpcontrol_service.setServicePump = function(pumpNumber,on) {
  var body;
  if(on){
    body = 'true';
  } else {
    body = 'false';
  };
  var options = {
    hostname: 'localhost',
    port: 9002,
    path: '/service/pumps/'+ pumpNumber,
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

pumpcontrol_service.getIngredient = function (pumpNumber,callback) {
  var options = {
    hostname: 'localhost',
    port: 9002,
    path: '/ingredients/'+pumpNumber,
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

pumpcontrol_service.setIngredient = function (pumpNumber,ingredient) {
  var options = {
    hostname: 'localhost',
    port: 9002,
    path: '/ingredients/'+pumpNumber,
    agent: false,
    method: 'PUT'
  };
  var req = http.request(options, function (res) {
    console.log(res.statusCode + ' ' + res.statusMessage);
    }
  ).end(ingredient);
};



module.exports = pumpcontrol_service;
