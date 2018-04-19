import {Component, OnInit} from '@angular/core';
import {AdminService} from '../../services/admin.service';
import {Balance} from '../../models/Balance';

@Component({
    selector: 'app-admin-wallet',
    templateUrl: './admin-wallet.component.html',
    styleUrls: ['./admin-wallet.component.css'],
    providers: [AdminService]
})
export class AdminWalletComponent implements OnInit {

    balance: Balance;

    constructor(private adminService: AdminService) {
    }

    ngOnInit() {
        this.adminService.getWalletBalance().subscribe(balance => this.balance = balance);
    }

}
