import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MdDialogRef, MD_DIALOG_DATA} from '@angular/material';
import {ComponentService} from "../services/component.service";
import {Component as ModelComponent} from '../models/Component'

@Component({
  selector: 'component-dialog',
  templateUrl: './admin-component-dialog.template.html',
  providers: [ComponentService]

})
export class AdminComponentDialogComponent implements OnInit{
 pumpNr = 1;
 oldComponent = "sdfghjkm";
 components: ModelComponent[];
 selectedValue: string;

  constructor(
    public dialogRef: MdDialogRef<AdminComponentDialogComponent>,
    @Inject(MD_DIALOG_DATA) public data: any,
    private componentService: ComponentService,) {

    this.pumpNr = data.pumpNr;
    this.oldComponent = data.oldComponent;
    // this.paymentRequest = data.message;

  }

  ngOnInit(){

    this.componentService.getComponents().then(c =>
      this.components = c
    );
  }

}
