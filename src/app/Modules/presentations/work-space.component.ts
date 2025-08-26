import { Component, OnInit } from '@angular/core';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { CommanService } from 'src/app/core/Sevices/comman.service';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
    selector: 'app-work-space',
    templateUrl: './work-space.component.html',
    styleUrls: ['./work-space.component.scss'],
    standalone: false
})
export class WorkSpaceComponent implements OnInit {
  selectedTab: any = ' ';
  closeModal: any;
  isLoadComponents: boolean;
  showCreatedWithAiModal: boolean = false;

  constructor(private _CommonService: CommanService, public presentationService: PresentationService,public workSpaceService:WorkspaceService,private route: ActivatedRoute,private router: Router) {
    this.route.queryParams.subscribe(params => {
      this.workSpaceService.presentationId = params['id'];
      if ('isTemplate' in params) {
        this.workSpaceService.isTemplate = params['isTemplate'];
      }
      if ('medium' in params && params['medium'] === 'AI') {
        this.showCreatedWithAiModal = true;
        const currentParams = { ...this.route.snapshot.queryParams };
        delete currentParams['medium']; // Remove 'medium'

        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: currentParams,
          replaceUrl: true
        });
      }
    });
    this.changePresentationMode();
  }
  //#region Lifecycle Hooks
  ngOnChanges() {
    // console.log("AppComponent: OnChanges");
  }

  ngOnInit(): void {
    this.isLoadComponents = false;
    this.selectedTab = this._CommonService.GetRightPanelHideShow();
    this.closeModal = this._CommonService.GetCloseModal();
  }

  ngDoCheck() {
    this.selectedTab = this._CommonService.GetRightPanelHideShow();
    this.closeModal = this._CommonService.GetCloseModal();
  }

  changePresentationMode(){
    let obj={
      presentationId:this.workSpaceService.presentationId,
      isTemplate:this.workSpaceService.isTemplate
    }
    this.presentationService.changePresentationMode(obj).subscribe(
      (response:any)=>{
        this.workSpaceService.storeActiveSlideDetails().then(() => {
          this.isLoadComponents = true;
        }).catch((error) => {
          console.error('Error in storeActiveSlideDetails(): ', error);
        });
      },
      (error:any)=>{
        console.log(error)
      }
    )
  }

  ngAfterContentInit() {
    // console.log("AppComponent: AfterContentInit");
  }

  ngAfterContentChecked() {
    //console.log("AppComponent:AfterContentChecked");
  }

  ngAfterViewInit() {
    //console.log("AppComponent:AfterViewInit");
  }

  ngAfterViewChecked() {
    // console.log("AppComponent:AfterViewChecked");
  }

  ngOnDestroy() {
    // console.log("AppComponent:OnDestroy");
  }
  //#endregion LifeCycle Hooks

  //#region Component Level functions
  //#region API Call
  
  //#endregion API Call

  //#region Without API Call

  //#endregion Without API Call

  //#endregion Component Level functions

  //#region Common Methods

  //#endregion Common Metods
}
