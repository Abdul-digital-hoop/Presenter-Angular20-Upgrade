import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CustomerPlan } from 'src/app/core/Models/customer-plan.model';
import { CustomerPlanService } from 'src/app/core/Sevices/CustomerPlan/customer-plan.service';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { PresenterToolbarService } from 'src/app/core/Sevices/Presentation/presenter-toolbar.service';
import { WorkSignalRServiceService } from 'src/app/core/Sevices/WorkSpace/work-signal-rservice.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { MasterSlideTypeName } from 'src/app/utility/constants';
declare const _IntegrationMediumZoom: boolean;
declare const _IntegrationMediumOffice: boolean;

@Component({
    selector: 'app-presenter-toolbar',
    templateUrl: './presenter-toolbar.component.html',
    styleUrls: ['./presenter-toolbar.component.scss'],
    standalone: false
})
export class PresenterToolbarComponent implements OnInit {
  @Input('activeslideTypeName') public activeslideTypeName: string;
  @Input('ContrastColor') public ContrastColor: string;
  @Input('loadPresentationPage') public loadPresentationPage: boolean;
  @Input('isTimerPop') public isTimerPop: boolean;
  @Input('isSingleSlideMode') public isSingleSlideMode: boolean = false;
  @Input('showAnnotationToolbar') public showAnnotationToolbar: boolean = false;
   @Output() public moveSlides = new EventEmitter<any>();
  @Output() public moveNextSlides = new EventEmitter<any>();
  @Output() public movePreviewSlides = new EventEmitter<any>();
  @Output() public presentationTimer = new EventEmitter<any>();
  @Output() public enableDisableHotKey = new EventEmitter<any>();
  @Output() public clearTimeInterver = new EventEmitter<any>();
  @Output() public enableDisableQRCode = new EventEmitter<any>();
  @Output() public selectVisualization = new EventEmitter<any>();
  @Output() public toggleAnnotationToolbar = new EventEmitter<void>();
  masterSlideTypeName = MasterSlideTypeName;
  isToolTipPop: boolean;
  @Output() public slideTypeName: EventEmitter<any> = new EventEmitter<any>();
  @Output() public contentChanged: EventEmitter<any> = new EventEmitter<any>();
  isResetSlideAction: boolean = false;
  selectedOption: string;
  folderId: null;
  @Output() public updatePresentChartData = new EventEmitter<any>();
  isResetShowHover:boolean = true;
  hoverTimeout: any;
  customerPlan:CustomerPlan
  IntegrationMediumZoom:boolean = _IntegrationMediumZoom;
  IntegrationMediumOffice:boolean = _IntegrationMediumOffice;
  constructor(
    public workSpaceService: WorkspaceService,
    public presentationService: PresentationService,
    public workSpaceSignalRService: WorkSignalRServiceService,
    public presenterToolbarService: PresenterToolbarService, 
    private _toastr: ToastrService,
    public _customerPlanService: CustomerPlanService
  ) {
    this.customerPlan = _customerPlanService.getCustomerPlan();
   }
   @ViewChild('timerPopup') timerPopup!: ElementRef;

