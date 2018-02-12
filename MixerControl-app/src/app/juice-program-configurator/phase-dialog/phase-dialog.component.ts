import {Component, Inject, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';

import {TdmPhase} from '../models/tdmprogram';

@Component({
    selector: 'app-phase-dialog',
    templateUrl: './phase-dialog.component.html',
    styleUrls: ['./phase-dialog.component.css']
})
export class PhaseDialogComponent implements OnInit {
    phase: TdmPhase;
    amount: number;
    amountFormControl = new FormControl('', [
        Validators.required,
        Validators.max(100),
        Validators.min(10),
    ]);

    constructor(public dialogRef: MatDialogRef<PhaseDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any) {
        this.phase = data.phase;
        this.amount = this.phase.amount;
    }

    ngOnInit() {
    }

    actionRemovePhase() {
        this.dialogRef.close({
            'action': 'remove',
            'phase': this.phase,
            'amount': this.amount
        });
    }

    actionSplitPhase() {
        this.dialogRef.close({
            'action': 'split',
            'phase': this.phase,
            'amount': this.amount
        });
    }

    actionChangePhase(event: Event) {
        event.preventDefault();
        this.dialogRef.close({
            'action': 'change',
            'phase': this.phase,
            'amount': this.amount
        });
    }

}
