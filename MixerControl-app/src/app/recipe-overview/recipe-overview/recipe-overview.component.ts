import {Component, OnInit} from '@angular/core';
import {RecipeDetailComponent} from '../recipe-detail/recipe-detail.component';
import {MatButtonToggleChange, MatDialog, MatDialogRef} from '@angular/material';
import {TdmCocktailComponentService} from 'tdm-common';
import {DrinkService} from '../../services/drink.service';
import {UserService} from '../../services/user.service';
import * as models from '../../models/models';
import {Router} from '@angular/router';

@Component({
    selector: 'app-recipe-overview',
    templateUrl: './recipe-overview.component.html',
    styleUrls: ['./recipe-overview.component.scss'],
    providers: [DrinkService, UserService, TdmCocktailComponentService]
})
export class RecipeOverviewComponent implements OnInit {

    error: any;
    detailDialogRef: MatDialogRef<RecipeDetailComponent> | null;
    detailDialogConfig = {
        disableClose: false,
        panelClass: 'custom-overlay-pane-class',
        hasBackdrop: true,
        backdropClass: '',
        width: '80vw',
        maxWidth: '800px',
        height: '80vh',
        position: {
            top: '',
            bottom: '',
            left: '',
            right: ''
        },
        data: {
            backgroundColor: '#CDB7A5'
        }
    };
    drinks: models.Drink[] = [];
    users: models.User[] = [];
    components: models.Component[] = [];
    drinkColors = {};
    componentSelection = {};
    filterData = {};
    testModel = 'n';
    resetEnabled = false;

    constructor(private dialog: MatDialog, private componentService: TdmCocktailComponentService,
                private router: Router,
                private drinkService: DrinkService,
                private userService: UserService) {
    }

    ngOnInit() {
        this.getDrinks();
        this.componentService.installedComponents.subscribe(components => {
            for (const comp of components) {
                this.componentSelection[comp.id] = 'n';
            }
            this.components = components;
        });


    }

    cardClick(drink: any) {
        this.detailDialogConfig.data['drink'] = drink;
        this.detailDialogConfig.data['user'] = this.users[drink.authorId];
        this.detailDialogConfig.data.backgroundColor = this.drinkColors[drink.id];
        this.detailDialogRef = this.dialog.open(RecipeDetailComponent, this.detailDialogConfig);
    }

    refreshUsers(): void {
        const loadingUser = new models.User();
        loadingUser.firstname = 'User';
        loadingUser.lastname = 'Loading';
        for (const drink of this.drinks) {
            if (!this.users[drink.authorId]) {
                this.users[drink.authorId] = loadingUser;
                this.userService.getUser(drink.authorId).subscribe(user => {
                    this.users[drink.authorId] = user;
                });
            }

        }
    }

    refreshDrinkColors(): void {
        if (!this.drinks) {
            return;
        }
        for (const drink of this.drinks) {
            if (drink && !this.drinkColors[drink.id]) {
                this.drinkColors[drink.id] = drink.backgroundColor ? drink.backgroundColor : getRandomBackgroundColor(drink.id);
            }
        }
    }

    getDrinks(): void {
        this.drinkService
            .getDrinks()
            .subscribe(drinks => {
                this.drinks = drinks;
                this.refreshUsers();
                this.refreshDrinkColors();
            }, error => this.error = error);
        return;
    }

    getBack(): void {
        this.router.navigateByUrl('/');
    }

    filterChanged(change: MatButtonToggleChange) {
        const include: string[] = new Array<string>();
        const exclude: string[] = new Array<string>();
        for (const comp in this.componentSelection) {
            if (this.componentSelection[comp] === 'i') {
                include.push(comp);
            } else if (this.componentSelection[comp] === 'e') {
                exclude.push(comp);
            }
        }
        const newFilter = {include: include, exclude: exclude};
        this.filterData = newFilter;
        this.resetEnabled = include.length > 0 || exclude.length > 0;
    }


    resetFilter() {
        for (const i in this.componentSelection) {
            if (this.componentSelection.hasOwnProperty(i)) {
                this.componentSelection[i] = 'n';
            }
        }
        this.filterChanged(null);
    }

}

function hashCode(str) {
    let hash = 0;
    if (str.length === 0) {
        return hash;
    }
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash * 32) - hash) + char;
        hash &= hash; // Convert to 32bit integer
    }
    return hash;
}

function randomInt(low, high, seed?) {
    if (seed) {
        const hash = hashCode(seed);
        return ((hash < 0 ? hash * -1 : hash) % (high + 1)) + low;
    } else {
        return Math.floor(Math.random() * (high - low) + low);
    }
}

function getRandomBackgroundColor(seed) {
    const colors = [
        '#0078ff',
        '#bd00ff',
        '#ff9a00',
        '#01ff1f',
        '#e3ff00',
        '#ffc780',
        '#f9d683',
        '#fffa86',
        '#e9ff74',
        '#d8ff69',
        '#e8f4f3',
        '#d3e7ea',
        '#c4e5f2',
        '#afe1f4',
        '#8dd0f0'
    ];

    return colors[randomInt(0, colors.length - 1, seed)];
}

