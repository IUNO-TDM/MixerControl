import { Injectable } from '@angular/core';
import { Socket } from 'ng-socket-io';
import {Observable} from "rxjs/Observable";

@Injectable()
export class ProductionSocket extends Socket {

  constructor() {
    super({ url: 'http://localhost:3000/production', options: {} });
  }

}

@Injectable()
export class ProductionSocketService {

  constructor(private socket: ProductionSocket) { }

  joinRoom(room: string){
    this.socket.emit("room", room);
  }

  getUpdates(subject: string): Observable<any> {
    return this.socket
      .fromEvent<any>(subject);
  }
}
