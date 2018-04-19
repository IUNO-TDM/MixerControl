import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {OrderSnackBarComponent} from './order-snack-bar.component';

describe('OrderSnackBarComponent', () => {
    let component: OrderSnackBarComponent;
    let fixture: ComponentFixture<OrderSnackBarComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [OrderSnackBarComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OrderSnackBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
