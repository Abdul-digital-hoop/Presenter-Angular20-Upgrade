import { Component, ComponentFactoryResolver, ComponentRef, EventEmitter, Input, OnInit, Output, SimpleChanges, Type, ViewChild } from '@angular/core';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { DynamicComponentDirective } from 'src/app/Modules/presentations/Common/dynamic-component.directive';
import { MasterSlideTypeName, QuizPresenterScreenManageConstant } from 'src/app/utility/constants';
import { MultipleDonutComponent } from '../../SlideTypes/PopularSlideType/multiple-donut/multiple-donut.component';
import { MultiplePieComponent } from '../../SlideTypes/PopularSlideType/multiple-pie/multiple-pie.component';
import { MultipleDotComponent } from '../../SlideTypes/PopularSlideType/multiple-dot/multiple-dot.component';
import { MultipleBarComponent } from '../../SlideTypes/PopularSlideType/multiple-bar/multiple-bar.component';
import { WordCloudComponent } from '../../SlideTypes/PopularSlideType/word-cloud/word-cloud.component';
import { OpenEndedComponent } from '../../SlideTypes/PopularSlideType/open-ended/open-ended.component';
import { OpenEndedFlowingComponent } from '../../SlideTypes/PopularSlideType/open-ended-flowing/open-ended-flowing.component';
import { GuessTheNumberComponent } from '../../SlideTypes/PopularSlideType/guess-the-number/guess-the-number.component';
import { RankingComponent } from '../../SlideTypes/PopularSlideType/ranking/ranking.component';
import { ScalesComponent } from '../../SlideTypes/PopularSlideType/scales/scales.component';
import { ScalesSliderComponent } from '../../SlideTypes/PopularSlideType/scales-slider/scales-slider.component';
import { QuestionAnswersComponent } from '../../SlideTypes/PopularSlideType/question-answers/question-answers.component';
import { ThisOrThatComponent } from '../../SlideTypes/PopularSlideType/this-or-that/this-or-that.component';
import { TruthOrLieComponent } from '../../SlideTypes/PopularSlideType/truth-or-lie/truth-or-lie.component';
import { TrafficLightsComponent } from '../../SlideTypes/PopularSlideType/traffic-lights/traffic-lights.component';
import { SelectAnswersComponent } from '../../SlideTypes/QuizSlides/select-answers/select-answers.component';
import { TypeAnswersComponent } from '../../SlideTypes/QuizSlides/type-answers/type-answers.component';
import { GuessTheNumberQuizComponent } from '../../SlideTypes/QuizSlides/guess-the-number-quiz/guess-the-number-quiz.component';
import { LeaderBoardComponent } from '../../SlideTypes/QuizSlides/leader-board/leader-board.component';
import { LeaderboardChampionComponent } from '../../SlideTypes/QuizSlides/leaderboard-champion/leaderboard-champion.component';
import { LeaderBoardLeadingComponent } from '../../SlideTypes/QuizSlides/leader-board-leading/leader-board-leading.component';
import { ImportPptComponent } from '../../SlideTypes/ImportSlides/import-google-slides/import-ppt/import-ppt.component';
import { ImportPowerpointComponent } from '../../SlideTypes/ImportSlides/import-powerpoint/import-powerpoint.component';
import { ImportGoogleSlideComponent } from '../../SlideTypes/ImportSlides/import-google-slide/import-google-slide.component';
import { LineupComponent } from '../../SlideTypes/QuizSlides/lineup/lineup.component';
import { MultimediaComponent } from '../../SlideTypes/PopularSlideType/multimedia/multimedia.component';
import { EmptySlideComponent } from '../../SlideTypes/empty-slide/empty-slide.component';
import { DynamicSlideTypeDirective } from '../../directive/dynamic-slide-type.directive';
import { InstructionComponent } from '../../SlideTypes/ContentSlides/instruction/instruction.component';

