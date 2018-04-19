import {Component, OnDestroy, OnInit} from '@angular/core';
import {InternetConnectionSocketService} from '../services/internetconnection-socket.service';
import {Subscription} from 'rxjs/Subscription';

@Component({
    moduleId: module.id,
    selector: 'my-internet-connection',
    templateUrl: './internetconnection.template.html',
    styleUrls: ['./internetconnection.component.css'],
    providers: [InternetConnectionSocketService]
})


export class InternetConnectionComponent implements OnInit, OnDestroy {
    state = true;
    containerstate = true;
    internetConnectionSocketServiceConnection: Subscription;
    licenseContainerSocketServiceConnection: Subscription;

    constructor(private internetConnectionSocketService: InternetConnectionSocketService) {

    }


    ngOnInit() {
        this.internetConnectionSocketServiceConnection =
            this.internetConnectionSocketService
                .getUpdates('connectionState')
                .subscribe(state => this.state = state);

        this.licenseContainerSocketServiceConnection =
            this.internetConnectionSocketService
                .getUpdates('licenseContainerState')
                .subscribe(state => this.containerstate = state);
        this.internetConnectionSocketService.joinRoom('connectionState');
        this.internetConnectionSocketService.joinRoom('licenseContainerState');
    }

    ngOnDestroy() {
        if (this.internetConnectionSocketServiceConnection) {
            this.internetConnectionSocketServiceConnection.unsubscribe();
        }

        if (this.licenseContainerSocketServiceConnection) {
            this.licenseContainerSocketServiceConnection.unsubscribe();
        }
    }
}
