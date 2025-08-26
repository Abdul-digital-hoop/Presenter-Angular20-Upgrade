import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'newLineRemove'
})
export class NewLineRemovePipe implements PipeTransform {

  transform(value: any): any {
    if (value === undefined)
      return 'undefined';
    return value.replace(/\n/g, "");
  }
}
