import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { CommanService } from 'src/app/core/Sevices/comman.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkSignalRServiceService } from 'src/app/core/Sevices/WorkSpace/work-signal-rservice.service';
import { RemoteAccessNotificationService } from 'src/app/core/Sevices/remote-access-notification.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
@Component({
    selector: 'app-work-space',
    templateUrl: './work-space.component.html',
    styleUrls: ['./work-space.component.scss'],
    standalone: false
})
export class WorkSpaceComponent implements OnInit, OnDestroy {
  selectedTab: any = ' ';
  closeModal: any;
  isLoadComponents: boolean;
  showCreatedWithAiModal: boolean = false;
  showRemoteAccessNotification: boolean = false;
  private remoteAccessSubscription: Subscription = new Subscription();

  constructor(
    private _CommonService: CommanService, 
    public presentationService: PresentationService,
    public workSpaceService:WorkspaceService,
    private route: ActivatedRoute,
    private router: Router,
    private workSpaceSignalRService: WorkSignalRServiceService,
    private remoteAccessNotificationService: RemoteAccessNotificationService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {
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
    
    this.workSpaceSignalRService.netWorkValidation();
    this.workSpaceSignalRService.callSignalR();
    
    this.setupRemoteAccessListeners();
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
    this.remoteAccessSubscription.unsubscribe();
    
    if (this.workSpaceSignalRService) {
      this.workSpaceSignalRService.stopConnection();
    }
  }

  private setupRemoteAccessListeners(): void {
    this.showRemoteAccessNotification = this.remoteAccessNotificationService.shouldShowNotificationForComponent();
    this.cdr.detectChanges();
    
    this.remoteAccessSubscription.add(
      this.remoteAccessNotificationService.newRequest$.subscribe(newRequest => {
        if (newRequest) {
          this.showRemoteAccessNotification = true;
          this.cdr.detectChanges();
        }
      })
    );
    
    this.remoteAccessSubscription.add(
      this.remoteAccessNotificationService.requests$.subscribe(requests => {
        if (requests.length === 0 && this.showRemoteAccessNotification) {
          this.showRemoteAccessNotification = false;
          this.cdr.detectChanges();
        }
      })
    );
  }

  onRemoteAccessNotificationVisibilityChange(isVisible: boolean): void {
    this.showRemoteAccessNotification = isVisible;
  }

  onRemoteAccessRequestApproved(request: any): void {
    this.toastr.success(`${request.remoteUserName} has been granted remote access`, 'Access Approved');
  }

  onRemoteAccessRequestRejected(request: any): void {
    this.toastr.info(`${request.remoteUserName} has been denied remote access`, 'Access Denied');
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
