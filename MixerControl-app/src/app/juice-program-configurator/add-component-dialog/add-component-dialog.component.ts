import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatSelect } from '@angular/material';
import { TdmComponent } from '../models/tdmcomponent';

@Component({
  selector: 'app-add-component-dialog',
  templateUrl: './add-component-dialog.component.html',
  styleUrls: ['./add-component-dialog.component.css']
})

export class AddComponentDialogComponent implements OnInit {
  components: TdmComponent[] = [];
  selectedComponent: TdmComponent = undefined;

  constructor(
    public dialogRef: MatDialogRef<AddComponentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.components = data.components;
    }

  // onNoClick(): void {
    // this.dialogRef.close();
  // }

  ngOnInit() {
  }

  confirmSelection() {
    this.dialogRef.close(this.selectedComponent);
  }

  componentSelected(component: TdmComponent) {
    this.selectedComponent = component;
    this.dialogRef.close(this.selectedComponent);
  }

}

