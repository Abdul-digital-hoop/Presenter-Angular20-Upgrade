// * angular Import
import { Component, ElementRef, OnInit, HostListener, ViewChild, ComponentFactoryResolver, ComponentRef, Type } from '@angular/core';
// * Service Import
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { CommanService } from 'src/app/core/Sevices/comman.service';
import { DynamicComponentDirective } from '../Common/dynamic-component.directive';
import { MasterSlideTypeName} from 'src/app/utility/constants';
import { Subject, debounceTime } from 'rxjs';
import { DynamicSlideTypeDirective } from 'src/app/shared/directive/dynamic-slide-type.directive';
import { DynamicSlideTypeComponent } from 'src/app/shared/Component/dynamic-slide-type/dynamic-slide-type.component';

@Component({
    selector: 'app-center-panel',
    templateUrl: './center-panel.component.html',
    styleUrls: ['./center-panel.component.scss'],
    standalone: false
})
export class CenterPanelComponent implements OnInit {
  @ViewChild('CenterPanel', {static: true}) CenterPanel: ElementRef;
  @ViewChild('InnerScreen', {static: true}) InnerScreen: ElementRef;
  @ViewChild('OuterScreen', {static: true}) OuterScreen: ElementRef;
  @ViewChild('dynamicComponentSession') public dynamicComponentSession: ElementRef;
  @ViewChild(DynamicSlideTypeDirective, { static: true }) appDynamicComponent!: DynamicSlideTypeDirective;
  @ViewChild('dynamicSlideComponent') dynamicSlideComponent!: DynamicSlideTypeComponent;
  dynamicComponent: Type<any>;
  activeslideTypeName: any;
  masterSlideTypeName = MasterSlideTypeName;
  activeComponentReference: ComponentRef<any> | null = null;
  isSpeakerNoteShow: boolean = false;
  imageType: any;
  panelWidth : any;
  panelHeight : any;
  private viewChecked$ = new Subject<void>();
  private viewCheckedSub = this.viewChecked$.pipe(debounceTime(50)).subscribe(() => this.handleViewChecked());
  ContrastColor: any;
  activePptImage: boolean = false;
  slidePdfImage: any;
  showPdf: boolean = false;
  @ViewChild('slideImage') slideImage: ElementRef<HTMLImageElement>;
  logoPositionType: string;
  imageWidth: number = 0;
  imageHeight: number = 0;
  centerPanelLoading: boolean = false;
  constructor(
    private _componentFactoryResolver:ComponentFactoryResolver,
    private _commonService : CommanService,
    public workSpaceService:WorkspaceService,
    public presentationService: PresentationService,
    ) 
    { 
      this.workSpaceService.currentMasterSlideTypeId = localStorage.getItem('masterSlideTypeId');
      this.workSpaceService.slideVisualizationId = localStorage.getItem('slideVisualizationId');
      this.assignCenterPanelLoading();
    }
    ngOnChanges() {
      //console.log("AppComponent: OnChanges");
    }

    ngOnInit(): void {
      this.imageType = this.workSpaceService.slideLayoutType;
      this.activeslideTypeName = this.workSpaceService.activeSlideTypeName;
      this.setScaleForLayout();
      this.initialScreenSizeSet();
      this.disableDragAndDrop();
      this.checkImagePositionType();
      
    }

    ngDoCheck(){
      this.setScaleForLayout();
    }

    ngAfterContentInit() {
      this.setScaleForLayout();
    // console.log("AppComponent: AfterContentInit");
    }
    checkImagePositionType(){
      if(this.workSpaceService.presentationTheme?.ThemeLogo?.logoCroppedUrl != null || this.workSpaceService.presentationTheme?.ThemeLogo?.logoCroppedUrl != ""){
       this.logoPositionType =  this.workSpaceService.checkOrientation(this.workSpaceService.presentationTheme?.ThemeLogo?.croppedposition);
      }
      
    }
    ngAfterContentChecked() {
      if(this.activeslideTypeName === "Import Document"){
          // this.imageType = 'Full Image';
      }
      this.activeslideTypeName = this.workSpaceService.activeSlideTypeName;
      // this.switchComponent(this.workSpaceService.currentMasterSlideTypeId);
    // console.log("AppComponent:AfterContentChecked");
    this.loadBGLayout();
    }

    ngAfterViewInit() {
      
    }

    ngAfterViewChecked() {
      this.ContrastColor = this._commonService.getContrastColor(this.workSpaceService?.slideDesign?.slideBackgroundColor);
      this.viewChecked$.next();
    }

   

