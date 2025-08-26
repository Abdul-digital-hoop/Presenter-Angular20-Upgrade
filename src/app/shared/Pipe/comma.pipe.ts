import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'comma',
    standalone: false
})
export class CommaPipe implements PipeTransform {

  transform(value:any): unknown {
    return value? value.join(",") : value;
  }

}
