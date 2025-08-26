import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
declare var $:any;
@Component({
  selector: 'app-change-themes',
  templateUrl: './change-themes.component.html',
  styleUrls: ['./change-themes.component.scss']
})
export class ChangeThemesComponent implements OnInit {
  @Output() changeThemeEvent = new EventEmitter();
  @Input() slideIndexArray :number[];
  isChangeThemes:boolean;
  constructor(private el: ElementRef,public workSpceService: WorkspaceService) { }

  ngOnInit(): void {
    document.body.appendChild(this.el.nativeElement);
  }
  ngOnDestroy() {
    this.el.nativeElement.remove();
  }
  onDismissClick(){
    this.workSpceService.isShowThemeChange = false;
    this.isChangeThemes = false;
    this.changeThemeEvent.emit(this.isChangeThemes);
  }
  onSaveChangeThemes(){
    this.workSpceService.isShowThemeChange = false;
    this.isChangeThemes = true;
    this.changeThemeEvent.emit(this.isChangeThemes);
  }

}
