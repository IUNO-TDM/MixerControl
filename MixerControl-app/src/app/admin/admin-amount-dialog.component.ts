import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {ComponentService} from "../services/component.service";
import {Component as ModelComponent} from '../models/Component'

@Component({
  selector: 'amount-dialog',
  templateUrl: './admin-amount-dialog.template.html',
  providers: []

})
export class AdminAmountDialogComponent implements OnInit {
  pumpNr = 1;
  oldAmount = 0;
  components: ModelComponent[];
  selectedValue: string;
  amount: number;
  reset = true;

  constructor(public dialogRef: MatDialogRef<AdminAmountDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {

    this.pumpNr = data.pumpNr;
    this.oldAmount = data.oldAmount;
    this.amount = data.oldAmount;
  }

  ngOnInit() {

  }

  result(){
    var res = {'reset': this.reset, 'amount': this.amount};
    // console.log(res);
    return res;
  }

  Accept(){
    this.dialogRef.close(this.result());
  }

}
