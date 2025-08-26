// angular import
import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { ToastrService } from 'ngx-toastr';
import { WorkSignalRServiceService } from 'src/app/core/Sevices/WorkSpace/work-signal-rservice.service';
import { CustomerPlanService } from 'src/app/core/Sevices/CustomerPlan/customer-plan.service';
import { CustomerLimitationsCount, CustomerPlan } from 'src/app/core/Models/customer-plan.model';
import { MypresentationsService } from '../../Home/mypresentations/Service/mypresentations.service';
declare const _IntegrationMediumOffice: boolean;
@Component({
    selector: 'app-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.scss'],
    standalone: false
})
export class NavBarComponent implements OnInit {
  @Output() public clearDynamicComponent: EventEmitter<any> = new EventEmitter<any>();
  copied: boolean = false;
  myPresent: boolean=false;
  userName: any;
  profileImageURL: any;
  folderId: string;
  isDashboard: any;
  @Output() public slideTypeName: EventEmitter<any> = new EventEmitter<any>();
  @Output() public contentChanged: EventEmitter<any> = new EventEmitter<any>();
  selectedOption: string = 'resetPresentation'; 
  slideActionPopupLeft: number;
  slideActionPopupTop: number; 
  isResetSlideAction: boolean = false;
  @ViewChild('toggleDiv', { static: false }) toggleDiv!: ElementRef;
  isShowAfterDuplicatePresentation: boolean = false;
  duplicatePresentationId: any;
  duplicateActiveSlideId: any;
  IntegrationMediumOffice: boolean = _IntegrationMediumOffice;
  customerPlan:CustomerPlan;
  customerLimitationCount:CustomerLimitationsCount;
  isLoading: boolean = false;
  @Output() public reactionUpdates: EventEmitter<any> = new EventEmitter<any>();
  constructor(public workSpaceService:WorkspaceService,private _router:Router,private clipboard: Clipboard,private route: ActivatedRoute,
    public presentationService:PresentationService, private _toastr: ToastrService, public workSpaceSignalRService:WorkSignalRServiceService,
    public _customerPlanService: CustomerPlanService, public _mypresentationsService: MypresentationsService
  ) { 
    this.customerPlan = _customerPlanService.getCustomerPlan();
    this.customerLimitationCount = _customerPlanService.getCustomerLimitationsCounts();
  }

  //#region LifeCycle Hooks
    ngOnChanges() {
      //console.log("AppComponent: OnChanges");
    }

    ngOnInit() {
      var userDetails = localStorage.getItem('userData');
      if (userDetails) {
        const userData = JSON.parse(userDetails);
        if(userData.ProfileImgUrl){
          this.profileImageURL = userData.ProfileImgUrl;
        }else{
          if (userData.ProfileSecondName) {
            this.userName = userData.ProfileFirstName.charAt(0).toLocaleUpperCase() + userData.ProfileSecondName.charAt(0).toLocaleUpperCase();
          } else {
            this.userName = userData.ProfileFirstName.charAt(0).toLocaleUpperCase();
          }
        }
      }
      this.myPresent = this.workSpaceService.getMyPresent();
      this.route.queryParamMap.subscribe(params => {
        this.folderId = params.get('folder'); 
        this.isDashboard = params.get('mp');
        this.workSpaceService.isTemplate = params.get('isTemplate') === 'true';
      });
     // console.log("AppComponent: OnInit");
    }

    ngDoCheck() {
     // console.log("AppComponent: DoCheck");
    }

    ngAfterContentInit() {
     // console.log("AppComponent: AfterContentInit");
    }

    ngAfterContentChecked() {
    // console.log("AppComponent:AfterContentChecked");
    }

    ngAfterViewInit() {
    // console.log("AppComponent:AfterViewInit");
    }

    ngAfterViewChecked() {
     // console.log("AppComponent:AfterViewChecked");
    }

    ngOnDestroy() {
     //  console.log("AppComponent:OnDestroy");
     this._mypresentationsService.preserveBreadcrumbsForNavigation();
    }
  //#endregion LifeCycle Hooks
  
  //#region Component Level functions
    //#region API Call
    //#endregion API Call

    //#region Without API Call
    // @HostListener('window:popstate', ['$event'])
    // onPopState(event: PopStateEvent) {
    //   this.backToPresentationList();
    // }
  
