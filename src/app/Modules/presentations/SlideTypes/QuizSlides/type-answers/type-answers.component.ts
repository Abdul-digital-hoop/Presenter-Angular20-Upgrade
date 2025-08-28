import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommanService } from 'src/app/core/Sevices/comman.service';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkSignalRServiceService } from 'src/app/core/Sevices/WorkSpace/work-signal-rservice.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { QuizTheme, staticPresentationTheme } from 'src/app/utility/MasterConstants';
import { settingVariables } from 'src/app/utility/SettingVariables';

@Component({
    selector: 'app-type-answers',
    templateUrl: './type-answers.component.html',
    styleUrls: ['./type-answers.component.scss'],
    standalone: false
})
export class TypeAnswersComponent implements OnInit {
  isPresenterEditorScreen:boolean=false;
  screenState: string;
  slideTheme: { ThemeName: string; ThemeLogo: string; ThemeBackgroundColor: string; ThemeBackgroundImage: string; ThemeTextColor: string; ThemeFontFamily: string; ThemeLineColor: string; ThemeVisualizationColor: any[]; slideTextBold: boolean; slideTextItalic: boolean; slideTextUnderLine: boolean; slideTextStrikeThrough: boolean; slidetextSize: number; };
  @Input() isFastAnswerGetMorePoints: boolean=false;
  @Input() playersList: any[] = [];
  options: any[]=[];
  respondPlayerCount: number = 0;
  startFlashScreenTimer!: ReturnType<typeof setInterval>;
  flashScreentimer: number=5;
  minutes: number=0;
  seconds: number=0;
  quizSeconds!: ReturnType<typeof setInterval>;
  typeAnswersData:any[]=[];
  respondPlayers: any[]=[];
  currentUrl: string;
  rgbColorCode: { r: number; g: number; b: number; };
  hexToRgbColor: any;
  quizTheme = QuizTheme;
  staticPresentationTheme = staticPresentationTheme;
  constructor(
    public _workspaceservice: WorkspaceService,
    public _workspaceSignalRService:WorkSignalRServiceService,
    public presentationService:PresentationService,
    private _commanservice:CommanService,
    private _activateRouter: ActivatedRoute,) {
      this._activateRouter.queryParams.subscribe(params => {
        if ('isTemplate' in params) {
          this._workspaceservice.isTemplate = params['isTemplate'];
        }
      });
   }

