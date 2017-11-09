import {Component, OnInit, OnDestroy} from "@angular/core";
import {InternetConnectionSocketService} from "../services/internetconnection-socket.service";
import {Subscription} from "rxjs/Subscription";

@Component({
  moduleId: module.id,
  selector: 'my-internet-connection',
  templateUrl: './internetconnection.template.html',
  styleUrls: ['./internetconnection.component.css'],
  providers: [InternetConnectionSocketService]
})



export class InternetConnectionComponent implements OnInit, OnDestroy {
  state = true;
  internetConnectionSocketServiceConnection: Subscription;
  constructor(private internetConnectionSocketService: InternetConnectionSocketService){

  }


  ngOnInit(){
      this.internetConnectionSocketServiceConnection =
        this.internetConnectionSocketService
          .getUpdates('connectionState')
          .subscribe(state => this.state = state);
      this.internetConnectionSocketService.joinRoom('connectionState');
  }

  ngOnDestroy(){
      if(this.internetConnectionSocketServiceConnection){
        this.internetConnectionSocketServiceConnection.unsubscribe();
      }
  }
}