    backToPresentationList() {
      // const currentUrl = window.location.pathname;
      // console.log('Current URL:', currentUrl);
  
      // if (currentUrl !== '/app/home') {
      //   window.history.replaceState({}, '', '/app/home');
      //   this._router.navigateByUrl('/app/home');
      //   console.log('Changed location.pathname to /app/home');
      //   this.clearDynamicComponent.emit();
      // } else {
      //   console.log('Already on /app/home, no need to change location.pathname');
      //   this.clearDynamicComponent.emit();
      // }
      if (this.folderId) {
        this._mypresentationsService.navigateBackToPresentations(this.folderId);
        let folderName = this._mypresentationsService.breadcrumbs.find(b => b.id === this.folderId)?.name;
        if (!folderName || folderName === 'Folder') {
          folderName = this._mypresentationsService.getFolderNameById(this.folderId) || 'Folder';
        }
        
        if (this.IntegrationMediumOffice) {
          const queryParams = new URLSearchParams();
          queryParams.set('isListView', this._mypresentationsService.isListView.toString());
          queryParams.set('Id', this.folderId);
          queryParams.set('folderName', folderName);
          window.location.href = `#/app/mypresentations?${queryParams.toString()}`;
        } else {
          this._router.navigate(['/app/mypresentations'], { 
            queryParams: { 
              isListView: this._mypresentationsService.isListView, 
              Id: this.folderId,
              folderName: folderName
            } 
          });
        }
      } else if (this.isDashboard == "true") {
        this._mypresentationsService.navigateBackToPresentations();
        
        if (this.IntegrationMediumOffice) {
          window.location.href = '#/app/mypresentations?isListView=true';
        } else {
          this._router.navigate(['/app/mypresentations']);
        }
      } else if (this.workSpaceService.isTemplate) {
        const currentQueryParams = { ...this.route.snapshot.queryParams };
        delete currentQueryParams.id;
        delete currentQueryParams.isTemplate;
        
        if (this.IntegrationMediumOffice) {
          const queryParams = new URLSearchParams();
          Object.keys(currentQueryParams).forEach(key => {
            queryParams.set(key, currentQueryParams[key]);
          });
          window.location.href = `#/app/templates?${queryParams.toString()}`;
        } else {
          this._router.navigate(['/app/templates'], { 
            queryParams: currentQueryParams
          });
        }
      } else {
        this._mypresentationsService.preserveBreadcrumbsForNavigation();
        
        if (this.IntegrationMediumOffice) {
          window.location.href = '#/app/mypresentations?isListView=true';
        } else {
          this._router.navigate(['/app/home']);
        }
      }
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
    resetResultPresentation(presentationId:any){
      if (this.isLoading) return;
      this.isLoading = true;
      if(this.customerPlan?.reset_result){
        if(this.selectedOption == "resetPresentation"){
          var data = {presentationId:presentationId};
          this.presentationService.resetPresentationResult(data).subscribe(
            (response:any)=>{
              this.isResetSlideAction = false;
              this.isLoading = false;
              this.workSpaceService.currentPresentation.slides = response.slides;
              this.workSpaceService.currentPresentation.leaderBoard = response.leaderBoard;
              this.workSpaceService.currentPresentation.presentationQuestions = response.presentationQuestions;
              this.workSpaceService.currentPresentation.totalParticipantCount = response.totalParticipantCount;
              this.workSpaceService.assignNewValueOnStore(this.workSpaceService.currentPresentation).then(() => {
                  this.slideTypeName.emit(this.workSpaceService.masterSlideTypeId);
                  this.contentChanged.emit("content"); 
              });
            });
          }
          else if(this.selectedOption == "resetPresentationDuplicate"){
            if(this.customerLimitationCount.balancePresentationLimit > 0){
              const presentationId = this.workSpaceService.presentationId;
              if(this.folderId == "" ){
                this.folderId = null
              }
            const data = {presentationId:presentationId,
              folderId:this.folderId};
            this.presentationService.duplicatePresentationResetResult(data).subscribe(
              (response:any)=>{
               // this.isResetSlideAction = false;
                this.isShowAfterDuplicatePresentation = true;
                this._toastr.success("Duplicated Succesfully", "", {
                  timeOut: 5000,
                });
                this.duplicatePresentationId = response?.presentation?.presentationId;
                this.duplicateActiveSlideId = response?.presentation?.activeSlideId;
                this._customerPlanService.setCustomerPresentationLimite(response?.balancePresentationLimit);
                if(response?.balancePresentationLimit <= 0)
                {
                  this.selectedOption="resetPresentation";
                }
              //   localStorage.setItem('activeSlideId',response?.activeSlideId);
              //  this.workSpaceService.activeSlideId = response?.presentation?.activeSlideId;
              //  localStorage.setItem('slideTypeId',response?.presentation?.slideTypeId);
               this.isLoading = false;
              //   localStorage.setItem('presentationId',response?.presentationId);
              //   if(this.folderId==null){
              //     this._router.navigate(['WorkSpace', 'edit', response?.presentationId], 
              //       { replaceUrl: true });
              //   }else{
              //     this._router.navigate(['WorkSpace', 'edit', response?.presentationId], { 
              //       queryParams: { folder: this.folderId }, 
              //       replaceUrl: true 
              //     });
              //   }
               
              //   this.workSpaceService.storeActiveSlideDetails().then(() => {
              //       const slideTypeId = response.slides.find(x => x.slideId === response?.activeSlideId)?.slideTypeId;
              //       this.slideTypeName.emit(slideTypeId);
              //       this.contentChanged.emit("content"); 
              //     },
              //     (error: any) => {
              //       console.log(error);
              //       this.isResetSlideAction = false;
              //     }
              //   )
              });
            }
            
          }
      }else{
        this.isResetSlideAction = false;
        this.isLoading = false;
        this._toastr.error("You don't have access to reset the presentation", "", {
          timeOut: 3000,
        });
      }
    }
    onRadioChange(event: Event) {
      this.selectedOption = (event.target as HTMLInputElement).value;
    }
    closeResetPopup(){
       this.isResetSlideAction = false;
       this.isShowAfterDuplicatePresentation = false;
    }
    showPopOver(event){
      if(this.customerPlan?.reset_result){
        this.slideActionPopupTop = (event.clientY - 30);
        this.slideActionPopupLeft = (event.clientX + 30);
        this.isResetSlideAction = true;
      }
    }
    @HostListener('document:click', ['$event'])
    navBar(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest('.toggle-button') && !target.closest('.cstm-popover-result')) {
        this.isResetSlideAction = false;
        this.isShowAfterDuplicatePresentation = false;
      }
    }
    openDuplicateResetResult(){
    
      //localStorage.setItem('presentationId',this.duplicatePresentationId);
      //localStorage.setItem('activeSlideId',this.duplicateActiveSlideId);
      this.workSpaceService.activeSlideId = this.duplicateActiveSlideId;
      this.workSpaceService.presentationId = this.duplicatePresentationId;
      if(this.folderId==null){
    // this._router.navigate(['WorkSpace', 'edit', this.duplicatePresentationId], 
    //   { replaceUrl: true }).then(() => {
    //       window.location.reload();
    //   });

    if (this.IntegrationMediumOffice) {
      this._router.navigate(['/WorkSpace/edit'], { 
        queryParams: { id: this.duplicatePresentationId },
        replaceUrl: true 
      }).then(() => {
        window.location.reload();
      });
    } else {
      const newUrl = `/WorkSpace/edit?id=${this.duplicatePresentationId}`;
      window.location.href = newUrl;
    }
      
    }
      else{
        // this._router.navigate(['WorkSpace', 'edit', this.duplicatePresentationId], 
        //   {queryParams: { folder: this.folderId },  replaceUrl: true }).then(() => {
        //       window.location.reload();
        //   });
        if (this.IntegrationMediumOffice) {
          this._router.navigate(['/WorkSpace/edit'], { 
            queryParams: { 
              id: this.duplicatePresentationId,
              folder: this.folderId 
            },
            replaceUrl: true 
          }).then(() => {
            window.location.reload();
          });
        } else {
          const newUrl = `/WorkSpace/edit?id=${this.duplicatePresentationId}&folder=${this.folderId}`;
          window.location.href = newUrl;
        }
          
      }
    }
    //#endregion Without API Call
    
  //#endregion Component Level functions

 //#region Common Methods
 updateReactions(reactions){
  this.reactionUpdates.emit(reactions);
 }
 //#endregion Common Metods

 //#region Preview section
    openPreview(){
      this.workSpaceService.isPreviewMode = true;
      this.workSpaceSignalRService.stopConnection();
      this._router.navigateByUrl('WorkSpace/preview');
    }
    viewResult(){
      var id = this.workSpaceService.presentationId;
      //localStorage.getItem('activeSlideId');
      this._router.navigateByUrl('/presentation/' + id + '/view-results');
    }
  //#endregion Preview section
  
}
