import {Pipe, PipeTransform} from '@angular/core';
import {Drink} from '../../models/Drink';

@Pipe({
    name: 'recipeFilter'
})

export class RecipeFilterPipe implements PipeTransform {
    transform(items: any, filter: any): any {
        if (!items || !filter || !(items as Drink[]) || filter.length === 0) {
            return items;
        }
        const drinks = items as Drink[];
        const exclude = filter['exclude'];
        const include = filter['include'];

        const filteredDrinks = new Array<Drink>();

        for (const drink of drinks) {
            var match = false;
            if (!include || include.length === 0) {
                match = true;
            } else {
                match = true;
                for (const inc of include) {
                    var found = false;
                    for (const comp of drink.components) {
                        if (comp.id === inc) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        match = false;
                    }
                }
            }
            if (match && exclude && exclude.length > 0) {
                for (const exc of exclude) {
                    for (const comp of drink.components) {
                        if (comp.id === exc) {
                            match = false;
                        }
                    }
                }
            }
            if (match) {
                filteredDrinks.push(drink);
            }
        }


        /**
         * Show special offer
         */

        if (filteredDrinks.length <= 0 && exclude && exclude.length >= 8) {
            const special = drinks.find(function (drink) {
                return drink.id == 'c9fcefb2-3869-44b0-9f10-e466b3bc1919';
            });

            if (special) {
                filteredDrinks.push();
            }
        }

        return filteredDrinks;
    }
}
