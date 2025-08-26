// ? Angular Imports
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { ErrorService } from 'src/app/core/Sevices/DynamicError/error.service';
// ? Custom Service Imports
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { CommanService } from 'src/app/core/Sevices/comman.service';
import { settingVariables } from 'src/app/utility/SettingVariables';
import { MasterSlideTypeName, ImageUploadeModuleName } from 'src/app/utility/constants';
import { ImageModalComponent } from 'src/app/shared/Component/image-modal/image-modal.component';
import { ToastrService } from 'ngx-toastr';
import { CustomerPlanService } from 'src/app/core/Sevices/CustomerPlan/customer-plan.service';
import { CustomerPlan } from 'src/app/core/Models/customer-plan.model';
import { PresentationThemeService } from 'src/app/core/Sevices/Presentation/presentation-theme.service';
import { Layout } from 'src/app/core/Models/layout.model';
//? Declarations
declare var $: any;
@Component({
  selector: 'app-right-side-bar',
  templateUrl: './right-side-bar.component.html',
  styleUrls: ['./right-side-bar.component.scss']
})
export class RightSideBarComponent implements OnInit {
  @Output() public slideTypeName: EventEmitter<any> = new EventEmitter<any>();
  @Output() public optionEmiter: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() public RankingEmiter: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() public TrafficlightEmiter: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() public guesstheNumberEmitter: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() public truthorLieEmitter: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() public slideThemesEmitter: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() public powerPointEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() public optionEmiterToParent: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() public ItemsRankingEmiter: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() public alignmentModeChanged = new EventEmitter<boolean>();
  @Output() public slidePresentationThemeEmitter: EventEmitter<any[]> = new EventEmitter<any[]>();
  selectedTab: string = ' ';
  TabNumber: any = 1;
  uploadTabNumber: any = 1;
  isVisible: boolean = false;
  PopSlideForDelete: any;
  top: number;
  left: number;
  presentationId: any = "";
  activeSlideId: any = "";
  slideListArray: any[] = [];
  masterSlideData:any[]=[];
  multipleChoiceVisualizationList: any[]=[];
  valuesArray: any[];
  optionTitle:any;
  options:any[];
  selectedSlideType: string;
  activeslideTypeName: any;
  masterSlideTypeName = MasterSlideTypeName;
  isErrorMarginVisible: boolean = false;
  guesstheNumberOptions: any;
  guesstheNumberResults = {
    Score: Array.from({ length: 11 }, (_, index) => ({
      x: index,
      y: 0,
      SelectedValue: 0
    })),
    ResponseCount: 0
  };
  possibleAnswers: any;
  CorrectAnswers: number;
  errorMarginValue: number;
  StartAnswer: number;
  EndAnswer: number;
  errorMarginMaxValue: number;
  nextSequenceValue: number;
  startValueGuess: number;
  addValue: number;
  subValue: number;
  endValueForGuess: number;
  settingVariable = settingVariables;
  scaleErrorForGuess: boolean = false;
  slideLayoutData: any;
  sameDimensionErrorMessage: string="";
  isMultipleSubmissionEnabled: boolean = false;
  Trafficlightcolors: string[] = [' #FF1A1A', ' #F7CD05', '#00D941'];
  selectParticipant: any;
  selectParticipantFlag: boolean= false;
  selectionsPerParticipants: any;
  EmbeddedPPTshowPopup: boolean=false;
  isInvalidLink: boolean = false;
  isPopupVisible = false;
  @ViewChild('googleslideslink') googleslidesimport: ElementRef;
  pptMaximum: boolean = false;
  multipleChoiceData: any[];
  allowAudienceView :boolean; 
  customerPlan: CustomerPlan | null = null;
  multimediaShowMoreShapes: boolean = false;
  multiMediaImages: any;
  imageUploadeModuleName = ImageUploadeModuleName;
  alignToSelection: boolean = true;
  displayPossibleAnswers: boolean = false;
  possibleAnswersText: string = '';
  private debounceTimer: any;
  constructor(
    private _CommanSerive : CommanService,
    public presentationService: PresentationService,
    private _DynamicErrorService: ErrorService,
    public workSpaceService:WorkspaceService,
    private _cdr: ChangeDetectorRef,  private renderer: Renderer2,
    private el: ElementRef,
    private _toastr: ToastrService,
    private _cutomerPlanService:CustomerPlanService,
    public presentationThemeService: PresentationThemeService) {


    this.activeSlideId = this.workSpaceService.activeSlideId;
    this.guesstheNumberOptions = this.workSpaceService.guesstheNumberoptions;
    this.guesstheNumberResults = this.workSpaceService.guessTheNumberResults;
    //this.GuesstheNumberScale(this.guesstheNumberOptions?.ScaleIncrement,this.guesstheNumberOptions?.Start,this.guesstheNumberOptions?.End);
     this.selectParticipant = this.workSpaceService.selectPerParticipantsOptions;
     this.customerPlan = this._cutomerPlanService.getCustomerPlan();
     this.multiMediaImages = {
      URL:null
     }
   }

//#region LifeCycle Hooks
  ngOnChanges() {
   // Static Music URL for Quiz Slides

  }

  ngOnInit(): void {
    $("body").tooltip({ selector: '[data-bs-toggle=tooltip]',trigger:'hover' });
    $(document).on('click', '[data-bs-toggle="tooltip"], [title]:not([data-bs-toggle="popover"])', function () {
      $(this).tooltip('hide');
    });
    this.activeslideTypeName = this.workSpaceService.activeSlideTypeName;
    this.workSpaceService.activeSlideTypeName == this.masterSlideTypeName.SELECT_ANSWER_SLIDE_TYPE ? this.slideTypeLevelFunctionality():false;
    if(this.activeslideTypeName !=""){
      this.selectTab("content");
    }
    this.selectParticipant = this.workSpaceService.selectPerParticipantsOptions;
  }

  ngDoCheck() {
  // console.log("AppComponent: DoCheck");
  }

  ngAfterContentInit() {
  // console.log("AppComponent: AfterContentInit");
  }

  ngAfterContentChecked() {
  // console.log("AppComponent:AfterContentChecked");
  this.activeslideTypeName = this.workSpaceService.activeSlideTypeName;
  if(this.activeslideTypeName == this.masterSlideTypeName.GUESS_TEHE_NUMBER_SLIDE_TYPE || this.activeslideTypeName == this.masterSlideTypeName.PICK_THE_NUMBER || this.activeslideTypeName == this.masterSlideTypeName.GUESS_THE_NUMBER_QUIZ){
    if( this.workSpaceService.guesstheNumberoptions != this.guesstheNumberOptions){
    this.updatePossibleAnswersDebounced(
      this.workSpaceService.guesstheNumberoptions.Start,
      this.workSpaceService.guesstheNumberoptions.End,
      this.workSpaceService.guesstheNumberoptions.ScaleIncrement
    );
  }
   }
  this.guesstheNumberOptions = this.workSpaceService.guesstheNumberoptions;
  this.guesstheNumberResults = this.workSpaceService.guessTheNumberResults;
  this.isMultipleSubmissionEnabled = this.workSpaceService.multibleSubmission; 
  if(this.activeslideTypeName == this.masterSlideTypeName.LEADER_BOARD_SLIDE_TYPE  && this.selectedTab == 'design' || this.activeslideTypeName == this.masterSlideTypeName.INSTRUCTION_DEFAULT_QUESTION && this.selectedTab == 'design' || this.activeslideTypeName == this.masterSlideTypeName.MULTIMEDIA && this.selectedTab == 'design'){
    this.selectTab('content');
  }
  if(this.workSpaceService.slideContentType == this.masterSlideTypeName.QUIZ || this.workSpaceService.slideContentType == this.masterSlideTypeName.IMPORT && this.TabNumber == 2){
    this.TabNumber = 1;
  }
  if(this.workSpaceService.activeSlideTypeName == this.masterSlideTypeName.SELECT_ANSWER_SLIDE_TYPE){  
  const correctAnswers = this.workSpaceService.options.filter(option => option.isCorrect === true);
  this.workSpaceService.isSelectMultipleCorrentAnswers = correctAnswers.length >= 2;
  }

  }
  
  ngAfterViewInit() {
  // console.log("AppComponent:AfterViewInit");
     if (!(this.customerPlan?.audience_response_control) &&  this.workSpaceService.slideEnableVoting) {
      this.settingsSlideEnableVoting(false);
     }
     if(this.activeslideTypeName == this.masterSlideTypeName.GUESS_TEHE_NUMBER_SLIDE_TYPE || this.activeslideTypeName == this.masterSlideTypeName.PICK_THE_NUMBER || this.activeslideTypeName == this.masterSlideTypeName.GUESS_THE_NUMBER_QUIZ){
      this.updatePossibleAnswersDebounced(
        this.guesstheNumberOptions.Start,
        this.guesstheNumberOptions.End,
        this.guesstheNumberOptions.ScaleIncrement
      );
     }
  }
  ngAfterViewChecked() {
    // console.log("AppComponent:AfterViewChecked");
    if (this.workSpaceService.isAllowedChangesforguesstheNumber) {
      const elements = this.el.nativeElement.querySelectorAll('#scalesError, #cannotSaved, #loopNotPossible, #maxReachError, #outSideTheRange,#roundedValueErrorEnd');
      elements.forEach((element: HTMLElement) => {
        this.renderer.addClass(element, 'hide');
      });
    }
    if(this.selectParticipantFlag){
      this.selectParticipant = this.workSpaceService.selectPerParticipantsOptions;
      this.selectParticipantFlag = false;
    }
  }

  ngOnDestroy() {
  //  console.log("AppComponent:OnDestroy");
  }
//#endregion LifeCycle Hooks

//#region Component Level functions
  //#region API Call
    //#region Type
      
