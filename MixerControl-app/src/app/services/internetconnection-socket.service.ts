import { Injectable } from '@angular/core';
import { Socket } from 'ng-socket-io';
import {Observable} from "rxjs/Observable";

@Injectable()
export class InternetConnectionSocket extends Socket {

  constructor() {
    super({ url: window.location.protocol+'//'+window.location.hostname+':'+ window.location.port +'/connectionState', options: {} });
  }

}

@Injectable()
export class InternetConnectionSocketService {

  constructor(private socket: InternetConnectionSocket) { }

  joinRoom(room: string){
    this.socket.emit("room", room);
  }

  getUpdates(subject: string): Observable<any> {
    return this.socket
      .fromEvent<any>(subject);
  }
}
