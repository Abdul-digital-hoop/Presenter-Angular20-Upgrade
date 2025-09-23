import { Component, ComponentFactoryResolver, ComponentRef, EventEmitter, OnInit, Output, SimpleChanges, Type, ViewChild } from '@angular/core';
import { MasterSlideTypeName, QuizPresenterScreenManageConstant } from 'src/app/utility/constants';
import { DynamicComponentDirective } from '../Common/dynamic-component.directive';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { CommanService } from 'src/app/core/Sevices/comman.service';
import { WorkSignalRServiceService } from 'src/app/core/Sevices/WorkSpace/work-signal-rservice.service';

@Component({
    selector: 'app-dynamic-chart',
    templateUrl: './dynamic-chart.component.html',
    styleUrls: ['./dynamic-chart.component.scss'],
    standalone: false
})
export class DynamicChartComponent implements OnInit {
  @Output() public clearDynamicComponent: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(DynamicComponentDirective, { static: true }) appDynamicComponent!: DynamicComponentDirective;
  dynamicComponent: Type<any>;
  activeComponentReference: ComponentRef<any> | null = null;
  ContrastColor: string;
  selectedAnswersAudio: HTMLAudioElement= new Audio();
  musicTooltipTittle: string="";
  quizPresenterScreenManageConstant = QuizPresenterScreenManageConstant;
  constructor(
    public workSpaceService:WorkspaceService,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _CommanService: CommanService,
    public workSpaceSignalRService : WorkSignalRServiceService) { }

 
  ngOnChanges(changes: SimpleChanges): void {
    // if (changes.backgroundColor && !changes.backgroundColor.firstChange) {
    //   this.captureScreenshot(changes.backgroundColor.currentValue);
    // }
  }

  ngOnInit(): void {
  //  this.switchComponent(this.workSpaceService.currentMasterSlideTypeId);
  }

  ngDoCheck() {
    
  }

  ngAfterContentInit() {
    // console.log("AppComponent: AfterContentInit");
  }

  ngAfterContentChecked() {
    // console.log("AppComponent:AfterContentChecked");
  }

  ngAfterViewInit() {
    //this.captureScreenshot(this.themesBackgroundColor);
  }

  ngAfterViewChecked() {
    // console.log("AppComponent:AfterViewChecked");
  }

  ngOnDestroy() {

  }

