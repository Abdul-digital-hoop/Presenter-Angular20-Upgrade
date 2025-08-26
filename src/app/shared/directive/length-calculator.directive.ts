import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appLengthCalculator]'
})
export class LengthCalculatorDirective {

  constructor(private readonly elementRef: ElementRef) {

  }
  @HostListener('input', ['$event']) onInput(event: Event): void {
    this.calculateLength(event);
  }
  @HostListener('paste', ['$event']) blockPaste(event: KeyboardEvent) {
    this.calculateLength(event);
  }
  calculateLength(event: any) {
    const inputValue = (event.target as HTMLInputElement).value;
    var newLinesandSpace = inputValue.match(/\s/g);
    var addition = 0;
    if (newLinesandSpace != null) {
      addition = newLinesandSpace.length;
    }
    (event.target as HTMLInputElement).value.length - addition;
  }
}
