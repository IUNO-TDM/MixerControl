var machina = require('machina');
const EventEmitter = require('events').EventEmitter;
const util = require('util');

var pumpcontrol_service = require('../services/pumpcontrol_service');

const prog = {
  "orderName": "Christians Drink",
  "recipe": {
    "id":"TestProgram",
    "lines":
      [

        {
          "components":
            [
              {
                "ingredient":"Orangensaft",
                "amount":5
              },
              {
                "ingredient":"Apfelsaft",
                "amount":5
              },
              {
                "ingredient":"Johannisbeersaft",
                "amount":5
              }
            ],
          "timing":1,
          "sleep":0
        }
      ]
  }
};



var ProductionQueue = function(){
};
const production_queue = new ProductionQueue();
util.inherits(ProductionQueue, EventEmitter);
var queue = [];
var pumpcontrol_service = require('../services/pumpcontrol_service');

var sendProductionQueueUpdate = function(){
    production_queue.emit('queueChange', production_queue.getStrippedQueue());
};


var state_machine = new machina.Fsm({

  namespace: "productionqueue",
  intialState: "uninitialized",

  states: {
    uninitialized: {
      _init: function () {
        pumpcontrol_service.init();
        this.transition("waitingPump");
      }
    },
    waitingPump:{
      pumpControlConnected: function(){
          if(queue.length == 0){
              this.transition("waitingOrder");
          }else{
              this.transition("waitingStart");
          }
      }
    },
    waitingOrder: {
      _onEnter: function () {
        if(queue.length > 0){
          this.transition("waitingStart");
        }
      },
      orderEnqueued: "waitingStart",
      productionPause: "productionPaused",
      pumpControlDisconnected: "waitingPump"
    },
    waitingStart:{
      // _onEnter: function () {
      // },
      startConfirmed: "startProcessing",
      productionPause: "productionPaused",
      pumpControlDisconnected: "waitingPump"
    },
    startProcessing:{
        _onEnter: function () {
            var p = prog;
            p.orderName = queue[0].orderName;
            pumpcontrol_service.startProgram(p);
        },
        startedProcessing: "processingOrder",
        errorProcessing: "errorProcessing",
        pumpControlDisconnected: "waitingPump"

    },
    processingOrder: {

      programEnded: "finished",
      pumpControlDisconnected: "waitingPump"
    },
    finished: {
      _onEnter: function () {
        order = queue.shift();
        sendProductionQueueUpdate();
        console.log("ProductionQueueFinished: Removed first order: " + order.orderNumber);
        if(queue.length == 0){
          this.transition("waitingOrder");
        }else{
          this.transition("waitingStart");
        }
      }
    },
    errorProcessing:{
      _onEnter: function(){
        var order = queue.shift();
        sendProductionQueueUpdate();
        console.log("ProductionQueueError: Removed first order: " + order.orderNumber);
        if(queue.length == 0){
            this.transition("waitingOrder");
        }else{
            this.transition("waitingStart");
        }
      },
      pumpControlDisconnected: "waitingPump"
    },
    productionPaused: {
      _onEnter: function(){

      },
      productionResume: function () {
        if(queue.length == 0){
          this.transition("waitingOrder");
        }else{
          this.transition("waitingStart");
        }
      },
      pumpControlDisconnected: "waitingPump"
    }
  },
  pauseProduction: function () {
    this.handle("productionPause");
  },
  resumeProduction: function () {
    this.handle("productionResume");
  },
  orderEnqueued: function () {
    this.handle("orderEnqueued");
  },
  programStarted: function(){
    this.handle("startedProcessing")
  },
  programEnded: function () {
    this.handle("programEnded");
  },
  startConfirmed: function () {
    this.handle("startConfirmed");
  },
  init: function () {
      this.handle("_init");
  },
  pumpControlConnected: function(){
    this.handle("pumpControlConnected");
  },
  pumpControlDisconnected: function(){
      this.handle("pumpControlDisconnected");
  },
  errorProcessing: function () {
      this.handle("errorProcessing");
  }

});

pumpcontrol_service.on('pumpControlState', function (state) {
  // console.log("New PumpControl state: " + state);
});
pumpcontrol_service.on('pumpControlProgress', function (progUpdate) {
  // console.log("PumpControl Progress: " + progUpdate.progress + "\% ("+progUpdate.orderName + ")");
    if (queue[0]){
        queue[0].progress = progUpdate.progress;
        production_queue.emit('progress', queue[0],progUpdate.progress);
        state_machine.programStarted();
    }

});
pumpcontrol_service.on('pumpControlProgramEnd', function (progName) {
  // console.log("PumpControl Program end: " + progName.orderName);
  state_machine.programEnded();
});
pumpcontrol_service.on('pumpControlError', function (error) {
    state_machine.errorProcessing();
});

state_machine.on('transition', function (data) {
  // console.log("ProductionQueue statechange " + data.toState );
  production_queue.emit('state',data.toState, queue[0]);

});

pumpcontrol_service.on('serviceState', function (state) {
    if(state == 'connected'){
        state_machine.pumpControlConnected();
    }else{
        state_machine.pumpControlDisconnected();
    }
});
production_queue.addOrderToQueue = function(order){
    if(queue.indexOf(order) != -1){
        console.log("Order with ordernumber " + order.orderNumber + " is already in queue");
        return false;
    }else {
        queue.push(order);
        sendProductionQueueUpdate();
        state_machine.orderEnqueued();
        return true;
    }
};
production_queue.removeOrderFromQueue = function (order) {
    //TODO: check that order can be safely removed
    queue.delete(order);
};


production_queue.pauseProduction = function () {
    state_machine.pauseProduction();
};

production_queue.resumeProduction = function () {
    state_machine.resumeProduction();
};

production_queue.startConfirmed = function (order) {
    if(!order){
        console.log("admin confirmed the first order start");
        state_machine.startConfirmed();
    }
    if(queue[0] == order){
        state_machine.startConfirmed();
        return true;
    }else {
        console.log("order cannot be confirmed because it is not the first element at the queue");
        return false;
    }

};

production_queue.init = function () {
    state_machine.init();
};

production_queue.getQueue = function () {
    return queue;
}

production_queue.getStrippedQueue = function () {
    var rv = [];
    for(var i = 0; i < queue.length;i++){
        rv.push(queue[i].strip());
    }
    return rv;
}

production_queue.getState = function () {
    return state_machine.compositeState();
}


module.exports = production_queue;