  async loadComponent() {
    this.workSpaceService.enableKeyDown(false);
    const componentFactory = this._componentFactoryResolver.resolveComponentFactory(this.dynamicComponent);
    this.slideLevelFunctions();
    if (this.appDynamicComponent?.viewContainerRef) {
      await this.clearActiveComponent();
      this.appDynamicComponent.viewContainerRef.clear();
      this.activeComponentReference = this.appDynamicComponent.viewContainerRef.createComponent(componentFactory);
      this.workSpaceService.dynamicComponent_Clone = this.activeComponentReference;
      // * Apply Themes Logic
      if (this.workSpaceService.slideDesign.slideResetTheme) {
        let updatedThemes = this.workSpaceService.setSlideThemes(this.workSpaceService.slideDesign);
        // this.ContrastColor = this._CommanService.getContrastColor(this.workSpaceService?.slideDesign?.slideBackgroundColor);
        if (this.workSpaceService.activeSlideTypeName != MasterSlideTypeName.ImportDocument && this.workSpaceService.activeSlideTypeName != MasterSlideTypeName.POWER_POINT && this.workSpaceService.activeSlideTypeName != MasterSlideTypeName.LEADER_BOARD_SLIDE_TYPE) {
          this.themesDataPassToDynamicComponent(updatedThemes);
        }
      }
      else {
        // this.ContrastColor = this._CommanService.getContrastColor(this.workSpaceService?.slideDesign?.slideBackgroundColor);
        if (this.workSpaceService.activeSlideTypeName != MasterSlideTypeName.ImportDocument && this.workSpaceService.activeSlideTypeName != MasterSlideTypeName.POWER_POINT && this.workSpaceService.activeSlideTypeName != MasterSlideTypeName.LEADER_BOARD_SLIDE_TYPE) {
          this.themesDataPassToDynamicComponent(this.workSpaceService.presentationTheme);
        }
      }
      // * Select Answers 
      if (this.workSpaceService.slideContentType == this.workSpaceService.masterSlideTypeName.QUIZ && this.workSpaceService.activeSlideTypeName != MasterSlideTypeName.LEADER_BOARD_SLIDE_TYPE) {
        this.activeComponentReference.instance.addNewPlayerList(this.workSpaceService.currentquizDetails?.players);
        this.workSpaceService.dynamicComponent_Clone.instance.clearTimerWhenDestroy();
      }
      else {
        if (!this.selectedAnswersAudio.paused) {
          this.selectedAnswersAudio.pause();
          this.selectedAnswersAudio.currentTime = 0;
          this.selectedAnswersAudio.src = "";
        }
      }
    } else {
      console.error('viewContainerRef is not available.');
    }
  }
  async clearActiveComponent() {
    if (this.activeComponentReference) {
      this.activeComponentReference.destroy();
      this.activeComponentReference = null;
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  themesDataPassToDynamicComponent(data: any) {
    this.activeComponentReference.instance.slideTheme = data;
    this.activeComponentReference.instance.updateTheme(data);
  }
  playBackgroundMusic(url: any) {
    if (this.workSpaceService.quizIsEnableMusic) {
      if (!this.selectedAnswersAudio.paused) {
        this.selectedAnswersAudio.pause();
        this.selectedAnswersAudio.currentTime = 0;
        this.selectedAnswersAudio.src = '';
        this.musicTooltipTittle = "Mute";
      }
      this.selectedAnswersAudio = new Audio();
      this.selectedAnswersAudio.src = url;
      this.selectedAnswersAudio.load();
      this.selectedAnswersAudio.play();
      this.musicTooltipTittle = "Mute";
    }
    else
    {
      this.musicTooltipTittle = "No music added";
    }
  }
  stopQuizMusic(){
    if (this.workSpaceService.quizIsEnableMusic) {
      if (!this.selectedAnswersAudio.paused) {
        this.selectedAnswersAudio.pause();
        this.selectedAnswersAudio.currentTime = 0;
      }
    }
  }
  slideLevelFunctions(){
    let slideTypeName =  this.workSpaceService.activeSlideTypeName;
    switch (slideTypeName) {
     case(this.workSpaceService.masterSlideTypeName.MULTIPLE_CHOICE_SLIDE_TYPE):
      //  this.workSpaceService.multiplechoicepresenterEnterClick = false;
      //  var obj = {
      //   presentationId:this.workSpaceService.presentationId,
      //   isShowCorrectAnswers:this.workSpaceService.multiplechoicepresenterEnterClick,
      // }
      // this.workSpaceSignalRService.multipleChoiceCorrectAnswersUpdate(obj);
       break;
     case(this.workSpaceService.masterSlideTypeName.GUESS_TEHE_NUMBER_SLIDE_TYPE):
      //  this.workSpaceService.guessthenumberpresenterEnterClick = false;
       break;
     case(this.workSpaceService.masterSlideTypeName.TRUTH_OR_LIE_SLIDE_TYPE):
      //  this.workSpaceService.truthorliepresenterEnterClick = false;
       break;
    }
    this.isShowQRCode();
    this.isCloseQACode();
  }
  switchComponent(activeSlideTypeId: any) {
    const curentSlideTypeObj = this.workSpaceService.getSlideTypeById(activeSlideTypeId) || { Name: 'Empty' };
    // switch (curentSlideTypeObj.Name) {
    //   case MasterSlideTypeName.MULTIPLE_CHOICE_SLIDE_TYPE:
    //     const masterVisualizationObj = this.workSpaceService.getMasterVisualizationData(this.workSpaceService.slideVisualizationId);
    //     switch (masterVisualizationObj.Name) {
    //       case this.workSpaceService.multipleChoicesVisualizationSlideType.DONUT:
    //         this.dynamicComponent = MultipleDonutComponent;
    //         break;
    //       case this.workSpaceService.multipleChoicesVisualizationSlideType.PIE:
    //         this.dynamicComponent = MultiplePieComponent;
    //         break;
    //       case this.workSpaceService.multipleChoicesVisualizationSlideType.DOT:
    //         this.dynamicComponent = MultipleDotComponent;
    //         break;
    //       default:
    //         this.dynamicComponent = MultipleBarComponent;
    //     }
    //     break;
    //   case MasterSlideTypeName.WORD_CLOUD_SLIDE_TYPE:
    //     this.dynamicComponent = WordCloudComponent;
    //     break;
    //   case MasterSlideTypeName.OPEN_ENDED_SLIDE_TYPE:
    //     const openEndedVisualizationObj = this.workSpaceService.getMasterVisualizationData(this.workSpaceService.slideVisualizationId);
    //     switch (openEndedVisualizationObj.Name) {
    //       case this.workSpaceService.openEndedVisualizationSlideType.SPEECH_BOBBLES:
    //         this.dynamicComponent = OpenEndedComponent;
    //         break;
    //       case this.workSpaceService.openEndedVisualizationSlideType.FLOWING_GRID:
    //         this.dynamicComponent = OpenEndedFlowingComponent;
    //         break;
    //     }
    //     break;
    //   case MasterSlideTypeName.GUESS_TEHE_NUMBER_SLIDE_TYPE:
    //     this.dynamicComponent = GuessTheNumberComponent;
    //     break;
    //   case MasterSlideTypeName.RANKING_SLIDE_TYPE:
    //     this.dynamicComponent = RankingComponent;
    //     break;
    //   case MasterSlideTypeName.SCALES_SLIDE_TYPE:
    //     const scalesMasterVisualizationObj = this.workSpaceService.getMasterVisualizationData(this.workSpaceService.slideVisualizationId);
    //     if (scalesMasterVisualizationObj.Name === this.workSpaceService.scalesChoicesVisualizationSlideType.SPIDER) {
    //       this.dynamicComponent = ScalesComponent;
    //     } else {
    //       this.dynamicComponent = ScalesSliderComponent;
    //     }
    //     break;
    //   case MasterSlideTypeName.QUESTIONS_AND_ANSWER_SLIDE_TYPE:
    //     this.dynamicComponent = QuestionAnswersComponent;
    //     break;
    //   case MasterSlideTypeName.THIS_OR_THAT_SLIDE_TYPE:
    //     this.dynamicComponent = ThisOrThatComponent;
    //     break;
    //   case MasterSlideTypeName.TRUTH_OR_LIE_SLIDE_TYPE:
    //     this.dynamicComponent = TruthOrLieComponent;
    //     break;
    //   case MasterSlideTypeName.TRAFFIC_LIGHTS_SLIDE_TYPE:
    //     this.dynamicComponent = TrafficLightsComponent;
    //     break;
    //   case MasterSlideTypeName.SELECT_ANSWER_SLIDE_TYPE:
    //     this.dynamicComponent = SelectAnswersComponent
    //     break;
    //   case MasterSlideTypeName.TYPE_ANSWER_SLIDE_TYPE:
    //     this.dynamicComponent = TypeAnswersComponent
    //     break;
    //   case MasterSlideTypeName.GUESS_THE_NUMBER_QUIZ:
    //     this.dynamicComponent = GuessTheNumberQuizComponent
    //     break;
    //   case MasterSlideTypeName.LEADER_BOARD_SLIDE_TYPE:
    //     if(this.workSpaceService.leaderBoardState == this.quizPresenterScreenManageConstant.QUIZ_SCORE){
    //       this.dynamicComponent = LeaderBoardComponent
    //     }
    //     else if(this.workSpaceService.leaderBoardState == this.quizPresenterScreenManageConstant.CHAMPION_SCORE){
    //       this.dynamicComponent = LeaderboardChampionComponent
    //     }
    //     else if(this.workSpaceService.leaderBoardState == this.quizPresenterScreenManageConstant.LEADING_SCORE){
    //       this.dynamicComponent = LeaderBoardLeadingComponent
    //     }
    //     break;
    //   case MasterSlideTypeName.ImportDocument:
    //     this.dynamicComponent = ImportPptComponent
    //     break;
    //   case MasterSlideTypeName.POWER_POINT:
    //     this.dynamicComponent = ImportPowerpointComponent
    //     // if(this.workSpaceService.EmbeddedPPTpresenterEnterClick){
    //     //   $("#myModal").modal("show");
    //     // }
    //     break;
    //   case MasterSlideTypeName.GoogleSlides:
    //     this.dynamicComponent = ImportGoogleSlideComponent
    //     break;
    //     case MasterSlideTypeName.INSTRUCTION_SLIDE_TYPE:
    //       this.dynamicComponent = InstructionComponent
    //       break;
    //   case MasterSlideTypeName.LINEUP_SLIDE_TYPE:
    //     this.dynamicComponent = LineupComponent
    //     break;
    //   case MasterSlideTypeName.MULTIMEDIA:
    //     this.dynamicComponent = MultimediaComponent
    //     break;
    //   default:
    //     this.dynamicComponent = EmptySlideComponent;
    //     break;
    // }
    this.loadComponent();
  } 

  isShowQRCode() {
    let obj = {
      presentationId: this.workSpaceService.presentationId,
      isShowQR: false
    }
    this.workSpaceSignalRService.hideShowQRCode(obj);
  }
  isCloseQACode(){
    var obj = {
      presentationId:this.workSpaceService.presentationId,
      isOpenQA:false,
    }
    this.workSpaceSignalRService.OpenQAModal(obj);
  }
}

