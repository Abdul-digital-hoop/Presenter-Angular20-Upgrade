import { Component, HostListener, OnInit } from '@angular/core';
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
export class LineupComponent implements OnInit {

  slideTheme: any;
  screenState: any;
  playersList: any[] = [];
  isFastAnswerGetMorePoints: boolean=false;
  currentUrl: string;
  isPresenterEditorScreen: boolean;
  startFlashScreenTimer: NodeJS.Timer;
  flashScreentimer: number=5;
  minutes: number=0;
  seconds: number=0;
  quizSeconds: NodeJS.Timer;
  respondPlayerCount: number=0;
  lineupData: any[];
  suffledData: any[];
  quizTheme= QuizTheme;
  constructor(
    public _workspaceservice: WorkspaceService,
    public _workspaceSignalRService:WorkSignalRServiceService,
    public presentationService:PresentationService,
    private _activateRouter: ActivatedRoute,
  ) 
    {
      //this.slideTheme = this._workspaceservice.presentationTheme;
      this.lineupData = this._workspaceservice.dynamicChartData(this._workspaceservice.options);
      // const colors = this.slideTheme.ThemeVisualizationColor.map(item => item.color);
      // this.lineupData.forEach((option, index) => {
      //   if (colors[index]) {
      //     option.color = colors[index];
      //   }
      // });
      this.screenState = this._workspaceservice.quizState;
      this.isFastAnswerGetMorePoints = this._workspaceservice.quizMorePointsforCorrectAnswers;
      this.getScreenName();
      this._activateRouter.queryParams.subscribe(params => {
        if ('isTemplate' in params) {
          this._workspaceservice.isTemplate = params['isTemplate'];
        }
      });
    }

  ngOnInit(): void {
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
    if (!this.isPresenterEditorScreen) {
      if (this.screenState == this._workspaceservice.quizPresenterScreen.WAITING_FOR_QUIZ_PLAYERS) {
        let QuizDTO={
          presentationId:this._workspaceservice.presentationId,
          slideId:this._workspaceservice.activeSlideId
        }
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
      this._workspaceSignalRService.quizScreenMaintenance(this._workspaceservice.presentationId, this._workspaceservice.quizPresenterScreen.LOADER_SCREEN);
      this._workspaceservice.quizState = this._workspaceservice.quizPresenterScreen.LOADER_SCREEN;
      this.screenState = this._workspaceservice.quizState;
      this.quizScreenState(this._workspaceservice.quizPresenterScreen.LOADER_SCREEN);
      this.startflashScreenTimer();   // Start count Down
     },3000);
  }
  startflashScreenTimer(): void {
    this._workspaceservice.quizState = this._workspaceservice.quizPresenterScreen.LOADER_SCREEN;
    this.screenState = this._workspaceservice.quizState;
    this.startFlashScreenTimer = setInterval(() => {
      if (this.flashScreentimer > 0) {
        this.flashScreentimer--; // Decrement timer by 1 second
      } else {
        this.stopTimer(); // Stop the timer when it reaches 0
        this.flashScreentimer = 5;

      }
    }, 1000); // Update every 1 second
  }
  stopTimer(): void {
    clearInterval(this.startFlashScreenTimer);
    this._workspaceSignalRService.quizScreenMaintenance(this._workspaceservice.presentationId, this._workspaceservice.quizPresenterScreen.VOTING_SCREEN);
    this._workspaceservice.quizState = this._workspaceservice.quizPresenterScreen.VOTING_SCREEN;
    this.screenState = this._workspaceservice.quizState;
    this.quizScreenState(this._workspaceservice.quizPresenterScreen.VOTING_SCREEN);
    this.startTimerForPlaying(this._workspaceservice.quizSecondsToAnswers);
  }
  quizScreenState(screenName:any) {
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
    this._workspaceservice.quizState = this._workspaceservice.quizPresenterScreen.RESULT_SCREEN;
    this.screenState = this._workspaceservice.quizState;
    this.updateChartAfterQuizEnd();
    this._workspaceSignalRService.quizScreenMaintenance(this._workspaceservice.presentationId, this._workspaceservice.quizPresenterScreen.RESULT_SCREEN);
    this.quizScreenState(this._workspaceservice.quizPresenterScreen.RESULT_SCREEN);
  }
  addNewPlayerList(list){
    this.playersList = list;
  }
  updatePlayerlist(player) {
    var index = this.playersList.findIndex(x=>x.playerId == player[0].playerId);
    if(index != -1){
      this.playersList[index].playerName = player[0].playerName;
      this.playersList[index].playerImageURL = player[0].playerImageURL;
      this.playersList[index].score = player[0].score;
      this.playersList[index].answerdTime = player[0].answerdTime;
      this.playersList[index].answerdOptionId = player[0].answerdOptionId;
    }else{
      this.playersList.push(player[0]);
      this._workspaceservice.quizPlayersCount++;
    }
  }
  updateChartAfterQuizEnd(){
    this.lineupData = this._workspaceservice.dynamicChartData(this._workspaceservice.options);
    // const colors = this.slideTheme.ThemeVisualizationColor.map(item => item.color);
    // this.lineupData.forEach((option, index) => {
    //   if (colors[index]) {
    //     option.color = colors[index];
    //   }
    // });
  }
  updatePlayerResponse(response:any){
    if(this._workspaceservice.quizPlayersCount > 0){
      this.respondPlayerCount = response;
      this._workspaceservice.slideVotersCount = this.respondPlayerCount;
      if(this._workspaceservice.quizPlayersCount == this.respondPlayerCount){
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
  ngOnDestroy(){
    clearInterval(this.startFlashScreenTimer);
    clearInterval(this.quizSeconds);
  }
}
