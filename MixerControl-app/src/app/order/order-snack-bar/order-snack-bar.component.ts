/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component, Inject, ViewEncapsulation} from '@angular/core';
import {MAT_SNACK_BAR_DATA, matSnackBarAnimations, MatSnackBarRef} from "@angular/material";


/**
 * A component used to open as the default snack bar, matching material spec.
 * This should only be used internally by the snack bar service.
 */
@Component({
    moduleId: module.id,
    selector: 'simple-snack-bar',
    templateUrl: 'order-snack-bar.component.html',
    styleUrls: ['order-snack-bar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [matSnackBarAnimations.contentFade],
    host: {
        '[@contentFade]': '',
        'class': 'mat-simple-snackbar',
    }
})
export class OrderSnackBarComponent {
    /** Data that was injected into the snack bar. */
    data: { message: string, action: string };

    constructor(public snackBarRef: MatSnackBarRef<OrderSnackBarComponent>,
                @Inject(MAT_SNACK_BAR_DATA) data: any) {
        this.data = data;
    }

    /** If the action button should be shown. */
    get hasAction(): boolean {
        return !!this.data.action;
    }

    /** Performs the action on the snack bar. */
    action(): void {
        this.snackBarRef.dismissWithAction();
    }
}
