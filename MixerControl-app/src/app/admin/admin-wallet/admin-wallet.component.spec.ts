import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminWalletComponent } from './admin-wallet.component';

describe('AdminWalletComponent', () => {
  let component: AdminWalletComponent;
  let fixture: ComponentFixture<AdminWalletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminWalletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
