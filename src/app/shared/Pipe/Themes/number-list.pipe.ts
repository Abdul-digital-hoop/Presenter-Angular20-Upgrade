import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'numberList',
    standalone: false
})
export class NumberListPipe implements PipeTransform {

  transform(numbers: number[]): string {
    if (!numbers || numbers.length === 0) {
      return '';
    }

    if (numbers.length === 1) {
      return numbers[0].toString();
    }

    const lastIndex = numbers.length - 1;
    const commaSeparatedNumbers = numbers.slice(0, lastIndex).join(', ');
    return `${commaSeparatedNumbers} and ${numbers[lastIndex]}`;
  }

}
