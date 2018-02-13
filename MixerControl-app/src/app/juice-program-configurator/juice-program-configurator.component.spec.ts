import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {JuiceProgramConfiguratorComponent} from './juice-program-configurator.component';

describe('JuiceProgramConfiguratorComponent', () => {
    let component: JuiceProgramConfiguratorComponent;
    let fixture: ComponentFixture<JuiceProgramConfiguratorComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [JuiceProgramConfiguratorComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(JuiceProgramConfiguratorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
