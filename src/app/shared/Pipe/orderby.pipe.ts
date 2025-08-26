import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderby'
})
export class OrderbyPipe implements PipeTransform {

  transform(array: any[]): any{
    return array?.sort((a, b) => a?.language.localeCompare(b?.language));
  }

}
