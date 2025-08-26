import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'spaceBetweenNumbers',
    standalone: false
})
export class SpaceBetweenNumbersPipe implements PipeTransform {

  transform(value: any): any {
    return value? value.replace(/(.{4})/g, '$1 ') : value;
  }

}
