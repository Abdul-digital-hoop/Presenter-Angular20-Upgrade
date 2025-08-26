import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';

@Component({
  selector: 'app-theme-name-component',
  templateUrl: './theme-name-component.component.html',
  styleUrls: ['./theme-name-component.component.scss']
})
export class ThemeNameComponentComponent implements OnInit {
  @Output() changeThemeNameEvent = new EventEmitter();
  myForm: FormGroup;
  isLoadingButton:boolean=false;
  isChangeThemesName: boolean;
  constructor(private el: ElementRef,private fb: FormBuilder,public workSpceService: WorkspaceService) { }

  ngOnInit(): void {
    document.body.appendChild(this.el.nativeElement);
    this.myForm = this.fb.group({
      themeName: ['', [Validators.required, Validators.maxLength(100),
        this.noWhitespaceValidator
      ]]
    });
  }
  noWhitespaceValidator(control: any) {
    const value = control.value || '';
    return value.trim().length > 0 ? null : { whitespace: true };
  }
  ngOnDestroy() {
    this.el.nativeElement.remove();
    this.isLoadingButton=false;
  }
  onSaveChangeThemes(){
    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      return;
    }
    this.isChangeThemesName = true;
    this.isLoadingButton = true;
    this.changeThemeNameEvent.emit({isChangeThemesName: this.isChangeThemesName, themeName: this.myForm.get('themeName').value});
  }
  cancelThemeName(){
    this.myForm.reset();
    this.workSpceService.isShowThemeNameChange = false;
    this.isChangeThemesName = false;
    this.changeThemeNameEvent.emit({isChangeThemesName: this.isChangeThemesName, themeName: this.myForm.get('themeName').value});
  }
}