    handleViewChecked() {
      // if(this.dynamicComponent == MultipleDotComponent){
      //   this.workSpaceService.dynamicComponent_Clone.instance.multipleChoiceData = this.workSpaceService.options;
      //   this.workSpaceService.dynamicComponent_Clone.instance.updateChart(this.workSpaceService.dynamicChartData(this.workSpaceService.options));
      // }
    
    }
    ngOnDestroy() {
      this.viewCheckedSub.unsubscribe();
      this.enableDragAndDrop();
    //  console.log("AppComponent:OnDestroy");
    }
//#endregion LifeCycle Hooks

//#region Component Level functions
  //#region API Call
    /**
     * * SpeakerNoteUpdate
     * ? Update the Speaker Note in the text area field based on slide level. The API call trigger is focusout on the text area.
     */
    presentationSpeakerNoteUpdate(){
      let speakerNoteDTO = {
        presentationId:this.workSpaceService.presentationId,
        slideId:this.workSpaceService.activeSlideId,
        speakerNote:this.workSpaceService.presentationSpeakerNotes,
        isTemplate: this.workSpaceService.isTemplate
       }
      this.presentationService.updatePresentationSpeakerNote(speakerNoteDTO).subscribe(
        (response: any) => {
        },
        (error: any) => {
          console.log(error?.error);
        }
      ); 
    }
  //#endregion API Call

