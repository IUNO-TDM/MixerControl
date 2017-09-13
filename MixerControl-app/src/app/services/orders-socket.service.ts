import { Injectable } from '@angular/core';
import { Socket } from 'ng-socket-io';
import {Observable} from "rxjs/Observable";

@Injectable()
export class OrdersSocket extends Socket {

  constructor() {
    super({ url: 'http://localhost:3000/orders', options: {} });
  }

}

@Injectable()
export class OrdersSocketService {

  constructor(private socket: OrdersSocket) { }

  joinRoom(room: string){
    this.socket.emit("room", room);
  }

  getUpdates(subject: string): Observable<any> {
    return this.socket
      .fromEvent<any>(subject);
  }
}
