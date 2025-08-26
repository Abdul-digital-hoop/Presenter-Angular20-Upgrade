import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommanService } from 'src/app/core/Sevices/comman.service';
import { PresenterToolbarService } from 'src/app/core/Sevices/Presentation/presenter-toolbar.service';
import { WorkSignalRServiceService } from 'src/app/core/Sevices/WorkSpace/work-signal-rservice.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { MasterSlideTypeName, RemoteTabString } from 'src/app/utility/constants';
import { Clipboard } from '@angular/cdk/clipboard';
import { tree } from 'd3';
import { RemoteCenterPanelComponent } from '../remote-center-panel/remote-center-panel.component';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { Profile } from 'src/app/core/Models/profile.model';
declare var $: any;
@Component({
    selector: 'app-remote',
    templateUrl: './remote.component.html',
    styleUrls: ['./remote.component.scss'],
    standalone: false
})
export class RemoteComponent implements OnInit {
  public RemoteTabString = RemoteTabString;
  @ViewChild('remoteCenterPanel') dynamicChartComponent!: RemoteCenterPanelComponent;
  @ViewChild('popoverContent') popoverContent: ElementRef;
  activeTab: string = this.RemoteTabString.Present;
  isMobile: boolean = false;
  isLoading: boolean = false;
  isPageLoading: boolean;
  itHasQASlides: boolean = false;
  masterSlideTypeName = MasterSlideTypeName;
  presenterTime: any;
  presentTimer: any;
  deleteQuestionId: string = "";
  newActiveQuestionId: string = "";
  isQuestinModalOpen: boolean = false;
  isRightSidebarVisible = false;
  isOpenQAWhenTabView = false;
  isPresentationResultReset = true;
  get hasAnswersToMark(): boolean {
    return this.workspaceService?.quizPlayers?.length > 0 && 
           this.workspaceService?.quizPlayers?.some(player => 
             player?.answerdOptionId != '' && player?.isVoted == true
           );
  }
  constructor(
    public presenterToolbarService: PresenterToolbarService,
    public workSpaceSignalRService: WorkSignalRServiceService,
    public workspaceService: WorkspaceService,
    public _CommanService: CommanService,
    private cdr: ChangeDetectorRef,private route : ActivatedRoute,private _presentationservice: PresentationService,) {
      this.route.queryParams.subscribe(params => {
        this.workspaceService.presentationId = params['id'];
        this.workspaceService.isTemplate = params['isTemplate'];
      });
    this.checkScreenSize();
    this.isLoading = true;
    this.isPageLoading = false;
    this.workSpaceSignalRService.netWorkValidation();
    this.workspaceService.storeActiveSlideDetails(true).finally(() => {
      this.isLoading = false;
      this.isPageLoading = true;
      this.itHasQASlides = this.workspaceService.slideListArray.some(x => x.slideTypeName == this.masterSlideTypeName.QUESTIONS_AND_ANSWER_SLIDE_TYPE);
      this.presentationTimer(this.workspaceService.presentedDateTime);
      this.cdr.detectChanges();
      this.dynamicChartComponent.dynamicComponentUpdate(this.workspaceService.currentMasterSlideTypeId,true);
    }).catch((error) => {
      console.error('Error in storeActiveSlideDetails(): ', error);
    });
    
  }
  ngOnInit(): void {
    this.changeActiveTab(this.activeTab);
    this.updateContent();
    this.customerActivity();
  }
  ngAfterViewInit() {
    this.cdr.detectChanges();
    $('[data-bs-toggle="tooltip"], [title]:not([data-bs-toggle="popover"])').tooltip('hide');
    $("body").tooltip({ selector: '[data-bs-toggle=tooltip]' });
    $(document).on('click', '[data-bs-toggle="tooltip"], [title]:not([data-bs-toggle="popover"])', function () {
      $(this).tooltip('hide');
    });
    $('[data-bs-toggle="popover"]').popover({
      html: true,
      content: () => this.popoverContent.nativeElement.innerHTML
    });
  }
  ngAfterViewChecked() {
    if(this.workspaceService.activeSlideTypeName === MasterSlideTypeName.OPEN_ENDED_SLIDE_TYPE){
      this.workspaceService.options = this.workspaceService.options?.filter(option => option?.Answer?.trim());
    }
  }
  presentationTimer(time: any) {
    if (this.presentTimer) {
      clearInterval(this.presentTimer);
    }
    this.presentTimer = setInterval(() => {
      this.calculatePresenterTime(time);
    }, 1000);
  }
  calculatePresenterTime(createdOn) {
    const currentDate = new Date();
    const createdOnDate = new Date(createdOn);
    const timeDifference = (currentDate.getTime() - createdOnDate.getTime()) / 1000; // Convert milliseconds to seconds
    const seconds = Math.floor(timeDifference % 60); // Get the remaining seconds
    const minutes = Math.floor(timeDifference / 60) % 60; // Get the remaining minutes
    const hours = Math.floor(timeDifference / 3600) % 24; // Get the remaining hours
    let presenterTime = '';
    if (hours > 0) {
      presenterTime += hours.toString().padStart(2, '0') + ':';
    }
    presenterTime += minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
    this.presenterTime = presenterTime;
  }
  presenterStartTimer(seconds: number) {
    this.presenterToolbarService.presenterStartTimer(seconds);
  }

