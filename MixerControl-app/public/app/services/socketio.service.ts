/**
 * Created by goergch on 25.01.17.
 */
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Rx";
import * as io from "socket.io-client";


@Injectable()
export class SocketService {

  // socket: SocketIOClient.Socket;

  constructor(


  ){}

  get(namespace: string, room: string, subject: string): Observable<any> {
    let socketUrl = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port +  namespace;
    var options = {"multiplex": true, "forceNew": false};
    var socket = io.connect(socketUrl, options);
    socket.emit('room',room);
    return Observable.create((observer: any) => {
      socket.on(subject, (item: any) => observer.next(item));
      return () => {
        socket.disconnect();
      };
    });
  }
}
