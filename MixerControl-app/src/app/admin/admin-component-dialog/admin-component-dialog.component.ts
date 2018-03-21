import {Component, Inject, OnInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {ComponentService} from '../../services/component.service';
import {Component as ModelComponent} from '../../models/Component';

@Component({
  selector: 'component-dialog',
  templateUrl: './admin-component-dialog.template.html',
  providers: [ComponentService]

})
export class AdminComponentDialogComponent implements OnInit {
  pumpNr = 1;
  oldComponent: ModelComponent;
  components: ModelComponent[];
  selectedValue: string;

  constructor(public dialogRef: MatDialogRef<AdminComponentDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private componentService: ComponentService) {

    this.pumpNr = data.pumpNr;
    this.oldComponent = data.oldComponent;

  }

  ngOnInit() {

    this.componentService.getComponents(false).subscribe(c =>
      this.components = c
    );
  }

}
