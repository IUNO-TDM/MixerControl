import {Injectable} from '@angular/core';
import {Socket} from 'ng-socket-io';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class OrdersSocket extends Socket {

    constructor() {
        super({
            url: window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/orders',
            options: {}
        });
    }

}

@Injectable()
export class OrdersSocketService {

    constructor(private socket: OrdersSocket) {
    }

    joinRoom(room: string) {
        this.socket.emit('room', room);
    }

    getUpdates(subject: string): Observable<any> {
        return this.socket
            .fromEvent<any>(subject);
    }
}
