/**
 * Created by goergch on 14.02.17.
 */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params }   from '@angular/router';
import {OrderService} from '../services/order.service'

@Component({

  moduleId: module.id,
  selector: 'my-payment',
  templateUrl: 'payment.template.html',
  providers: [OrderService]
})

export class PaymentComponent implements OnInit{
  paymentRequest: string;
  response: string;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) { }

  ngOnInit(): void{
    this.route.params.
    switchMap((params: Params) => this.orderService.getPaymentRequest(params['id']))
      .subscribe(paymentRequest => {
        this.paymentRequest = paymentRequest;
      });

  }

  onRead(text: string){
    this.route.params.
    switchMap((params: Params) => this.orderService.sendPayment(params['id'], text))
      .subscribe(response => this.response = response);

  }

}
