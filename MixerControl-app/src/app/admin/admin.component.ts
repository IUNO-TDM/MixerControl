/**
 * Created by goergch on 28.02.17.
 */
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    moduleId: module.id,
    selector: 'my-admin',
    templateUrl: 'admin.component.html',
    styleUrls: ['./admin.component.css']
})

export class AdminComponent {
    private fragment: string
    index = 1

    constructor(private route: ActivatedRoute) { }
    
    ngOnInit() {
        this.route.fragment.subscribe(fragment => {
            this.fragment = fragment;
            this.index = +fragment
        });
    }
}
