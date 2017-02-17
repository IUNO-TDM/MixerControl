var machina = require('machina');
const EventEmitter = require('events').EventEmitter;
const util = require('util');

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
                "amount":25
              },
              {
                "ingredient":"Apfelsaft",
                "amount":25
              },
              {
                "ingredient":"Johannisbeersaft",
                "amount":25
              }
            ],
          "timing":3,
          "sleep":0
        },
        {
          "components":
            [

              {
                "ingredient":"Kirschsaft",
                "amount":25
              },
              {
                "ingredient":"Bananensaft",
                "amount":25
              },
              {
                "ingredient":"Sprudel",
                "amount":25
              }
            ],
          "timing":0,
          "sleep":5000
        },
        {
          "components":
            [

              {
                "ingredient":"Cola",
                "amount":25
              },
              {
                "ingredient":"Fanta",
                "amount":25
              }
            ],
          "timing":3,
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
var state_machine = new machina.Fsm({

  namespace: "productionqueue",
  intialState: "uninitialized",

  states: {
    uninitialized: {
      _init: function () {
        this.transition("init");
      }
    },
    init: {
      _onEnter: function () {
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
      productionPause: "productionPaused"
    },
    waitingStart:{
      // _onEnter: function () {
      // },
      startConfirmed: "processingOrder",
      productionPause: "productionPaused"
    },
    processingOrder: {
      _onEnter: function () {
        var p = prog;
        p.orderName = queue[0].orderName;
        pumpcontrol_service.startProgram(p);
      },
      programEnded: "finished"
    },
    finished: {
      _onEnter: function () {
        queue.shift();
        if(queue.length == 0){
          this.transition("waitingOrder");
        }else{
          this.transition("waitingStart");
        }
      }
    },
    productionPaused: {
      productionResume: function () {
        if(queue.length == 0){
          this.transition("waitingOrder");
        }else{
          this.transition("waitingStart");
        }
      }
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
  programEnded: function () {
    this.handle("programEnded");
  },
  startConfirmed: function () {
    this.handle("startConfirmed");
  },
  init: function () {
    this.handle("_init");
  }

});

pumpcontrol_service.on('pumpControlState', function (state) {
  // console.log("New PumpControl state: " + state);
});
pumpcontrol_service.on('pumpControlProgress', function (progUpdate) {
  // console.log("PumpControl Progress: " + progUpdate.progress + "\% ("+progUpdate.orderName + ")");
  queue[0].progress = progUpdate.progress;
  production_queue.emit('progress', queue[0],progUpdate.progress);
});
pumpcontrol_service.on('pumpControlProgramEnd', function (progName) {
  // console.log("PumpControl Program end: " + progName.orderName);
  state_machine.programEnded();
});
pumpcontrol_service.on('serviceState', function (state) {
  // console.log("PumpControlService has new state: " + state);
  // if()
});

production_queue.addOrderToQueue = function(order){
  queue.push(order);
  state_machine.orderEnqueued();
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

state_machine.on('transition', function (data) {
  // console.log("ProductionQueue statechange " + data.toState );
  production_queue.emit('state',data.toState, queue[0]);

});



module.exports = production_queue;
