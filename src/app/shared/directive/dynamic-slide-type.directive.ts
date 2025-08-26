import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[appDynamicSlideType]',
    standalone: false
})
export class DynamicSlideTypeDirective {

  constructor(public viewContainerRef:ViewContainerRef) { }

}
