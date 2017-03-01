"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
/**
 * Created by goergch on 25.01.17.
 */
var core_1 = require("@angular/core");
var Rx_1 = require("rxjs/Rx");
var io = require("socket.io-client");
var SocketService = (function () {
    // socket: SocketIOClient.Socket;
    function SocketService() {
    }
    SocketService.prototype.get = function (namespace, room, subject) {
        var socketUrl = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + namespace;
        var options = { "multiplex": true, "forceNew": false };
        var socket = io.connect(socketUrl, options);
        socket.emit('room', room);
        return Rx_1.Observable.create(function (observer) {
            socket.on(subject, function (item) { return observer.next(item); });
            return function () {
                socket.disconnect();
            };
        });
    };
    SocketService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], SocketService);
    return SocketService;
}());
exports.SocketService = SocketService;
//# sourceMappingURL=socketio.service.js.map