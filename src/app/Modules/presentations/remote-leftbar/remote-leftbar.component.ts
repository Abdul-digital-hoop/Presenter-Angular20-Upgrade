import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PresenterToolbarService } from 'src/app/core/Sevices/Presentation/presenter-toolbar.service';
import { WorkSignalRServiceService } from 'src/app/core/Sevices/WorkSpace/work-signal-rservice.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { Tooltip } from 'bootstrap';
import { MasterSlideTypeName } from 'src/app/utility/constants';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { CustomerPlan } from 'src/app/core/Models/customer-plan.model';
import { CustomerPlanService } from 'src/app/core/Sevices/CustomerPlan/customer-plan.service';
import { debug } from 'util';
declare var $: any;

@Component({
    selector: 'app-remote-leftbar',
    templateUrl: './remote-leftbar.component.html',
    styleUrls: ['./remote-leftbar.component.scss'],
    standalone: false
})
export class RemoteLeftbarComponent implements OnInit {
  isSidebarHidden = false;
  @ViewChild('popoverContent') popoverContent: ElementRef;
  isCopied:boolean=false;
  @ViewChild('copyButton', { static: true }) copyButton: ElementRef;
  @Output() dynamicComponentUpdate = new EventEmitter();
  tooltip: Tooltip;
  masterSlideTypeName = MasterSlideTypeName;
  customerPlan:CustomerPlan;
  constructor(
  public workspaceService : WorkspaceService,
  public presenterToolbarService : PresenterToolbarService,
  private clipboard: Clipboard,private _router:Router,
  private workSpaceSignalRService:WorkSignalRServiceService,
  private customerPlanService:CustomerPlanService,
  private presentationService:PresentationService) { 
    
  }

