import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
  name: 'drinkFilter'
})

export class DrinkFilterPipe implements PipeTransform{
  transform(items: any, filter: any): any{
    return items;
  }
}