@Component({
    selector: 'app-dynamic-slide-type',
    templateUrl: './dynamic-slide-type.component.html',
    styleUrls: ['./dynamic-slide-type.component.scss'],
    standalone: false
})
export class DynamicSlideTypeComponent implements OnInit {
  @Input() activeSlideTypeId: any;
  @Input() activeslideVisualizationId: any;
  @Input() slideDetails: any;
  @Input() template: any;
  @Input() presentationTheme: any;
  @Input() viewfrom: any;
  @Input() isPresenterEditorScreen: any;
  @Input() screenOptions: any;
  @Input() isPreview: any;
  @Input() isAdminPreview:boolean=false;
  @Output() public clearDynamicComponent: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(DynamicSlideTypeDirective, { static: true }) appDynamicSlideType!: DynamicSlideTypeDirective;
  dynamicComponent: Type<any>;
  activeComponentReference: ComponentRef<any> | null = null;
  quizPresenterScreenManageConstant = QuizPresenterScreenManageConstant;
  selectedAnswersAudio: HTMLAudioElement= new Audio();
  constructor(
    public workSpaceService: WorkspaceService,
    private _componentFactoryResolver: ComponentFactoryResolver,) { }

  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
    if (this.appDynamicSlideType) {
      this.switchComponent(this.activeSlideTypeId);
    } else {
      console.error('DynamicSlideTypeDirective is not available.');
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if ((changes.activeSlideTypeId && changes.activeSlideTypeId.currentValue !== changes.activeSlideTypeId.previousValue) || (changes.template && changes.template.currentValue !== changes.template.previousValue) || changes.slide ||
    changes.slideDetails) {
      this.switchComponent(this.activeSlideTypeId);
   }
  //  if(changes.presentationTheme){
  //   var currentChanges = this.workSpaceService.setSlideThemes(this.workSpaceService.slideDesign);
  //   this.updatePresentationTheme(currentChanges);
  //  }

  }
  switchComponent(activeSlideTypeId: any,isRemote:boolean=false) {
    const curentSlideTypeObj = this.workSpaceService.getSlideTypeById(activeSlideTypeId) || { Name: 'Empty' };
    switch (curentSlideTypeObj.Name) {
      case MasterSlideTypeName.MULTIPLE_CHOICE_SLIDE_TYPE:
        const masterVisualizationObj = this.workSpaceService.getMasterVisualizationData(this.slideDetails?.design?.slideVisualizationId);
        switch (masterVisualizationObj?.Name) {
          case this.workSpaceService.multipleChoicesVisualizationSlideType.DONUT:
            this.dynamicComponent = MultipleDonutComponent;
            break;
          case this.workSpaceService.multipleChoicesVisualizationSlideType.PIE:
            this.dynamicComponent = MultiplePieComponent;
            break;
          case this.workSpaceService.multipleChoicesVisualizationSlideType.DOT:
            this.dynamicComponent = MultipleDotComponent;
            break;
          default:
            this.dynamicComponent = MultipleBarComponent;
        }
        break;
      case MasterSlideTypeName.WORD_CLOUD_SLIDE_TYPE:
        this.dynamicComponent = WordCloudComponent;
        break;
      case MasterSlideTypeName.OPEN_ENDED_SLIDE_TYPE:
        const openEndedVisualizationObj = this.workSpaceService.getMasterVisualizationData(this.slideDetails?.design?.slideVisualizationId);
        switch (openEndedVisualizationObj.Name) {
          case this.workSpaceService.openEndedVisualizationSlideType.SPEECH_BOBBLES:
            this.dynamicComponent = OpenEndedComponent;
            break;
          case this.workSpaceService.openEndedVisualizationSlideType.FLOWING_GRID:
            this.dynamicComponent = OpenEndedFlowingComponent;
            break;
        }
        break;
      case MasterSlideTypeName.GUESS_TEHE_NUMBER_SLIDE_TYPE:
        this.dynamicComponent = GuessTheNumberComponent;
        break;
      case MasterSlideTypeName.RANKING_SLIDE_TYPE:
        this.dynamicComponent = RankingComponent;
        break;
      case MasterSlideTypeName.SCALES_SLIDE_TYPE:
        const scalesMasterVisualizationObj = this.workSpaceService.getMasterVisualizationData(this.slideDetails?.design?.slideVisualizationId);
        if (scalesMasterVisualizationObj.Name === this.workSpaceService.scalesChoicesVisualizationSlideType.SPIDER) {
          this.dynamicComponent = ScalesComponent;
        } else {
          this.dynamicComponent = ScalesSliderComponent;
        }
        break;
      case MasterSlideTypeName.QUESTIONS_AND_ANSWER_SLIDE_TYPE:
        this.dynamicComponent = QuestionAnswersComponent;
        break;
      case MasterSlideTypeName.THIS_OR_THAT_SLIDE_TYPE:
        this.dynamicComponent = ThisOrThatComponent;
        break;
      case MasterSlideTypeName.TRUTH_OR_LIE_SLIDE_TYPE:
        this.dynamicComponent = TruthOrLieComponent;
        break;
      case MasterSlideTypeName.TRAFFIC_LIGHTS_SLIDE_TYPE:
        this.dynamicComponent = TrafficLightsComponent;
        break;
      case MasterSlideTypeName.SELECT_ANSWER_SLIDE_TYPE:
        this.dynamicComponent = SelectAnswersComponent;
        break;
      case MasterSlideTypeName.TYPE_ANSWER_SLIDE_TYPE:
        this.dynamicComponent = TypeAnswersComponent;
        break;
      case MasterSlideTypeName.GUESS_THE_NUMBER_QUIZ:
        this.dynamicComponent = GuessTheNumberQuizComponent;
        break;
      case MasterSlideTypeName.LEADER_BOARD_SLIDE_TYPE:
        if (this.template?.leaderBoard?.leaderBoardState == this.quizPresenterScreenManageConstant.QUIZ_SCORE) {
          this.dynamicComponent = LeaderBoardComponent;
        }
        else if (this.template?.leaderBoard?.leaderBoardState == this.quizPresenterScreenManageConstant.CHAMPION_SCORE) {
          this.dynamicComponent = LeaderboardChampionComponent;
        }
        else if (this.template?.leaderBoard?.leaderBoardState == this.quizPresenterScreenManageConstant.LEADING_SCORE) {
          this.dynamicComponent = LeaderBoardLeadingComponent;
        }
        break;
      case MasterSlideTypeName.ImportDocument:
        this.dynamicComponent = ImportPptComponent;
        break;
      case MasterSlideTypeName.POWER_POINT:
        this.dynamicComponent = ImportPowerpointComponent;
        break;
      case MasterSlideTypeName.GoogleSlides:
        this.dynamicComponent = ImportGoogleSlideComponent;
        break;
      case MasterSlideTypeName.INSTRUCTION_SLIDE_TYPE:
        this.dynamicComponent = InstructionComponent;
        break;
      case MasterSlideTypeName.LINEUP_SLIDE_TYPE:
        this.dynamicComponent = LineupComponent;
        break;
      case MasterSlideTypeName.MULTIMEDIA:
        this.dynamicComponent = MultimediaComponent;
        break;
      default:
        this.dynamicComponent = EmptySlideComponent;
        break;
    }
    this.loadComponent(curentSlideTypeObj.Name,isRemote);
  }
  async loadComponent(slideTypeName: any,isRemote:boolean=false) {
    this.workSpaceService.enableKeyDown(false);
    const componentFactory = this._componentFactoryResolver.resolveComponentFactory(this.dynamicComponent);
    if (this.appDynamicSlideType?.viewContainerRef) {
      await this.clearActiveComponent();
      this.appDynamicSlideType.viewContainerRef.clear();
      this.activeComponentReference = this.appDynamicSlideType.viewContainerRef.createComponent(componentFactory);
      this.workSpaceService.dynamicComponent_Clone = this.activeComponentReference;
      this.activeComponentReference.setInput("slideDetails", this.slideDetails);
      this.activeComponentReference.setInput("presentationLevelTheme", this.presentationTheme);
      this.activeComponentReference.setInput("viewfrom", this.viewfrom);
      this.activeComponentReference.setInput("presentationMode",this.isAdminPreview ? true : this.template?.presentationMode);
      switch (slideTypeName) {
        case MasterSlideTypeName.MULTIPLE_CHOICE_SLIDE_TYPE:
        case MasterSlideTypeName.WORD_CLOUD_SLIDE_TYPE:
          break;
        case MasterSlideTypeName.OPEN_ENDED_SLIDE_TYPE:
          this.activeComponentReference.setInput("presentationMode", this.isAdminPreview ? true : this.template?.presentationMode);
          this.activeComponentReference.setInput("isPreviewMode", this.template?.isPreview);
          this.activeComponentReference.setInput("isShowOptionDetails", false);
          this.activeComponentReference.setInput("screenOptions", this.screenOptions);
          break;
          case MasterSlideTypeName.THIS_OR_THAT_SLIDE_TYPE:
            this.activeComponentReference.setInput("presentationMode",this.isAdminPreview ? true : this.template?.presentationMode);
            this.activeComponentReference.setInput("screenOptions", this.screenOptions);
            break;
        case MasterSlideTypeName.RANKING_SLIDE_TYPE:
          break;
        case MasterSlideTypeName.QUESTIONS_AND_ANSWER_SLIDE_TYPE:
          this.activeComponentReference.setInput("template", this.template);
          this.activeComponentReference.setInput("isPreviewMode", this.template?.isPreview);
          break;
        case MasterSlideTypeName.GUESS_TEHE_NUMBER_SLIDE_TYPE:
          this.activeComponentReference.setInput("template", this.template);
          this.activeComponentReference.setInput("screenOptions", this.screenOptions);
          break;
        case MasterSlideTypeName.TRUTH_OR_LIE_SLIDE_TYPE:
          this.activeComponentReference.setInput("template", this.template);
          this.activeComponentReference.setInput("screenOptions", this.screenOptions);
          break;
        case MasterSlideTypeName.SELECT_ANSWER_SLIDE_TYPE:
          this.activeComponentReference.setInput("template", this.template);
          this.activeComponentReference.setInput("isPresenterEditorScreen", this.isPresenterEditorScreen);
          this.activeComponentReference.setInput("isPreview", this.isPreview);
          this.activeComponentReference.setInput("isRemote", isRemote);
          this.activeComponentReference?.instance?.clearTimerWhenDestroy();
          this.selectedAnswersAudio.pause();
          this.selectedAnswersAudio.currentTime = 0;
          this.selectedAnswersAudio.src = "";
          break;
        case MasterSlideTypeName.INSTRUCTION_SLIDE_TYPE:
          this.activeComponentReference.setInput("template", this.template);
          this.activeComponentReference.setInput("isPresenterEditorScreen",this.isPresenterEditorScreen);
          break;
        case MasterSlideTypeName.TYPE_ANSWER_SLIDE_TYPE:
          this.activeComponentReference.setInput("template", this.template);
          this.activeComponentReference.setInput("isPresenterEditorScreen", this.isPresenterEditorScreen);
          this.activeComponentReference.setInput("isPreview", this.isPreview);
          this.activeComponentReference.setInput("isRemote", isRemote);
          break;
        case MasterSlideTypeName.GUESS_THE_NUMBER_QUIZ:
          this.activeComponentReference.setInput("template", this.template);
          this.activeComponentReference.setInput("isPresenterEditorScreen", this.isPresenterEditorScreen);
          this.activeComponentReference.setInput("isPreview", this.isPreview);
          this.activeComponentReference.setInput("isRemote", isRemote);
          break;
        case MasterSlideTypeName.LINEUP_SLIDE_TYPE:
          this.activeComponentReference.setInput("template", this.template);
          this.activeComponentReference.setInput("isPresenterEditorScreen", this.isPresenterEditorScreen);
          this.activeComponentReference.setInput("isPreview", this.isPreview);
          this.activeComponentReference.setInput("isRemote", isRemote);
          break;
          case MasterSlideTypeName.TRAFFIC_LIGHTS_SLIDE_TYPE:
            this.activeComponentReference.setInput("template", this.template);
            this.activeComponentReference.setInput("isPresenterEditorScreen", this.isPresenterEditorScreen);
            this.activeComponentReference.setInput("isPreview", this.isPreview);
            break;
        case MasterSlideTypeName.LEADER_BOARD_SLIDE_TYPE:
          this.activeComponentReference.setInput("template", this.template);
          this.activeComponentReference.setInput("isPresenterEditorScreen", this.isPresenterEditorScreen);
          this.activeComponentReference.setInput("isPreview", this.isPreview);
          break;
          case MasterSlideTypeName.POWER_POINT:
            this.activeComponentReference.setInput("template", this.template);
            break;
        default:
          this.dynamicComponent = EmptySlideComponent;
          break;
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
  updateThemes(theme){
    if (theme) {
      this.activeComponentReference.instance.updateTheme(theme);
    } else {
      console.error('Theme is null or undefined.');
    }
  }
  updatePresentationTheme(theme){
    if (theme) {
      this.activeComponentReference.instance.updatePresentationTheme(theme);
    } else {
      console.error('Theme is null or undefined.');
    }
  }
  updateDynamicComponent(slideTypeId:any){
    if(slideTypeId){
    this.switchComponent(slideTypeId);
    }
    else{
      console.error('slideTypeId is null or undefined.');
    }
  }
  
}