  ngOnInit(): void {
    this.hideandshowResults();
    this.hideandshowResponse();
    this.updatePercentage();
    this.updateSlideVisualizationsType();
    this.updateAccessCodeManage();
    this.EnableDisableQuestions();
    this.EnableDisableComment();
    this.timerCountDown();
    this.hideShowQRCode();
    this.blankScreenUpdateOn();
    this.customerPlan = this.customerPlanService.getCustomerPlan();
  }
  ngAfterViewInit() {
//  this.copyURLToolTipConfig(); 
  }
  updateSlideShowResults(){
    this.presenterToolbarService.ShowResponse();
  }
  updateSlideShowResponse(){
    this.presenterToolbarService.RemoteLockVoting(!this.workspaceService.slideEnableVoting);
  }
  updateSlidePercentage(){
    this.workspaceService.currentActiveSlide.design.slideResponseAsPercentage = this.workspaceService.slideResponseAsPercentage;
    this.presenterToolbarService.showPercentage();
  }
  designSlideSelectVisualization(id: any) {
    if (id != '64f73242d57651272c4c75a4') {
      this.workspaceService.slideVisualizationId = id;
      const foundSlide = this.workspaceService.slideListArray.find(x => x.slideId == this.workspaceService.activeSlideId);
      if (foundSlide) {
        var valuesArray = [foundSlide];
        valuesArray.forEach(element => {
          this.activeSlide(element.slideId, element.slideTypeId);
        });
      }
      this.presenterToolbarService.designSlideSelectVisualization(id);
    }

  }
  activeSlide(slideId: any, slideTypeId: any) {
    this.workspaceService.activeSlideId = slideId;
    this.workspaceService.slideTypeId = slideTypeId;
  //  this.dynamicComponentUpdate.emit(slideTypeId);
  }
  updateAccessCode(){
    this.presenterToolbarService.RemoteUpdateAccessCode();
  }
  enableDisableQuestion(){
    this.enableQuestion();
  }
  enableQuestion(){
    let presentationDTO = {
      presentationId: this.workspaceService.presentationId,
      slideId: this.workspaceService.activeSlideId,
      isTemplate: this.workspaceService.isTemplate,
      remoteUserId: localStorage.getItem(`remote_user_id_${this.workspaceService.presentationId}`) == null ?  this.workspaceService.remoteUserId : localStorage.getItem(`remote_user_id_${this.workspaceService.presentationId}`) 
    }
    this.presentationService.RemotePresenterEnableQuestion(presentationDTO).subscribe(
      (response: any) => {
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }
  enableDisableComment(){
    this.enableComment();
  }
  enableComment(){
    let presentationDTO = {
      presentationId: this.workspaceService.presentationId,
      slideId: this.workspaceService.activeSlideId,
      isTemplate: this.workspaceService.isTemplate,
      remoteUserId: localStorage.getItem(`remote_user_id_${this.workspaceService.presentationId}`) == null ?  this.workspaceService.remoteUserId : localStorage.getItem(`remote_user_id_${this.workspaceService.presentationId}`) 
    }
    this.presentationService.RemoteSlideEnableComment(presentationDTO).subscribe(
      (response: any) => {
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }
  blankScreenUpdate() {
    if(this.workspaceService.isBlackOverlayVisible){
      if((this.workspaceService.slideContentType != this.masterSlideTypeName.QUIZ && this.workspaceService.activeSlideTypeName !=this.masterSlideTypeName.ImportDocument && this.workspaceService.activeSlideTypeName !=this.masterSlideTypeName.GoogleSlides && this.workspaceService.activeSlideTypeName !=this.masterSlideTypeName.POWER_POINT)){
        this.workspaceService.slideEnableVoting = false;
      }
      var objWhenTrue= {
        presentationId:this.workspaceService.presentationId,
        isOpenBlankScreen:this.workspaceService.isBlackOverlayVisible,
        slideId:this.workspaceService.activeSlideId,
        lookVoting:this.workspaceService.slideEnableVoting,
        isTemplate: this.workspaceService.isTemplate
      }
      this.presenterToolbarService.blankScreenUpdate(objWhenTrue);
    }
    else{
      var objWhenFalse= {
        presentationId:this.workspaceService.presentationId,
        isOpenBlankScreen:this.workspaceService.isBlackOverlayVisible,
        slideId:this.workspaceService.activeSlideId,
        lookVoting:true,
        isTemplate: this.workspaceService.isTemplate
      }
      this.presenterToolbarService.blankScreenUpdate(objWhenFalse);
    }
  }
  RemoteBlankScreenUpdate() {
    if(this.workspaceService.isBlackOverlayVisible){
      if((this.workspaceService.slideContentType != this.masterSlideTypeName.QUIZ && this.workspaceService.activeSlideTypeName !=this.masterSlideTypeName.ImportDocument && this.workspaceService.activeSlideTypeName !=this.masterSlideTypeName.GoogleSlides && this.workspaceService.activeSlideTypeName !=this.masterSlideTypeName.POWER_POINT)){
        this.workspaceService.slideEnableVoting = false;
      }
      var objWhenTrue= {
        presentationId:this.workspaceService.presentationId,
        isOpenBlankScreen:this.workspaceService.isBlackOverlayVisible,
        slideId:this.workspaceService.activeSlideId,
        lookVoting:this.workspaceService.slideEnableVoting,
        isTemplate: this.workspaceService.isTemplate,
        remoteUserId: localStorage.getItem(`remote_user_id_${this.workspaceService.presentationId}`) == null ?  this.workspaceService.remoteUserId : localStorage.getItem(`remote_user_id_${this.workspaceService.presentationId}`) 
      }
      this.presenterToolbarService.RemoteBlankScreenUpdate(objWhenTrue);
    }
    else{
      var objWhenFalse= {
        presentationId:this.workspaceService.presentationId,
        isOpenBlankScreen:this.workspaceService.isBlackOverlayVisible,
        slideId:this.workspaceService.activeSlideId,
        lookVoting:true,
        isTemplate: this.workspaceService.isTemplate,
        remoteUserId: localStorage.getItem(`remote_user_id_${this.workspaceService.presentationId}`) == null ?  this.workspaceService.remoteUserId : localStorage.getItem(`remote_user_id_${this.workspaceService.presentationId}`) 
      }
      this.presenterToolbarService.RemoteBlankScreenUpdate(objWhenFalse);
    }
  }
  copyPresentationLink(){
    if (this.workspaceService.presentationURL) {
      this.clipboard.copy(this.workspaceService.presentationURL);
      this.isCopied = true;
      setTimeout(() => {
        this.isCopied = false;
      }, 2000);
    }
  }
  isShowQRCode() {
    let obj = {
      presentationId: this.workspaceService.presentationId,
      isShowQR: this.workspaceService.isShowQRCode
    }
    this.workSpaceSignalRService.hideShowQRCode(obj);
  }
  myPresentations(){
    this._router.navigateByUrl('/app/home');
  }
  // copyURLToolTipConfig(){
  //   $('[data-bs-toggle="tooltip"], [title]:not([data-bs-toggle="popover"])').tooltip('hide');
  //   $("body").tooltip({ selector: '[data-bs-toggle=tooltip]'});
  //   $(document).on('click', '[data-bs-toggle="tooltip"], [title]:not([data-bs-toggle="popover"])',
  //    function () {
  //     $(this).tooltip('hide');
  //   });
  //   $('[data-bs-toggle="popover"]').popover({
  //     html: true,
  //     content: () => this.popoverContent.nativeElement.innerHTML
  //   });
  //   this.tooltip = new Tooltip(this.copyButton.nativeElement, {
  //     trigger: 'manual', // Disable automatic showing
  //     placement: 'top' // Optional: Control where the tooltip appears
  //   });

  //   // Show tooltip on button click
  //   this.copyButton.nativeElement.addEventListener('click', () => {
  //     this.tooltip.show();

  //     // Hide the tooltip after 2 seconds
  //     setTimeout(() => {
  //       this.tooltip.hide();
  //     }, 2000); // Hide after 2 seconds
  //   });
  // }
// * ============= Behaviour Subject ===================
  hideandshowResults(){
    this.workspaceService.hideandShowResultsBehavioursSubject.subscribe((data:any)=>{
      if(data != null){
        this.workspaceService.slideShowInResults = data?.isResults;
        this.workspaceService.currentActiveSlide.settings.showInResults = this.workspaceService.slideShowInResults;
        this.workspaceService.dynamicChartResponseLoad();
      }
    });
  }
  hideandshowResponse(){
    this.workspaceService.hideandShowResponseBehavioursSubject.subscribe((data:any)=>{
      if(data != null){
        this.workspaceService.slideEnableVoting = data?.enableDisableValues;
      }
    });
  }
  updatePercentage(){
    this.workspaceService.updatePercentageBehavioursSubject.subscribe((data:any)=>{
      if(data != null){
        this.workspaceService.slideResponseAsPercentage = data?.isPercentage;
        this.workspaceService.currentActiveSlide.design.slideResponseAsPercentage = this.workspaceService.slideResponseAsPercentage;
        this.workspaceService.dynamicChartResponseLoad();
      }
    });
  }
  updateSlideVisualizationsType(){
    this.workspaceService.updateVisualizationsTypeChangeBehavioursSubject.subscribe((data:any)=>{
      if(data != null){
        this.workspaceService.slideVisualizationId = data?.visualizationType;
        this.workspaceService.currentActiveSlide.design.slideVisualizationId = this.workspaceService.slideVisualizationId;
        this.dynamicComponentUpdate.emit(this.workspaceService.slideTypeId);
      }
    });
  } 
  updateAccessCodeManage(){
    this.workspaceService.updateAccessCodeBehavioursSubject.subscribe((data:any)=>{
      if(data != null){
        this.workspaceService.presentationSettingJoiningInstructions = data?.isAccessCode;
      }
    });
  } 
  EnableDisableQuestions(){
    this.workspaceService.enableDisableQuestionsBehavioursSubject.subscribe((data:any)=>{
      if(data != null){
        this.workspaceService.slideShowQuestions = data?.enableDisableValues;
      }
    });
  }
  EnableDisableComment(){
    this.workspaceService.enableDisableCommentsBehavioursSubject.subscribe((data:any)=>{
      if(data != null){
        this.workspaceService.slideShowComments = data?.enableDisableValues;
      }
    });
  }
  timerCountDown(){
    this.workspaceService.timerCountDownBehavioursSubject.subscribe((data:any)=>{
      if(data != null){
        this.presenterToolbarService.wrappingContdown(data?.seconds);
      }
    });
  }
  hideShowQRCode(){
    this.workspaceService.hideShowQRDownBehavioursSubject.subscribe((data:any)=>{
      if(data != null){
        this.workspaceService.isShowQRCode = data?.isShowQR
      }
    });
  }
  blankScreenUpdateOn() {
    this.workspaceService.blankScreenUpdateBehavioursSubject.subscribe((data: any) => {
      if (data != null) {
        this.workspaceService.isBlackOverlayVisible = data?.isOpenBlankScreen;
      }
    });
  }
  // * ================= API Calls ====================
  changeParticipantcount(value: any): void {
    value = parseInt(value, 10);
    if (isNaN(value) || value < 1 || value > 10) {
        this.workspaceService.responsePerParticipant = 1;
    } else {
        this.workspaceService.responsePerParticipant = value;
    }
    this.updateWordParticipant(this.workspaceService.responsePerParticipant);
  }
  updateWordParticipant(participantcount:any){ 
    let updateparticipant = {
      presentationId: this.workspaceService.presentationId,
      slideId: this.workspaceService.activeSlideId,
      responsePerParticipant: participantcount,
      isTemplate: this.workspaceService.isTemplate
     }
    this.presentationService.UpdateWordCloudParticipant(updateparticipant).subscribe(
      (response: any) => {
        // this.workspaceService.changeDataFormat(response.slideContentData);
      },
      (error: any) => {
        console.log(error?.error);
      }
    ); 
  }
  decimalPointRestrict(event: any): void {
    let value = event.target.value;
    if (value.includes('.')) {
        value = value.split('.')[0];
        this.workspaceService.responsePerParticipant = parseInt(value, 10);
        event.target.value = value;
        this.updateWordParticipant(this.workspaceService.responsePerParticipant);
    }
  }
  toggleSidebar() {
    this.isSidebarHidden = !this.isSidebarHidden;
  }
}

