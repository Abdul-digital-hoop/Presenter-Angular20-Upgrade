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
import { environment } from 'src/environments/environment';


declare var $: any;
/**
 * Remote Component - Handles remote access requests and redirects
 * 
 * Flow:
 * 1. User enters name and requests access
 * 2. If access is already granted, redirects immediately to remote page
 * 3. If access is pending, waits for presenter approval
 * 4. After approval, redirects to remote page with access token
 */
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
     showAccessRequest: boolean = false;
   hasRemoteAccess: boolean = false;
   guestToken: string = '';
   remoteUserName: string = '';
   requestStatus: string = '';
   errorMessage: string = '';
   isRedirecting: boolean = false;
  
  // Add environment property for template access
  public environment = environment;
  
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
    
    // Don't call workspace services here for remote users - wait for authentication
    // this.workspaceService.storeActiveSlideDetails(true).finally(() => {
    //   this.isLoading = false;
    //   this.isPageLoading = true;
    //   this.itHasQASlides = this.workspaceService.slideListArray.some(x => x.slideTypeName == this.masterSlideTypeName.QUESTIONS_AND_ANSWER_SLIDE_TYPE);
    //   this.presentationTimer(this.workspaceService.presentedDateTime);
    //   this.cdr.detectChanges();
    //   this.dynamicChartComponent.dynamicComponentUpdate(this.workspaceService.currentMasterSlideTypeId,true);
    // }).catch((error) => {
    //   console.error('Error in storeActiveSlideDetails(): ', error);
    // });
    
  }
  ngOnInit(): void {
    console.log('Remote component initialized');
    
    // Prevent multiple initializations
    if (this.isRedirecting) {
      console.log('Component already processing redirect, skipping initialization');
      return;
    }
    
    // Check for authentication token from auth module
    this.checkAuthToken();
    
    // Setup listeners immediately
    this.setupRemoteAccessListeners();
    
    // Handle page refresh scenarios
    this.handlePageRefresh();
  }

  private handlePageRefresh(): void {
    // Prevent multiple calls
    if (this.isRedirecting) {
      console.log('Already processing redirect, skipping page refresh handling');
      return;
    }
    
    // Check if this is a page refresh by looking for stored access
    if (this.workspaceService.presentationId) {
      const storedRequest = localStorage.getItem(`remote_request_${this.workspaceService.presentationId}`);
      const storedToken = localStorage.getItem(`remote_access_${this.workspaceService.presentationId}`);
      
      if (storedRequest || storedToken) {
        console.log('Page refresh detected with stored access, attempting to restore access');
        // The checkAuthToken method will handle restoring access
      }
    }
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
    
    // Initialize tooltips and popovers regardless of access status
    // Dynamic component will be initialized after authentication in validateAuthToken
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
  this.resetPresentedTime().then(() => {
      // Ensure the presentedDateTime is valid before resetting the timer
      if (this.workspaceService.presentedDateTime) {
          this.presentationTimer(this.workspaceService.presentedDateTime);
      } else {
          console.warn('Presented date time is invalid, timer not started.');
      }
      this.closeTimerModal();
  });
}
resetPresentedTime(){
  return new Promise((resolve, reject) => {
    var obj = {
      presentationId: this.workspaceService.presentationId,
      slideId: this.workspaceService.activeSlideId,
      isTemplate: this.workspaceService.isTemplate,
      remoteUserId: localStorage.getItem(`remote_user_id_${this.workspaceService.presentationId}`) == null ?  this.workspaceService.remoteUserId : localStorage.getItem(`remote_user_id_${this.workspaceService.presentationId}`) 
    };
    this._presentationservice.RemoteResetPresentTime(obj).subscribe(
      (response: any) => {
       this.workspaceService.presentedDateTime = response.presentedDateTime;
      // this.calculatePresenterTime(this.presentedDateTime);
      resolve(response);
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
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
      this.resetPresentationResults(data).then((response:any)=>{
        this.closeResetModal();
        let presentationData = response['data'];
        this.workspaceService.storeActiveSlideDetailsRemote().then(() => {
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
          const data = { presentationId: presentationId, slideId: slideId, remoteUserId: localStorage.getItem(`remote_user_id_${this.workspaceService.presentationId}`) == null ?  this.workspaceService.remoteUserId : localStorage.getItem(`remote_user_id_${this.workspaceService.presentationId}`) };
          this.presenterToolbarService.resetSlideResults(data).then((response: any) => {
            this.closeResetModal();
            let presentationData = response['data'];
            this.workspaceService.storeActiveSlideDetailsRemote().then(() => {
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
   this.isRedirecting = false;
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

  setupRemoteAccessListeners(): void {
   
  }

  public checkAuthToken(): void {
    // Prevent multiple calls
    if (this.isRedirecting) {
      console.log('Already processing redirect, skipping checkAuthToken');
      return;
    }
    
    // Get presentation ID from route params
    this.route.queryParams.subscribe(params => {
      const presentationId = params['id'];
      const token = params['token'];
      const remoteUserId = params['remoteUserId'];
      
      console.log('Route params received:', { presentationId, token, remoteUserId });
      
      if (presentationId) {
        // Check if we have a stored token for this presentation
        const storedToken = localStorage.getItem(`remote_access_${presentationId}`);
        
        if (token || storedToken) {
          // User is coming from auth module with a token or has a stored token
          const tokenToUse = token || storedToken;
          console.log('Proceeding with token validation');
          this.validateAuthToken(presentationId, tokenToUse, remoteUserId);
        } else {
          // Check if user already has access (from previous session)
          this.checkExistingAccess(presentationId);
        }
      } else {
        // No presentation ID, show access request
        console.log('No presentation ID found, showing access request');
        this.showAccessRequest = true;
        this.hasRemoteAccess = false;
      }
    });
  }

  private async checkExistingAccess(presentationId: string): Promise<void> {
    try {
      console.log('Checking if user already has access to presentation:', presentationId);
      
      // Check if we're already on the remote page to prevent infinite redirects
      if (window.location.pathname.includes('/remote')) {
        console.log('Already on remote page, checking for valid access');
        // Validate the stored token instead of redirecting
        const storedToken = localStorage.getItem(`remote_access_${presentationId}`);
        if (storedToken) {
          console.log('Found stored access token, validating instead of redirecting');
          this.validateAuthToken(presentationId, storedToken);
          return;
        }
      }
      
      // Check if we have stored access details
      const storedRequest = localStorage.getItem(`remote_request_${presentationId}`);
      if (storedRequest) {
        const requestData = JSON.parse(storedRequest);
        console.log('Found stored request data:', requestData);
        
        // Check if the stored request indicates access was granted
        if (requestData.guestToken && requestData.hasAccess === true) {
          console.log('Found stored access, redirecting to remote page');
          this.guestToken = requestData.guestToken;
          this.remoteUserName = requestData.remoteUserName;
          this.redirectToRemotePage();
          return;
        }
      }
      
      // Also check if we have a stored access token (only redirect if not already on remote page)
      const storedToken = localStorage.getItem(`remote_access_${presentationId}`);
      if (storedToken && !window.location.pathname.includes('/remote')) {
        console.log('Found stored access token, redirecting to remote page');
        this.guestToken = storedToken;
        this.redirectToRemotePage();
        return;
      }
      
      // If no stored access found, show access request
      console.log('No existing access found, showing access request');
      this.showAccessRequest = true;
      this.hasRemoteAccess = false;
    } catch (error) {
      console.error('Error checking existing access:', error);
      this.showAccessRequest = true;
      this.hasRemoteAccess = false;
    }
  }

  private async validateAuthToken(presentationId: string, token: string, remoteUserId?: string): Promise<void> {
    try {
      console.log('Validating auth token for presentation:', presentationId);
      const response = await fetch(`${environment.MyApi}remote-access/validate/${presentationId}/${token}`);
      if (response.ok) {
        const userData = await response.json();
        console.log('Auth token validation successful:', userData);
        this.hasRemoteAccess = true;
        this.guestToken = token;
        
        // Store both token and remoteUserId in localStorage
        localStorage.setItem(`remote_access_${presentationId}`, token);
        if (remoteUserId || userData.remoteUserId) {
          const userId = remoteUserId || userData.remoteUserId;
          localStorage.setItem(`remote_user_id_${presentationId}`, userId);
        }
        
                 console.log('Access validated successfully');
         
         // Store the remote user name if available
         if (userData.remoteUserName) {
           this.remoteUserName = userData.remoteUserName;
         }
         
         // Check if we're already on the remote page
         if (window.location.pathname.includes('/remote')) {
           console.log('Already on remote page, loading remote data');
           this.hasRemoteAccess = true;
           this.showAccessRequest = false;
           
           // Load the remote data on the same page
           this.loadRemoteData();
         } else {
           console.log('Redirecting to remote page with validated token');
           // Redirect to the remote page with the validated token
           this.redirectToRemotePage();
         }
      } else {
        console.log('Auth token validation failed');
        this.showAccessRequest = true;
        this.hasRemoteAccess = false;
      }
    } catch (error) {
      console.error('Error validating auth token:', error);
      this.showAccessRequest = true;
      this.hasRemoteAccess = false;
    }
  }

  async requestAccess(): Promise<void> {
    if (!this.remoteUserName || this.remoteUserName.trim().length < 2) {
      this.errorMessage = 'Please enter a valid name (at least 2 characters)';
      this.requestStatus = 'error';
      return;
    }

    console.log('Starting requestAccess with userName:', this.remoteUserName);
    console.log('Current component state:', {
      hasRemoteAccess: this.hasRemoteAccess,
      showAccessRequest: this.showAccessRequest,
      requestStatus: this.requestStatus
    });

    try {
      this.requestStatus = 'pending';
      this.errorMessage = '';

      // Get connection ID from SignalR
      const connectionId = this.workSpaceSignalRService.presentationHub.connectionId;

      const requestData = {
        presentationId: this.workspaceService.presentationId,
        remoteUserName: this.remoteUserName.trim(),
        connectionId: connectionId
      };

      console.log('Requesting remote access:', requestData);

      const response = await fetch(`${environment.MyApi}remote-access/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Remote access request successful:', result);
        
                 // Check if access is already granted
         if (result.hasAccess === true) {
           console.log('Access already granted');
           this.guestToken = result.guestToken || result.remoteUserId;
           this.remoteUserName = result.remoteUserName || this.remoteUserName;
           
           // Store the access token
           localStorage.setItem(`remote_access_${this.workspaceService.presentationId}`, this.guestToken);
           
           // Update the stored request data to indicate access was granted
           localStorage.setItem(`remote_request_${this.workspaceService.presentationId}`, JSON.stringify({
             remoteUserId: result.remoteUserId,
             remoteUserName: this.remoteUserName,
             guestToken: this.guestToken,
             hasAccess: true
           }));
           
           // Check if we're already on the remote page
           if (window.location.pathname.includes('/remote')) {
             console.log('Already on remote page, granting access directly');
             this.onAccessGranted({
               presentationId: this.workspaceService.presentationId,
               remoteUserId: result.remoteUserId,
               guestToken: this.guestToken
             });
           } else {
             console.log('Redirecting to remote page immediately');
             // Redirect to remote page immediately
             this.redirectToRemotePage();
           }
           return;
         }
        
        // Store the request details for later use
        localStorage.setItem(`remote_request_${this.workspaceService.presentationId}`, JSON.stringify({
          remoteUserId: result.remoteUserId,
          remoteUserName: this.remoteUserName,
          guestToken: result.guestToken
        }));

        // Wait for presenter approval via SignalR
        this.requestStatus = 'pending';
        
        // Listen for approval notification
        this.workSpaceSignalRService.presentationHub.on('RemoteAccessApproved', (data: any) => {
          if (data.presentationId === this.workspaceService.presentationId && 
              data.remoteUserId === result.remoteUserId) {
            this.onAccessGranted(data);
          }
        });

      } else {
        const errorData = await response.json();
        this.errorMessage = errorData.message || 'Failed to request access';
        this.requestStatus = 'error';
      }
    } catch (error) {
      console.error('Error requesting remote access:', error);
      this.errorMessage = 'Network error. Please try again.';
      this.requestStatus = 'error';
    }
  }

  onAccessGranted(data: any): void {
    console.log('Access granted:', data);
    this.hasRemoteAccess = true;
    this.showAccessRequest = false;
    this.guestToken = data.guestToken || '';
    
    console.log('Component state after access granted:', {
      hasRemoteAccess: this.hasRemoteAccess,
      showAccessRequest: this.showAccessRequest,
      guestToken: this.guestToken
    });
    
    // Store the access token
    localStorage.setItem(`remote_access_${this.workspaceService.presentationId}`, this.guestToken);
    
    // Update the stored request data to indicate access was granted
    const storedRequest = localStorage.getItem(`remote_request_${this.workspaceService.presentationId}`);
    if (storedRequest) {
      try {
        const requestData = JSON.parse(storedRequest);
        requestData.guestToken = this.guestToken;
        requestData.hasAccess = true;
        localStorage.setItem(`remote_request_${this.workspaceService.presentationId}`, JSON.stringify(requestData));
      } catch (error) {
        console.error('Error updating stored request data:', error);
      }
    }
    
    // Force change detection
    this.cdr.detectChanges();
    
    // Redirect to remote page with access token
    this.redirectToRemotePage();
  }

  private redirectToRemotePage(): void {
    // Prevent multiple redirects
    if (this.isRedirecting) {
      console.log('Redirect already in progress, skipping');
      return;
    }
    
    // Check if we've already redirected in this session
    const redirectKey = `redirected_${this.workspaceService.presentationId}`;
    if (sessionStorage.getItem(redirectKey)) {
      console.log('Already redirected in this session, skipping');
      return;
    }
    
    this.isRedirecting = true;
    console.log('Redirecting to remote page with access token');
    
    // Mark that we've redirected in this session
    sessionStorage.setItem(redirectKey, 'true');
    
    // Get the remote user ID from stored data
    const storedRequest = localStorage.getItem(`remote_request_${this.workspaceService.presentationId}`);
    let remoteUserId = this.remoteUserName; // Default to userName if no stored ID
    
    if (storedRequest) {
      try {
        const requestData = JSON.parse(storedRequest);
        if (requestData.remoteUserId) {
          remoteUserId = requestData.remoteUserId;
        }
      } catch (error) {
        console.error('Error parsing stored request data:', error);
      }
    }
    
    // Build the remote page URL with the access token
    const remoteUrl = `/WorkSpace/remote?id=${this.workspaceService.presentationId}&token=${this.guestToken}&remoteUserId=${remoteUserId}`;
    
    console.log('Redirecting to:', remoteUrl);
    
    // Add a small delay to prevent rapid redirects
    setTimeout(() => {
      // Redirect to the remote page
      window.location.href = remoteUrl;
    }, 100);
  }

  private async loadRemoteData(): Promise<void> {
    try {
      this.isLoading = true;
      this.isPageLoading = false;
      this.cdr.detectChanges();

      // Load presentation data using the workspace service
      try {
        await this.workspaceService.storeActiveSlideDetailsRemote(true);
      } catch (error) {
        console.error('Error loading workspace data:', error);
      }

      this.isLoading = false;
      this.isPageLoading = true;
      this.itHasQASlides = this.workspaceService.slideListArray.some(x => x.slideTypeName == this.masterSlideTypeName.QUESTIONS_AND_ANSWER_SLIDE_TYPE);
      this.presentationTimer(new Date());
      this.cdr.detectChanges();

      if (this.dynamicChartComponent) {
        this.dynamicChartComponent.dynamicComponentUpdate(this.workspaceService.currentMasterSlideTypeId, true);
      }
    } catch (error) {
      console.error('Error loading remote data:', error);
      this.isLoading = false;
      this.isPageLoading = false;
      this.cdr.detectChanges();
    }
  }
  resetPresentationResults(data:any){
    return new Promise((resolve, reject) => {
      this._presentationservice.resetRemotePresentationResult(data).subscribe(
        (response: any) => {
          resolve(response);
        },
        (error: any) => {
          console.log(error);
        }
      )
    })
  }
}