      /**
       * * SlideTypeOptionShow
       * ? Show a slide types when i trigger the method
       * todo: We need to call this method when we click the type bar
       */
      typeOptionsShow(){
        
      }
      /**
       * * Select Slide Type
       * ? Select Particular SlideType for your slide form here
       * ! Check before select the slide all slide loaded or not
       * todo: We need to call some API calls inside the method
       */
      selectSlideTypes(){

      }
      /**
       * * UpdateSlideType
       * ? Change your slide type in right side panel (or) Update your slideType for existing slide
       * todo:After API Call we store the active slideIn LocalStroage and store the Active Slide detail in Workspace Service
       * @param slideTypeId pass new slideTypeId for update your slide type
       */
      updateSlideType(slideTypeId:any){
        if(this.workSpaceService.slideTypeId == slideTypeId){
          return;
        }
        var isNotImport = this.workSpaceService?.masterImportSlideType.findIndex(x=>x.id == slideTypeId);
        var isNotQuiz = this.workSpaceService?.masterQuizzSlideType.findIndex(x=>x.id == slideTypeId);
        var access = true;
        if(isNotImport != -1){
          if (this.workSpaceService.slideCountForImport < this.customerPlan?.import_presentations) {
            access = true;
          } else if (
            this.workSpaceService.slideCountForImport >= this.customerPlan?.import_presentations
          ) {
            if (this.workSpaceService.slideContentType == this.masterSlideTypeName.IMPORT) {
              access = true;
            } else {
              access = false;
            }
          }
        }
        if(isNotQuiz != -1){
          if(this.workSpaceService.quizSlidesCount < this.customerPlan?.quiz_per_presentation){
            access = true;
          }else{
            access = false;
          }
        }
        if(access){
          this.workSpaceService.setCenterPanelLoading(true);
          var updateSlideTypeDTO = {
            presentationId: this.workSpaceService.presentationId,
            activeSlideId:this.workSpaceService.activeSlideId,
            slideTypeId:slideTypeId,
            currentSlideTypeId:this.workSpaceService.currentMasterSlideTypeId,
            isTemplate: this.workSpaceService.isTemplate
          }
          this.presentationService.updateSlideType(updateSlideTypeDTO).subscribe(
            (response: any) => {
               this.workSpaceService.currentPresentation = response;
               this.workSpaceService.activeSlideId = response?.activeSlideId;
               this.workSpaceService.currentMasterSlideTypeId = response?.masterSlideTypeId;
               var masterSlideId = this.workSpaceService.currentPresentation.slides.find(x=>x.slideId == this.workSpaceService.activeSlideId).slideTypeId;
               this.workSpaceService.currentMasterSlideTypeId = masterSlideId;
               this.workSpaceService.assignNewValueOnStore(this.workSpaceService.currentPresentation).then(() => {
                this.workSpaceService.fontFamily = "Lexend Deca,-apple-system";
                this.workSpaceService.setCenterPanelLoading(false);
              });
            },
            (error: any) => {
              console.log(error?.error);
            }
          );
        }
        else{
          this._toastr.info("Upgrade your plan now to access more slides.", "", {
            timeOut: 3000,
          });
        }
      }
    //#endregion Type
    //#region Content
      addOrUpdateContentSection(){
        
      }
      bindContentSection(){

      }
      addOrUpdateQuestion(){
        let addorUpdateQuestionDTO = {
            presentationId: this.workSpaceService.presentationId,
            slideId: this.workSpaceService.activeSlideId,
            slideQuestion: this.workSpaceService.questions
        }
        this.presentationService.addOrUpdateQuestionDTO(addorUpdateQuestionDTO).subscribe(
          (response: any) => {
          },
          (error: any) => {
            console.log(error?.error);
          }
        );
      }
      addOrUpdateLongerDescription(){
        let addorUpdateLongerDescriptionDTO = {
          presentationId: this.workSpaceService.presentationId,
          slideId: this.workSpaceService.activeSlideId,
          slideLongerDescription: this.workSpaceService.longerDescription,
          isTemplate: this.workSpaceService.isTemplate
         }
        this.presentationService.addorUpdateLongerDescription(addorUpdateLongerDescriptionDTO).subscribe(
          (response: any) => {
          },
          (error: any) => {
            console.log(error?.error);
          }
        );
      }
      addOrUpdateOptions(OptionId:any,OptionTitle:string){
        let updateOptionDTO = {
          presentationId: this.workSpaceService.presentationId,
          slideId: this.workSpaceService.activeSlideId,
          optionId: OptionId,
          optionTitle: OptionTitle.trimStart(),
          visualizationColor : this.workSpaceService.slideVisualizationColor,
          isTemplate: this.workSpaceService.isTemplate
         }
        this.presentationService.updateOptions(updateOptionDTO).subscribe(
          (response: any) => {
            this.updateOptionTitle(OptionId, OptionTitle);
            this.optionEmiter.emit(this.workSpaceService.options);
            this.RankingEmiter.emit(this.workSpaceService.options);
            // this.TrafficlightEmiter.emit(this.workSpaceService.options);
          },
          (error: any) => {
            console.log(error?.error);
          }
        ); 
      }
      addNewOptions(){
        let addOptionDTO = {
          presentationId: this.workSpaceService.presentationId,
          slideId: this.workSpaceService.activeSlideId,
         }
        this.presentationService.addOptions(addOptionDTO).subscribe(
          (response: any) => {
            this.workSpaceService.changeDataFormat(response.slideContentData);
            this.optionEmiter.emit(this.workSpaceService.options);
            this.RankingEmiter.emit(this.workSpaceService.options);
            this.TrafficlightEmiter.emit(this.workSpaceService.options);
          },
          (error: any) => {
            console.log(error?.error);
          }
        );  
      }
      // hasOptionWithValueGreaterThanZero(): boolean {
      //   return this.workSpaceService.options.some(option => option.value > 0);
      // }
    
