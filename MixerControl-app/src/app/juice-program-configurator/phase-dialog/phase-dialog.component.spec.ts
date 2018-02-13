import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {PhaseDialogComponent} from './phase-dialog.component';

describe('PhaseDialogComponent', () => {
    let component: PhaseDialogComponent;
    let fixture: ComponentFixture<PhaseDialogComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PhaseDialogComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PhaseDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
