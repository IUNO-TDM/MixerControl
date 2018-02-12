import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRecipeComponent } from './admin-recipe.component';

describe('AdminRecipeComponent', () => {
  let component: AdminRecipeComponent;
  let fixture: ComponentFixture<AdminRecipeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminRecipeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminRecipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
