import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';

@Component({
    selector: 'app-explore',
    templateUrl: './explore.component.html',
    styleUrls: ['./explore.component.scss'],
    standalone: false
})
export class ExploreComponent implements OnInit {
  isPowerPoinPopupVisible: boolean = false;
  isZoomPopupVisible: boolean = false;
  isGsPopupVisible: boolean = false;
  constructor(private elementRef: ElementRef, private _presentationservice: PresentationService, private workspaceService: WorkspaceService) { }

  ngOnInit(): void {
  }
  openBox(boxType: string) {
  }
  pptopenPopup() {
    this.isPowerPoinPopupVisible = true;
  }
  zoomopenPopup(){
    this.isZoomPopupVisible =true;
  }
  googleslidesopenPopup(){
    this.isGsPopupVisible = true;
  }
  closePopup() {
    this.isPowerPoinPopupVisible = false;
    this.isZoomPopupVisible = false;
    this.isGsPopupVisible = false;
  }
  activity(integration: string){
    if(integration == 'zoom'){
      var payload = {
        description: `The user open the zoom application`
      };
    }
    else if(integration == 'ppt'){
      this.isPowerPoinPopupVisible = false;
      var payload = {
        description: `The user open the powerpoint application`
      };
    };
    this._presentationservice.customerActive(payload).subscribe(
      (response: any) => {})
  
  }
}
