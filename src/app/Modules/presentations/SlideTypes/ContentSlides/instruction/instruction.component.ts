import { Component, Input, OnInit } from '@angular/core';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { environment } from 'src/environments/environment';
import { Clipboard } from '@angular/cdk/clipboard';
import { CommanService } from 'src/app/core/Sevices/comman.service';

@Component({
    selector: 'app-instruction',
    templateUrl: './instruction.component.html',
    styleUrls: ['./instruction.component.scss'],
    standalone: false
})
export class InstructionComponent implements OnInit {
  environmentDetails=environment;
  isPresenterEditorScreen: boolean=false;
  copied: boolean = false;
  ContrastColor: any;

  constructor(public workSpaceService:WorkspaceService, private clipboard: Clipboard, public commonService:CommanService) { }

  ngOnInit(): void {
  this.isPresenterEditorScreen = this.workSpaceService.presentationMode;
  this.ContrastColor = this.commonService.getContrastColor(this.workSpaceService?.slideDesign?.slideBackgroundColor);
  }
  ngOnchanges(){
    debugger
    this.ContrastColor = this.commonService.getContrastColor(this.workSpaceService?.slideDesign?.slideBackgroundColor);
  }
  ngAfterContentChecked() {
    this.ContrastColor = this.commonService.getContrastColor(this.workSpaceService?.slideDesign?.slideBackgroundColor);
  }
  copyToClipboard() {
    if (this.workSpaceService.presentationURL) {
      this.clipboard.copy(this.workSpaceService.presentationURL);
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    }
  }
}
