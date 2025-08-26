import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appDynamicSlideType]'
})
export class DynamicSlideTypeDirective {

  constructor(public viewContainerRef:ViewContainerRef) { }

}
