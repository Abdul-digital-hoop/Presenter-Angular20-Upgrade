import { Component, HostListener, Input, OnInit, OnDestroy, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkSignalRServiceService } from 'src/app/core/Sevices/WorkSpace/work-signal-rservice.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { QuizPresenterScreenManageConstant } from 'src/app/utility/constants';
import { QuizTheme, staticPresentationTheme } from 'src/app/utility/MasterConstants';

@Component({
    selector: 'app-lineup',
    templateUrl: './lineup.component.html',
    styleUrls: ['./lineup.component.scss'],
    standalone: false
})
export class LineupComponent implements OnInit, OnDestroy {

  slideTheme: any;
  screenState: any;
  playersList: any[] = [];
  isFastAnswerGetMorePoints: boolean=false;
  currentUrl: string;
  startFlashScreenTimer!: ReturnType<typeof setInterval>;
  flashScreentimer: number=5;
  minutes: number=0;
  seconds: number=0;
  quizSeconds!: ReturnType<typeof setInterval>;
  respondPlayerCount: number=0;
  lineupData: any[];
  suffledData: any[];
  quizTheme= QuizTheme;
  @Input() slideDetails:any;
  @Input() presentationLevelTheme:any;
  @Input() viewfrom:string='';
  @Input() isPresenterEditorScreen:boolean;
  @Input() isPreview:boolean;
  @Input() template:any;
  @Input() isRemote:boolean;

  // Animation properties
  chartUpdateInterval: any;
  previousIndex: number = -1;
  isFirstUpdate: boolean = true;
  currentIndex: number = -1;
  originalData: any[] = [];
  startQuizVoting: boolean = false;
  constructor(
    public _workspaceservice: WorkspaceService,
    public _workspaceSignalRService:WorkSignalRServiceService,
    public presentationService:PresentationService,
    private _activateRouter: ActivatedRoute,
    private ngZone: NgZone
  ) 
    {
      
      // this.getScreenName();
      this._activateRouter.queryParams.subscribe(params => {
        if ('isTemplate' in params) {
          this._workspaceservice.isTemplate = params['isTemplate'];
        }
      });
    }

  ngOnInit(): void {
    this.startQuizVoting = false;
    var lineUpData = this._workspaceservice.convertDataFormat(this.slideDetails?.slideContentData, 'Options');
    this.lineupData = this._workspaceservice.dynamicChartData(lineUpData);
    this.screenState = this._workspaceservice.quizState;
    this.isFastAnswerGetMorePoints =  this._workspaceservice.changeMorePointsForCorrectAnswersDataFormat(this.slideDetails?.slideContentData);
    
    // Store original data for animation
    this.originalData = [...this.lineupData];
  }
  ngAfterViewInit() {
    if(!this.isRemote){
      this._workspaceSignalRService.quizScreenMaintenance(this._workspaceservice.presentationId, this.screenState);
    }
    if(this.screenState == this._workspaceservice?.quizPresenterScreen.WAITING_FOR_QUIZ_PLAYERS && this._workspaceservice.presentationMode){
      setTimeout(() => {
        let attempts = 0;
        const maxAttempts = 3;
        const interval = setInterval(() => {
          if (attempts < maxAttempts) {
            if ( this._workspaceservice.quizPlayers.length == this._workspaceservice.slideParticipantCount) {
              clearInterval(interval);
            }
            this.playersList = this._workspaceservice.quizPlayers;
            var playerIdList = this.playersList.map(player => player.playerId);
            var waitingForQuizPlayersDTO = {
              presentationId: this._workspaceservice.presentationId,
              playerIdList: playerIdList,
              screenState: this._workspaceservice?.quizPresenterScreen.WAITING_FOR_QUIZ_PLAYERS
            }
            // this._workspaceSignalRService.waitingForQuizPlayers(waitingForQuizPlayersDTO);
            attempts++;
          } else {
            clearInterval(interval);
          }
        }, 1000);
      }, 300);
      
    }
  }