  resetPresentationTimer(defaultTime: any = '00:00:00') {
    if (this.presentTimer) {
      clearInterval(this.presentTimer);
    }
    this.presenterTime = defaultTime;
  }

resetTimer() {
  this.resetPresentationTimer('00:00:00'); // Reset the timer to default
  this.presenterTime = '00:00:00'; // Set presenter time to default
  this.presenterToolbarService.resetPresentedTime().then(() => {
      // Ensure the presentedDateTime is valid before resetting the timer
      if (this.workspaceService.presentedDateTime) {
          this.presentationTimer(this.workspaceService.presentedDateTime);
      } else {
          console.warn('Presented date time is invalid, timer not started.');
      }
      this.closeTimerModal();
  });
}
  closeTimerModal() {
    var timerModal = $("#resetModal");
    timerModal.modal("hide");
    $('.modal-backdrop').remove();
  }
  closeQuestionDeleteModal() {
    var timerModal = $("#deleteQuestionModal");
    timerModal.modal("hide");
    $('.modal-backdrop').remove();
    this.deleteQuestionId = "";
    this.newActiveQuestionId = "";
  }
  closeModerationModal() {
    var moderationModal = $("#moderationModal");
    moderationModal.modal("hide");
    $('.modal-backdrop').remove();
  }
  closeMarkAnswersnModal() {
    var moderationModal = $("#markCorrectAnswersModal");
    moderationModal.modal("hide");
    $('.modal-backdrop').remove();
  }
  closeResetModal() {
    var moderationModal = $("#resetResultModal");
    moderationModal.modal("hide");
    $('.modal-backdrop').remove();
  }
  closeStartTimerModal() {
    var moderationModal = $("#startTimerModal");
    moderationModal.modal("hide");
    $('.modal-backdrop').remove();
  }
  
