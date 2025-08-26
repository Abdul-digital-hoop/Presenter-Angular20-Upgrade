import { Directive, ElementRef, HostListener } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Directive({
    selector: '[appPreventClick]',
    standalone: false
})
export class PreventClickDirective {

  constructor(private el: ElementRef,private _toastr: ToastrService) { }

  ngOnInit(): void {
    this.el.nativeElement.addEventListener('click', (event: MouseEvent) => {
      this._toastr.success('The action could not be performed.', "", {
        timeOut: 3000,
      });
      event.stopPropagation();
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);
  }
}