  ngOnChanges(){
  }
  getScreenName() {
    const url = new URL(window.location.href);
    const pathSegments = url.pathname.split('/');
    this.currentUrl = pathSegments[pathSegments.length - 1];
    if (this.currentUrl == 'presentation') {
      this.isPresenterEditorScreen = false;
    }
    else {
      this.isPresenterEditorScreen = true;
    }
  }
  @HostListener('document:keydown.enter', ['$event'])
  public documentClick(event: Event): void {
    this.startQuiz();
  }
  startQuiz(){
    if (!this.isPresenterEditorScreen && !this._workspaceservice.changeSlideFlag) {
      if (this.screenState == this._workspaceservice.quizPresenterScreen.WAITING_FOR_QUIZ_PLAYERS) {
        let QuizDTO={
          presentationId:this._workspaceservice.presentationId,
          slideId:this._workspaceservice.activeSlideId
        }
        this.startQuizVoting = true;
        this._workspaceSignalRService.startQuizForRemote(QuizDTO);
        this._workspaceSignalRService.quizScreenMaintenance(this._workspaceservice.presentationId, this._workspaceservice.quizPresenterScreen.FAST_ANSWERS_SCREEN);
        this._workspaceservice.quizState = this._workspaceservice.quizPresenterScreen.FAST_ANSWERS_SCREEN;
        this.screenState = this._workspaceservice.quizState;
        this.startFastAnswersScreen();
        this.quizScreenState(this._workspaceservice.quizPresenterScreen.FAST_ANSWERS_SCREEN);
      }
    }
  }
  startFastAnswersScreen(){
    setTimeout(() => {
      if(!this._workspaceservice.changeSlideFlag && this.startQuizVoting){
        this._workspaceSignalRService.quizScreenMaintenance(this._workspaceservice.presentationId, this._workspaceservice.quizPresenterScreen.LOADER_SCREEN);
        this._workspaceservice.quizState = this._workspaceservice.quizPresenterScreen.LOADER_SCREEN;
        this.screenState = this._workspaceservice.quizState;
        this.quizScreenState(this._workspaceservice.quizPresenterScreen.LOADER_SCREEN);
        this.startflashScreenTimer();   // Start count Down
      }else{
        return;
      }
     },3000);
  }
  startflashScreenTimer(): void {
    this._workspaceservice.quizState = this._workspaceservice.quizPresenterScreen.LOADER_SCREEN;
    this.screenState = this._workspaceservice.quizState;
    this.startFlashScreenTimer = setInterval(() => {
    if(!this._workspaceservice.changeSlideFlag && this.startQuizVoting){
      if (this.flashScreentimer > 0) {
        this.flashScreentimer--; // Decrement timer by 1 second
      } else {
        this.stopTimer(); // Stop the timer when it reaches 0
        this.flashScreentimer = 5;

      }
    }else{
      return;
    }
    }, 1000); // Update every 1 second
  }
  stopTimer(): void {
    clearInterval(this.startFlashScreenTimer);
    if(!this._workspaceservice.changeSlideFlag && this.startQuizVoting){
    this._workspaceSignalRService.quizScreenMaintenance(this._workspaceservice.presentationId, this._workspaceservice.quizPresenterScreen.VOTING_SCREEN);
    this._workspaceservice.quizState = this._workspaceservice.quizPresenterScreen.VOTING_SCREEN;
    this.screenState = this._workspaceservice.quizState;
    this.quizScreenState(this._workspaceservice.quizPresenterScreen.VOTING_SCREEN);
    this.startTimerForPlaying(this._workspaceservice.quizSecondsToAnswers);
    }else{
      return;
    }
  }
  quizScreenState(screenName:any) {
    if(this._workspaceservice.isAttendeeRole()){
      return;
    }
    let presentationDTO = {
      presentationId: this._workspaceservice.presentationId,
      slideId: this._workspaceservice.activeSlideId,
      state: screenName,
      isTemplate: this._workspaceservice.isTemplate
    }
    this.presentationService.quizStateUpdate(presentationDTO).subscribe(
      (response: any) => {
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }
  startTimerForPlaying(secondsfromUser: any) {
    if (secondsfromUser > 60) {
      this.minutes = Math.floor((secondsfromUser % 3600) / 60);
      this.seconds = secondsfromUser % 60;
      if (!(this.minutes < 0)) {
        this.quizSeconds = setInterval(() => {
          this.seconds--;                                                                                                   // Generate interval every one second;
          if (this.seconds < 0) {
            this.minutes = this.minutes - 1;                                                                                // Decrease the mintuies after 59 less
            this.seconds = 59;                                                                                              // Regenerate the sec
          }
          if (this.seconds === 0 && this.minutes === 0) {
            this.clearInterForQuizPlaying();
          }
        }, 1000)

      }
    }
    else {
      this.seconds = secondsfromUser;
      this.quizSeconds = setInterval(() => {
        if (!(this.seconds < 0)) {
          this.seconds--;
          if (this.seconds === 0) {
            this.clearInterForQuizPlaying();                                                                                 // Unsubscribe the interval when timer finished
          }
        }
      }, 1000)
    }
  }
  clearInterForQuizPlaying(){
    clearInterval(this.quizSeconds);
    if(!this._workspaceservice.changeSlideFlag && this.startQuizVoting ){
      this._workspaceservice.quizState = this._workspaceservice.quizPresenterScreen.RESULT_SCREEN;
      this.screenState = this._workspaceservice.quizState;
      this.updateChartAfterQuizEnd();
      this._workspaceSignalRService.quizScreenMaintenance(this._workspaceservice.presentationId, this._workspaceservice.quizPresenterScreen.RESULT_SCREEN);
      this.quizScreenState(this._workspaceservice.quizPresenterScreen.RESULT_SCREEN);
    }else{
      return;
    }
  }
  addNewPlayerList(list){
    this.playersList = list;
  }
  updatePlayerlist(player) {
    try {
      if (!player || !Array.isArray(player) || player.length === 0) {
        return;
      }
      
      if (!this.playersList) {
        this.playersList = [];
      }
      
      var index = this.playersList.findIndex(x => x.playerId == player[0].playerId);
      if(index != -1){
        this.playersList[index].playerName = player[0].playerName;
        this.playersList[index].playerImageURL = player[0].playerImageURL;
        this.playersList[index].score = player[0].score;
        this.playersList[index].answerdTime = player[0].answerdTime;
        this.playersList[index].answerdOptionId = player[0].answerdOptionId;
      } else {
        this.playersList.push(player[0]);
        this._workspaceservice.quizPlayersCount++;
      }
      
      if (this.ngZone) {
        this.ngZone.run(() => {
        });
      }
      
      return true; 
    } catch (error) {
      console.error("Error in updatePlayerlist:", error);
      return false; 
    }
  }
  removePlayerFromList(playerId) {
    try {
      if (!this.playersList || !Array.isArray(this.playersList) || this.playersList.length === 0) {
        return false;
      }
      const index = this.playersList.findIndex(x => x.playerId == playerId);
      if (index !== -1) {
        this.playersList.splice(index, 1);
        if (this._workspaceservice.quizPlayersCount > 0) {
          this._workspaceservice.quizPlayersCount--;
        }
        if (this.ngZone) {
          this.ngZone.run(() => {
          });
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error in removePlayerFromList:", error);
      return false;
    }
  }
  updateChartAfterQuizEnd(){
    var lineUpData = this._workspaceservice.convertDataFormat(this.slideDetails?.slideContentData, 'Options');
    this.lineupData = this._workspaceservice.dynamicChartData(lineUpData);
  }
  updatePlayerResponse(response:any){
    if(this._workspaceservice.quizPlayersCount > 0){
      this.respondPlayerCount = response;
      this._workspaceservice.slideVotersCount = this.respondPlayerCount;
      if(this.playersList.length == this.respondPlayerCount){
        clearInterval(this.quizSeconds);
        this._workspaceservice.quizState = this._workspaceservice.quizPresenterScreen.EVERY_ONE_HAS_VOTED;
        this.screenState = this._workspaceservice.quizState;
        setTimeout(() => {
          this._workspaceservice.quizState = this._workspaceservice.quizPresenterScreen.RESULT_SCREEN;
          this.screenState = this._workspaceservice.quizState;
          this.updateChartAfterQuizEnd();
          this._workspaceSignalRService.quizScreenMaintenance(this._workspaceservice.presentationId, this._workspaceservice.quizPresenterScreen.RESULT_SCREEN);
          this.quizScreenState(this._workspaceservice.quizPresenterScreen.RESULT_SCREEN);
        }, 2000);
      }
    }
  }

  updateChart(value: any){
    this.lineupData = value;
    // const colors = this.slideTheme.ThemeVisualizationColor.map(item => item.color);

    // this.lineupData.forEach((option, index) => {
    //   if (colors[index]) {
    //     option.color = colors[index];
    //   }
    // });
  }

  // updateTheme(data:any){
  //   this.slideTheme = data;    
  // }
  clearTimerWhenDestroy(){    
    clearInterval(this.startFlashScreenTimer);
    clearInterval(this.quizSeconds);
    this.flashScreentimer = 5;
    // this._workspaceservice.quizSecondsToAnswers = 0;
    this.seconds = 0;
    this.minutes = 0;
  }
  updateTheme(data: any) {
   
  }
  ngOnDestroy(): void {
    // Clear flash screen timer
    this.startQuizVoting = false;
    if (this.startFlashScreenTimer) {
      clearInterval(this.startFlashScreenTimer);
    }

    // Clear quiz seconds timer
    if (this.quizSeconds) {
      clearInterval(this.quizSeconds);
    }

    // Clear chart update interval
    if (this.chartUpdateInterval) {
      clearInterval(this.chartUpdateInterval);
    }

    // Reset all timer values
    this.flashScreentimer = 5;
    this.seconds = 0;
    this.minutes = 0;

  }

  updateChartWithRandomData(): void {
    try {
      if (this.isFirstUpdate) {
        // Initialize with empty array
        this.lineupData = [];
        this.currentIndex = 0;
        this.isFirstUpdate = false;
      } else {
        // Check if we've shown all items
        if (this.currentIndex >= this.originalData.length) {
          // Reset to empty array to start the cycle again
          this.lineupData = [];
          this.currentIndex = 0;
        }

        // Get the next item in sequence
        const nextItem = this.originalData[this.currentIndex];

        // Push the next item to lineupData
        this.lineupData.push({
          ...nextItem,
          value: nextItem.value
        });

        // Increment the index for next update
        this.currentIndex++;
      }

      // Update the chart
      this.updateChart(this.lineupData);
    } catch (error) {
      console.error('Error updating lineup data:', error);
      this.stopRandomDataUpdates();
    }
  }

  resetChart(): void {
    this.isFirstUpdate = true;
    this.previousIndex = -1;
  }

  startRandomDataUpdates(): void {
    this.resetChart();
    if (this.chartUpdateInterval) {
      clearInterval(this.chartUpdateInterval);
    }

    // First update with 1000ms interval
    this.chartUpdateInterval = setInterval(() => {
      this.updateChartWithRandomData();
      
      // After first update, clear the interval and set a new one with 2000ms
      if (!this.isFirstUpdate) {
        clearInterval(this.chartUpdateInterval);
        this.chartUpdateInterval = setInterval(() => {
          this.updateChartWithRandomData();
        }, 2000);
      }
    }, 1000);
  }

  stopRandomDataUpdates(): void {
    if (this.chartUpdateInterval) {
      clearInterval(this.chartUpdateInterval);
      this.chartUpdateInterval = null;
      this.lineupData = [...this.originalData];
    }
  }
}