  deleteQuestion() {
    this.presenterToolbarService.deleteQuestion(this.deleteQuestionId, this.newActiveQuestionId, this.isQuestinModalOpen).finally(() => {
      this.closeQuestionDeleteModal();
    })
  }
  deleteQuestionIdSet(questionDTO: any) {
    this.deleteQuestionId = questionDTO?.questionId;
    this.newActiveQuestionId = questionDTO?.newActiveSlideId;
    this.isQuestinModalOpen = questionDTO?.isOpenQAflag
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }
  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
    if (window.innerWidth < 768 || window.innerWidth > 1024) {
      this.isOpenQAWhenTabView = false;
    }
  }
  changeActiveTab(tabName: any) {
    this.activeTab = tabName;
  }
  openQA() {
    this.isOpenQAWhenTabView = !this.isOpenQAWhenTabView;
  }
  changeResutMethod(){
    this.isPresentationResultReset = !this.isPresentationResultReset;
  }
  resetResults(){
    if (this.workspaceService.activeSlideTypeName != this.masterSlideTypeName.LEADER_BOARD_SLIDE_TYPE) {
      if(this.isPresentationResultReset){
      var data = {presentationId:this.workspaceService.presentationId};
      this.presenterToolbarService.resetPresentationResults(data).then((response:any)=>{
        this.closeResetModal();
        let presentationData = response['data'];
        this.workspaceService.storeActiveSlideDetails().then(() => {
          const slideTypeId = response.slides.find(x => x.slideId === response.activeSlideId)?.slideTypeId;
          this.workSpaceSignalRService.resetResult(this.workspaceService.presentationId);
          this.dynamicChartComponent.buttonContentUpdate();
        }).catch((error) => {
         
          console.error('Error in storeActiveSlideDetails(): ', error);
        });
      })
      }
      else if(!this.isPresentationResultReset){
          const presentationId = this.workspaceService.presentationId;
          const slideId = this.workspaceService.activeSlideId;
          const data = { presentationId: presentationId, slideId: slideId };
          this.presenterToolbarService.resetSlideResults(data).then((response: any) => {
            this.closeResetModal();
            let presentationData = response['data'];
            this.workspaceService.storeActiveSlideDetails().then(() => {
              const slideTypeId = response.slides.find(x => x.slideId === response.activeSlideId)?.slideTypeId;
              this.workSpaceSignalRService.resetResult(this.workspaceService.presentationId);
              this.dynamicChartComponent.buttonContentUpdate();
            }).catch((error) => {

              console.error('Error in storeActiveSlideDetails(): ', error);
            });
          })
      }
      else{
        return;
      }
    }
    else{
      return;
    }
  }
  ngOnDestroy(){
   this.closeModals();
  }
  closeModals(){
    this.closeTimerModal();
    this.closeMarkAnswersnModal();
    this.closeModerationModal();
    this.closeResetModal();
    this.closeQuestionDeleteModal();
    this.closeStartTimerModal();
  }
  manageResetResults(value:any){
    if(this.workspaceService.activeSlideTypeName == this.masterSlideTypeName.LEADER_BOARD_SLIDE_TYPE){
      this.closeResetModal();
      this.isPresentationResultReset = value;
    }
    else{
      this.isPresentationResultReset = value;
    }
  }
  // * =============== API Call ========
  presentAnyway() {
    if(!this.workspaceService.isTemplate){
    const url = `/WorkSpace/presentation?id=${this.workspaceService.presentationId}`;
    window.open(url, '_blank');
    }else{
      const url = `/WorkSpace/presentation?id=${this.workspaceService.presentationId}&isTemplate=true`;
      window.open(url, '_blank');
    }
  }
  moderateResponse(response: any) {
    let moderatesResponse = this.workspaceService.options.filter(x => x.Answer.toLowerCase().trim() == response.Answer.toLowerCase().trim());
    moderatesResponse.forEach(element => {
      element.ModerateAnswer = !element.ModerateAnswer;
    });
    let moderateResponseDTO = {
      presentationId: this.workspaceService.presentationId,
      slideId: this.workspaceService.activeSlideId,
      ResponseId: response?.Answer,
      ModerateValue: response.ModerateAnswer
    }
    this.presenterToolbarService.moderateResponse(moderateResponseDTO);
  }
  resetModerateResponse() {
    // this.workspaceService.options.find(x=>x.AnswerId == response.AnswerId).ModerateAnswer = !response.ModerateAnswer;
    this.workspaceService.options= this.workspaceService.options.map(item => ({
      ...item,
      ModerateAnswer: false
    }));
    let resetModerateResponseDTO = {
      presentationId: this.workspaceService.presentationId,
      slideId: this.workspaceService.activeSlideId,
    }
    this.presenterToolbarService.resetModerateResponse(resetModerateResponseDTO);
  }
  makeCorrectorWrongAnswer(player,isCorrect){
    let playersAnswers = this.workspaceService.quizPlayers.filter(x => x.answerdOptionId.toString().toLowerCase().trim() == player.answerdOptionId.toString().toLowerCase().trim());
    playersAnswers.forEach(element => {
      element.isCorrectAnswers = !isCorrect;
    });
    let presentationDTO = {
      presentationId: this.workspaceService.presentationId,
      slideId: this.workspaceService.activeSlideId,
      answer: player.answerdOptionId.toString().trim(),
      isCorrect:isCorrect
    }
    this.presenterToolbarService.makeCorrectorWrongAnswer(presentationDTO);
  }
  hideandShowAnswers(player,isHide){
    let playersAnswers = this.workspaceService.quizPlayers.filter(x => x.answerdOptionId.toString().trim() == player.answerdOptionId.toString().trim());
    playersAnswers.forEach(element => {
      element.isHide = isHide;
    });
    let presentationDTO = {
      presentationId: this.workspaceService.presentationId,
      slideId: this.workspaceService.activeSlideId,
      answer: player.answerdOptionId.toString().trim(),
      isHide:isHide
    }
    this.presenterToolbarService.hideandShowAnswers(presentationDTO);
  }
  // * ====== behaviouSubjectCalls ======
  isLastSlideOn() {
    this.workspaceService.isLastBehavioursSubject.subscribe((data: any) => {
      if (data != null) {
        this.workspaceService.isLastSlide = !this.workspaceService.isLastSlide;
      }
    });
  }
  updateContent() {
    this.workspaceService.updateContentBehavioursSubject.subscribe((data: any) => {
      
        if (data != null || data != undefined) {
          if(!data.isPreview){
          this.workspaceService.activeSlideId = data?.slideId== ""? this.workspaceService.activeSlideId:data?.slideId;
          this.workspaceService.storeActiveSlideDetails().then(
            (response: any) => {
              let presentationData = response['data'];
              this.workspaceService.presentationMode = presentationData?.activePresentationData?.presentationMode;
              // this.dynamicChartComponent.dynamicComponentUpdate(presentationData?.masterSlideTypeId);
              if(this.workspaceService.presentationMode == false){
                this.closeModals();
              }
            },
            (error: any) => {
              console.log(error);
            }
          )
        }
      }
      
    });
  }
  

  customerActivity(){
    const payload = {
      description: `The user Accessed remote control for the presentation. Presentation ID:${this.workspaceService.presentationId}`
    };
    this._presentationservice.customerActive(payload).subscribe(
      (response: any) => {})
  }
}
