var machina = require('machina');
const EventEmitter = require('events').EventEmitter;
const util = require('util');

var logger = require('../global/logger');

var ProductionQueue = function () {
};
const production_queue = new ProductionQueue();
util.inherits(ProductionQueue, EventEmitter);
var queue = [];
var pumpcontrol_service = require('../services/pumpcontrol_service');
pumpcontrol_service.on('gpio', (data) => {
    if (data.name == 'start_button') {
      production_queue.startConfirmed();
    }

  }
);

var sendProductionQueueUpdate = function () {
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
    waitingPump: {
      pumpControlConnected: function () {
        if (pumpcontrol_service.getMode() == 'service') {
          this.transition("pumpControlServiceMode");
        }
        if (queue.length == 0) {
          this.transition("waitingOrder");
        } else {
          this.transition("waitingStart");
        }
      }
    },
    waitingOrder: {
      _onEnter: function () {
        if (queue.length > 0) {
          this.transition("waitingStart");
        }
      },
      orderEnqueued: "waitingStart",
      productionPause: "productionPaused",
      pumpControlDisconnected: "waitingPump",
      pumpControlService: "pumpControlServiceMode"
    },
    waitingStart: {
      _onEnter: function () {
        if(pumpcontrol_service.hasStartButtonIllumination()){
          pumpcontrol_service.setStartButtonIllumination(true);
        }
      },
      _onExit: function () {
        if(pumpcontrol_service.hasStartButtonIllumination()){
          pumpcontrol_service.setStartButtonIllumination(false);
        }
      },
      startConfirmed: "startProcessing",
      productionPause: "productionPaused",
      pumpControlDisconnected: "waitingPump",
      pumpControlService: "pumpControlServiceMode"
    },
    startProcessing: {
      _onEnter: function () {
        if (queue[0]) {
          try {
            pumpcontrol_service.startProgram(this, queue[0].recipe);
          }
          catch (err) {
            logger.crit(err);
            this.transition("errorProcessing");
          }
        } else {
          this.transition("errorProcessing");
        }
      },
      startedProcessing: "processingOrder",
      errorProcessing: "errorProcessing",
      pumpControlDisconnected: "waitingPump",
      pumpControlService: "pumpControlServiceMode"

    },
    processingOrder: {

      programEnded: "finished",
      pumpControlDisconnected: "waitingPump",
      pumpControlService: "pumpControlServiceMode"
    },
    finished: {
      _onEnter: function () {
        order = queue.shift();
        sendProductionQueueUpdate();
        console.log("ProductionQueueFinished: Removed first order: " + order.orderNumber);
        if (queue.length == 0) {
          this.transition("waitingOrder");
        } else {
          this.transition("waitingStart");
        }
      }
    },
    errorProcessing: {
      _onEnter: function () {
        var order = queue.shift();
        sendProductionQueueUpdate();
        console.log("ProductionQueueError: Removed first order: " + order.orderNumber);
        if (queue.length == 0) {
          this.transition("waitingOrder");
        } else {
          this.transition("waitingStart");
        }
      },
      pumpControlDisconnected: "waitingPump",
      pumpControlService: "pumpControlServiceMode"
    },
    productionPaused: {
      _onEnter: function () {

      },
      productionResume: function () {
        if (queue.length == 0) {
          this.transition("waitingOrder");
        } else {
          this.transition("waitingStart");
        }
      },
      pumpControlDisconnected: "waitingPump",
      pumpControlService: "pumpControlServiceMode"
    },
    pumpControlServiceMode: {
      pumpControlIdle: function () {
        if (queue.length == 0) {
          this.transition("waitingOrder");
        } else {
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
  programStarted: function () {
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
  pumpControlConnected: function () {
    this.handle("pumpControlConnected");
  },
  pumpControlDisconnected: function () {
    this.handle("pumpControlDisconnected");
  },
  errorProcessing: function () {
    this.handle("errorProcessing");
  },
  pumpControlService: function () {
    this.handle("pumpControlService");
  },
  pumpControlIdle: function () {
    this.handle("pumpControlIdle");
  }

});

pumpcontrol_service.on('pumpControlState', function (state) {
  // console.log("New PumpControl state: " + state);
});
pumpcontrol_service.on('pumpControlProgress', function (progUpdate) {
  // console.log("PumpControl Progress: " + progUpdate.progress + "\% ("+progUpdate.orderName + ")");
  if (queue[0]) {
    queue[0].progress = progUpdate.progress;
    production_queue.emit('progress', queue[0], progUpdate.progress);
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
pumpcontrol_service.on('amountWarning', function (amountWarning) {
  logger.debug("Amount Warning: " + JSON.stringify(amountWarning));
});

state_machine.on('transition', function (data) {
  // console.log("ProductionQueue statechange " + data.toState );
  production_queue.emit('state', data.toState, queue[0]);

});

pumpcontrol_service.on('serviceState', function (state) {
  if (state == 'connected') {
    state_machine.pumpControlConnected();
  } else {
    state_machine.pumpControlDisconnected();
  }
});
production_queue.addOrderToQueue = function (order) {
  if (queue.indexOf(order) != -1) {
    console.log("Order with ordernumber " + order.orderNumber + " is already in queue");
    return false;
  } else {
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
  if (!order) {
    console.log("admin confirmed the first order start");
    state_machine.startConfirmed();
  }
  if (queue[0] == order) {
    state_machine.startConfirmed();
    return true;
  } else {
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
  for (var i = 0; i < queue.length; i++) {
    var o = queue[i].strip();
    o.queuePlace = i;
    rv.push(o);
  }
  return rv;
}

production_queue.getState = function () {
  return state_machine.compositeState();
}


pumpcontrol_service.on('pumpControlMode', function (mode) {
  if (mode == 'idle') {
    state_machine.pumpControlIdle();
  } else if (mode == 'service') {
    state_machine.pumpControlService();
  }
});

module.exports = production_queue;