      onRemoveOptionClick(event: Event, optionId: string, optionValue: string): void {
        // if (!this.hasOptionWithValueGreaterThanZero() || optionValue > 0) {
        //   return;
        // }
        if(!this.workSpaceService.isVotedOnScalesResults){
          this.removeOptions(optionId);
        }
      }
      removeOptions(optionId:any){
        let deleteOptionDTO = {
          presentationId: this.workSpaceService.presentationId,
          slideId: this.workSpaceService.activeSlideId,
          optionId: optionId,
         }
        this.presentationService.deleteOptions(deleteOptionDTO).subscribe(
          (response: any) => {
            this.workSpaceService.changeDataFormat(response.slideContentData);
            this.optionEmiter.emit(this.workSpaceService.options);
            this.RankingEmiter.emit(this.workSpaceService.options);
            this.TrafficlightEmiter.emit(this.workSpaceService.options);
          },
          (error: any) => {
            console.log(error?.error);
          }
        ); 
      }
  makeCorrectOptions(optionId: any) {
    this.options.forEach(option => {
      option.isCorrect = option.OptionId === optionId;
    });

    let updateOptionDTO = {
      presentationId: this.workSpaceService.presentationId,
      slideId: this.workSpaceService.activeSlideId,
      optionId: optionId,
      optionTitle: "",
    }
    this.presentationService.updateOptionsMarkAnswers(updateOptionDTO).subscribe(
      (response: any) => {
        // this.workSpaceService.changeDataFormat(response.slideContentData);
        this.options = this.workSpaceService.options;
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }
      chooseCorrectAnswers(){
          let showChooseCorrectAnswerDTO = {
            presentationId: this.workSpaceService.presentationId,
            slideId: this.workSpaceService.activeSlideId,
            isShowChooseCorrectAnswers: this.workSpaceService.chooseCorrectAnswers,
            isTemplate: this.workSpaceService.isTemplate
           }
          this.presentationService.showChooseCorrectAnswers(showChooseCorrectAnswerDTO).subscribe(
            (response: any) => {
              this.workSpaceService.updateChoicesCorrectAnswer();
              this.workSpaceService.dynamicComponent_Clone.instance.chooseCorrectAnswers = this.workSpaceService.chooseCorrectAnswers;
              this.workSpaceService.dynamicChartResponseLoad();
            },
            (error: any) => {
              console.log(error?.error);
            }
          );
      }

      UpdateGuesstheNumber(start:any,end:any,scaleIncrement:any,correctAnswer:any,iserrorMargin:boolean,errorMargnNumber:any,ischangedstartEnd:boolean,eventType:any)
      {
        let updateguessthenumber = {
          presentationId: this.workSpaceService.presentationId,
          slideId: this.workSpaceService.activeSlideId,
          Start: start,
          End: end,
          ScaleIncrement :scaleIncrement,
          CorrectAnswer : correctAnswer,
          IsErrorMargin : iserrorMargin,
          ErrorMarginNumber : errorMargnNumber,
          IsChangedStartEnd : ischangedstartEnd,
          isTemplate: this.workSpaceService.isTemplate
         }
        this.presentationService.UpdateGuesstheNumber(updateguessthenumber).subscribe(
          (response: any) => {
            this.workSpaceService.isAllowedChangesforguesstheNumber = false;
            this.workSpaceService.changeDataFormat(response.slideContentData);
            this.guesstheNumberEmitter.emit(this.workSpaceService.guesstheNumberoptions);
          },
          (error: any) => {
            console.log(error?.error);
          }
        ); 
      }
      guesstheNumberValidation(start, end, scaleIncrement, correctAnswer, iserrorMargin, errorMargnNumber, ischangedstartEnd, event,eventType,bool?:boolean,currentvalue?:boolean) {
        if (!this.workSpaceService.isAllowedChangesforguesstheNumber) {

        var startValue = start <= 0 ? 0 : Number(start);
        var endValue = end <= 0 ? 0 : Number(end);
        var correctValue = eventType == settingVariables?.FocusEvent
        ? (correctAnswer <= 0 ? 0 : Number(correctAnswer))
        : (correctAnswer === '' ? null : (correctAnswer <= 0 ? 0 : Number(correctAnswer)));
    
       var incrementValue;
        incrementValue = Number(scaleIncrement);
        var errorMarginValue = errorMargnNumber  <= 0 ? 0 :  Number(errorMargnNumber)
        var correctValueAddorEven = correctValue % 2;
        var OprationValueAddorEven = (startValue + incrementValue) % 2;
        var termNumber = 1;
        var termIncrementValue = startValue;
        var isValidTerm = false;
        var isPossibleNumber = false;
        this.CorrectAnswers = correctValue;
        this.errorMarginValue = errorMarginValue;
        this.StartAnswer = startValue;
        this.EndAnswer = endValue;
        this.guesstheNumberOptions.CorrectAnswer = correctValue;
        this.guesstheNumberOptions.Start = startValue;
        this.guesstheNumberOptions.End = endValue;
        this.guesstheNumberOptions.ErrorMarginNumber = errorMarginValue
        this.guesstheNumberOptions.ScaleIncrement = incrementValue;
        this.errorMarginMaxValue = Math.abs(this.StartAnswer - this.EndAnswer);
        var resultsAnswersCount =(endValue-startValue) / incrementValue;
        isValidTerm = (endValue - startValue) % incrementValue === 0;
        if (!isValidTerm) {
          this.nextSequenceValue = startValue + Math.ceil((endValue - startValue) / incrementValue) * incrementValue;
          document.getElementById('roundedValueErrorEnd').classList.remove("hide");
        }
        else {
          document.getElementById('roundedValueErrorEnd').classList.add("hide");
        }
          if (correctValue !== null && correctValue !== undefined) {
            isPossibleNumber = (correctValue - startValue) % incrementValue === 0 &&
              correctValue >= startValue &&
              correctValue <= endValue;
          }
        
        if(this.CorrectAnswers >= 0){
          this.startValueGuess = this.CorrectAnswers - this.errorMarginValue;
          if (this.startValueGuess < 0) {
              this.startValueGuess = 0;
          }
              this.addValue = this.CorrectAnswers + this.errorMarginValue;
              this.subValue = this.CorrectAnswers - this.errorMarginValue;
              if (this.addValue > this.EndAnswer) {
                this.endValueForGuess = this.EndAnswer;
              } else {
                this.endValueForGuess = this.addValue;
            }
            if(this.subValue < this.StartAnswer){
              this.startValueGuess = this.CorrectAnswers - this.errorMarginValue;
            }else{
              this.startValueGuess = this.subValue;
            }
            if(this.CorrectAnswers > this.EndAnswer){
              this.endValueForGuess = this.addValue;
              this.startValueGuess = this.subValue;
            }
         this.workSpaceService.startValueGuess = this.startValueGuess;
         this.workSpaceService.endValueForGuess = this.endValueForGuess;
         this.errorMarginMaxValue = Math.abs(this.StartAnswer - this.EndAnswer);
        }
        if (startValue >= endValue) {
          document.getElementById('cannotSaved').classList.remove("hide");
          document.getElementById("maxReachError").classList.remove("hide");
          this.displayPossibleAnswers = false;
          return;
        }
        else{
          document.getElementById("maxReachError").classList.add("hide");
        }
        if((startValue <= correctValue)&&(endValue >= correctValue)){
          document.getElementById('outSideTheRange').classList.add("hide");
          //document.getElementById('scalesError').classList.add("hide");
         }
         else{
          document.getElementById('outSideTheRange').classList.remove("hide");
          //document.getElementById('scalesError').classList.remove("hide");
         }
        if (resultsAnswersCount > 100) {
          document.getElementById('cannotSaved').classList.remove("hide")
          document.getElementById('loopNotPossible').classList.remove("hide");
          //document.getElementById('scalesError').classList.remove("hide");
          this.scaleErrorForGuess = bool;
          if(this.scaleErrorForGuess){
            //document.getElementById('scalesError').classList.remove("hide");
          }
          this.displayPossibleAnswers = false;
          return;
        }
        else {
          document.getElementById('scalesError').classList.add("hide");
          document.getElementById('loopNotPossible').classList.add("hide");
        }
        if (startValue > correctValue) {
          document.getElementById('cannotSaved').classList.remove("hide");
          document.getElementById('outSideTheRange').classList.remove("hide");
          // return;
        }
        else {
          document.getElementById('cannotSaved').classList.add("hide");
          document.getElementById('outSideTheRange').classList.add("hide");
        }
        if (endValue < correctValue) {
          document.getElementById('outSideTheRange').classList.remove("hide");
          document.getElementById('cannotSaved').classList.remove("hide");
          // return;
        }
        if (!isPossibleNumber) {
          document.getElementById('scalesError').classList.remove("hide"); 
          document.getElementById('cannotSaved').classList.remove("hide");
          if((startValue <= correctValue)&&(endValue >= correctValue)){
            document.getElementById('outSideTheRange').classList.add("hide");
            document.getElementById('scalesError').classList.remove("hide"); 
           }
           else{
            document.getElementById('outSideTheRange').classList.remove("hide");
            document.getElementById('scalesError').classList.remove("hide"); 
           }
           this.displayPossibleAnswers = false;
          return;
        }
        else {
          document.getElementById('scalesError').classList.add("hide");
          document.getElementById('cannotSaved').classList.add("hide");
          this.updatePossibleAnswersDebounced(
            start,
            end,
            scaleIncrement
          );
          
          this.UpdateGuesstheNumber(start, end, scaleIncrement, correctAnswer, iserrorMargin, errorMargnNumber, ischangedstartEnd,eventType);
          this.workSpaceService.startValueGuess = this.startValueGuess;
          this.workSpaceService.endValueForGuess = this.endValueForGuess;
        }
      }
    }

    updatePossibleAnswersDebounced(start: number, end: number, increment: number) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.possibleAnswersText = this.generatePossibleAnswersPreview(start, end, increment);
        this.displayPossibleAnswers = increment <= end && start !== end;
      }, 300); 
    }
  
    generatePossibleAnswersPreview(start: number, end: number, increment: number): string {
      const count = Math.floor((end - start) / increment) + 1;
    
      if (!isFinite(start) || !isFinite(end) || !isFinite(increment) ||
          increment <= 0 || start < 0 || end < 0 || end < start) {
        return '0';
      }
    
      if (count > 10000) {
        return 'Too many values to display';
      }
    
      const first = start;
      const second = start + increment;
      const third = start + increment * 2;
      const last = end;
      const secondLast = end - increment;
    
      if (count <= 1) {
        return `${first}`;
      } else if (count === 2) {
        return `${first},${second}`;
      } else if (count <= 5) {
        // Show all if small
        return Array.from({ length: count }, (_, i) => start + i * increment).join(',');
      } else if (count > 100) {
        return `${first},${second},${third},...,${secondLast},${last}`;
      } else {
        return `${first},${second},${third},...`;
      }
    }
    
  //#region Scales
    slideScalesRangeUpdate(){
      let newDimensionList:any[]=[];
      let startValue = this.workSpaceService.scalesDimensions[0].Id;
      let endValue = this.workSpaceService.scalesDimensions[this.workSpaceService.scalesDimensions?.length - 1].Id;
      if(endValue <= 0){
        this.sameDimensionErrorMessage = this._DynamicErrorService.scalesHighValueLessThanOneError();
        return;
      }
      if (startValue != null && endValue != null) {
        let range: number[] = [];
        if(startValue == endValue){
         this.sameDimensionErrorMessage = this._DynamicErrorService.scalesSameDimensionErrorMessage(startValue,endValue);
         this.workSpaceService.scalesDimensions.splice(1, this.workSpaceService.scalesDimensions?.length-2);
         return;
        }
        else
        {
          this.sameDimensionErrorMessage = "";
          if(endValue > startValue){
            if (startValue <= endValue) {
              range = Array.from({ length: endValue - startValue + 1 }, (_, i) => i + startValue);
            } else {
              range = Array.from({ length: startValue - endValue + 1 }, (_, i) => endValue + i);
            }
            if (range.length > 11) {
              newDimensionList=[];
              this.workSpaceService.scalesDimensions.splice(1, this.workSpaceService.scalesDimensions?.length-2);
              this.slideScalesDimensionsAddorUpdate();
            } else {
              range.forEach((element: any, index: any) => {
                let newDimension = {
                  Name:index == 0 ? this.workSpaceService.scalesDimensions[index]?.Name:index+1 == range.length ? this.workSpaceService.scalesDimensions[this.workSpaceService.scalesDimensions.length - 1]?.Name:"",
                  Id: element
                }
                newDimensionList.push(newDimension);
              }
              )
              this.workSpaceService.scalesDimensions = [];
              this.workSpaceService.scalesDimensions = newDimensionList;
              this.slideScalesDimensionsAddorUpdate();
            }
          }
          else
          {
            this.sameDimensionErrorMessage = this._DynamicErrorService.scalesSameDimensionErrorMessage(endValue,startValue);
          }
        }
      }
    }
    slideScalesDimensionsAddorUpdate(){
      let scalesDimensionAddorUpdateDTO={
        presentationId: this.workSpaceService.presentationId,
        slideId:this.workSpaceService.activeSlideId,
        scalesDimensions:this.workSpaceService.scalesDimensions,
        isTemplate: this.workSpaceService.isTemplate
      }
      this.presentationService.scalesDimensionsAddorUpdate(scalesDimensionAddorUpdateDTO).subscribe(
        (response: any) => {
          this.optionEmiter.emit(this.workSpaceService.options);
        },
        (error: any) => {
          console.log(error?.error);
        }
      );
    }
    scalesSkipStatmentUpdate(){
      let scalesSkipStatementUpdateDTO = {
        presentationId: this.workSpaceService.presentationId,
        slideId: this.workSpaceService.activeSlideId,
        isSkipStatement: this.workSpaceService.scalesIsStatmentSkip,
        isTemplate: this.workSpaceService.isTemplate
      };
      this.presentationService.scaleIsSkipStatementUpdate(scalesSkipStatementUpdateDTO).subscribe(
        (response: any) => {
        },
        (error: any) => {
          console.log(error?.error);
        }
      ); 
    }
    openEndedMultibleSubmission(){
       
      let updateopenEnded = {
        presentationId: this.workSpaceService.presentationId,
        slideId: this.workSpaceService.activeSlideId,
        multibleSubmission:this.workSpaceService.multibleSubmission,
        isTemplate:this.workSpaceService.isTemplate
       }
      this.presentationService.OpenEndedMultipleSubmission(updateopenEnded).subscribe(
        (response: any) => {
          // this.workSpaceService.changeDataFormat(response.slideContentData);
          // this.guesstheNumberEmitter.emit(this.workSpaceService.guesstheNumberoptions);
        },
        (error: any) => {
          console.log(error?.error);
        }
      ); 
    }
  truthorLieCorrectOptions(optionId: any, isCorrect: boolean, option: any) {
    if (isCorrect) {
      option.isCorrect = true;
    } else {
      option.isCorrect = false;
    }
    let updateOptionDTO = {
      presentationId: this.workSpaceService.presentationId,
      slideId: this.workSpaceService.activeSlideId,
      optionId: optionId,
      optionTitle: "",
      isTemplate: this.workSpaceService.isTemplate
    }
    this.presentationService.UpdateTruthorLieMarkAnswers(updateOptionDTO).subscribe(
      (response: any) => {
        this.workSpaceService.changeDataFormat(response.slideContentData);
        this.options = this.workSpaceService.options;
        this.workSpaceService.dynamicComponent_Clone.instance.updateChart(this.workSpaceService.options);
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }
    UpdateWordParticipant(participantcount:any){ 
      let updateparticipant = {
        presentationId: this.workSpaceService.presentationId,
        slideId: this.workSpaceService.activeSlideId,
        responsePerParticipant: participantcount,
        isTemplate: this.workSpaceService.isTemplate
       }
      this.presentationService.UpdateWordCloudParticipant(updateparticipant).subscribe(
        (response: any) => {
          this.workSpaceService.changeDataFormat(response.slideContentData);
        },
        (error: any) => {
          console.log(error?.error);
        }
      ); 
    }
    ImportGoogleSlideAddOrUpdate(){
      let ImportGoogleSlidesAddorUpdateDTO={
        presentationId: this.workSpaceService.presentationId,
        slideId:this.workSpaceService.activeSlideId,
        GoogleSlidesLink:this.workSpaceService.GoogleSlidesLink
      }
      this.presentationService.ImportGoogleSlideAddOrUpdate(ImportGoogleSlidesAddorUpdateDTO).subscribe(
        (response: any) => {
        },
        (error: any) => {
          console.log(error?.error);
        }
      );
    }
  //#endregion Scales

  //#region Import Embedded Slides 
  ImportSlideMethod(){
    if(this.workSpaceService.ImportSlideNumber < 1){
      this.workSpaceService.ImportSlideNumber = this.workSpaceService.embeddedSlideIndex;
      return;
    }
    let ImportSlidesAddorUpdateDTO={
      presentationId: this.workSpaceService.presentationId,
      slideId: this.workSpaceService.activeSlideId,
      importSlideLink: this.workSpaceService.ImportSlideLink,
      importSlideNumber: this.workSpaceService.ImportSlideNumber,
      isTemplate: this.workSpaceService.isTemplate
    }
    this.presentationService.ImportSlides(ImportSlidesAddorUpdateDTO).subscribe(
      (response: any) => {
        this.workSpaceService.changeImportSlideNumberDataFormat(response.slideContentData);
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }

  openEmbeddedPPTPopup(){
    this.EmbeddedPPTshowPopup = !this.EmbeddedPPTshowPopup;
    if (!this.EmbeddedPPTshowPopup || this.workSpaceService.invalidembedLink) {
      this.validembed();
    }
  }
  closeEmbeddedPPTPopup(){
    this.EmbeddedPPTshowPopup = false;
    if (this.EmbeddedPPTshowPopup || !this.workSpaceService.invalidembedLink) {
      this.validembed();
    } else if (this.workSpaceService.invalidembedLink) {
      this.validembed();
    }
  }
  validembed(){
    if (this.workSpaceService.invalidembedLink) {
      this.workSpaceService.ImportSlideLink = "";
      this.ImportSlideMethod();
    }
  }
  nextOrPrevius(){
    this.powerPointEmitter.emit({value:this.workSpaceService.ImportSlideLink,index:this.workSpaceService.ImportSlideNumber});
  }
  EmbeddedLinkCheck(){
    const regex = /<iframe[^>]+src="([^"]+)"/;
    const source = this.workSpaceService.ImportSlideLink.match(regex);
    const link = this.workSpaceService.ImportSlideLink.startsWith('https://onedrive.live.com/embed') || 
                this.workSpaceService.ImportSlideLink.startsWith('https://1drive.live.com/embed');
    if (source) {
      const decodedLink = source[1].replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"');
      this.workSpaceService.ImportSlideLink = decodedLink;
      this.powerPointEmitter.emit({value:this.workSpaceService.ImportSlideLink,index:this.workSpaceService.ImportSlideNumber});
      this.ImportSlideMethod();
      this.EmbeddedPPTshowPopup = false;
      this.workSpaceService.invalidembedLink = false;
    } else if (link) {
      const decodedLink = this.workSpaceService.ImportSlideLink.replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"');
      this.workSpaceService.ImportSlideLink = decodedLink;
      this.powerPointEmitter.emit({value:this.workSpaceService.ImportSlideLink,index:this.workSpaceService.ImportSlideNumber});
      this.ImportSlideMethod();
      this.EmbeddedPPTshowPopup = false;
      this.workSpaceService.invalidembedLink = false;
    } else {
      this.EmbeddedPPTshowPopup = true;
      this.workSpaceService.invalidembedLink = true;
    }
  }
  //#endregion Import Embedded Slides 

  //#region Quiz Select Answer
  quizSelectAnswersSecondsToAnswersUpdate(eventType:any){
    // Handle valid range (5 to 1000)
    if (this.workSpaceService.quizSecondsToAnswers >= 5 && this.workSpaceService.quizSecondsToAnswers <= 1000) {
      this.workSpaceService.quizSecondsErrorMessage = "";
      this.saveProcedure(eventType?.type);
    }
    else {
      // Handle values greater than 1000
      if (this.workSpaceService.quizSecondsToAnswers > 1000) {
        this.workSpaceService.quizSecondsErrorMessage = this._DynamicErrorService.quizAnswersSecondsValidations(5,1000);
        const cappedValue = this.workSpaceService.quizSecondsToAnswers.toString().slice(0, 3);
        if(eventType?.type != 'keyup'){
          this.workSpaceService.quizSecondsToAnswers = Number(cappedValue) == 100 ?  1000:Number(cappedValue);
          this.workSpaceService.quizSecondsErrorMessage = "";
        }
        this.saveProcedure(eventType?.type);
      }
      else { // Handle values less than 5
        const adjustedValue = Math.max(this.workSpaceService.quizSecondsToAnswers, 5);
        this.workSpaceService.quizSecondsErrorMessage = this._DynamicErrorService.quizAnswersSecondsValidations(5,1000);
        if(eventType?.type != 'keyup'){
          this.workSpaceService.quizSecondsToAnswers = adjustedValue;
          this.workSpaceService.quizSecondsErrorMessage = "";
        }
        this.saveProcedure(eventType?.type);
      }
    }
  }
  saveProcedure(eventType) {
    if (eventType == 'keyup') {
      return;
    }
    else {
      this.updateSecondsToAnswers();
    }
  }
  updateSecondsToAnswers() {
    let updateSecondsToAnswers = {
      presentationId: this.workSpaceService.presentationId,
      slideId: this.workSpaceService.activeSlideId,
      secondsToAnswers: this.workSpaceService.quizSecondsToAnswers,
      isTemplate: this.workSpaceService.isTemplate
    }
    this.presentationService.updateSecondsToAnswers(updateSecondsToAnswers).subscribe(
      (response: any) => {
        // this.workSpaceService.changeDataFormat(response.slideContentData);
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }
  quizUpdateMorePointsForCorrectAnswersUpdate(){
    let updateMorePoints = {
      presentationId: this.workSpaceService.presentationId,
      slideId: this.workSpaceService.activeSlideId,
      morePointsCorrectAnswers: this.workSpaceService.quizMorePointsforCorrectAnswers,
      isTemplate: this.workSpaceService.isTemplate
     }
    this.presentationService.updateMorePointsForCorrectAnswers(updateMorePoints).subscribe(
      (response: any) => {
        // this.workSpaceService.changeDataFormat(response.slideContentData);
      },
      (error: any) => {
        console.log(error?.error);
      }
    ); 
  }
  quizAddLeaderBoardUpdate(){
    let updateAddLeaderBoard = {
      presentationId: this.workSpaceService.presentationId,
      slideId: this.workSpaceService.activeSlideId,
      isLeadeboard: this.workSpaceService.quizAddLeaderboard,
      isTemplate: this.workSpaceService.isTemplate,
      isLast: false,
     }
    this.presentationService.updateAddLeaderBoard(updateAddLeaderBoard).subscribe(
      (response: any) => {
        if(response){
          this.workSpaceService.currentPresentation.slides = response?.slides;
          this.workSpaceService.assignNewValueOnStore(this.workSpaceService.currentPresentation).then(() => {
          });
        }
      },
      (error: any) => {
        console.log(error?.error);
      }
    ); 
  }
  quizQuizEnableMusicUpdate(){
    if(!this.workSpaceService.quizIsEnableMusic){
      var playedSong = this.workSpaceService.selectedAnswersMusic.filter(x => x.isPlay == true);
      playedSong.forEach(element => {
        element.isPlay = false;
        this.workSpaceService.selectedAnswersEditorScreenAudio.pause();
        this.workSpaceService.selectedAnswersEditorScreenAudio.currentTime = 0;
      });
    }
    this.workSpaceService.quizMusicURL = this.workSpaceService.quizIsEnableMusic ? this.workSpaceService.selectedAnswersMusic[0]?.src : "";
    let updateQuizEnableMusic = {
      presentationId: this.workSpaceService.presentationId,
      slideId: this.workSpaceService.activeSlideId,
      EnableMusic: this.workSpaceService.quizIsEnableMusic,
      musicURL: this.workSpaceService.quizMusicURL,
      isTemplate: this.workSpaceService.isTemplate
    }
    this.presentationService.updateQuizEnableMusic(updateQuizEnableMusic).subscribe(
      (response: any) => {
        this.workSpaceService.changeDataFormat(response.slideContentData);
      },
      (error: any) => {
        console.log(error?.error);
      }
    ); 
  }
  playMusic(song: any, state: any, index: any) {
    // if State is true assiume presenter play the music
    // if State is false assiume presenter stop the music
    if (state) {
      var playedSong = this.workSpaceService.selectedAnswersMusic.filter(x => x.isPlay == true);
      playedSong.forEach(element => {
        element.isPlay = false;
        this.workSpaceService.selectedAnswersEditorScreenAudio.pause();
        this.workSpaceService.selectedAnswersEditorScreenAudio.currentTime = 0;
      });
      this.workSpaceService.selectedAnswersEditorScreenAudio = new Audio();
      this.workSpaceService.selectedAnswersEditorScreenAudio.src = song?.src;
      this.workSpaceService.selectedAnswersEditorScreenAudio.load();
      this.workSpaceService.selectedAnswersEditorScreenAudio.play();
      this.workSpaceService.selectedAnswersMusic[index].isPlay = true;
    }
    else {
      this.workSpaceService.selectedAnswersEditorScreenAudio.pause();
      this.workSpaceService.selectedAnswersEditorScreenAudio.currentTime = 0;
      this.workSpaceService.selectedAnswersMusic[index].isPlay = false;
    }

  }
  quizQuizMusicUpdate(song: any) {
    this.workSpaceService.quizMusicURL = song.src;
    let updateQuizMusic = {
      presentationId: this.workSpaceService.presentationId,
      slideId: this.workSpaceService.activeSlideId,
      MusicURL: this.workSpaceService.quizMusicURL,
      isTemplate: this.workSpaceService.isTemplate
    }
    this.presentationService.updateQuizMusic(updateQuizMusic).subscribe(
      (response: any) => {
        this.workSpaceService.changeDataFormat(response.slideContentData);
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }
  //#endregion Quiz Select Answer
    
    //#endregion Content
    //#region Design
      designSlideSelectVisualization(visualizationId:any){
        this.workSpaceService.slideVisualizationId = visualizationId;
        const foundSlide = this.workSpaceService.slideListArray.find(x => x.slideId == this.workSpaceService.activeSlideId);
        if (foundSlide) {
          this.valuesArray = [foundSlide]; 
          this.valuesArray.forEach(element => {
            this.activeSlide(element.slideId,element.slideTypeId);
          });
        }
        let applyVisualizationDTO={
          presentationId: this.workSpaceService.presentationId,
          slideId:this.workSpaceService.activeSlideId,
          visualizationId: visualizationId,
          isTemplate: this.workSpaceService.isTemplate
        }
        this.presentationService.applyVisualization(applyVisualizationDTO).subscribe(
          (response: any) => {
          },
          (error: any) => {
            console.log(error?.error);
          }
        );
      }
      presenterShowResponse() {
        let presentationDTO = {
            presentationId: this.workSpaceService.presentationId,
            slideId: this.workSpaceService.activeSlideId,
            slideShowInResults: this.workSpaceService.slideShowInResults,
            isTemplate: this.workSpaceService.isTemplate
        };
        this.presentationService.presenterShowResponse(presentationDTO).subscribe(
            (response: any) => {
                if(this.workSpaceService.presentationSettingShowResults != this.workSpaceService.slideShowInResults){
                  this.workSpaceService.presentationSettingShowResults = this.workSpaceService.slideShowInResults;
                  this.workSpaceService.currentActiveSlide.settings.showInResults = this.workSpaceService.slideShowInResults;
                }
                this.workSpaceService.dynamicChartResponseLoad();
            },
            (error: any) => {
                console.log(error?.error);
            }
        );
      }
      designSlideShowresponsePercentage(){
        let responseAsPresentageDTO={
          presentationId: this.workSpaceService.presentationId,
          slideId:this.workSpaceService.activeSlideId,
          isShowPresentage: this.workSpaceService.slideResponseAsPercentage,
          isTemplate: this.workSpaceService.isTemplate
        }
        this.presentationService.responseAsPercentage(responseAsPresentageDTO).subscribe(
          (response: any) => {
            this.workSpaceService.currentActiveSlide.design.slideResponseAsPercentage = this.workSpaceService.slideResponseAsPercentage;
            this.workSpaceService.dynamicChartResponseLoad();
          },
          (error: any) => {
            console.log(error?.error);
          }
        );
      }
      activeSlide(slideId:any, slideTypeId:any){
        this.activeSlideId = slideId;
        this.workSpaceService.currentActiveSlide.design.slideVisualizationId = this.workSpaceService.slideVisualizationId;
        this.slideTypeName.emit(slideTypeId);
      }
  designSlideSelectLayoutOptions(layoutId: any, layoutType: any) {
    if(this.workSpaceService.slideLayoutId == layoutId){
      return;
    }
    if (this.customerPlan?.quick_layouts) {
      this.workSpaceService.slideLayoutId = layoutId;
      var slideIndex = this.workSpaceService.slideListArray.findIndex(x=>x.slideId == this.workSpaceService.activeSlideId);
      this.workSpaceService.slideListArray[slideIndex].design.slideLayoutId = layoutId;
      this.slideLayoutData = this.workSpaceService.getMasterLayoutData(layoutId)
      this.workSpaceService.slideLayoutType = this.slideLayoutData.layoutType;
      let applyLayoutDTO = {
        presentationId: this.workSpaceService.presentationId,
        slideId: this.workSpaceService.activeSlideId,
        layoutId: layoutId,
        isTemplate: this.workSpaceService.isTemplate
      }
      this.presentationService.applyLayout(applyLayoutDTO).subscribe(
        (response: any) => {
          if (this.activeslideTypeName == this.masterSlideTypeName.MULTIPLE_CHOICE_SLIDE_TYPE) {
            if (layoutType == 'Default' || layoutType == 'Full Image') {
              this.workSpaceService.slideLayoutActive = false;
            } else {
              this.workSpaceService.slideLayoutActive = true;
            }
            this.workSpaceService.dynamicComponent_Clone.instance.multipleChoiceData = this.workSpaceService.options;
            this.workSpaceService.dynamicComponent_Clone.instance.updateChart(this.workSpaceService.dynamicChartData(this.workSpaceService.options));
            this.workSpaceService.dynamicComponent_Clone.instance.updateLayout(this.workSpaceService.dynamicChartData(this.workSpaceService.options),this.workSpaceService.slideLayoutActive);
          }
        },
        (error: any) => {
          console.log(error?.error);
        }
      );
    }
    else {
      return;
    }

  }
  designSlideChangeTextFamily(fontFamily: any) {
    if (this.customerPlan.custom_colours == true) {
      let newSlideThemes: any;
      this.workSpaceService.fontFamily = fontFamily;
      this.workSpaceService.slideDesign.slideTextFontFamily = fontFamily;
      this.workSpaceService.resetThemes = true;
      newSlideThemes = this.workSpaceService.setSlideThemes(this.workSpaceService.slideDesign);
      if (newSlideThemes.ThemeVisualizationColor && this.workSpaceService.options) {
        newSlideThemes.ThemeVisualizationColor = this.workSpaceService.options.map((option, index) => ({
          color: option.visualizationColor
        }));
      }  
      this.slideThemesEmitter.emit(newSlideThemes);
      this.designSlideTextDetails();
    }
    else {
      return;
    }
  }
  designSlideChangeTextFontSize(fontSize: any) {
    if (this.customerPlan.custom_colours == true) {
      this.workSpaceService.activeFontSizeButton = fontSize ? 'increase' : 'decrease';
      let newSlideThemes: any;
      this.workSpaceService.fontSize = fontSize ? this.workSpaceService.fontSize + 2 : this.workSpaceService.fontSize - 2;
      this.workSpaceService.slideDesign.slideTextFontSize = this.workSpaceService.fontSize;
      this.workSpaceService.resetThemes = true;
      newSlideThemes = this.workSpaceService.setSlideThemes(this.workSpaceService.slideDesign);
      if (newSlideThemes.ThemeVisualizationColor && this.workSpaceService.options) {
        newSlideThemes.ThemeVisualizationColor = this.workSpaceService.options.map((option, index) => ({
          color: option.visualizationColor
        }));
      }  
      this.slideThemesEmitter.emit(newSlideThemes);
      this.designSlideTextDetails();
    }
    else {
      return;
    }
  }
  designSlideChangeTextColor(textColor: any) {
    if (this.customerPlan.custom_colours == true) {
      let newSlideThemes: any;
      this.workSpaceService.slideTextColor = textColor;
      this.workSpaceService.slideDesign.slideTextColor = textColor;
      this.workSpaceService.resetThemes = true;
      newSlideThemes = this.workSpaceService.setSlideThemes(this.workSpaceService.slideDesign);
      if (newSlideThemes.ThemeVisualizationColor && this.workSpaceService.options) {
        newSlideThemes.ThemeVisualizationColor = this.workSpaceService.options.map((option, index) => ({
          color: option.visualizationColor
        }));
      }  
      this.slideThemesEmitter.emit(newSlideThemes);
      this.designSlideTextDetails();
    }
    else {
      return;
    }

  }
  designSlideChangLineColor(lineColor: any) {
    if (this.customerPlan.custom_colours == true) {
      let newSlideThemes: any;
      this.workSpaceService.slideLineColor = lineColor;
      this.workSpaceService.slideDesign.slideLineColor = lineColor;
      this.workSpaceService.resetThemes = true;
      newSlideThemes = this.workSpaceService.setSlideThemes(this.workSpaceService.slideDesign);
      if (newSlideThemes.ThemeVisualizationColor && this.workSpaceService.options) {
        newSlideThemes.ThemeVisualizationColor = this.workSpaceService.options.map((option, index) => ({
          color: option.visualizationColor
        }));
      }  
      this.slideThemesEmitter.emit(newSlideThemes);
      this.designSlideTextDetails();
    }
    else {
      return;
    }

  }
  designSlideChangebackgroundClour(backGroundColor: any) {
    if (this.customerPlan.custom_colours == true) {
      let newSlideThemes: any;
      this.workSpaceService.slideBackgroundColor = backGroundColor;
      this.workSpaceService.resetThemes = true;
      this.workSpaceService.setSlideThemes(this.workSpaceService.slideDesign);
      this.designSlideTextDetails();
    }
    else {
      return;
    }
  }
  designSlideResetThemeDefault() {
    if (this.customerPlan.custom_colours == true) {
      let presentationThemes: any;
      this.workSpaceService.resetThemes = !this.workSpaceService.resetThemes;
      this.workSpaceService.slideDesign = this.workSpaceService.currentActiveSlide.design;
      presentationThemes = this.workSpaceService.presentationTheme
      this.slideThemesEmitter.emit(presentationThemes);
      this.slideResetTheme();
    }
    else {
      return;
    }
  }
  designSlideTextOptionsBold(value: any) {
    if (this.customerPlan.custom_colours == true) {
      let newSlideThemes: any;
      this.workSpaceService.slideTextBold = value;
      this.workSpaceService.slideDesign.slideTextBold = value;
      this.workSpaceService.resetThemes = true;
      newSlideThemes = this.workSpaceService.setSlideThemes(this.workSpaceService.slideDesign);
      this.slideThemesEmitter.emit(newSlideThemes);
      this.designSlideTextDetails();
    }
    else {
      return;
    }
  }
  designSlideTextOptionsItalic(value: any) {
    if (this.customerPlan.custom_colours == true) {
      let newSlideThemes: any;
      this.workSpaceService.slideTextItalic = value;
      this.workSpaceService.resetThemes = true;
      this.workSpaceService.slideDesign.slideTextItalic = value;
      newSlideThemes = this.workSpaceService.setSlideThemes(this.workSpaceService.slideDesign);
      this.slideThemesEmitter.emit(newSlideThemes);
      this.designSlideTextDetails();
    }
    else {
      return;
    }

  }
  designSlideTextOptionsUnderLine(value: any) {
    if (this.customerPlan.custom_colours == true) {
      let newSlideThemes: any;
      this.workSpaceService.slideTextUnderLine = value;
      this.workSpaceService.resetThemes = true;
      this.workSpaceService.slideDesign.slideTextUnderLine = value;
      newSlideThemes = this.workSpaceService.setSlideThemes(this.workSpaceService.slideDesign);
      this.slideThemesEmitter.emit(newSlideThemes);
      this.designSlideTextDetails();
    }
    else {
      return;
    }

  }
  designSlideTextOptionsStrikeThrough(value: any) {
    if (this.customerPlan.custom_colours == true) {
      let newSlideThemes: any;
      this.workSpaceService.slideTextStrikeThrough = value;
      this.workSpaceService.resetThemes = true;
      this.workSpaceService.slideDesign.slideTextStrikeThrough = value;
      newSlideThemes = this.workSpaceService.setSlideThemes(this.workSpaceService.slideDesign);
      this.slideThemesEmitter.emit(newSlideThemes);
      this.designSlideTextDetails();
    }
    else {
      return;
    }
  }
  designSlideTextDetails() {
    this.workSpaceService.currentActiveSlide.design.slideResetTheme = true;
    this.workSpaceService.currentActiveSlide.design= this.workSpaceService.slideDesign;
    if (this.customerPlan.custom_colours == true) {
      let slideDesignDTO = {
        presentationId: this.workSpaceService.presentationId,
        slideId: this.workSpaceService.activeSlideId,
        slideTextBold: this.workSpaceService.slideTextBold,
        slideTextItalic: this.workSpaceService.slideTextItalic,
        slideTextUnderLine: this.workSpaceService.slideTextUnderLine,
        slideTextStrikeThrough: this.workSpaceService.slideTextStrikeThrough,
        slideTextColor: this.workSpaceService.slideTextColor,
        slideLineColor: this.workSpaceService.slideLineColor,
        slideBackgroundColor: this.workSpaceService.slideBackgroundColor,
        fontFamily: this.workSpaceService.fontFamily,
        fontSize: this.workSpaceService.fontSize,
        isTemplate: this.workSpaceService.isTemplate
        //  resetThemes :this.workSpaceService.resetThemes,
      }
      const slideSettings = {
        slideBackgroundColor: this.workSpaceService.slideBackgroundColor,
        slideLayoutId: this.workSpaceService.slideLayoutId,
        slideLineColor: this.workSpaceService.slideLineColor,
        slideResetTheme: this.workSpaceService.resetThemes,
        slideResponseAsPercentage: this.workSpaceService.slideResponseAsPercentage,
        slideTextBold: this.workSpaceService.slideTextBold,
        slideTextColor: this.workSpaceService.slideTextColor,
        slideTextFontFamily: this.workSpaceService.fontFamily,
        slideTextFontSize: this.workSpaceService.fontSize,
        slideTextItalic: this.workSpaceService.slideTextItalic,
        slideTextStrikeThrough: this.workSpaceService.slideTextStrikeThrough,
        slideTextUnderLine: this.workSpaceService.slideTextUnderLine,
        slideVisualizationId: this.workSpaceService.slideVisualizationId
      } as const;
     this.workSpaceService.slideDesign = slideSettings;
      this.presentationService.applyTextFontAndColor(slideDesignDTO).subscribe(
        (response: any) => {
          let presentationData = response['data'];
          //  this.workSpaceService.storeActiveSlideDetails(); 
          this.workSpaceService.slideListArray = presentationData?.activePresentationData?.slides.sort((a,b)=>a.index - b.index);
          let currentActiveSlide = this.workSpaceService.slideListArray?.length > 0 ? this.workSpaceService.slideListArray.find(x => x.slideId == this.workSpaceService.activeSlideId) : null;
          this.workSpaceService.SetCurrectSlideThemeValue(currentActiveSlide, presentationData);
        },
        (error: any) => {
          console.log(error?.error);
        }
      );
    }
    else {
      return;
    }

  }
      slideResetTheme(){
        this.workSpaceService.currentActiveSlide.design.slideResetTheme = false;
        this.workSpaceService.currentActiveSlide.design = this.workSpaceService.slideDesign;
        this.workSpaceService.slideTextBold = this.workSpaceService?.presentationTheme?.slideTextBold;
        this.workSpaceService.slideTextItalic = this.workSpaceService?.presentationTheme?.slideTextItalic;
        this.workSpaceService.slideTextUnderLine = this.workSpaceService?.presentationTheme?.slideTextUnderLine;
        this.workSpaceService.slideTextStrikeThrough = this.workSpaceService?.presentationTheme?.slideTextStrikeThrough;
        this.workSpaceService.slideTextColor =this.workSpaceService?.presentationTheme?.ThemeTextColor;
        this.workSpaceService.slideLineColor = this.workSpaceService?.presentationTheme?.ThemeLineColor;
        this.workSpaceService.slideBackgroundColor =this.workSpaceService?.presentationTheme?.ThemeBackgroundColor;
        this.workSpaceService.fontFamily =this.workSpaceService?.presentationTheme?.ThemeFontFamily;
        this.workSpaceService.fontSize =this.workSpaceService?.masterSlideDefaultDesing?.slideTextFontSize;
        let slideDesignDTO={
           presentationId: this.workSpaceService.presentationId,
           slideId:this.workSpaceService.activeSlideId,
           slideTextBold : this.workSpaceService?.presentationTheme?.slideTextBold,
           slideTextItalic :this.workSpaceService?.presentationTheme?.slideTextItalic,
           slideTextUnderLine :this.workSpaceService?.presentationTheme?.slideTextUnderLine,
           slideTextStrikeThrough :this.workSpaceService?.presentationTheme?.slideTextStrikeThrough,
           slideTextColor:this.workSpaceService?.presentationTheme?.ThemeTextColor,
           slideLineColor:this.workSpaceService?.presentationTheme?.ThemeLineColor,
           slideBackgroundColor:this.workSpaceService?.presentationTheme?.ThemeBackgroundColor,
           fontFamily :this.workSpaceService?.presentationTheme?.ThemeFontFamily,
           fontSize :this.workSpaceService?.masterSlideDefaultDesing?.slideTextFontSize,
           isTemplate: this.workSpaceService.isTemplate
          //  resetThemes :this.workSpaceService?.masterSlideDefaultDesing?.resetThemes,
        }
        this.presentationService.slideResetDesign(slideDesignDTO).subscribe(
          (response: any) => {
          // this.workSpaceService.storeActiveSlideDetails();
          let presentationData = response['data'];
          var currentPresentation = presentationData?.activePresentationData;
          this.workSpaceService.assignNewValueOnStore(currentPresentation);
          let currentActiveSlide = this.workSpaceService.slideListArray?.length > 0 ? this.workSpaceService.slideListArray.find(x => x.slideId == this.workSpaceService.activeSlideId) : null;
          this.workSpaceService.activeFontSizeButton =currentActiveSlide?.design?.slideTextFontSize > 20 ? 'increase' : currentActiveSlide?.design?.slideTextFontSize == 20 ? currentActiveSlide?.design?.slideResetTheme ? 'increase' : '' : 'decrease';
          this.workSpaceService.SetCurrectSlideThemeValue(currentActiveSlide,presentationData);
          this.workSpaceService.options.forEach((data, index) => {
            const themeColor = this.workSpaceService.presentationTheme.ThemeVisualizationColor[index]?.color;
          
            if (themeColor && data.visualizationColor !== themeColor && !this.workSpaceService.resetThemes) {
              data.visualizationColor = themeColor;
            }
          });
          this.multipleChoiceData = this.workSpaceService.dynamicChartData(this.workSpaceService.options);
          this.ItemsRankingEmiter.emit();
          // if(this.workSpaceService.activeSlideTypeName != this.masterSlideTypeName.GUESS_TEHE_NUMBER_SLIDE_TYPE && this.workSpaceService.activeSlideTypeName != this.masterSlideTypeName.GUESS_THE_NUMBER_QUIZ){
          //   this.workSpaceService.dynamicComponent_Clone.instance.updateChart(this.multipleChoiceData);
          // }
          this.workSpaceService.visualizationColor = true;
          },
          (error: any) => {
            console.log(error?.error);
          }
        );
      }
      selectionsPerParticipant: number = 1;
      selectMultipleOptions(selectMultipleOptions: boolean) {
          this.workSpaceService.selectMultipleOptions = selectMultipleOptions;
          if (!selectMultipleOptions) {
              this.selectionsPerParticipant = 1;
          }
          this.updateMultipleOptions();
      }
      updateSelectionsPerParticipant(event: any) {
        const value = Number(event.target.value);
        this.selectionsPerParticipants = value;
          if (this.selectionsPerParticipants > this.workSpaceService.optionslength || this.selectionsPerParticipants === 0) {
            this.selectParticipantFlag =true;
            this.workSpaceService.selectPerParticipantsOptions =  this.selectParticipant; 
          } else {
            this.selectParticipant = this.workSpaceService.selectPerParticipantsOptions
            this.updateMultipleOptions();
          }
      }
      updateMultipleOptions() {
          let selectMultipleOptionsDTO = {
              presentationId: this.workSpaceService.presentationId,
              slideId: this.workSpaceService.activeSlideId,
              selectMultipleOptions: this.workSpaceService.selectMultipleOptions,
              selectPerParticipantsOptions:  this.workSpaceService.selectPerParticipantsOptions,
              isTemplate: this.workSpaceService.isTemplate
          };
          this.presentationService.selectMultipleOptions(selectMultipleOptionsDTO).subscribe(
              (response: any) => {
              },
              (error: any) => {
                  console.log(error?.error);
              }
          );
      }
    //#endregion Design
    //#region Settings
    
      settingsSlideEnableVoting(voting:any){
        if (this.customerPlan?.audience_response_control) {
        this.workSpaceService.slideEnableVoting = voting;
        this.designSlideSettingsDetails();
      }else{
        return;
      }
    }
      settingsSlideShowOnaudiencesDevices(devices:any){
        this.workSpaceService.slideShowAudienceDevices = devices;
        this.designSlideSettingsDetails();
      }
      settingsSlideEnableLiveChat(liveChart:any){
        this.workSpaceService.slideEnableLiveChat = liveChart;
        this.designSlideSettingsDetails();
      }
      settingsSlideChoosePresentationLanguages(language:any){
        this.workSpaceService.slidePresentationLanguage = language;
        this.designSlideSettingsDetails();
      }
      designSlideSettingsDetails(){
        let applySlideSettingsDTO={
           presentationId: this.workSpaceService.presentationId,
           slideId:this.workSpaceService.activeSlideId,
           enableVoting : this.workSpaceService.slideEnableVoting,
           showAudienceDevices :this.workSpaceService.slideShowAudienceDevices,
           enableLiveChat:this.workSpaceService.slideEnableLiveChat,
           presentationLanguage:this.workSpaceService.slidePresentationLanguage,
           isTemplate: this.workSpaceService.isTemplate
        }
        this.presentationService.applySlideSettings(applySlideSettingsDTO).subscribe(
          (response: any) => {
          },
          (error: any) => {
            console.log(error?.error);
          }
        );
      }
      aboutSlide(value: any){
        this.pptMaximum = false;
        let aboutslideDTO={
          presentationId: this.workSpaceService.presentationId,
          slideId:this.workSpaceService.activeSlideId,
          aboutSlide :value,
          isTemplate: this.workSpaceService.isTemplate
       }
       this.presentationService.updateAboutSlide(aboutslideDTO).subscribe(
         (response: any) => {
          this.workSpaceService.storeActiveSlideDetails();
         },
         (error: any) => {
           console.log(error?.error);
         }
       );
      }
    //#endregion Settings
  //#endregion API Call

  //#region Without API Call
    selectTab(tabName: any) {
      if((this.activeslideTypeName === this.masterSlideTypeName.LEADER_BOARD_SLIDE_TYPE || this.activeslideTypeName === this.masterSlideTypeName.INSTRUCTION_SLIDE_TYPE || this.activeslideTypeName === this.masterSlideTypeName.INSTRUCTION_DEFAULT_QUESTION || this.activeslideTypeName === this.masterSlideTypeName.MULTIMEDIA) && tabName == 'design'){
        return
      }
      else{
        this.selectedTab = tabName;
      }
      this._CommanSerive.SetRightPanelHideShow(this.selectedTab);
    }
    selectSlideType(tabName: string) {
      this.selectedSlideType = tabName;
    }
    selectTabForDesign(Tab:any) {
      if(this.workSpaceService.slideContentType == this.masterSlideTypeName.QUIZ || this.workSpaceService.slideContentType == this.masterSlideTypeName.IMPORT || this.workSpaceService.activeSlideTypeName == this.masterSlideTypeName.MULTIMEDIA){
        this.TabNumber = 1;
      }
      else{
        this.TabNumber = Tab;
      }
    }
    selectTabForUpload(Tab:any) {
      this.uploadTabNumber = Tab;
    }
    showPopover(event) {
      this.isVisible = true;
      this.top = (event.clientY - 30);
      this.left = (event.clientX + 30);
      event.preventDefault();
      event.stopPropagation();
    }
    textAreaVisibility() {
      this.workSpaceService.textAreaVisible = !this.workSpaceService.textAreaVisible;
    }
    calculateSliderPercentage() {
      return (5);
    }
    closeContent() {
      this.selectedTab = ' '
      this._CommanSerive.SetRightPanelHideShow(this.selectedTab);
    }
    SelectLayoutImage(Type:any){
      this._CommanSerive.SetSelectLayoutImage(Type);
    }
    slideTypeLevelFunctionality()
    {
      this.workSpaceService.selectedAnswersMusic = this._CommanSerive.getSelectedAnswersMusic();
      this.workSpaceService.correctOptionValidations();
    }
    //#endregion guessthenumber
  //   GuesstheNumberScale(value: any,start:any,end:any): any{
  //     var resultSequence = [];
  //   var result;
  //   var resultsAnswersCount =(end-start) / value;
  //   for (let i = start; i <= end; i += value) {
  //     resultSequence.push(i);
  //   }
  //   if(value == end){
  //     if( resultSequence.length == 1 ){
  //       result = resultSequence[0];
  //     }else{
  //       result = resultSequence[0]+','+resultSequence[1];
  //     }
  //   }else if(resultsAnswersCount > 100){
  //     result = resultSequence[0]+','+resultSequence[1]+','+resultSequence[2]+"..."+resultSequence[resultSequence?.length-2]+','+[resultSequence[resultSequence?.length-1]];
  //   }
  //   else{
  //     if( resultSequence.length == 1 ){
  //       result = resultSequence[0];
  //     }else if(resultSequence.length == 2){
  //       result = resultSequence[0]+','+resultSequence[1];
  //     }else{
  //       result = resultSequence[0]+','+resultSequence[1]+','+resultSequence[2]+"...";
  //     }
  //   }
  //   this.possibleAnswers = result;
  //   return result;
    
  // }
  GuesstheNumberScale(value: number, start: number, end: number): string {
    let result = "";

    if (start === end) {
      result = `${start}`;
    } else if (start > end) {
      result = `${start}`;
    } else if (value > end) {
      result = `${start}`;
    } else {
      const resultsAnswersCount = Math.floor((end - start) / value);

      if (resultsAnswersCount > 100) {
        result = `${start},${start + value},${start + 2 * value}...${end - 2 * value},${end - value},${end}`;
      } else {
        const resultSequence = [];
        for (let i = start; i <= end; i += value) {
          resultSequence.push(i);
        }
        result = resultSequence.join(",");
      }
    }

    this.possibleAnswers = result;
    return result;
  }
  updateOptionsOnChart(){
     this.optionEmiter.emit(this.workSpaceService.options);
  }
  applyThemeToChart(data:any){
     this.slidePresentationThemeEmitter.emit(data);
  }
  
    
  //#endregion Without API Call

//#endregion Component Level functions

//#region Common Methods
  @HostListener('document:click', ['$event'])

  RightSideBar(event: MouseEvent) {
    if (!(event.target instanceof HTMLElement) || !event.target.closest('button')) {
      this.isVisible = false;
    }

  }
  isFocused(input: any): boolean {
    return input === document.activeElement;
  }
  validateAndSetEndNumber(field: 'Start' | 'End' |'Correct',NumberInput, event) {
    let value = NumberInput.value;
    if (/^0+$/.test(value)) {
      value = '0';
    }
    this.guesstheNumberOptions[field] = value;
    // NumberInput.reset(value);
  }
  
  isDisabled(masterLayout: any): boolean {
    return (masterLayout?.layoutType == 'Image bottom' || masterLayout?.layoutType == 'Image top') || (masterLayout?.layoutType == 'Side by side right' || masterLayout?.layoutType == 'Side by side left') && this.activeslideTypeName == this.masterSlideTypeName.OPEN_ENDED_SLIDE_TYPE ||  (masterLayout?.layoutType == 'Image bottom' || masterLayout?.layoutType == 'Image top') || (masterLayout?.layoutType == 'Default' || masterLayout?.layoutType == 'Image left' || masterLayout?.layoutType == 'Image right')  && this.activeslideTypeName == this.masterSlideTypeName.ImportDocument;
}

getPlaceholder(idx: number): string {
  const placeholders = ["Red", "Yellow", "Green"];
  return placeholders[idx] || "Default placeholder";
}

ChangeParticipantcount(value: any): void {
  value = parseInt(value, 10);
  if (isNaN(value) || value < 1 || value > 10) {
      this.workSpaceService.responsePerParticipant = 1;
  } else {
      this.workSpaceService.responsePerParticipant = value;
  }
  this.UpdateWordParticipant(this.workSpaceService.responsePerParticipant);
}

DecimalPointRestrict(event: any): void {
  let value = event.target.value;
  if (value.includes('.')) {
      value = value.split('.')[0];
      this.workSpaceService.responsePerParticipant = parseInt(value, 10);
      event.target.value = value;
      this.UpdateWordParticipant(this.workSpaceService.responsePerParticipant);
  }
}
getAboutSlide(slide: any): string | null {
  const contentData = slide.slideContentData.find((data: any) => data.name === 'contentData');
  if (contentData && Array.isArray(contentData.value)) {
    const imageData = contentData.value.find((item: any) => item.name === 'aboutSlide');
    if (imageData) {
      return imageData.value;
    }
  }
  return null;
}
OnlyQAEnableQuestion(isBool:boolean) {
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
openPopup() {
  this.isPopupVisible = !this.isPopupVisible;
}
togglePopup() {
  if (this.workSpaceService.isInvalidLink) {
    this.googleslidesimport.nativeElement.value = '';
  }
  this.isPopupVisible = !this.isPopupVisible;
}
closePopup() {
  if (this.workSpaceService.isInvalidLink) {
    this.googleslidesimport.nativeElement.value = '';
  }
  this.isPopupVisible = false;
  // this.myForm.reset();
}
@HostListener('document:click', ['$event'])
  handleClick(event: Event) {
    const targetElement = event.target as HTMLElement;
    // if (this.isClickInsidePopup(event)) {
    //   return;
    // }
    if (this.isPopupVisible) {
      this.closePopup();
    }
    if (this.EmbeddedPPTshowPopup) {
      this.closeEmbeddedPPTPopup();
    }
    if (targetElement.classList.contains('gslides')) {
      this.openPopup();
      // this.openPowerPointPopup();
    }
    if (targetElement.classList.contains('pptslides')) {
      this.openEmbeddedPPTPopup();
    }
  }
  googleslideslinkvalidate(e) {
    const trimmedValue = e.value.trim();
    if (trimmedValue !== '') {
      if (trimmedValue.startsWith('https://docs.google.com/presentation/d/')) {
        this.workSpaceService.ImportSlideLink = trimmedValue.replace('/pub?', '/embed?');
        this.powerPointEmitter.emit({value:this.workSpaceService.ImportSlideLink,index:this.workSpaceService.ImportSlideNumber});
        this.isPopupVisible = false;
        this.workSpaceService.isInvalidLink = false;
        this.workSpaceService.dynamicComponent_Clone.instance.isInvalidLink = false;
      } else {
        this.isPopupVisible = true;
        this.workSpaceService.isInvalidLink = true;
        this.workSpaceService.ImportSlideLink = '';
        this.workSpaceService.dynamicComponent_Clone.instance.isInvalidLink = true;
      }
    }
  }
  onMaximumError(){
    this.pptMaximum = true;
  }
  allowOtherAudienceQuestionsToView(){
    if(this.workSpaceService.IsAllowOtherAudienceQuestionsToView == true){
      var payload = {
        presentationId : this.workSpaceService.presentationId,
        IsAllowQuestion : false,
        isTemplate: this.workSpaceService.isTemplate
      };
      this.presentationService.AllowOtherAudienceQuestionsToView(payload).subscribe( 
        (response: any) => {
          this.workSpaceService.IsAllowOtherAudienceQuestionsToView = response?.isAllowOtherAudienceQuestionsToView;
      });
    }else{
      var payload = {
        presentationId :this.workSpaceService.presentationId,
        IsAllowQuestion : true,
        isTemplate: this.workSpaceService.isTemplate
      };
      this.presentationService.AllowOtherAudienceQuestionsToView(payload).subscribe( 
        (response: any) => {
          this.workSpaceService.IsAllowOtherAudienceQuestionsToView = response?.isAllowOtherAudienceQuestionsToView;
      });
    }
  }
  TrafficLightClearDefaultValue(option: any) {
    const defaultValues = ["green", "yellow", "red"];
    if (defaultValues.includes(option.OptionTitle.trim().toLowerCase())) {
      option.originalValue = option.OptionTitle;
      option.OptionTitle = "";
    }
  }
  
  TrafficLightRestoreDefaultValue(option: any) {
    const defaultValues = ["green", "yellow", "red"];
    
    if (!option.OptionTitle.trim()) {
      option.OptionTitle = option.originalValue || "";
    }
  }
  confirmDeleteTheme() {
    this.presentationThemeService.deleteTheme(this.presentationThemeService.customeThemeId).then((response: any) => {
      if (response) {
        $("#deleteCustomeTheme").modal("hide");
        var customeThemes = this.presentationThemeService.customerThemes.filter(x => x.id != this.presentationThemeService.customeThemeId);
        this.presentationThemeService.customerThemes = [];
        this.presentationThemeService.customerThemes = customeThemes;
        this._toastr.success("Your theme has been deleted.","",{
          timeOut: 3000,
        })
      } else {
        console.error('Error: No response received'); // Log error if no response received
      }
    }).catch(error => {
      this._toastr.warning("Error:", error, {
        timeOut: 3000,
      });
    });
  }
  onBackgroundOpacityUpdate(backgroundColorOpacity: number) {
    this.workSpaceService.slideImageopacityAsPercentage = (backgroundColorOpacity * 100).toFixed(0);
    var opacityDTO={
      presentationId:this.workSpaceService.presentationId,
      SlideId:this.workSpaceService.activeSlideId,
      Opacity:backgroundColorOpacity,
      isTemplate: this.workSpaceService.isTemplate
    }
    this.workSpaceService.slideLayoutImageOpacity = backgroundColorOpacity;
    this.presentationService.contentImageBackgroundImageOpacity(opacityDTO).subscribe((response: any) => {
      
    }),
    ((error: any) => {
      console.error('Error updating background opacity:', error);
    });
  }
  changesBackgroundOpacity(backgroundColorOpacity: number) {
    this.workSpaceService.slideImageopacityAsPercentage = (backgroundColorOpacity * 100).toFixed(0);
    var index = this.workSpaceService.slideListArray.findIndex(x=>x.slideId == this.workSpaceService.activeSlideId);
    if (index != -1) {
      this.workSpaceService.slideListArray[index].contentImage.backgroundImageOpacity = backgroundColorOpacity
    }
    else {
      console.log("slide not found")
    }
  }
  
  //#region Multimedia Methods
  sendAction(action: string) {
    const alignmentActions = [
      'alignMiddle',
      'alignTop',
      'alignBottom',
      'distributeHorizontally',
      'distributeVertically',
      'alignLeft',
      'alignRight',
      'alignCenter'
    ];
    
    if (alignmentActions.includes(action) && this.workSpaceService.multimediaAlighment) {
      return;
    }
    
    let obj = {
      type:action
    }
    this.workSpaceService.triggerAction(obj);
  }
  toggleShapes() {
    this.multimediaShowMoreShapes = !this.multimediaShowMoreShapes;
  }

  multimediaImageUpload(data:any){
    let obj = {
      type:'addImageUrl',
      imageUrl: data.imageUrl
    }
    this.workSpaceService.triggerMultimediaImageAction(obj);
  }
  //#endregion

  updateOptionTitle(optionIdToUpdate: string, newTitle: string) {
    // Find the contentData array in slideContentData
    const contentData = this.workSpaceService.currentActiveSlide.slideContentData.find(
      item => item.name === 'contentData'
    );
  
    if (contentData) {
      // Find the Options object in the value array
      const options = contentData.value.find(
        item => item.name === 'Options'
      );
  
      if (options && options.value) {
        // Find and update the OptionTitle for the specific option
        options.value.forEach(option => {
          const optionId = option.find(item => item.name === 'OptionId')?.value;
          if (optionId === optionIdToUpdate) {
            const optionTitle = option.find(item => item.name === 'OptionTitle');
            if (optionTitle) {
              optionTitle.value = newTitle;
            }
          }
        });
      }
    }
  }
  preventMinus(event: KeyboardEvent) {
    if (event.key === '-' || event.keyCode === 189 || event.key === '.') {
      event.preventDefault();
    }
  }
  
}