  ngOnInit(): void {
   this.getScreenName();
   if (this._workspaceservice.quizState == this._workspaceservice.quizPresenterScreen.RESULT_SCREEN) {
    this.screenState = this._workspaceservice.quizPresenterScreen.RESULT_SCREEN;
    this.typeAnswersData = this._workspaceservice.currentquizDetails?.players?.filter(x=>x.isVoted == true && x.answerdOptionId !='');
    this.typeAnswersData = this._workspaceservice.profanityWordsChecksForWord(this.typeAnswersData);
  }
  else {
    this.screenState = this._workspaceservice.quizPresenterScreen.WAITING_FOR_QUIZ_PLAYERS;
   // this.quizScreenState(this._workspaceservice.quizPresenterScreen.WAITING_FOR_QUIZ_PLAYERS);
  }
   this.slideTheme = this.staticPresentationTheme;
   this.isFastAnswerGetMorePoints = this._workspaceservice.quizMorePointsforCorrectAnswers;
   this.options = this._workspaceservice.dynamicChartData(this._workspaceservice.options);
   this.typeAnswersData = this._workspaceservice.currentquizDetails?.players?.filter(x=>x.isVoted == true && x.answerdOptionId !='');
   this.typeAnswersData = this._workspaceservice.profanityWordsChecksForWord(this.typeAnswersData);
   this.getRgbColr(this.slideTheme?.ThemeBackgroundColor);
  }
  ngOnChanges() {
    
  }
  updateChart(data:any){
    this.options = data;
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
        // this.workSpaceSignalRService.openAndCloseResponse(this.workSpaceService.presentationId);
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }
  startTimerForPlaying(secondsfromUser: any) {
    //this.quizSeconds.unsubscribe();
    //this.minutes = 0;
    //this.seconds = 0;
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
            // this.isTimerFinished = true;
            // this.selectedAnswersTimesUp(true);
            // Unsubscribe the interval when timer finished
            //  clearInterval(this.quizSeconds);
            this.clearInterForQuizPlaying();
            // call TimesUp API
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
            // this.selectedAnswersTimesUp(true);
            // this.isTimerFinished = true;
            // clearInterval(this.quizSeconds);
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
    this.updateChartAfterQuizEnd(this.respondPlayers);
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
  updateChartAfterQuizEnd(response:any){
    // this.selectAnswerData = this._workspaceservice.dynamicChartData(this._workspaceservice.options);
    // this.barChartData  = this.selectAnswerData;
    // this.updateChart(this.barChartData);
    this.typeAnswersData = response;
    this.typeAnswersData = this._workspaceservice.profanityWordsChecksForWord(this.typeAnswersData);
  }
  updatePlayerResponse(response:any){
    if(this._workspaceservice.quizPlayersCount > 0){
      this.respondPlayerCount += 1;
      this._workspaceservice.slideVotersCount = this.respondPlayerCount;
      if(response.answerdOptionId != ""){
        this.respondPlayers.push(response);
      }
      this._workspaceservice.slideVotersCount = this.respondPlayerCount;
      if(this._workspaceservice.quizPlayersCount == this.respondPlayerCount){
        clearInterval(this.quizSeconds);
        this._workspaceservice.quizState = this._workspaceservice.quizPresenterScreen.EVERY_ONE_HAS_VOTED;
        this.screenState = this._workspaceservice.quizState;
        setTimeout(() => {
          this._workspaceservice.quizState = this._workspaceservice.quizPresenterScreen.RESULT_SCREEN;
          this.screenState = this._workspaceservice.quizState;
          this.updateChartAfterQuizEnd(this.respondPlayers);
          this._workspaceSignalRService.quizScreenMaintenance(this._workspaceservice.presentationId, this._workspaceservice.quizPresenterScreen.RESULT_SCREEN);
          this.quizScreenState(this._workspaceservice.quizPresenterScreen.RESULT_SCREEN);
        }, 2000);
      }
      this.updateChartAfterQuizEnd(this.respondPlayers);
    }
  }
  updatePlayerResponseViaRemote(response:any){
    this.respondPlayerCount = response.filter(x=>x.isVoted == true)?.length;
    this.respondPlayers = response.filter(x=>x.isVoted == true && x.answerdOptionId !='');
    this._workspaceservice.slideVotersCount = this.respondPlayerCount;
    this.updateChartAfterQuizEnd(this.respondPlayers);
  }
  makeCorrectorWrongAnswer(player,isCorrect){
    let presentationDTO = {
      presentationId: this._workspaceservice.presentationId,
      slideId: this._workspaceservice.activeSlideId,
      answer: player.answerdOptionId.toString().trim(),
      isCorrect:isCorrect
    }
    this.presentationService.typeAnswersResultCorrectandWrongWorkSpace(presentationDTO).subscribe(
      (response: any) => {
        var player= response.leaderBoard?.slidesQuizPlayer?.find(x=>x.slideId == this._workspaceservice.activeSlideId);
        var votedPlayer = player?.players?.filter(x=>x.isVoted == true && x.answerdOptionId !='');
        this.updateChartAfterQuizEnd(votedPlayer);
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }
  hideandShowAnswers(player,isHide){
    let presentationDTO = {
      presentationId: this._workspaceservice.presentationId,
      slideId: this._workspaceservice.activeSlideId,
      answer: player.answerdOptionId.toString().trim(),
      isHide:isHide
    }
    this.presentationService.typeAnswersResultHideandShowWorkSpace(presentationDTO).subscribe(
      (response: any) => {
        var player= response.leaderBoard?.slidesQuizPlayer?.find(x=>x.slideId == this._workspaceservice.activeSlideId);
        var votedPlayer = player?.players?.filter(x=>x.isVoted == true && x.answerdOptionId !='');
        this.updateChartAfterQuizEnd(votedPlayer);
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }
  getRgbColr(code:any){
    this.rgbColorCode = this._commanservice.getHexToRgb(code);
    if(this.rgbColorCode.r >200){
      var rbg={
        r:this.rgbColorCode.r-30,
        g:this.rgbColorCode.g-30,
        b:this.rgbColorCode.b-30
      }
    }else{
      var rbg={
        r:this.rgbColorCode.r+30,
        g:this.rgbColorCode.g+30,
        b:this.rgbColorCode.b+30
      }
    }
    this.hexToRgbColor='rgba('+rbg.r+','+rbg.g+','+rbg.b+',0.5)';
  }
  hovered(){
    if(this.rgbColorCode.r >200){
      var rbg={
        r:this.rgbColorCode.r-30,
        g:this.rgbColorCode.g-30,
        b:this.rgbColorCode.b-30
      }
    }else{
      var rbg={
        r:this.rgbColorCode.r+30,
        g:this.rgbColorCode.g+30,
        b:this.rgbColorCode.b+30
      }
    }
    this.hexToRgbColor='rgb('+rbg.r+','+rbg.g+','+rbg.b+',1)';
  }
  updateTheme(data: any) {
    this.slideTheme = this.staticPresentationTheme;
    this.getRgbColr(this.slideTheme?.ThemeBackgroundColor);
  }
  clearTimerWhenDestroy(){
    this.flashScreentimer = 5;
    // this._workspaceservice.quizSecondsToAnswers = 0;
    this.seconds = 0;
    this.minutes = 0;
  }
  ngOnDestroy(){
    clearInterval(this.startFlashScreenTimer);
    clearInterval(this.quizSeconds);
  }
 }