  ngOnInit(): void {
    if (this.workSpaceService.slideVotersCount === 0) {
      this.selectedOption = 'resetPresentation';
    } else {
      this.selectedOption = 'resetSlide';
    }
  }
  ngAfterContentChecked(){
    if(Object.keys(this.customerPlan || {}).length === 0){
      this.customerPlan = this._customerPlanService.getCustomerPlan(); 
    }
   }
  onHover() {
    let elements = document.getElementsByClassName('hover-target');
    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.add('hover-to-show-values');
    }
  }
  onHoverOut() {
  //    if(!this.isResetSlideAction){
  //   let elements = document.getElementsByClassName('hover-target');
  //   for (let i = 0; i < elements.length; i++) {
  //     elements[i].classList.remove('hover-to-show-values');
  //   }
  // }
  if (!this.isResetSlideAction) {
    this.hoverTimeout = setTimeout(() => {
      let elements = document.getElementsByClassName('hover-target');
      for (let i = 0; i < elements.length; i++) {
        elements[i].classList.remove('hover-to-show-values');
      }
    }, 1600); 
  }
}
  toggleShowPercentage() {
    this.workSpaceService.slideResponseAsPercentage = !this.workSpaceService.slideResponseAsPercentage;
    this.presenterToolbarService.showPercentage();
  }

  /**
   * Toggle annotation toolbar
   */
  onToggleAnnotationToolbar(): void {
    this.toggleAnnotationToolbar.emit();
  }
  previousSlide() {
    if (this.isSingleSlideMode && this.IntegrationMediumOffice) {
      return;
    }
    // let perivousSlideId = this.workSpaceService.slideListArray[this.workSpaceService.currentSlideIndex - 1]?.slideId;
    // if (perivousSlideId != null || perivousSlideId != undefined) {
    //   localStorage.setItem('activeSlideId', perivousSlideId);
    //   this.presenterToolbarService.previousSlides().then((response: any) => {
    //     let presentationData = response['data'];
    //     this.moveSlides.emit(presentationData?.masterSlideTypeId)
    //   }).catch((error) => {
    //     console.error('Error in storeActiveSlideDetails(): ', error);
    //   });
    // }
    this.movePreviewSlides.emit();
    this.clearTimeInterver.emit();
  }
  nextSlide() {
    if (this.isSingleSlideMode && this.IntegrationMediumOffice) {
      return;
    }
    this.moveNextSlides.emit();
    this.clearTimeInterver.emit();
    // if (this.workSpaceService.slideCount + 1 == this.workSpaceService.currentSlideIndex + 2) {
    //   this.workSpaceService.isLastSlide = true;
    //   this.workSpaceSignalRService.isLastSlide(this.workSpaceService.presentationId);
    // } else {
    //   let nextSlideId = this.workSpaceService.slideListArray[this.workSpaceService.currentSlideIndex + 1]?.slideId;
    //   if (nextSlideId != null || nextSlideId != undefined) {
    //     localStorage.setItem('activeSlideId', nextSlideId);
    //     this.presenterToolbarService.nextSlide().then((response: any) => {
    //       let presentationData = response['data'];
    //       this.moveSlides.emit(presentationData?.masterSlideTypeId);
    //     }).catch((error) => {
    //       console.error('Error in storeActiveSlideDetails(): ', error);
    //     });
    //   }
    // }
  }
  toggleFullScreen() {
    // Set the flag in workspace service before toggling fullscreen
    this.workSpaceService.isFullscreenToggle = true;
    
    if (!document.fullscreenElement) {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if ((elem as any).mozRequestFullScreen) {
        (elem as any).mozRequestFullScreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  }

  toggleTimerButton() {
    if (this.activeslideTypeName === this.masterSlideTypeName.ImportDocument || this.activeslideTypeName === this.masterSlideTypeName.POWER_POINT || this.activeslideTypeName === this.masterSlideTypeName.GoogleSlides || this.workSpaceService.slideContentType == this.workSpaceService.masterSlideTypeName.QUIZ || this.workSpaceService.activeSlideTypeName == this.masterSlideTypeName.INSTRUCTION_SLIDE_TYPE) {
      return;
    }
    if (this.isToolTipPop == true) {
      this.isToolTipPop = !this.isToolTipPop;
      this.isTimerPop = !this.isTimerPop;
    }
    else {
      this.isTimerPop = !this.isTimerPop;
    }
  }

  presenterStartTimer(seconds: any) {
    if(this.customerPlan?.audience_response_control){ 
      this.presentationTimer.emit(seconds);
    }
  }
  openHotKeys() {
    this.enableDisableHotKey.emit();
  }
  presenterEnableQuestion() {
    if(this.customerPlan?.qa){
      this.workSpaceService.slideShowQuestions = !this.workSpaceService.slideShowQuestions;
    this.presenterToolbarService.enableQuestion();
    let isBool:boolean;
    if(this.workSpaceService.OnlyQA == true){
      isBool = false;
    
    let presentationDTO = {
      presentationId: this.workSpaceService.presentationId,
      slideId: this.workSpaceService.activeSlideId,
      IsTrue: isBool,
      isTemplate: this.workSpaceService.isTemplate
    }
    this.presentationService.OnlyQAEnableQuestion(presentationDTO).subscribe(
      (response: any) => {
        this.workSpaceService.OnlyQA = response?.isOnlyQA;
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
    } 
  }
  else{
   return;
  }
  }

  presenterEnableComment() {
    if(this.customerPlan?.comments){
      
    this.workSpaceService.slideShowComments = !this.workSpaceService.slideShowComments;
    this.presenterToolbarService.enableComment();
  }
  else{
    return;
  }
  }
  presenterShowResponse() {
    if (this.activeslideTypeName === this.masterSlideTypeName.ImportDocument || this.activeslideTypeName === this.masterSlideTypeName.POWER_POINT || this.activeslideTypeName === this.masterSlideTypeName.GoogleSlides || this.workSpaceService.slideContentType == this.workSpaceService.masterSlideTypeName.QUIZ || this.workSpaceService.activeSlideTypeName == this.masterSlideTypeName.INSTRUCTION_SLIDE_TYPE || this.workSpaceService.activeSlideTypeName == this.masterSlideTypeName.MULTIMEDIA) {
      return;
    }
    this.workSpaceService.slideShowInResults = !this.workSpaceService.slideShowInResults;
    this.presenterToolbarService.ShowResponse();
  }


  presenterLockVoting() {
    if(this.customerPlan?.audience_response_control){
    if (this.activeslideTypeName === this.masterSlideTypeName.ImportDocument || this.activeslideTypeName === this.masterSlideTypeName.POWER_POINT || this.activeslideTypeName === this.masterSlideTypeName.GoogleSlides || this.workSpaceService.slideContentType == this.workSpaceService.masterSlideTypeName.QUIZ || this.workSpaceService.activeSlideTypeName == this.masterSlideTypeName.INSTRUCTION_SLIDE_TYPE ||this.workSpaceService.activeSlideTypeName === this.workSpaceService.masterSlideTypeName.QUESTIONS_AND_ANSWER_SLIDE_TYPE || this.workSpaceService.activeSlideTypeName == this.masterSlideTypeName.MULTIMEDIA) {
      return;
    }
    this.clearTimeInterver.emit();
    //this.clearTimerIntervel();
    this.workSpaceService.slideEnableVoting = !this.workSpaceService.slideEnableVoting;
    this.presenterToolbarService.lockVoting(this.workSpaceService.slideEnableVoting);
  }
else{
  return;
}
}
  presenterShowQRCode() {
    this.enableDisableQRCode.emit();
  }
  designSlideSelectVisualization(id: any) {
    this.selectVisualization.emit(id);
  }
  resetResultPresentation(presentationId:any){
    if(this.customerPlan?.reset_result){
      if(this.selectedOption == "resetPresentation"){
        var data = {presentationId:presentationId};
        this.presentationService.resetPresentationResult(data).subscribe(
          (response:any)=>{
            this.isResetSlideAction = false;
            this.onHoverOut();
            this.workSpaceService.storeActiveSlideDetails().then(() => {
              const slideTypeId = response.slides.find(x => x.slideId === response.activeSlideId)?.slideTypeId;
              this.contentChanged.emit("content");
              this.workSpaceSignalRService.resetResult(this.workSpaceService.presentationId);
              this.selectedOption = '';
            }).catch((error) => {
              this.isResetSlideAction = false;
              this.onHoverOut();
              console.error('Error in storeActiveSlideDetails(): ', error);
            });
          });
        }
        else if(this.selectedOption == "resetSlide"){
          const presentationId = this.workSpaceService.presentationId;
          const slideId = this.workSpaceService.activeSlideId;
          const data = {presentationId:presentationId,slideId:slideId};
            this.presentationService.resetSlideResult(data).subscribe(
              (response:any)=>{
                this.workSpaceService.storeActiveSlideDetails().then(() => {
                  const slideTypeId = response.slides.find(x => x.slideId === response.activeSlideId)?.slideTypeId;
                  this.contentChanged.emit("content");
                  this.isResetSlideAction = false;
                  this.onHoverOut();
                  this.workSpaceSignalRService.resetResult(this.workSpaceService.presentationId);
                  this.selectedOption = '';
                }).catch((error) => {
                  this.isResetSlideAction = false;
                  this.onHoverOut();
                  console.error('Error in storeActiveSlideDetails(): ', error);
                });
              });
        }
    }else{
      this.isResetSlideAction = false;
      this._toastr.error("You don't have access to reset the results.", "", {
        timeOut: 3000,
      });
    }
  }
  onRadioChange(event: Event) {
    this.selectedOption = (event.target as HTMLInputElement).value;
  }
  closeResetPopup(){
    this.isResetSlideAction = false;
    this.onHoverOut();
 }
 showPopover(){
  if(this.customerPlan?.reset_result){
    if(!this.isResetSlideAction){
      this.isResetSlideAction = true;
      this.onHoverOut();
    }else{
      this.isResetSlideAction = false;
      // this.onHoverOut();
    }
  }
 }
 @HostListener('document:click', ['$event'])
 toolBar(event: MouseEvent) {
   const target = event.target as HTMLElement;
   const isTimerPopup = target.closest('.timer-popup');
   const isToggleButton = target.closest('.toggle-button');

   if (target.closest('.toggle-button') && !target.closest('.cstm-popover-result') && !this.isResetSlideAction) {
     this.isResetSlideAction = false;
     this.onHoverOut();
   }else if(!target.closest('.toggle-button') && !target.closest('.cstm-popover-result')&& this.isResetSlideAction){
    this.isResetSlideAction = false;
    this.onHoverOut();
   }else if(!target.closest('.toggle-button') && !target.closest('.cstm-popover-result')){
    this.isResetSlideAction = false;
    //this.onHoverOut();
   }
   if (isToggleButton && !isTimerPopup && !this.timerPopup) {
    this.isTimerPop = false;
    this.onHoverOut();
  } 
  else if (!isToggleButton && !isTimerPopup && this.timerPopup) {
    this.isTimerPop = false;
   // this.onHoverOut();
  } 
  else if (!isToggleButton && !isTimerPopup) {
    this.isTimerPop = false;
    // this.onHoverOut();
  }
 }
 ngAfterViewInit(){
  this.customerPlan = this._customerPlanService.getCustomerPlan(); 
 }
}