  //#region Without API Call
    // Speaker Notes Visibality
      /**
       *  * ToggleTextarea
       *  ? Speaker Notes Text area box hide and show when i trigger the method
       *  todo:Trigger setScaleForLayout method for center panel layout adjustment
       */
      toggleTextarea() {
        this.isSpeakerNoteShow = !this.isSpeakerNoteShow;
        // Center Panel Layout Calculation
        this.setScaleForLayout();
      }
      /**
       *  * setScaleForLayout
       *  ? Center Panel Layout Calculation for difference senarios
       *  todo: This method calculates center panel caclulation when the page is resized; the right bar and speaker notes hide and show cases.
       */
      setScaleForLayout() {
        const CENTERSCREENELEMENT = this.CenterPanel.nativeElement;
        const WIDTH = CENTERSCREENELEMENT.offsetWidth;
        const HEIGHT = CENTERSCREENELEMENT.offsetHeight;
        const INNERSCREENELEMENT = this.InnerScreen.nativeElement;
        var innerWidth = INNERSCREENELEMENT.offsetWidth;
        const INNERHEIGHT = INNERSCREENELEMENT.offsetHeight;
        var ratio = innerWidth/INNERHEIGHT;
        if(ratio > 1.7){
          innerWidth =  INNERHEIGHT * 1.777;
          INNERSCREENELEMENT.style.width = innerWidth;
        }
        var scale = Math.min(WIDTH/innerWidth, HEIGHT/INNERHEIGHT);
        if(scale > 1){
          scale =innerWidth/INNERHEIGHT;
          if(scale > 1){
            scale =1;
          }
        }
        INNERSCREENELEMENT.style.scale= scale;
        INNERSCREENELEMENT.style.width = innerWidth * scale;
        INNERSCREENELEMENT.style.height = INNERHEIGHT * scale;
        const OuterElement = this.OuterScreen.nativeElement;
        OuterElement.style.width = innerWidth * scale;
        OuterElement.style.height = INNERHEIGHT * scale;
      }
       /**
       *  * setScaleForLayout
       *  ? Center Panel Layout calculat set for Initial page landing
       *  todo: This method calculates center panel caclulation when the page is resized; the right bar and speaker notes hide and show cases.
       */
      initialScreenSizeSet(){
        const CenterScreenElement = this.CenterPanel.nativeElement;
        const width = CenterScreenElement.offsetWidth;
        const height = CenterScreenElement.offsetHeight;
        if(width > 767){
          this.panelWidth =  height * 1.555 + 'px';
          this.panelHeight =  (height * 1.777) / 1.777 + 'px';
        }else{
          this.panelWidth =  890 + 'px';
          this.panelHeight =  500 + 'px';
        }
      }
     /**
       *  * loadBGLayout
       *  ? Load background Image
       */
      loadBGLayout(){
        // if(this.activeslideTypeName === "Import Document" && this.workSpaceService.isPdf === false ){
        //   this.imageType == 'Full Image'
        //   const pptImage = this.workSpaceService.slidePptImage;
        //   this.showPdf = false;
        //   this.activePptImage = true;
        //   return {
        //     backgroundImage: `url(${pptImage})`,
        //   };
        // }
   if(this.activeslideTypeName === "Import Document"){
          this.activePptImage = true;
          this.showPdf = true;
          this.slidePdfImage = (this.workSpaceService.slidePptImage);
          this.imageType ='Default';
          if(this.slideImage && this.slideImage.nativeElement) {
            const image = this.slideImage.nativeElement;
            if (image.naturalWidth > image.naturalHeight) {
              this.imageWidth = image.naturalWidth;
              this.imageHeight = image.naturalHeight;
            }
          }
        }
        else{
          this.activePptImage = false;
          this.showPdf = false;
          var defaultImageUrl = "/assets/images/static_bg_image.svg";
          var fullImageUrl = this.workSpaceService.slideLayoutImage;
          if(this.workSpaceService.activeSlideId ===''){
            this.imageType ='Default';
            this.workSpaceService.slideLayoutType = this.imageType;
          }
          else{
            this.imageType = this.workSpaceService.slideLayoutType;
          }
          const finalImageUrl = fullImageUrl || defaultImageUrl;
          return {
            backgroundImage: `url(${finalImageUrl})`,
          };
        }

      }
    async loadComponent() {
      this.workSpaceService.enableKeyDown(true);
      const componentFactory = this._componentFactoryResolver.resolveComponentFactory(this.dynamicComponent);
      if (this.appDynamicComponent?.viewContainerRef) {
        await this.clearActiveComponent();
        this.appDynamicComponent.viewContainerRef.clear();
        this.activeComponentReference = this.appDynamicComponent.viewContainerRef.createComponent(componentFactory);
        this.workSpaceService.dynamicComponent_Clone = this.activeComponentReference;
        if(this.workSpaceService.slideDesign.slideResetTheme){
          let updatedThemes = this.workSpaceService.setSlideThemes(this.workSpaceService.slideDesign);
          this.themesDataPassToDynamicComponent(updatedThemes);
          this.ContrastColor = this._commonService.getContrastColor(this.workSpaceService?.slideDesign?.slideBackgroundColor);
        }
        else{
          this.themesDataPassToDynamicComponent(this.workSpaceService.presentationTheme);
          this.ContrastColor = this._commonService.getContrastColor(this.workSpaceService?.slideDesign?.slideBackgroundColor);
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
    removeComponent(){
      this.appDynamicComponent?.viewContainerRef?.clear();
      this.dynamicComponent = null;
      this.activeComponentReference = null;
      this.workSpaceService.dynamicComponent_Clone = null;
      this.workSpaceService.clearLocalStorageData();
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
      //       const openEndedVisualizationObj = this.workSpaceService.getMasterVisualizationData(this.workSpaceService.slideVisualizationId);
      //       switch (openEndedVisualizationObj.Name) {
      //         case this.workSpaceService.openEndedVisualizationSlideType.SPEECH_BOBBLES:
      //           this.dynamicComponent = OpenEndedComponent;
      //           break;
      //         case this.workSpaceService.openEndedVisualizationSlideType.FLOWING_GRID:
      //           this.dynamicComponent = OpenEndedFlowingComponent;
      //           break;
      //       }
      //       // this.dynamicComponent = OpenEndedComponent;
      //       break;
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
      //   case MasterSlideTypeName.LEADER_BOARD_SLIDE_TYPE:
      //     this.dynamicComponent = LeaderBoardComponent
      //     break;
      //     case MasterSlideTypeName.ImportDocument:
      //       this.dynamicComponent = ImportPptComponent
      //       break;
      //   case MasterSlideTypeName.GoogleSlides:
      //     this.dynamicComponent = ImportGoogleSlideComponent
      //     break;
      //   case MasterSlideTypeName.POWER_POINT:
      //     this.dynamicComponent = ImportPowerpointComponent
      //     break;
      //   case MasterSlideTypeName.INSTRUCTION_SLIDE_TYPE:
      //     this.dynamicComponent = InstructionComponent
      //     break;
      //   case MasterSlideTypeName.GUESS_THE_NUMBER_QUIZ:
      //     this.dynamicComponent = GuessTheNumberQuizComponent
      //     break;
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
  optionsDataPassToDynamicComponent(value: any) {
    this.workSpaceService.dynamicComponent_Clone.instance.multipleChoiceData = value;
    if (this.workSpaceService.activeSlideTypeName == this.masterSlideTypeName.SCALES_SLIDE_TYPE) {
      this.workSpaceService.dynamicComponent_Clone.instance.updateChart(value, this.workSpaceService.scalesResult, this.workSpaceService.scalesDimensions);
      return;
    }
    if (this.workSpaceService.activeSlideTypeName == this.masterSlideTypeName.TRUTH_OR_LIE_SLIDE_TYPE) {
      this.workSpaceService.dynamicComponent_Clone.instance.updateChart(value);
      return;
    }
    if (this.workSpaceService.activeSlideTypeName == this.masterSlideTypeName.THIS_OR_THAT_SLIDE_TYPE) {
      this.workSpaceService.dynamicComponent_Clone.instance.updateChart(value);
      return;
    }
    this.workSpaceService.dynamicComponent_Clone.instance.updateChart(this.workSpaceService.dynamicChartData(value));
  }
    rankingoptionsDataPassToDynamicComponent(value:any){
      this.activeComponentReference.instance.rankingOptionData = value;
      this.activeComponentReference.instance.updateChart(value);
    }
    guesstheNumberDataPasstoDynamic(value:any){
      this.workSpaceService.dynamicComponent_Clone.instance.updateChart(this.workSpaceService.dynamicGuesstheNumberData(value),this.workSpaceService.guessTheNumberResults);
    }
    EmbeddedPPTDataPasstoDynamic(data:any){
      this.workSpaceService.dynamicComponent_Clone.instance.EmbeddedPPTData = data?.value;
      this.workSpaceService.dynamicComponent_Clone.instance.updateChart(data?.value,data?.index);
    }
    truthorLieDataPasstoDynamic(value:any){
      this.workSpaceService.dynamicComponent_Clone.instance.updateChart(this.workSpaceService.dynamicChartData(value));
    }
    trafficlightDynamicComponent(value:any){
      this.workSpaceService.dynamicComponent_Clone.instance.trafficLightOptions = value;
      this.workSpaceService.dynamicComponent_Clone.instance.updateChart(this.workSpaceService.dynamicChartData(value));
    }
    themesDataPassToDynamicComponent(data:any){
      this.workSpaceService.dynamicComponent_Clone.instance.updateTheme(data);
    }
  //#endregion Without API Call

//#endregion Component Level functions

//#region Common Methods
/**
 * * PageResize
 * ?  Center Panel Layout calculat when resize the screen
 */
  @HostListener('window:resize')
  onResize() {
    this.setScaleForLayout();
  }

  calculateFontSize(text: string): string {
    const length = text ? text.length : 0;
      if (length > 100) {
        return '16px';
      } else if (length >= 50 && length <= 100) {
        return '18px';
      } else {
        return '20px';
      }
  }
  updateReactionsToChild(reactions){
    this.workSpaceService.presentationSettingActiveReactions =[];
    this.workSpaceService.presentationSettingActiveReactions = reactions.filter(x => x.isShowReaction == true);
  }
//#endregion Common Metods

assignCenterPanelLoading(){
this.workSpaceService.centerPanelLoadingSubject$.subscribe(isLoading => {
  this.centerPanelLoading = isLoading;
});
}

disableDragAndDrop(): void {
  document.addEventListener('dragover', this.preventDefault, false);
  document.addEventListener('drop', this.preventDefault, false);
}

enableDragAndDrop(): void {
  document.removeEventListener('dragover', this.preventDefault, false);
  document.removeEventListener('drop', this.preventDefault, false);
}

preventDefault(event: Event): void {
  event.preventDefault();
}
get imageOrientationClass(): string {
  if (this.slidePdfImage) {
    const img = new Image();
    img.src = this.slidePdfImage;
    if (img.naturalWidth > img.naturalHeight) {
      return 'landscape';
    } else {
      return 'portrait';
    }
  }
  return 'landscape';
}
checkImageOrientation(event: Event): void {
  const image = event.target as HTMLImageElement;
  if (image.naturalWidth > image.naturalHeight) {
    this.imageWidth = image.naturalWidth;
    this.imageHeight = image.naturalHeight;
  }
}

  updateTheme(newTheme: any) {
    this.dynamicSlideComponent?.updateThemes(newTheme);
  }
  updatePresentationTheme(newTheme: any) {
    this.dynamicSlideComponent?.updatePresentationTheme(newTheme);
  }
  updateDynamicComponent(slideTypeId: any) {
    this.dynamicSlideComponent?.updateDynamicComponent(slideTypeId);
  }
}