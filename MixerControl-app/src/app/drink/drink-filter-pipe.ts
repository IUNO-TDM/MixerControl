import {Pipe, PipeTransform} from '@angular/core';
import {Drink} from '../models/Drink';
import async from 'async';

@Pipe({
  name: 'drinkFilter'
})

export class DrinkFilterPipe implements PipeTransform {
  transform(items: any, filter: any): any {
    console.log(filter);
    if (!items || !filter || !(items as Drink[]) || filter.length === 0) {
      return items;
    }
    const drinks = items as Drink[];
    const filteredDrinks = drinks.filter(drink => {
      const item = filter.find(item => {
          let found = drink.components.find(component => {
            let matches = item === component.id;
            console.log('   ' + item + ':' + component.id + '=' + matches);
            return matches;
          });
          console.log(' ' + items + '=' + found);
          return found === undefined;
        }
      );
      console.log( drink.title + '=' + item);
      return item === undefined;
    });

    return filteredDrinks;
  }
}
