//? Anguar import
import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { MasterLayout, MasterVisualization, Options, Reactions, SlideDefaultDesing, SlideType } from 'src/app/utility/MasterConstants';
import { AssetsNewIconURL, MasterSlideTypeName, MultipleChoicesVisualizationSlideType, OpenEndedVisualizationSlideType, OptionsName, QuizPresenterScreenManageConstant, ScalesVisualizationSlideType, SlideTypeContent, VisualizationSlideType } from 'src/app/utility/constants';
//? Enviornment Import
import { environment } from 'src/environments/environment';
import { WorkSignalRServiceService } from './work-signal-rservice.service';
import { ToastrService } from 'ngx-toastr';
import { ScalesSlideTypeErrorMessage, SelectAnswerSlideTypeErrorMessage, TypeAnswerSlideTypeErrorMessage } from 'src/app/utility/ErrorMessageConstants';
import { InputLabelConstant } from 'src/app/utility/LabelConstants/InputLables';
import { InputControlType, InputControlsTextLengthConfig } from 'src/app/utility/InputControlType';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { CommanService } from '../comman.service';
import { ProfanityFilterWords } from 'src/app/utility/ProfanityFilter';
import { CustomerPlanService } from '../CustomerPlan/customer-plan.service';
import { v4 as uuidv4 } from 'uuid';
@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  [x: string]: any;
  activeSlideId: any = "";
  activeSlideTypeName: any;
  currentSlideIndex: number = 0;
  presentationId: any = "";
  slideListArray: any[] = [];
  currentMasterSlideTypeId: any = "";
  activeSlideIdIndex: number = 0;
  slideContentType: string = "";
  isShowQRCode:boolean=false;
  public presentationQuestions: any[]=[];
  isFullscreenToggle: boolean = false;


  // ? Slide Desing Variables
  slideDesign: any;
  slideVisualizationId: any;
  slideResponseAsPercentage: boolean=false;
  slideLayoutId: any;
  slideTextBold: any;
  slideTextItalic: any;
  slideTextUnderLine: any;
  slideTextStrikeThrough: any;
  slideTextColor: any;
  slideLineColor: any;
  slideBackgroundColor: any = "#FFFFFF";
  fontFamily: any;
  fontSize: number;
  resetThemes: any;
  // ? Slide Settings Variables
  slideEnableVoting: any;
  slideShowAudienceDevices: any;
  slideShowInPercentage: any;
  slideShowInResults: any;
  slideEnableLiveChat: any;
  slidePresentationLanguage: any;
  // ? Slide Content Variable
  public currentActiveSlide: any;
  public questions: any = "";
  longerDescription: any;
  options: any[] = [];
  chooseCorrectAnswers: boolean = false;
  multiplechoicepresenterEnterClick: boolean;
  guessthenumberpresenterEnterClick: boolean;
  truthorliepresenterEnterClick: boolean;
  slideLevelImageURL: any;
  optionLength:number = 0;
  //? Presentation Data
  public currentPresentation: any;
  public presentationList: any[] = [];
  public presentationName: any = "";
  public presentationURL: any = "";
  public presentationCode: any;
  public presentationQRCode: any;
  public presentedDateTime: any;
  public presentationSpeakerNotes: any = "";
  public presentationSettingJoiningInstructions: boolean = false;
  public presentationSettingMakeLinkavailable: boolean = false;
  public presentationSettingAudienceFeekback: boolean = false;
  public presentationSettingAudienceReview: boolean = false;
  public presentationSettingShowResults: boolean = false;
  public presentationSettingReactions: any[] = [];
  public presentationSettingActiveReactions: any[] = [];
  public presentationSettingLanguage: any = "";
  public presentationSettingAlwaysEnglish: boolean = false;
  public presentationSettingProfanity: any[] = [];
  public presentationSettingProfanitySelectedFilter: boolean = false;
  public presentationSettingAllowMultipleResponse: boolean = false;

  //? Common Constant 
  slideContentTypeConstant = SlideTypeContent;
  masterSlideTypeName = MasterSlideTypeName;
  visualizationSlides = VisualizationSlideType;
  // ? Master Layout Data
  masterLayoutList = MasterLayout;
  masterSlideType = SlideType;
  masterVisualizationList = MasterVisualization;
  masterOptions = this.dynamicChartData(Options);
  masterSlideDefaultDesing = SlideDefaultDesing;
  masterReactions = Reactions;
  newIconURL = AssetsNewIconURL.NEWICONURL;
  multipleChoicesVisualizationSlideType = MultipleChoicesVisualizationSlideType;
  scalesChoicesVisualizationSlideType = ScalesVisualizationSlideType;
  openEndedVisualizationSlideType = OpenEndedVisualizationSlideType;
  masterPopularSlideType: any[] = this.getSlideType(SlideType, this.slideContentTypeConstant.POPULAR_SLIDE_TYPE);
  masterQuizzSlideType: any[] = this.getSlideType(SlideType, this.slideContentTypeConstant.QUIZ_SLIDE_TYPE);
  masterImportSlideType: any[] = this.getSlideType(SlideType, this.slideContentTypeConstant.IMPORT_SLIDE_TYPE);
  masterSlidesVisualizationType: any[];
  slideDetails = [];

  //? Presentation View Screen
  // * Left Panel Actions
  public historyActionButton: boolean = true;
  public presentaionResetResultActionButton: boolean = true;
  public showLayoutActionButton: boolean = false;
  public showTrendsActionButton: boolean = true;
  // * Bottom Panel Actions
  public slideCount: number = 1;
  public slideResetResultActionButton: boolean = true;
  public slideTimerCountsToDisplay: string = "";
  public slideTimerInterval: any;
  public slideTimerCountShow: boolean = false;
  public slideLockVoting: boolean = false;
  public slideTimer: boolean = false;
  public slideTooltip: boolean = true;
  public slideShowQuestions: boolean;
  public OnlyQA: boolean = true;
  public PresentationShowcomments: boolean = true;
  public IsAllowOtherAudienceQuestionsToView: boolean= false;
  public slideShowComments: boolean = true;
  public slideShowResponse: boolean = true;
  public slideShowQRCode: boolean = true;
  // * Bottom Right Panel Display
  public slideCommentsLegnth: number;
  public presentationQuestionsLegnth: number;
  public slideReactionsLegnth: number = 0;
  public slideReactionsCountList: any = [];
  public slideVotersCount: number = 0;
  public slideParticipantCount: number = 0;
  // * Environment Details
  environmentDetails = environment;

  // * SignalR Variables
  isVotingCloseSignalR: boolean = false;
  isQuestionandCommentSignalR: boolean = false;
  isNextandPerviousSlideSignalR: boolean = false;
  isGetResponseSignalR: boolean = false;

  // * Common Variables
  dynamicComponent_Clone: any;
  slideTypeId: string;
  guesstheNumberoptions: any;
  guessTheNumberResults: any;
  private myPresent: boolean = false;
  private myPresentToPresent: boolean = false;
  //Scales Variables
  scalesResult: any;
  scalesDimensions: any;
  slideLayoutData: any;
  slideLayoutType: any;
  slideLayoutImage: string;
  slideLayoutImageOpacity: any;
  slideImageopacityAsPercentage: any;
  presentationMode: boolean;
  scalesErrorConstants = ScalesSlideTypeErrorMessage;
  isVotedOnScalesResults: boolean = false;
  scalesIsStatmentSkip: boolean = false;
  multibleSubmission: boolean;
  // * Input Constants Variables
  inputLabelConstant = InputLabelConstant;
  inputControlType = InputControlType;
  InputControlsTextLength = InputControlsTextLengthConfig;
  optionsName = OptionsName
  selectMultipleOptions: any;
  selectPerParticipantsOptions: any;
  optionslength: any;
  presentationTheme: { ThemeName: string; ThemeLogo: any; ThemeBackgroundColor: string; ThemeBackgroundImage: any;  ThemeTextColor: string; ThemeFontFamily: string; ThemeLineColor: string; ThemeVisualizationColor: any[]; slideTextBold: boolean; slideTextItalic: boolean; slideTextUnderLine: boolean; slideTextStrikeThrough: boolean; slidetextSize: number,backgroundColorOpacity:any};
  slidesTheme: { ThemeName: string; ThemeLogo: any; ThemeBackgroundColor: string; ThemeBackgroundImage: string; ThemeTextColor: string; ThemeFontFamily: string; ThemeLineColor: string; ThemeVisualizationColor: any[]; slideTextBold: boolean; slideTextItalic: boolean; slideTextUnderLine: boolean; slideTextStrikeThrough: boolean; slidetextSize: number };
  slideLayoutDefaultImage: string = '/assets/new-icons/static_bg_image.svg';
  slideContentImage: any;
  responsePerParticipant: any;
  private enableKeyDownSubject = new BehaviorSubject<boolean>(true);
  isBlackOverlayVisible: boolean = false;
  isAllowedChangesforOptions:boolean=true;
  isAllowedChangesforguesstheNumber:boolean=false;
  currentThemeId:any;
  
  //* Quiz Select Answers Variables
  parentId:any="";
  presentationQuizPlayerList:any[]=[];
  slidesQuizPlayerList:any[]=[];
  quizSecondsToAnswers:number;
  quizMorePointsforCorrectAnswers:boolean=false;
  quizAddLeaderboard:boolean=false;
  quizIsEnableMusic:boolean=false;
  quizMusicURL:string="";
  isSelectMultipleCorrentAnswers:boolean=false;
  isSelectSignleCorrentAnswers:boolean=false;
  selectAnswerErrorConstants = SelectAnswerSlideTypeErrorMessage;
  quizPresenterScreen = QuizPresenterScreenManageConstant;
  slideLayoutActive : boolean = false;
  quizState:string="";
  currentQuizSlideIndex:number=0;
  quizSlidesCount:number=0;
  quizPlayers:any[]=[];
  quizPlayersCount:number=0;
  currentquizDetails:any;
  quizResultLeaderboard:any[]=[];
  isMusicMute:boolean=false;
  isPresentationPoints:boolean=false;
  quizSecondsErrorMessage:string="";
  selectedAnswersEditorScreenAudio:HTMLAudioElement = new Audio();
  selectedAnswersMusic:any[];
  leaderBoardState = QuizPresenterScreenManageConstant.QUIZ_SCORE;
  isLastLeaderBoard = false;

  //* Quiz Type Answers Variables
  typeAnswersErrorConstants = TypeAnswerSlideTypeErrorMessage;

  ImportSlideLink:any='';
  ImportSlideNumber:any=1;
  invalidembedLink:boolean = false;
  isInvalidLink: boolean = false;
  EmbeddedPPTpresenterEnterClick: boolean = false;

  bgBackgroundColor:any;
  isShowOptionDetails: boolean = false;
  isPdf:boolean;
  visualizationColor: boolean = false;
  embeddedSlideIndex=1;
  activeFontSizeButton: 'increase' | 'decrease' | '' = '';
  themeActiveFontSizeButton: 'increase' | 'decrease' | null = null;
  suffledOrder:any[]=[];
  public isLastSlide:boolean = false;
  public isShowThemeChange:boolean = false;
  public isShowThemeNameChange:boolean = false;
  public isSingleQuiz = true;
  public isPreviewMode:boolean = false;
  public isNewCommentRecived : boolean = false;
  public isAddSlideClicked: boolean = false;

  // BehaviourSubject For Remote
  public moveNextSlideBehavioursSubject = new BehaviorSubject<string>("");
  public isLastBehavioursSubject = new BehaviorSubject<any>(null);
  public updateContentBehavioursSubject = new BehaviorSubject<any>(null);
  public hideandShowResultsBehavioursSubject = new BehaviorSubject<any>(null);
  public hideandShowResponseBehavioursSubject = new BehaviorSubject<any>(null);
  public updatePercentageBehavioursSubject = new BehaviorSubject<any>(null);
  public updateVisualizationsTypeChangeBehavioursSubject = new BehaviorSubject<any>(null);
  public updateAccessCodeBehavioursSubject = new BehaviorSubject<any>(null);
  public enableDisableCommentsBehavioursSubject = new BehaviorSubject<any>(null);
  public multipleChoicesCorrectAnswersBehavioursSubject = new BehaviorSubject<any>(null);
  public enableDisableQuestionsBehavioursSubject = new BehaviorSubject<any>(null);
  public timerCountDownBehavioursSubject = new BehaviorSubject<any>(null);
  public hideShowQRDownBehavioursSubject = new BehaviorSubject<any>(null);
  public onlyQAEnableBehavioursSubject = new BehaviorSubject<any>(null);
  public openQABehavioursSubject = new BehaviorSubject<any>(null);
  public openQAWithIndexBehavioursSubject = new BehaviorSubject<any>(null);
  public markAsAnswerPinQuestionBehavioursSubject = new BehaviorSubject<any>(null);
  public getQuestionBehavioursSubject = new BehaviorSubject<any>(null);
  public startQuizforRemoteBehavioursSubject = new BehaviorSubject<any>(null);
  public blankScreenUpdateBehavioursSubject = new BehaviorSubject<any>(null);
  public resetResultBehavioursSubject = new BehaviorSubject<any>(null);
  
  // Annotation BehaviorSubjects for real-time sharing
  public receiveAnnotationBehavioursSubject = new BehaviorSubject<any>(null);
  public clearAnnotationsBehavioursSubject = new BehaviorSubject<any>(null);
  public syncAnnotationsBehavioursSubject = new BehaviorSubject<any>(null);
  public participantCountBehavioursSubject = new BehaviorSubject<any>(null);
  
  public multimediaActionSubject = new Subject<any>();;
  moveNextSlideBehavioursSubject$ = this.moveNextSlideBehavioursSubject.asObservable();
  multimediaActionSubject$ = this.multimediaActionSubject.asObservable();
  public multimediaImageActionSubject = new Subject<any>();
  multimediaImageActionSubject$ = this.multimediaImageActionSubject.asObservable();
  multimediaAlighment:boolean=false;
  isAllSelectedProfantyLanguage:boolean;
  selectedProfantyLanguage:any[]=[];
  profanityLanguageWords = ProfanityFilterWords;
  responseCountForQuiz = 0;
  public slideCountWithoutLeaderboard: number = 0;
  slideCountForImport:number = 0;
  textAreaVisible: boolean = false;
  uploadImageSlideId:any;
  changeSlideFlag:boolean=false;
  isAllowMakeAPIRightPanel:boolean=false;
  isTemplate:boolean = false;
  private centerPanelLoadingSubject = new BehaviorSubject<boolean>(false);
  centerPanelLoadingSubject$ = this.centerPanelLoadingSubject.asObservable();
  public remoteUrlQRCode: any;

  setCenterPanelLoading(isLoading: boolean) {
    this.centerPanelLoadingSubject.next(isLoading);
  }
  constructor(private _http: HttpClient, private _injector: Injector, private _toastr: ToastrService , private _CommanService : CommanService,private _customerPlanService:CustomerPlanService) { 
    this.selectedAnswersMusic = _CommanService["selectAnswerMusics"];
  }
  /**
   * * storeActiveSlideDetails
   * ? Store the ActiveSlideDetail afte Initial Bindings
   * todo: Store ActiveSlideid,SlideList,MasterSlideTypeId,MasterSlideData after API Call
   */
  storeActiveSlideDetails(isRemote:boolean=false): Promise<any> {
    return new Promise((resolve, reject) => {
      let obj = {
        presentationId: this.presentationId,
        activeSlideId: this.activeSlideId == null ? "" : this.activeSlideId,
        slideTypeId: localStorage.getItem('slideTypeId') == null ? "" : localStorage.getItem('slideTypeId'),
        isTemplate : this.isTemplate,
        isRemote:isRemote
      }
      this._http.post(environment.MyApi + 'activeworkspaceslides', obj).subscribe(
        (response: any) => {
          let presentationData = response['data'];
          this.currentPresentation = presentationData?.activePresentationData;
          this.currentMasterSlideTypeId = presentationData?.masterSlideTypeId;
          localStorage.setItem('masterSlideTypeId', presentationData?.masterSlideTypeId);
          this.assignNewValueOnStore(this.currentPresentation);
          this._customerPlanService.setCustomerPlan(presentationData?.customerPlan);
          this._customerPlanService.setCustomerLimitationsCounts(presentationData?.customerLimitationsItemsTables);
          resolve(response);
        },
        (error: any) => {
          console.log(error?.error);
          resolve(error);
          this.isTemplate = false;
        }
      );
    })
  }
  storeActiveSlideDetailsRemote(isRemote:boolean=false): Promise<any> {
    return new Promise((resolve, reject) => {
      let obj = {
        presentationId: this.presentationId,
        activeSlideId: this.activeSlideId == null ? "" : this.activeSlideId,
        slideTypeId: localStorage.getItem('slideTypeId') == null ? "" : localStorage.getItem('slideTypeId'),
        isTemplate : this.isTemplate,
        isRemote:isRemote,
        remoteUserId: localStorage.getItem(`remote_user_id_${this.presentationId}`)
      }
      this._http.post(environment.MyApi + 'remote-access/active-work-space-slides', obj).subscribe(
        (response: any) => {
          let presentationData = response['data'];
          this.currentPresentation = presentationData?.activePresentationData;
          this.currentMasterSlideTypeId = presentationData?.masterSlideTypeId;
          localStorage.setItem('masterSlideTypeId', presentationData?.masterSlideTypeId);
          this.assignNewValueOnStore(this.currentPresentation);
          this._customerPlanService.setCustomerPlan(presentationData?.customerPlan);
          this._customerPlanService.setCustomerLimitationsCounts(presentationData?.customerLimitationsItemsTables);
          resolve(response);
        },
        (error: any) => {
          console.log(error?.error);
          resolve(error);
          this.isTemplate = false;
        }
      );
    })
  }
  getComments(commets : any){
      let lastComment = commets;
      if (lastComment) {
        this.isNewCommentRecived =true;
        const commentCharacterCount = lastComment.length;
        const notification = document.createElement('div');
        notification.style.backgroundColor = '#F8F9FA';
        notification.style.color = '#343434';
        notification.style.margin = '8px 0px';
        notification.style.padding = '12px 32px 12px 32px';
        notification.style.borderRadius = '50px';
        notification.style.border = '1px solid #EEEEEE1A';
        notification.style.boxShadow = '-6px 6px 6px 0px #00000008 inset';
        notification.style.transition = 'opacity 0.3s ease-in-out';
        if(commentCharacterCount < 35){
          notification.style.width = 'fit-content';
        }else{
          notification.style.width = '325px';
        }
        notification.innerHTML = `
              <div style="display: flex; justify-content: space-between; align-items: center;">
                  <p style="margin: 0; padding-right: 10px;font-size:14px;font-weight:400;">${lastComment}</p>
              </div>
          `;
        const mainCenterDiv = document.querySelector('.show-comments-div');
        if (mainCenterDiv) {
          mainCenterDiv.appendChild(notification);
          const commentIndicator = document.querySelector('.new-comment-recived');
          if (commentIndicator) {
            commentIndicator.classList.add('red-comment');
          }
          setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
              notification.remove();
              this.isNewCommentRecived = false;
              if (commentIndicator) {
                commentIndicator.classList.remove('red-comment');
              }
            }, 300);
          }, 9700);
        }
    }
  }
  getVotingResult(): Promise<any> {
    return new Promise((resolve, reject) => {
      let obj = {
        presentationId:this.presentationId,
        activeSlideId: this.activeSlideId == null ? "" : this.activeSlideId,
        slideTypeId: this.slideTypeId == null ? "" : this.slideTypeId,
        isTemplate: this.isTemplate
      }
      this._http.post(environment.MyApi + 'getvotingresult', obj).subscribe(
        (response: any) => {
          var currentActiveSlide = response;
          this.slideTypeId = currentActiveSlide?.slideTypeId;
          this.options = currentActiveSlide?.slideContentData;
          this.optionLength = this.options.length;
          this.changeDataFormat(this.options);
          // * Active Slide content Info
          if (this.activeSlideTypeName == MasterSlideTypeName.MULTIPLE_CHOICE_SLIDE_TYPE) {
            this.chooseCorrectAnswers = this.changeChooseCorrectAnswerFormat(currentActiveSlide?.slideContentData);
            this.selectMultipleOptions = this.changeSelectMultipleOptionsFormat(currentActiveSlide?.slideContentData);
            this.selectPerParticipantsOptions = this.changeSelectPerParticipantsOptionsFormat(currentActiveSlide?.slideContentData);
          }
          const slideContentData = currentActiveSlide?.slideContentData || [];
          this.multibleSubmission = this.getMultipleSubmissionValue(slideContentData);
          this.responsePerParticipant = this.getParticipantCount(slideContentData);
          this.optionslength = this.options?.length;
          this.slideContentImage = currentActiveSlide?.contentImage;
          if (this.guesstheNumberoptions?.IsErrorMargin) {
            this.errormarginActive(this.guesstheNumberoptions.Start, this.guesstheNumberoptions.End, this.guesstheNumberoptions.CorrectAnswer, this.guesstheNumberoptions.ErrorMarginNumber)
          }
          // * Active Slide Design Info
          this.slideVisualizationId = currentActiveSlide?.design?.slideVisualizationId;
          localStorage.setItem('slideVisualizationId', currentActiveSlide?.design?.slideVisualizationId);
          this.slideResponseAsPercentage = currentActiveSlide?.design?.slideResponseAsPercentage;
          // * SignalR 
          // ! Next Slide Move signalR trigger write presentation component ts we will remove this code code cleaning
          let isNext = false;
          this.slideVotersCount = response.totalResponseCount;
          if (this.isNextandPerviousSlideSignalR == true) {
            this.isNextandPerviousSlideSignalR = false;
            let workSpaceSignalRService = this._injector.get(WorkSignalRServiceService);
            workSpaceSignalRService.moveNextandPerviousSlides(this.presentationId);
            isNext = true;
          }
          // * Dynamic Component Emit
          if (this.isGetResponseSignalR == true || isNext == true) {
            this.isGetResponseSignalR = false;
            isNext = false;
            if (this.activeSlideTypeName == this.masterSlideTypeName.MULTIPLE_CHOICE_SLIDE_TYPE) {
              this.currentActiveSlide.slideContentData = currentActiveSlide?.slideContentData;
              this.dynamicComponent_Clone.instance.multipleChoiceData = this.options;
              this.dynamicComponent_Clone.instance.updateResult(this.dynamicChartData(this.options));
            } else if (this.activeSlideTypeName == this.masterSlideTypeName.GUESS_TEHE_NUMBER_SLIDE_TYPE) {
              this.dynamicComponent_Clone.instance.guessTheNumberResults = this.guesstheNumberoptions;
              this.dynamicComponent_Clone.instance.updateChart(this.dynamicGuesstheNumberData(this.guesstheNumberoptions));
            } else if (this.activeSlideTypeName == this.masterSlideTypeName.OPEN_ENDED_SLIDE_TYPE) {
              this.dynamicComponent_Clone.instance.openEndedData = this.options;
              this.dynamicComponent_Clone.instance.updateChart(this.options);
            } else if (this.activeSlideTypeName == this.masterSlideTypeName.THIS_OR_THAT_SLIDE_TYPE) {
              this.dynamicComponent_Clone.instance.openEndedData = this.options;
              this.dynamicComponent_Clone.instance.updateChart(this.options);
            } else if (this.activeSlideTypeName == this.masterSlideTypeName.SCALES_SLIDE_TYPE) {
              this.dynamicComponent_Clone.instance.totalResponseCount = this.slideVotersCount;
              this.dynamicComponent_Clone.instance.updateResult(this.scalesResult);
            }
            else if (this.activeSlideTypeName == this.masterSlideTypeName.WORD_CLOUD_SLIDE_TYPE) {
              this.dynamicComponent_Clone.instance.WordCloudData = this.options;
              this.dynamicComponent_Clone.instance.updateChart(this.options);
            }
            else if (this.activeSlideTypeName == this.masterSlideTypeName.TRAFFIC_LIGHTS_SLIDE_TYPE) {
              this.dynamicComponent_Clone.instance.trafficLightOptions = this.options;
              this.dynamicComponent_Clone.instance.updateResult(this.options);
            }
            else if (this.activeSlideTypeName == this.masterSlideTypeName.RANKING_SLIDE_TYPE) {
              this.dynamicComponent_Clone.instance.updateResult(this.dynamicChartData(this.options));
            }
            else if (this.activeSlideTypeName == this.masterSlideTypeName.TRUTH_OR_LIE_SLIDE_TYPE) {
              this.dynamicComponent_Clone.instance.truthorLieData = this.options;
              this.dynamicComponent_Clone.instance.updateChart(this.options);
            }
            else if (this.activeSlideTypeName == this.masterSlideTypeName.SELECT_ANSWER_SLIDE_TYPE) {
              this.dynamicComponent_Clone.instance.selectAnswerData = this.options;
              //this.dynamicComponent_Clone.instance.updateChart(this.options);
            }
            else if (this.activeSlideTypeName == this.masterSlideTypeName.TYPE_ANSWER_SLIDE_TYPE) {
              this.dynamicComponent_Clone.instance.selectAnswerData = this.options;
              //this.dynamicComponent_Clone.instance.updateChart(this.options);
            }
            else if (this.activeSlideTypeName == this.masterSlideTypeName.GUESS_THE_NUMBER_QUIZ) {
              this.dynamicComponent_Clone.instance.guessTheNumberResults = this.guesstheNumberoptions;
              this.dynamicComponent_Clone.instance.updateChart(this.dynamicGuesstheNumberData(this.guesstheNumberoptions));
            }
          }
          resolve(response);
        },
        (error: any) => {
          console.log(error?.error);
          resolve(error);
        }
      );
    })
  }
  getQuestions(): Promise<any> {
    return new Promise((resolve, reject) => {
      let obj = {
        presentationId:this.presentationId,
        activeSlideId: this.activeSlideId == null ? "" : this.activeSlideId,
        slideTypeId: this.slideTypeId == null ? "" : this.slideTypeId,
        isTemplate: this.isTemplate
      }
      this._http.post(environment.MyApi + 'getquestions', obj).subscribe(
        (response: any) => {
          this.presentationQuestions = response;
          this.profanityWordsChecks();
          this.presentationQuestionsLegnth = response == null ? 0 : response?.length;
          resolve(response);
          if (this.activeSlideTypeName == this.masterSlideTypeName.QUESTIONS_AND_ANSWER_SLIDE_TYPE) {
            // this.dynamicComponent_Clone.instance.presentationQuestionsData = this.presentationQuestions;
            // this.dynamicComponent_Clone.instance.updateChart(this.presentationsQuestions);
          }
          this.presentationQuestionsLegnth = this.presentationQuestions
          ? this.presentationQuestions.filter(q => !q.isAnswered).length
          : 0;
        },
        (error: any) => {
          console.log(error?.error);
          resolve(error);
        }
      );
    })
  }
  getPresentationQuestions(questions:any){
    this.presentationQuestions.push(questions?.questions);
    this.profanityWordsChecks();
    this.presentationQuestionsLegnth = this.presentationQuestions == null ? 0 : this.presentationQuestions?.length;
    if (this.activeSlideTypeName == this.masterSlideTypeName.QUESTIONS_AND_ANSWER_SLIDE_TYPE) {
       this.dynamicComponent_Clone.instance.presentationQuestionsData = this.presentationQuestions;
       this.dynamicComponent_Clone.instance.presentationsLevelQuestionss = this.presentationQuestions;
      this.dynamicComponent_Clone.instance.updateChart(this.presentationQuestions);
    }
    this.presentationQuestionsLegnth = this.presentationQuestions
    ? this.presentationQuestions.filter(q => !q.isAnswered).length
    : 0;
    this.currentActiveSlide?.presentationQuestions?.push(questions?.questions);
  }
  getPresentationLikeQuestions(questions:any){
    if (!questions?.questions) {
      return;
    }

    // Find and update the existing question in presentationQuestions array
    const existingQuestionIndex = this.presentationQuestions.findIndex(q => q.questionId === questions.questions.questionId);
    if (existingQuestionIndex !== -1) {
      this.presentationQuestions[existingQuestionIndex] = questions.questions;
    } else {
      this.presentationQuestions.push(questions.questions);
    }

    this.profanityWordsChecks();
    this.presentationQuestionsLegnth = this.presentationQuestions == null ? 0 : this.presentationQuestions?.length;
    
    if (this.activeSlideTypeName == this.masterSlideTypeName.QUESTIONS_AND_ANSWER_SLIDE_TYPE) {
      this.dynamicComponent_Clone.instance.presentationQuestionsData = this.presentationQuestions;
      this.dynamicComponent_Clone.instance.presentationsLevelQuestionss = this.presentationQuestions;
      this.dynamicComponent_Clone.instance.updateChart(this.presentationQuestions);
    }

    this.presentationQuestionsLegnth = this.presentationQuestions
    ? this.presentationQuestions.filter(q => !q.isAnswered).length
    : 0;

    // Update the current active slide's questions
    if (this.currentActiveSlide?.presentationQuestions) {
      const currentSlideQuestionIndex = this.currentActiveSlide.presentationQuestions.findIndex(
        q => q.questionId === questions.questions.questionId
      );
      if (currentSlideQuestionIndex !== -1) {
        this.currentActiveSlide.presentationQuestions[currentSlideQuestionIndex] = questions.questions;
      } else {
        this.currentActiveSlide.presentationQuestions.push(questions.questions);
      }
    }
  }
  getReactions(data) {
    this.slideReactionsCountList = data.reactionCount;
    //return data;
    // return new Promise((resolve, reject) => {
    //   let obj = {
    //     presentationId: localStorage.getItem('presentationId'),
    //     activeSlideId: localStorage.getItem('activeSlideId') == null ? "" : localStorage.getItem('activeSlideId'),
    //     slideTypeId: localStorage.getItem('slideTypeId') == null ? "" : localStorage.getItem('slideTypeId')
    //   }
    //   this._http.post(environment.MyApi + 'getreactions', obj).subscribe(
    //     (response: any) => {
    //       this.slideReactionsCountList = response;
    //       resolve(response);
    //     },
    //     (error: any) => {
    //       console.log(error?.error);
    //       resolve(error);
    //     }
    //   );
    // })
  }
  GetAudienceCount(): Promise<any> {
    return new Promise((resolve, reject) => {
      let obj = {
        presentationId:this.presentationId,
        activeSlideId: this.activeSlideId == null ? "" : this.activeSlideId,
        slideTypeId: this.slideTypeId == null ? "" : this.slideTypeId }
      this._http.post(environment.MyApi + 'getaudiencecount', obj).subscribe(
        (response: any) => {
          this.slideParticipantCount = response;
          resolve(response);
        },
        (error: any) => {
          console.log(error?.error);
          resolve(error);
        }
      );
    })
  }
  dynamicChartResponseLoad() {
    const dynamicComponentInstance = this.dynamicComponent_Clone.instance;
    if (dynamicComponentInstance && typeof dynamicComponentInstance.dynamicChartResponseLoad === 'function') {
      dynamicComponentInstance.dynamicChartResponseLoad();
    }
  }
  getSlideVisualizationList(slideType: any) {
    return this.masterVisualizationList.filter(x => x.Type == slideType).sort((a, b) => a.OrderId - b.OrderId);
  }
  getLayoutData(layoutType: any) {
    return this.masterLayoutList.filter(x => x.layoutType == layoutType);
  }
  getMasterVisualizationData(slideVisualizationId: any) {
    return this.masterVisualizationList.find(x => x.id === slideVisualizationId);
  }
  getMasterLayoutData(slideLayoutId: any) {
    return this.masterLayoutList.find(x => x.id === slideLayoutId);
  }
  dynamicChartData(slideDetails: any) {
    let chartData = [];
    let colorsArray = [
      'red',
      'blue',
      'green',
      'black',
      'yellow'
    ]
    slideDetails.forEach((options, i) => {
      chartData.push({ id: options.OptionId, name: options.OptionTitle, value: options.value, color: options.visualizationColor, isCorrect: options?.isCorrect ,position:options.Position});
    });
    return chartData;

  }
  dynamicGuesstheNumberData(slideDetails: any) {
    return slideDetails;

  }
  getSlideType(slideTypeList: any, slideType: any) {
    return slideTypeList.filter(x => x.ContentType == slideType).sort((a, b) => a.OrderId - b.OrderId);
    
  }
  getSlideTypeById(slideTypeId: any) {
    return SlideType.find(x => x.id == slideTypeId);
  }
  previousSlide() {
    let perivousSlideId = this.slideListArray[this.currentSlideIndex - 1]?.slideId;
    if (perivousSlideId != null || perivousSlideId != undefined) {
      let workSpaceSignalRService = this._injector.get(WorkSignalRServiceService)
     // localStorage.setItem('activeSlideId', perivousSlideId);
     this.activeSlideId = perivousSlideId;
      this.storeActiveSlideDetails();
      workSpaceSignalRService.moveNextandPerviousSlides(this.presentationId);
    }
  }
  nextSlide() {
    let nextSlideId = this.slideListArray[this.currentSlideIndex + 1]?.slideId;
    if (nextSlideId != null || nextSlideId != undefined) {

    //  localStorage.setItem('activeSlideId', nextSlideId);
    this.activeSlideId = nextSlideId;
      this.storeActiveSlideDetails();

    }
  }
  getDataFromAPIActiveSlide() {
    let obj = {
      presentationId: this.presentationId,
      activeSlideId: this.activeSlideId == null ? "" : this.activeSlideId,
      slideTypeId: this.slideTypeId == null ? "" : this.slideTypeId,
      isTemplate: this.isTemplate
    }
    return this._http.post(environment.MyApi + 'activeworkspaceslides', obj);
  }
  changeSlideData() {
    let obj = {
      presentationId: this.presentationId,
      activeSlideId: this.activeSlideId == null ? "" : this.activeSlideId,
      slideTypeId: this.slideTypeId == null ? "" : this.slideTypeId,
      isTemplate: this.isTemplate
    }
    if(this.slideContentType == MasterSlideTypeName.QUIZ && this.activeSlideTypeName != MasterSlideTypeName.LEADER_BOARD_SLIDE_TYPE){
      this.dynamicComponent_Clone.instance.ngOnDestroy();
    }
    return this._http.post(environment.MyApi + 'change-slide', obj);
  }
  assignNewValueOnStore(presentationData: any): Promise<void>{
    return new Promise((resolve) => {
   // * Presentation Info
   this.presentationId = presentationData?.presentationId;
   this.presentationName = presentationData?.presentationName;
   this.presentedDateTime = presentationData?.presentedDateTime;
   this.presentationURL = this.environmentDetails?.AudienceDomain + presentationData?.presentationAccess?.url;
   this.audienceURL = this.environmentDetails?.AudienceDomain + presentationData?.presentationAccess?.url;
   this.presentationCode = presentationData?.presentationAccess?.code;
   this.presentationQRCode = presentationData?.presentationAccess?.qrCode;
   this.activeSlideId = presentationData?.activeSlideId;
   this.activeSlideTypeName = presentationData?.activeSlideTypeName;
   this.presentationMode = presentationData?.presentationMode;
   this.isBlackOverlayVisible = presentationData?.isBlankScreen;
   this.slideParticipantCount = presentationData?.totalParticipantCount == null ? 0 : presentationData?.totalParticipantCount;
   this.isPreviewMode = presentationData?.isPreview,
   this.isTemplate = presentationData?.isTemplate
   // * Presentation Setting Info
   this.presentationSettingJoiningInstructions = presentationData?.presentationSettings?.hideTheJoingingInstructionBar;
   this.presentationSettingMakeLinkavailable = presentationData?.presentationSettings?.makeLinksClickable;
   this.presentationSettingAudienceFeekback = presentationData?.presentationSettings?.allowAudienceFeedback;
   this.presentationSettingAudienceReview = presentationData?.presentationSettings?.allowAudienceToReviewTheSlides;
   this.presentationSettingShowResults = presentationData?.presentationSettings?.showResults;
   this.presentationSettingReactions = presentationData?.presentationSettings?.reactions;
   this.presentationSettingActiveReactions = presentationData?.presentationSettings?.reactions.filter(x => x.isShowReaction == true);
   this.presentationSettingLanguage = presentationData?.presentationSettings?.presentationLanguage?.presentationLanguage;
   this.presentationSettingAlwaysEnglish = presentationData?.presentationSettings?.presentationLanguage?.alwaysUseEngilsh;
   this.presentationSettingProfanity = presentationData?.presentationSettings?.presentationLanguage?.profanityFilter;
   this.isAllSelectedProfantyLanguage = this.presentationSettingProfanity.every(x=> x.isApply == true);
   this.selectedProfantyLanguage = this.presentationSettingProfanity.filter(x=> x.isApply == true);
   this.presentationSettingProfanitySelectedFilter = presentationData?.presentationSettings?.presentationLanguage?.alwaysUseTheSelectedFilters;
   this.presentationSettingAllowMultipleResponse = presentationData?.presentationSettings?.allowMultipleResponse;
   if(this.isPreviewMode){
     this.presentationQuestions = presentationData?.questions;
   }else{
     this.presentationQuestions = presentationData?.presentationQuestions;
   }
   this.profanityWordsChecks();
   // * Presentation Leaderboard Info
   this.presentationQuizPlayerList = presentationData?.leaderBoard?.presentationQuizPlayer;
   this.slidesQuizPlayerList = presentationData?.leaderBoard?.slidesQuizPlayer;
   this.currentquizDetails = presentationData?.leaderBoard?.slidesQuizPlayer.find(x=>x.slideId == this.activeSlideId);
   this.quizPlayers = this.currentquizDetails?.players;
   this.quizSlidesCount = presentationData?.slides.filter(x=>x.contentType == this.masterSlideTypeName.QUIZ && x.slideTypeName != this.masterSlideTypeName.LEADER_BOARD_SLIDE_TYPE)?.length;
   this.isSingleQuiz = presentationData?.leaderBoard?.slidesQuizPlayer.length == 1? true: false;
   this.currentQuizSlideIndex = this.currentquizDetails?.currentQuizSlideIndex;
   this.quizState = this.currentquizDetails?.quizState;
   this.quizResultLeaderboard = this.slidesQuizPlayerList?.find(x=>x.slideId == this.activeSlideDetails?.parentId);
   this.quizPlayersCount = this.currentquizDetails?.quizPlayersCount;
   this.leaderBoardState = presentationData?.leaderBoard?.leaderBoardState;
   if (this.activeSlideTypeName !== this.masterSlideTypeName.LEADER_BOARD_SLIDE_TYPE) {
    this.leaderBoardState = QuizPresenterScreenManageConstant.QUIZ_SCORE;
  }
   this.responseCountForQuiz = 0;
   // * Presentation Themes Info
   this.setPresentationThemes(presentationData?.presentationThemes);
   //* SlideType Info
   //* SlideLists Info 
   this.slideListArray = presentationData?.slides.sort((a,b)=>a.index - b.index);
   this.slideCount = presentationData?.slides?.length;
   this.slideCountWithoutLeaderboard = presentationData?.slides.filter(x=>x.slideTypeName != this.masterSlideTypeName.LEADER_BOARD_SLIDE_TYPE)?.length;
   this.slideCountForImport = presentationData?.slides.filter(x=>x.contentType == this.masterSlideTypeName.IMPORT)?.length;
   this.currentSlideIndex = presentationData?.slides.findIndex(x => x.slideId == this.activeSlideId);
   //* Active Slide Info
   this.currentActiveSlide = this.slideListArray?.length > 0 ? this.slideListArray.find(x => x.slideId == this.activeSlideId) : null;
   //if(this.currentActiveSlide != null){
   // * Slide Info
   this.parentId = this.currentActiveSlide?.parentId;
   var quizSlideDetails = this.slideListArray.find(x=> x.slideId == this.parentId);
   this.quizMorePointsforCorrectAnswers = this.changeMorePointsForCorrectAnswersDataFormat(quizSlideDetails?.slideContentData);
   this.quizResultLeaderboard = this.slidesQuizPlayerList?.find(x=>x.slideId == this.parentId)?.players;
   this.slideTypeId = this.currentActiveSlide?.slideTypeId;
   this.activeSlideIdIndex = this.currentActiveSlide?.index;
   this.slideContentType = this.currentActiveSlide?.contentType;
   localStorage.setItem('slideTypeId', this.slideTypeId);
   this.presentationSpeakerNotes = this.currentActiveSlide?.speakerNotes;
   this.slideLockVoting = this.currentActiveSlide?.closeVoting;
   this.slideShowQuestions = this.currentActiveSlide?.showQuestions;
   this.OnlyQA = presentationData?.isOnlyQA;
   this.PresentationShowcomments = presentationData?.presentationShowComments;
   this.IsAllowOtherAudienceQuestionsToView = presentationData?.isAllowOtherAudienceQuestionsToView;
   this.slideShowComments = this.currentActiveSlide?.showComments;
   this.slideCommentsLegnth = this.currentActiveSlide?.comments == null ? 0 : this.currentActiveSlide?.comments?.length;
   this.slideReactionsLegnth = this.currentActiveSlide?.reactionCounts == null ? 0 : this.currentActiveSlide?.reactionCounts?.length;
   this.slideReactionsCountList = this.currentActiveSlide?.reactionCounts;
   this.slideShowResponse = this.currentActiveSlide?.showResponse;
   this.slideShowQRCode = this.currentActiveSlide?.showQRCode;
   this.slideVotersCount = this.isTemplate ? 0 : this.currentActiveSlide?.totalResponseCount;
   if(this.activeSlideTypeName == MasterSlideTypeName.QUESTIONS_AND_ANSWER_SLIDE_TYPE){
    this.slideVotersCount = this.presentationQuestions?.length;
   }
   this.options = this.currentActiveSlide?.slideContentData;
   this.optionLength = this.options?.length;
   this.changeDataFormat(this.options);
   //#region Leaderboard count
   if(this.activeSlideTypeName == MasterSlideTypeName.LEADER_BOARD_SLIDE_TYPE){
     this.isLastLeaderBoard = false;
     var leaderBoardSslide = this.slideListArray.filter(x=>x.slideTypeName == MasterSlideTypeName.LEADER_BOARD_SLIDE_TYPE);
     var indexLeaderboard = leaderBoardSslide[leaderBoardSslide.length-1]?.index;
     if(this.currentSlideIndex+1 == indexLeaderboard){
       this.isLastLeaderBoard = true;
     }                   
   }
   //#endregion Leaderboard count
   // * Active Slide content Info
   this.questions = this.changeQuestionDataFormat(this.currentActiveSlide?.slideContentData);
   this.longerDescription = this.changeLongDescriptionDataFormat(this.currentActiveSlide?.slideContentData);
   this.textAreaVisible = this.longerDescription?.length >0 ? true : false;
   if (this.activeSlideTypeName == MasterSlideTypeName.MULTIPLE_CHOICE_SLIDE_TYPE) {
     this.chooseCorrectAnswers = this.changeChooseCorrectAnswerFormat(this.currentActiveSlide?.slideContentData);
     this.selectMultipleOptions = this.changeSelectMultipleOptionsFormat(this.currentActiveSlide?.slideContentData);
     this.selectPerParticipantsOptions = this.changeSelectPerParticipantsOptionsFormat(this.currentActiveSlide?.slideContentData);
   }
   this.multiplechoicepresenterEnterClick = this.changeCorrectAnswerFormat(this.currentActiveSlide?.slideContentData);
   this.guessthenumberpresenterEnterClick = this.changeCorrectAnswerFormat(this.currentActiveSlide?.slideContentData);
   this.truthorliepresenterEnterClick = this.changeCorrectAnswerFormat(this.currentActiveSlide?.slideContentData);
   const slideContentData = this.currentActiveSlide?.slideContentData || [];
   this.multibleSubmission = this.getMultipleSubmissionValue(slideContentData);
   this.responsePerParticipant = this.getParticipantCount(slideContentData);
   this.invalidembedLink = false;
   this.isInvalidLink = false;
   if(this.activeSlideTypeName == MasterSlideTypeName.POWER_POINT || this.activeSlideTypeName == MasterSlideTypeName.GoogleSlides){
     this.ImportSlideLink = this.changeImportSlideLinkDataFormat(slideContentData);
     this.ImportSlideNumber = this.changeImportSlideNumberDataFormat(slideContentData);
   }
   this.optionslength = this.options?.length;
   this.slideContentImage = this.currentActiveSlide?.contentImage;
   if (this.guesstheNumberoptions?.IsErrorMargin) {
     this.errormarginActive(this.guesstheNumberoptions.Start, this.guesstheNumberoptions.End, this.guesstheNumberoptions.CorrectAnswer, this.guesstheNumberoptions.ErrorMarginNumber)
   }
   this.isAllowedChangesforguesstheNumber = false; 
   // * Active Slide Design Info
   this.slideVisualizationId = this.currentActiveSlide?.design?.slideVisualizationId;
   localStorage.setItem('slideVisualizationId', this.currentActiveSlide?.design?.slideVisualizationId);
   this.slideResponseAsPercentage = this.currentActiveSlide?.design?.slideResponseAsPercentage;
   this.slideLayoutId = this.currentActiveSlide?.design?.slideLayoutId;
   if (this.slideLayoutId) {
     this.slideLayoutData = this.getMasterLayoutData(this.slideLayoutId);
     this.slideLayoutType = this.slideLayoutData.layoutType;
   }
   this.bgBackgroundColor = this._CommanService?.getContrastColor(this.currentActiveSlide?.design?.slideBackgroundColor);
   if(this.bgBackgroundColor == 'black'){
     this.slideLayoutDefaultImage = '/assets/new-icons/static_bg_image_light.svg'
   }
   else{
     this.slideLayoutDefaultImage ='/assets/new-icons/static_bg_image.svg'
   }
   this.slideLayoutImage = this.currentActiveSlide?.contentImage ? this.currentActiveSlide?.contentImage?.croppedUrl : this.slideLayoutDefaultImage;
   this.slideLayoutImageOpacity = this.currentActiveSlide?.contentImage?.backgroundImageOpacity;
   this.layoutImageOpacity();
   this.slideDesign = this.currentActiveSlide?.design;
   this.fontFamily = this.currentActiveSlide?.design?.slideTextFontFamily;
   this.fontSize = this.currentActiveSlide?.design?.slideTextFontSize;
   this.slideTextBold = this.currentActiveSlide?.design?.slideTextBold;
   this.slideTextItalic = this.currentActiveSlide?.design?.slideTextItalic;
   this.slideTextUnderLine = this.currentActiveSlide?.design?.slideTextUnderLine;
   this.slideTextStrikeThrough = this.currentActiveSlide?.design?.slideTextStrikeThrough;
   this.slideTextColor = this.currentActiveSlide?.design?.slideTextColor;
   this.slideLineColor = this.currentActiveSlide?.design?.slideLineColor;
   this.slideBackgroundColor = this.currentActiveSlide?.design?.slideBackgroundColor ?? '#fff';
   this.resetThemes = this.currentActiveSlide?.design?.slideResetTheme;
   this.activeFontSizeButton = this.currentActiveSlide?.design?.slideTextFontSize > 20 ? 'increase' : this.currentActiveSlide?.design?.slideTextFontSize == 20 ? this.currentActiveSlide?.design?.slideResetTheme ? 'increase' : '' : 'decrease';
   const matchingLayout = this.masterLayoutList.find(layout => layout.id === this.slideLayoutId && (layout.layoutType === 'Default' || layout.layoutType === 'Full Image'));
   if( matchingLayout ){
     this.slideLayoutActive = false;
   }else{
     this.slideLayoutActive = true;
   }
   // * Active Slide Settings Info
   this.slideEnableVoting = this.currentActiveSlide?.settings?.enableVoting;
   this.slideShowAudienceDevices = this.currentActiveSlide?.settings?.showAudienceDevices;
   this.slideShowInPercentage = this.currentActiveSlide?.settings?.showInPercentage;
   this.slideShowInResults = this.currentActiveSlide?.settings?.showInResults;
   this.slideEnableLiveChat = this.currentActiveSlide?.settings?.enableLiveChat;
   this.slidePresentationLanguage = this.currentActiveSlide?.settings?.presentationLanguage;
   switch (this.activeSlideTypeName) {
     case this.visualizationSlides.MULTIPLE_CHOICE_SLIDE_TYPE:
       this.masterSlidesVisualizationType = this.getSlideVisualizationList(this.visualizationSlides.MULTIPLE_CHOICE_SLIDE_TYPE);
       break;
     case this.visualizationSlides.SCALES_SLIDE_TYPE:
       this.masterSlidesVisualizationType = this.getSlideVisualizationList(this.visualizationSlides.SCALES_SLIDE_TYPE);
       break;
     case this.visualizationSlides.OPEN_ENDED_SLIDE_TYPE:
       this.masterSlidesVisualizationType = this.getSlideVisualizationList(this.visualizationSlides.OPEN_ENDED_SLIDE_TYPE);
       break;
     default:
       this.masterSlidesVisualizationType = null;
       break;
   }
   // * SignalR 
   // ! Next Slide Move signalR trigger write presentation component ts we will remove this code code cleaning
   let isNext = false;
   if (this.isNextandPerviousSlideSignalR == true) {
     this.isNextandPerviousSlideSignalR = false;
     let workSpaceSignalRService = this._injector.get(WorkSignalRServiceService);
     workSpaceSignalRService.moveNextandPerviousSlides(this.presentationId);
     isNext = true;
   }
   // * Dynamic Component Emit
   if (this.isGetResponseSignalR == true || isNext == true) {
     this.isGetResponseSignalR = false;
     isNext = false;
     if (this.activeSlideTypeName == this.masterSlideTypeName.MULTIPLE_CHOICE_SLIDE_TYPE) {
       this.dynamicComponent_Clone.instance.multipleChoiceData = this.options;
       this.dynamicComponent_Clone.instance.updateChart(this.dynamicChartData(this.options));
     } else if (this.activeSlideTypeName == this.masterSlideTypeName.GUESS_TEHE_NUMBER_SLIDE_TYPE) {
       this.dynamicComponent_Clone.instance.guessTheNumberResults = this.guesstheNumberoptions;
       this.dynamicComponent_Clone.instance.updateChart(this.dynamicGuesstheNumberData(this.guesstheNumberoptions));
     } else if (this.activeSlideTypeName == this.masterSlideTypeName.OPEN_ENDED_SLIDE_TYPE) {
       this.dynamicComponent_Clone.instance.openEndedData = this.options;
       this.dynamicComponent_Clone.instance.updateChart(this.options);
     } else if (this.activeSlideTypeName == this.masterSlideTypeName.THIS_OR_THAT_SLIDE_TYPE) {
       this.dynamicComponent_Clone.instance.openEndedData = this.options;
       this.dynamicComponent_Clone.instance.updateChart(this.options);
     } else if (this.activeSlideTypeName == this.masterSlideTypeName.SCALES_SLIDE_TYPE) {
       this.dynamicComponent_Clone.instance.openEndedData = this.options;
       this.dynamicComponent_Clone.instance.updateChart(this.options);
     }
     else if (this.activeSlideTypeName == this.masterSlideTypeName.WORD_CLOUD_SLIDE_TYPE) {
       this.dynamicComponent_Clone.instance.WordCloudData = this.options;
       this.dynamicComponent_Clone.instance.updateChart(this.options);
     }
     else if (this.activeSlideTypeName == this.masterSlideTypeName.TRAFFIC_LIGHTS_SLIDE_TYPE) {
       this.dynamicComponent_Clone.instance.trafficLightOptions = this.options;
       this.dynamicComponent_Clone.instance.updateChart(this.options);
     }
     else if (this.activeSlideTypeName == this.masterSlideTypeName.RANKING_SLIDE_TYPE) {
       this.dynamicComponent_Clone.instance.rankingOptionData = this.options;
       this.dynamicComponent_Clone.instance.updateChart(this.options);
     }
     else if (this.activeSlideTypeName == this.masterSlideTypeName.TRUTH_OR_LIE_SLIDE_TYPE) {
       this.dynamicComponent_Clone.instance.truthorLieData = this.options;
       this.dynamicComponent_Clone.instance.updateChart(this.options);
     }
     else if (this.activeSlideTypeName == this.masterSlideTypeName.SELECT_ANSWER_SLIDE_TYPE) {
       this.dynamicComponent_Clone.instance.truthorLieData = this.options;
       this.dynamicComponent_Clone.instance.updateChart(this.options);
       this.dynamicComponent_Clone.instance.addNewPlayerList(this.slidesQuizPlayerList);
     }
     else if (this.activeSlideTypeName == this.masterSlideTypeName.TYPE_ANSWER_SLIDE_TYPE) {
       this.dynamicComponent_Clone.instance.truthorLieData = this.options;
       this.dynamicComponent_Clone.instance.updatePlayerlist(this.slidesQuizPlayerList);
     }
     else if (this.activeSlideTypeName == this.masterSlideTypeName.GUESS_THE_NUMBER_QUIZ) {
       this.dynamicComponent_Clone.instance.guessTheNumberResults = this.guesstheNumberoptions;
       this.dynamicComponent_Clone.instance.updateChart(this.dynamicGuesstheNumberData(this.guesstheNumberoptions));
       this.dynamicComponent_Clone.instance.updatePlayerlist(this.slidesQuizPlayerList);
     }
     else if (this.activeSlideTypeName == this.masterSlideTypeName.POWER_POINT) {
       this.dynamicComponent_Clone.instance.embeddedLink = this.ImportSlideNumber;
       this.dynamicComponent_Clone.instance.updateChart(this.ImportSlideNumber);
     }
   }
   // * Dynamic Comments Show
   if (this.isQuestionandCommentSignalR == true) {
     this.isQuestionandCommentSignalR = false;
     if (this.slideCommentsLegnth > 0) {
       let lastComment = this.currentActiveSlide?.comments[this.slideCommentsLegnth - 1];
       if (lastComment?.comment) {
         const notification = document.createElement('div');
         notification.style.backgroundColor = '#F8F9FA';
         notification.style.color = '#343434';
         notification.style.margin = '8px 0px';
         notification.style.padding = '12px 32px 12px 32px';
         notification.style.borderRadius = '50px';
         notification.style.border = '1px solid #EEEEEE1A';
         notification.style.boxShadow = '-6px 6px 6px 0px #00000008 inset';
         notification.style.transition = 'opacity 0.3s ease-in-out';
         notification.style.width = 'fit-content';
         notification.innerHTML = `
               <div style="display: flex; justify-content: space-between; align-items: center;">
                   <p style="margin: 0; padding-right: 10px;font-size:14px;font-weight:400;">${lastComment.comment}</p>
               </div>
           `;
         const mainCenterDiv = document.querySelector('.show-comments-div');
         if (mainCenterDiv) {
           mainCenterDiv.appendChild(notification);
           const commentIndicator = document.querySelector('.new-comment-recived');
           if (commentIndicator) {
             commentIndicator.classList.add('red-comment');
           }
           setTimeout(() => {
             notification.style.opacity = '0';
             setTimeout(() => {
               notification.remove();
               if (commentIndicator) {
                 commentIndicator.classList.remove('red-comment');
               }
             }, 300);
           }, 9700);
         }
       }
     }
   }
   resolve();
  });
  }
  updateSlideData(presentationData: any) {
    this.changeSlideFlag = false;
    // * Presentation Info
    this.activeSlideId = presentationData?.activePresentationData?.activeSlideId;
    this.activeSlideTypeName = presentationData?.activePresentationData?.activeSlideTypeName;
    this.PresentationShowcomments = presentationData?.activePresentationData?.presentationShowComments;
    this.IsAllowOtherAudienceQuestionsToView = presentationData?.activePresentationData?.isAllowOtherAudienceQuestionsToView;
    this.isBlackOverlayVisible = presentationData?.activePresentationData?.isBlankScreen;
    this.slideParticipantCount = presentationData?.activePresentationData?.totalParticipantCount;
    this.isPreviewMode = presentationData?.activePresentationData?.isPreview;
    if(this.isPreviewMode){
      this.presentationQuestions = presentationData?.activePresentationData?.questions;
    }else{
      this.presentationQuestions = presentationData?.activePresentationData?.presentationQuestions;
    }
    this.profanityWordsChecks();
    this.currentPresentation.presentationQuestions = this.presentationQuestions;
    this.presentationQuestionsLegnth = this.presentationQuestions?.length > 0 ? this.presentationQuestions.filter(q => !q.isAnswered).length : 0;
    this.currentActiveSlide = this.slideListArray?.length > 0 ? presentationData?.activePresentationData?.slides[0] : null;
    this.slideContentType = this.currentActiveSlide?.contentType;
     // * Presentation Leaderboard Info
     if(this.currentActiveSlide?.contentType == MasterSlideTypeName.QUIZ){
      this.presentationQuizPlayerList = presentationData?.activePresentationData?.leaderBoard?.presentationQuizPlayer;
      this.slidesQuizPlayerList = presentationData?.activePresentationData?.leaderBoard?.slidesQuizPlayer;
      if(this.currentActiveSlide?.slideTypeName == MasterSlideTypeName.LEADER_BOARD_SLIDE_TYPE ){
         this.currentquizDetails = presentationData?.activePresentationData?.leaderBoard?.slidesQuizPlayer.find(x=>x.slideId == this.currentActiveSlide.parentId)
      }else{
        this.currentquizDetails = presentationData?.activePresentationData?.leaderBoard?.slidesQuizPlayer.find(x=>x.slideId == this.activeSlideId);
      }
      this.quizSlidesCount = this.slideListArray.filter(x=>x.contentType == this.masterSlideTypeName.QUIZ && x.slideTypeName != this.masterSlideTypeName.LEADER_BOARD_SLIDE_TYPE)?.length;
      this.isSingleQuiz = presentationData?.activePresentationData?.leaderBoard?.slidesQuizPlayer.length == 1? true: false;
      this.currentQuizSlideIndex = this.currentquizDetails?.currentQuizSlideIndex;
      this.quizState = this.currentquizDetails?.quizState;
      this.quizPlayersCount = this.currentquizDetails?.quizPlayersCount;
      this.leaderBoardState = presentationData?.activePresentationData?.leaderBoard?.leaderBoardState;
      this.responseCountForQuiz = 0;
      this.quizPlayers = this.currentquizDetails?.players;
      this.currentPresentation.leaderBoard = presentationData?.activePresentationData?.leaderBoard;
      this.currentPresentation.leaderBoard.presentationQuizPlayerList  = this.presentationQuizPlayerList;
     }
     else{
      this.quizState = '';
     }
     this.setPresentationThemes(presentationData?.activePresentationData?.presentationThemes);
    //* SlideType Info
    this.currentMasterSlideTypeId = presentationData?.masterSlideTypeId;
    localStorage.setItem('masterSlideTypeId', presentationData?.masterSlideTypeId);
    //* SlideLists Info 
    this.currentSlideIndex =this.slideListArray.findIndex(x => x.slideId == this.activeSlideId);
    //#region Leaderboard count
    if(this.activeSlideTypeName == MasterSlideTypeName.LEADER_BOARD_SLIDE_TYPE){
      this.isLastLeaderBoard = false;
      var leaderBoardSslide = this.slideListArray.filter(x=>x.slideTypeName == MasterSlideTypeName.LEADER_BOARD_SLIDE_TYPE);
      var indexLeaderboard = leaderBoardSslide[leaderBoardSslide.length-1]?.index;
      if(this.currentSlideIndex+1 == indexLeaderboard){
        this.isLastLeaderBoard = true;
      }                   
    }
    if(this.slideContentType != MasterSlideTypeName.QUIZ){
        this.leaderBoardState = QuizPresenterScreenManageConstant.QUIZ_SCORE;
    }
    //#endregion Leaderboard count
    //* Active Slide Info
    this.parentId = this.currentActiveSlide?.parentId;
    this.slideTypeId = this.currentActiveSlide?.slideTypeId;
    this.quizResultLeaderboard = this.slidesQuizPlayerList?.find(x=>x.slideId == this.parentId)?.players;
    if (this.currentActiveSlide != null) {
      // * Slide Info
      this.activeSlideIdIndex = this.currentActiveSlide?.index;
      this.presentationSpeakerNotes = this.currentActiveSlide?.speakerNotes;
      this.slideTimer = this.currentActiveSlide?.slideTimer;
      this.slideLockVoting = this.currentActiveSlide?.closeVoting;
      this.slideShowQuestions = this.currentActiveSlide?.showQuestions;
      this.slideShowComments = this.currentActiveSlide?.showComments;
      this.slideCommentsLegnth = this.currentActiveSlide?.comments == null ? 0 : this.currentActiveSlide?.comments?.length;
      this.slideReactionsLegnth = this.currentActiveSlide?.reactionCounts == null ? 0 : this.currentActiveSlide?.reactionCounts?.length;
      this.slideShowResponse = this.currentActiveSlide?.showResponse;
      this.slideShowQRCode = this.currentActiveSlide?.showQRCode;
      this.slideVotersCount = this.currentActiveSlide?.totalResponseCount;
      if(this.activeSlideTypeName == MasterSlideTypeName.QUESTIONS_AND_ANSWER_SLIDE_TYPE){
        this.slideVotersCount = this.presentationQuestions?.length;
       }
      this.slideContentType = this.currentActiveSlide?.contentType;
      // * Active Slide content Info
      this.questions = this.changeQuestionDataFormat(this.currentActiveSlide?.slideContentData);
      this.longerDescription = this.changeLongDescriptionDataFormat(this.currentActiveSlide?.slideContentData);
      this.textAreaVisible = this.longerDescription?.length >0 ? true : false;
      this.slideLayoutImage = this.currentActiveSlide?.contentImage ? this.currentActiveSlide?.contentImage?.croppedUrl : this.slideLayoutDefaultImage;
      this.slideLayoutImageOpacity = this.currentActiveSlide?.contentImage?.backgroundImageOpacity;
      this.layoutImageOpacity();
      if (this.activeSlideTypeName == MasterSlideTypeName.MULTIPLE_CHOICE_SLIDE_TYPE) {
        this.chooseCorrectAnswers = this.changeChooseCorrectAnswerFormat(this.currentActiveSlide?.slideContentData);
        this.selectMultipleOptions = this.changeSelectMultipleOptionsFormat(this.currentActiveSlide?.slideContentData);
        this.selectPerParticipantsOptions = this.changeSelectPerParticipantsOptionsFormat(this.currentActiveSlide?.slideContentData);
      }
      this.multiplechoicepresenterEnterClick = this.changeCorrectAnswerFormat(this.currentActiveSlide?.slideContentData);
      this.guessthenumberpresenterEnterClick = this.changeCorrectAnswerFormat(this.currentActiveSlide?.slideContentData);
      this.truthorliepresenterEnterClick = this.changeCorrectAnswerFormat(this.currentActiveSlide?.slideContentData);
      this.slideReactionsCountList = this.currentActiveSlide?.reactionCounts;
      this.options = this.currentActiveSlide?.slideContentData;
      this.optionLength = this.options.length;
      this.changeDataFormat(this.options);
      this.optionslength = this.options?.length;
      const slideContentData = this.currentActiveSlide?.slideContentData || [];
      this.multibleSubmission = this.getMultipleSubmissionValue(slideContentData);
      this.responsePerParticipant = this.getParticipantCount(slideContentData);
      if(this.activeSlideTypeName == MasterSlideTypeName.POWER_POINT || this.activeSlideTypeName == MasterSlideTypeName.GoogleSlides){
        this.ImportSlideLink = this.changeImportSlideLinkDataFormat(slideContentData);
        this.ImportSlideNumber = this.changeImportSlideNumberDataFormat(slideContentData);
      }
      // * Active Slide Design Info
      this.slideVisualizationId = this.currentActiveSlide?.design?.slideVisualizationId;
      localStorage.setItem('slideVisualizationId', this.currentActiveSlide?.design?.slideVisualizationId);
      this.slideResponseAsPercentage = this.currentActiveSlide?.design?.slideResponseAsPercentage;
      this.slideLayoutId = this.currentActiveSlide?.design?.slideLayoutId;
      if (this.slideLayoutId) {
        this.slideLayoutData = this.getMasterLayoutData(this.slideLayoutId);
        this.slideLayoutType = this.slideLayoutData.layoutType;
      }
      const matchingLayout = this.masterLayoutList.find(layout => layout.id === this.slideLayoutId && (layout.layoutType === 'Default' || layout.layoutType === 'Full Image'));
      if( matchingLayout ){
        this.slideLayoutActive = false;
      }else{
        this.slideLayoutActive = true;
      }
      this.SetCurrectSlideThemeValue(this.currentActiveSlide,presentationData);
      this.activeFontSizeButton =this.currentActiveSlide?.design?.slideTextFontSize > 20 ? 'increase' : this.currentActiveSlide?.design?.slideTextFontSize == 20 ? this.currentActiveSlide?.design?.slideResetTheme ? 'increase' : '' : 'decrease';
      // * Active Slide Settings Info
      this.slideContentImage = this.currentActiveSlide?.contentImage;
      this.slideEnableVoting = this.currentActiveSlide?.settings?.enableVoting;
      this.slideShowAudienceDevices = this.currentActiveSlide?.settings?.showAudienceDevices;
      this.slideShowInPercentage = this.currentActiveSlide?.settings?.showInPercentage;
      this.slideShowInResults = this.currentActiveSlide?.settings?.showInResults;
      this.slideEnableLiveChat = this.currentActiveSlide?.settings?.enableLiveChat;
      this.slidePresentationLanguage = this.currentActiveSlide?.settings?.presentationLanguage;
      switch (this.activeSlideTypeName) {
        case this.visualizationSlides.MULTIPLE_CHOICE_SLIDE_TYPE:
          this.masterSlidesVisualizationType = this.getSlideVisualizationList(this.visualizationSlides.MULTIPLE_CHOICE_SLIDE_TYPE);
          break;
        case this.visualizationSlides.SCALES_SLIDE_TYPE:
          this.masterSlidesVisualizationType = this.getSlideVisualizationList(this.visualizationSlides.SCALES_SLIDE_TYPE);
          break;
        case this.visualizationSlides.OPEN_ENDED_SLIDE_TYPE:
          this.masterSlidesVisualizationType = this.getSlideVisualizationList(this.visualizationSlides.OPEN_ENDED_SLIDE_TYPE);
          break;
        default:
          this.masterSlidesVisualizationType = null;
          break;
      }
    }
  }
  SetCurrectSlideThemeValue(currentActiveSlide:any,presentationData:any){
    this.bgBackgroundColor = this._CommanService?.getContrastColor(currentActiveSlide?.design?.slideBackgroundColor);
    if(this.bgBackgroundColor == 'black'){
      this.slideLayoutDefaultImage = '/assets/new-icons/static_bg_image_light.svg'
    }
    else{
      this.slideLayoutDefaultImage ='/assets/new-icons/static_bg_image.svg'
    }
    this.slideLayoutImage = currentActiveSlide?.contentImage ? currentActiveSlide?.contentImage?.croppedUrl: this.slideLayoutDefaultImage;
    this.slideDesign = currentActiveSlide?.design;
    this.fontFamily = currentActiveSlide?.design?.slideTextFontFamily;
    this.fontSize = currentActiveSlide?.design?.slideTextFontSize;
    this.slideTextBold = currentActiveSlide?.design?.slideTextBold;
    this.slideTextItalic = currentActiveSlide?.design?.slideTextItalic;
    this.slideTextUnderLine = currentActiveSlide?.design?.slideTextUnderLine;
    this.slideTextStrikeThrough = currentActiveSlide?.design?.slideTextStrikeThrough;
    this.slideTextColor = currentActiveSlide?.design?.slideTextColor;
    this.slideLineColor = currentActiveSlide?.design?.slideLineColor;
    this.slideBackgroundColor = currentActiveSlide?.design?.slideBackgroundColor;
    this.resetThemes = currentActiveSlide?.design?.slideResetTheme;
  }
  setPresentationThemes(presentationTheme: any) {
  let presentationThemes = {
      ThemeName: presentationTheme?.themeName,
      ThemeLogo: presentationTheme?.themesLogo,
      ThemeBackgroundColor: presentationTheme?.themesBackgroundColor,
      ThemeBackgroundImage: presentationTheme?.themesBackgroundImage,
      ThemeTextColor: presentationTheme?.themesFontColor,
      ThemeFontFamily: presentationTheme?.themesFonts,
      ThemeLineColor: presentationTheme?.lineClour,
      ThemeVisualizationColor: presentationTheme?.themesChartColor,
      slideTextBold: presentationTheme?.textBold,
      slideTextItalic: presentationTheme?.textItalic,
      slideTextUnderLine: presentationTheme?.textUnderline,
      slideTextStrikeThrough: presentationTheme?.textStrikeout,
      slidetextSize: presentationTheme?.fontSize,
      backgroundColorOpacity: presentationTheme?.backgroundColorOpacity,
    }
    this.themeActiveFontSizeButton = presentationTheme?.fontSize;
    this.currentThemeId = presentationTheme?.themeId;
    this.presentationTheme = presentationThemes;
    return this.presentationTheme;
  }
  setApplyPresentationTheme(presentationTheme: any) {
    this.currentPresentation.presentationThemes = presentationTheme;
  }
  setApplyCurrentSlideTheme(currentSlideTheme: any) {
   var currentActiveSlide = this.slideListArray?.length > 0 ? this.slideListArray.find(x => x.slideId == this.activeSlideId) : null;
   currentActiveSlide.design = currentSlideTheme;
  }
  setSlideThemes(slideTheme: any) {
    let slidesThemeDTO = {
      ThemeName: "",
      ThemeLogo: this.presentationTheme?.ThemeLogo,
      ThemeBackgroundColor: slideTheme?.slideBackgroundColor,
      ThemeBackgroundImage: this.presentationTheme?.ThemeBackgroundImage,
      ThemeTextColor: slideTheme?.slideTextColor,
      ThemeFontFamily: slideTheme?.slideTextFontFamily,
      ThemeLineColor: slideTheme?.slideLineColor,
      ThemeVisualizationColor: this.presentationTheme?.ThemeVisualizationColor,
      slideTextBold: slideTheme?.slideTextBold,
      slideTextItalic: slideTheme?.slideTextItalic,
      slideTextUnderLine: slideTheme?.slideTextUnderLine,
      slideTextStrikeThrough: slideTheme?.slideTextStrikeThrough,
      slidetextSize: slideTheme.slideTextFontSize,
    }
    this.slidesTheme = slidesThemeDTO;
    return this.slidesTheme;
  }
  layoutImageOpacity(){
    this.slideImageopacityAsPercentage = (this.slideLayoutImageOpacity * 100).toFixed(0);
  }
  clearLocalStorageData() {
    localStorage.removeItem('masterSlideTypeId');
    localStorage.removeItem('slideVisualizationId');
    localStorage.removeItem('presentationId');
    localStorage.removeItem('activeSlideId');
    localStorage.removeItem('slideTypeId');
  }
  changeDataFormat(response: any) {
    if (response) {
      let optionsData = [];
      let suffledData = [];
      let guesstheNumberoptionsData = [];
      let guessTheNumberResultsData = [];
      let scaleResultData = [];
      let ScalesDimensionsData = [];
      const slideContentData = response;
      slideContentData.forEach((content: any) => {
        if (content.name === 'contentData' && Array.isArray(content.value)) {
          content.value.forEach((innerContent: any) => {
            if (innerContent.name === 'Options' && Array.isArray(innerContent.value)) {
              optionsData = optionsData.concat(innerContent.value);
            }
            if (innerContent.name === 'GuessTheNumberOptions' && Array.isArray(innerContent.value)) {
              guesstheNumberoptionsData = guesstheNumberoptionsData.concat(innerContent.value);
            }
            if (innerContent.name === 'GuessTheNumberResults' && Array.isArray(innerContent.value)) {
              guessTheNumberResultsData = guessTheNumberResultsData.concat(innerContent.value);
            }
            if (innerContent.name === 'Dimensions' && Array.isArray(innerContent.value)) {
              ScalesDimensionsData = ScalesDimensionsData.concat(innerContent.value);
            }
            if (innerContent.name === 'ScalesResult' && Array.isArray(innerContent.value)) {
              scaleResultData = scaleResultData.concat(innerContent.value);
            }
            if (innerContent.name === 'isSkipStatement') {
              this.scalesIsStatmentSkip = this.changeIsSkipStatementDataFormat(response);
            }
            if (innerContent.name === 'SecondsToAnswers') {
              this.quizSecondsToAnswers = this.changeSecondsToAnswersDataFormat(response);
            }
            if (innerContent.name === 'MorePointsForCorrectAnswers') {
              this.quizMorePointsforCorrectAnswers = this.changeMorePointsForCorrectAnswersDataFormat(response);
            }
            if (innerContent.name === 'AddLeaderboard') {
              this.quizAddLeaderboard = this.changeAddLeaderboardDataFormat(response);
            }
            if (innerContent.name === 'Music') {
              this.quizMusicURL = this.changeMusicDataFormat(response);
            }
            if (innerContent.name === 'EnableMusic') {
              this.quizIsEnableMusic = this.changeEnableMusicDataFormat(response);
            }
            if (innerContent.name === 'slideImage') {
              this.slidePptImage  = this.changepptImgDataFormat(response);
              this.isPdf = this.changepdfImgDataFormat(response);
            }
            if (innerContent.name === 'aboutSlide') {
              this.aboutSlide  = this.changeaboutSlideDataFormat(response);
            }
            if (innerContent.name === 'suffledOrder' && Array.isArray(innerContent.value)) {
              suffledData = suffledData.concat(innerContent.value);
            }
            if (innerContent.name === 'json') {
               this.multimediaDataFormater(response);
            }
          });
        }
      });
      if (optionsData.length != 0) {
        this.options = optionsData.map(optionArray => {
          return optionArray.reduce((acc, curr) => {
            acc[curr.name] = curr.value;
            return acc;
          }, {});

        });
        this.optionslength = this.options?.length;        
      }
      else{
        if(this.activeSlideTypeName == this.masterSlideTypeName.TYPE_ANSWER_SLIDE_TYPE || this.activeSlideTypeName == this.masterSlideTypeName.WORD_CLOUD_SLIDE_TYPE || this.activeSlideTypeName == this.masterSlideTypeName.OPEN_ENDED_SLIDE_TYPE)
        { 
          this.options = [];
        }
      }
      if (suffledData.length != 0) {
        this.suffledOrder = suffledData.map(optionArray => {
          return optionArray.reduce((acc, curr) => {
            acc[curr.name] = curr.value;
            return acc;
          }, {});
        });
      }
      if (ScalesDimensionsData.length != 0) {
        this.scalesDimensions = ScalesDimensionsData.map(optionArray => {
          return optionArray.reduce((acc, curr) => {
            acc[curr.name] = curr.value;
            return acc;
          }, {});
        });
      }
      if (scaleResultData.length != 0) {
        this.scalesResult = this.changeScalesData(scaleResultData);
        this.isVotedOnScalesResults = this.scalesResult.some((x: any) => x.ResponseCount > 0);
      }

      if (guesstheNumberoptionsData.length != 0) {
        this.guesstheNumberoptions = guesstheNumberoptionsData.reduce((acc, curr) => {
          acc[curr.name] = curr.value;
          return acc;
        }, {});
      }

      if (guessTheNumberResultsData.length != 0) {
        this.guessTheNumberResults = this.transformGuessTheNumberResults(guessTheNumberResultsData);
      }
      if(this.activeSlideTypeName == this.masterSlideTypeName.LEADER_BOARD_SLIDE_TYPE){
        return this.options;
      }
    }

  }
  changeQuestionDataFormat(response: any) {
    if (response && Array.isArray(response)) {
      for (const content of response) {
        if (content.name === 'contentData' && Array.isArray(content.value)) {
          for (const innerContent of content.value) {
            if (innerContent.name === 'Questions' && typeof innerContent.value === 'string') {
              return innerContent.value;
            }
          }
        }
      }
    }
  }
  changeChooseCorrectAnswerFormat(response: any) {
    if (response && Array.isArray(response)) {
      for (const content of response) {
        if (content.name === 'contentData' && Array.isArray(content.value)) {
          for (const innerContent of content.value) {
            if (innerContent.name === 'chooseCorrectAnswer') {
              return innerContent.value;
            }
          }
        }
      }
    }
    return null;
  }
  changeCorrectAnswerFormat(response: any) {
    if (response && Array.isArray(response)) {
      for (const content of response) {
        if (content.name === 'contentData' && Array.isArray(content.value)) {
          for (const innerContent of content.value) {
            if (innerContent.name === 'showCorrectAnswer') {
              return innerContent.value;
            }
          }
        }
      }
    }
    return null;
  }
  changeSelectMultipleOptionsFormat(response: any) {
    if (response && Array.isArray(response)) {
      for (const content of response) {
        if (content.name === 'contentData' && Array.isArray(content.value)) {
          for (const innerContent of content.value) {
            if (innerContent.name === 'selectMultipleOptions') {
              return innerContent.value;
            }
          }
        }
      }
    }
    return null;
  }
  changeSelectPerParticipantsOptionsFormat(response: any) {
    if (response && Array.isArray(response)) {
      for (const content of response) {
        if (content.name === 'contentData' && Array.isArray(content.value)) {
          for (const innerContent of content.value) {
            if (innerContent.name === 'selectPerParticipantsOptions') {
              return innerContent.value;
            }
          }
        }
      }
    }
    return null;
  }
  changeLongDescriptionDataFormat(response: any) {
    if (response && Array.isArray(response)) {
      for (const content of response) {
        if (content.name === 'contentData' && Array.isArray(content.value)) {
          for (const innerContent of content.value) {
            if (innerContent.name === 'LongerDescription') {
              return innerContent.value;
            }
          }
        }
      }
    }
  }
  changeIsSkipStatementDataFormat(response: any) {
    if (response && Array.isArray(response)) {
      for (const content of response) {
        if (content.name === 'contentData' && Array.isArray(content.value)) {
          for (const innerContent of content.value) {
            if (innerContent.name === 'isSkipStatement') {
              return innerContent.value;
            }
          }
        }
      }
    }
  }
  changeSecondsToAnswersDataFormat(response: any) {
    if (response && Array.isArray(response)) {
      for (const content of response) {
        if (content.name === 'contentData' && Array.isArray(content.value)) {
          for (const innerContent of content.value) {
            if (innerContent.name === 'SecondsToAnswers') {
              return innerContent.value;
            }
          }
        }
      }
    }
  }
  changeMorePointsForCorrectAnswersDataFormat(response: any) {
    if (response && Array.isArray(response)) {
      for (const content of response) {
        if (content.name === 'contentData' && Array.isArray(content.value)) {
          for (const innerContent of content.value) {
            if (innerContent.name === 'MorePointsForCorrectAnswers') {
              return innerContent.value;
            }
          }
        }
      }
    }
  }
  changeAddLeaderboardDataFormat(response: any) {
    if (response && Array.isArray(response)) {
      for (const content of response) {
        if (content.name === 'contentData' && Array.isArray(content.value)) {
          for (const innerContent of content.value) {
            if (innerContent.name === 'AddLeaderboard') {
              return innerContent.value;
            }
          }
        }
      }
    }
  }
  changeMusicDataFormat(response: any) {
    if (response && Array.isArray(response)) {
      for (const content of response) {
        if (content.name === 'contentData' && Array.isArray(content.value)) {
          for (const innerContent of content.value) {
            if (innerContent.name === 'Music') {
              return innerContent.value;
            }
          }
        }
      }
    }
  }
  changeEnableMusicDataFormat(response: any) {
    if (response && Array.isArray(response)) {
      for (const content of response) {
        if (content.name === 'contentData' && Array.isArray(content.value)) {
          for (const innerContent of content.value) {
            if (innerContent.name === 'EnableMusic') {
              return innerContent.value;
            }
          }
        }
      }
    }
  }
  changepptImgDataFormat(response: any) {
    if (response && Array.isArray(response)) {
      for (const content of response) {
        if (content.name === 'contentData' && Array.isArray(content.value)) {
          for (const innerContent of content.value) {
            if (innerContent.name === 'slideImage') {
              return innerContent.value;
            }
          }
        }
      }
    }
  }
  changepdfImgDataFormat(response: any) {
    if (response && Array.isArray(response)) {
      for (const content of response) {
        if (content.name === 'contentData' && Array.isArray(content.value)) {
          for (const innerContent of content.value) {
            if (innerContent.name === 'isPDF') {
              return innerContent.value;
            }
          }
        }
      }
    }
  }
  changeaboutSlideDataFormat(response: any) {
    if (response && Array.isArray(response)) {
      for (const content of response) {
        if (content.name === 'contentData' && Array.isArray(content.value)) {
          for (const innerContent of content.value) {
            if (innerContent.name === 'aboutSlide') {
              return innerContent.value;
            }
          }
        }
      }
    }
  }
  transformGuessTheNumberResults(data: any[]): any {
    let transformedResults = {
      Score: [],
      ResponseCount: 0
    };

    data.forEach(item => {
      if (item.name === 'Score' && Array.isArray(item.value)) {
        item.value.forEach(scoreItem => {
          let scoreObject = {};
          scoreItem.forEach(scoreDetail => {
            scoreDetail.name = scoreDetail.name.charAt(0).toLowerCase() + scoreDetail.name.slice(1);
            scoreObject[scoreDetail.name] = scoreDetail.value;
            if (scoreDetail.name === 'y') {
              transformedResults.ResponseCount += scoreDetail.value;
            }
          });
          transformedResults.Score.push(scoreObject);
        });
      }
    });
    

    return transformedResults;
  }
  multimediaDataFormater(data): void{
    if (data && Array.isArray(data)) {
      for (const content of data) {
        if (content.name === 'contentData' && Array.isArray(content.value)) {
          for (const innerContent of content.value) {
            if (innerContent.name === 'json') {
              this.options= innerContent.value;
            }
          }
        }
      }
    }
  }
  setMyPresent(value: boolean): void {
    this.myPresent = value;
  }
  getMyPresent(): boolean {
    return this.myPresent;
  }
  changeScalesData(input) {
    return input.map(optionArray => {
      const transformedObject = optionArray.reduce((acc, curr) => {
        if (curr.name === "Score") {
          acc[curr.name] = curr.value.map(scoreArray => {
            return scoreArray.reduce((scoreAcc, scoreCurr) => {
              scoreAcc[scoreCurr.name] = scoreCurr.value;
              return scoreAcc;
            }, {});
          });
        } else {
          acc[curr.name] = curr.value;
        }
        return acc;
      }, {});

      return {
        OptionId: transformedObject.OptionId,
        OptionTitle: transformedObject.OptionTitle,
        ResponseCount: transformedObject.ResponseCount,
        Score: transformedObject.Score
      };
    });
  }
  setMyPresentToPresent(value: boolean) {
    this.myPresentToPresent = value;
  }
  getMyPresentToPresent() {
    return this.myPresentToPresent;
  }
  getMultipleSubmissionValue(slideContentData: any[]): boolean | undefined {
    let multipleSubmissionData: boolean | undefined;
    slideContentData.forEach((content: any) => {
      if (content.name === 'contentData' && Array.isArray(content.value)) {
        content.value.forEach((innerContent: any) => {
          if (innerContent.name === 'MultipleSubmission') {
            multipleSubmissionData = innerContent.value;
          }
        });
      }
    });
    return multipleSubmissionData;
  }
  //#region Slide Themes Mehtods
  changeSlideThemes(theme: any): boolean {
    let presentationTheme = {
      ThemeName: theme?.themeName,
      ThemeLogo: theme?.themesLogo,
      ThemeBackgroundColor: theme?.themesBackgroundColor,
      ThemeBackgroundImage: theme?.themesBackgroundImage,
      ThemeTextColor: theme?.themesFontColor,
      ThemeFontFamily: theme?.themesFonts,
      ThemeLineColor: theme?.lineClour,
      ThemeVisualizationColor: theme?.themesChartColor,
      slideTextBold: theme?.textBold,
      slideTextItalic: theme?.textItalic,
      slideTextUnderLine: theme?.textUnderline,
      slideTextStrikeThrough: theme?.textStrikeout,
      slidetextSize: theme?.fontSize,
      backgroundColorOpacity: theme?.backgroundColorOpacity,
    }
    this.presentationTheme = presentationTheme;
    return true;
  }

  //#endregion Slide Themes Mehtods
  getParticipantCount(slideContentData: any[]): number | undefined {
    let participantData: number | undefined;

    slideContentData.forEach((content: any) => {
      if (content.name === 'contentData' && Array.isArray(content.value)) {
        content.value.forEach((innerContent: any) => {
          if (innerContent.name === 'responsePerParticipant') {
            participantData = innerContent.value;
          }
        });
      }
    });
    return participantData;
  }
  getStartingSlideNumber(slideContentData: any[]): number | undefined {
    let participantData: number | undefined;

    slideContentData.forEach((content: any) => {
      if (content.name === 'contentData' && Array.isArray(content.value)) {
        content.value.forEach((innerContent: any) => {
          if (innerContent.name === 'responsePerParticipant') {
            participantData = innerContent.value;
          }
        });
      }
    });
    return participantData;
  }
  errormarginActive(start: any, end: any, correctValue: any, errorMarginValue: any) {
    this.CorrectAnswers = correctValue;
    this.errorMarginValue = errorMarginValue;
    this.StartAnswer = start;
    this.EndAnswer = end;
    if (this.CorrectAnswers >= 0) {
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
      if (this.subValue < this.StartAnswer) {
        this.startValueGuess = this.CorrectAnswers - this.errorMarginValue;
      } else {
        this.startValueGuess = this.subValue;
      }
      if (this.CorrectAnswers > this.EndAnswer) {
        this.endValueForGuess = this.addValue;
        this.startValueGuess = this.subValue;
      }
      this.errorMarginMaxValue = Math.abs(this.StartAnswer - this.EndAnswer);
    }
  }
  enableKeyDown(value: boolean): void {
    this.enableKeyDownSubject.next(value);
  }

  isKeyDownEnabled(): Observable<boolean> {
    return this.enableKeyDownSubject.asObservable();
  }
  //#region Quiz Slide Functions
  correctOptionValidations(){
    var isCorrectOptions = this.options?.filter((x: any) => x.isCorrect == true);
    if (isCorrectOptions?.length > 0 && isCorrectOptions?.length == 1) {
      this.isSelectSignleCorrentAnswers = false;
      this.isSelectMultipleCorrentAnswers = false;
    }
    else if (isCorrectOptions?.length > 1) {
      this.isSelectSignleCorrentAnswers = false;
      this.isSelectMultipleCorrentAnswers = true;
    }
    else if(isCorrectOptions?.length == 0){
      this.isSelectSignleCorrentAnswers = true;
    }
  if (this.activeSlideTypeName === this.masterSlideTypeName.SELECT_ANSWER_SLIDE_TYPE) {
    if(this.dynamicComponent_Clone){
      this.dynamicComponent_Clone.instance.isNonofOptionCorrect = this.isSelectSignleCorrentAnswers;
    }
  }
  }
  stopQuizMusic(){
    if (!this.selectedAnswersEditorScreenAudio.paused) {
      this.selectedAnswersEditorScreenAudio.pause();
      this.selectedAnswersEditorScreenAudio.currentTime = 0;
      this.selectedAnswersMusic =this.selectedAnswersMusic.map(data => ({...data,isPlay: false}));
    }
  }
  getQuizPlayers(){
    return new Promise((resolve, reject) => {
      let obj = {
        presentationId: this.presentationId,
        slideId: this.activeSlideId== null ? "" : this.activeSlideId,
      }
      this._http.get(environment.MyApi + 'get-quiz-players?presentationId=' + obj.presentationId + "&slideId=" + obj.slideId).subscribe(
        (response: any) => {
          this.currentquizDetails = response;
          this.quizPlayersCount = this.currentquizDetails?.quizPlayersCount;
          this.dynamicComponent_Clone.instance.addNewPlayerList(response?.players);
          resolve(response);
        },
        (error: any) => {
          console.log(error?.error);
          resolve(error);
        }
      );
    })
  }
  getQuizPlayerResponse(isRemote=false){
    return new Promise((resolve, reject) => {
      let obj = {
        presentationId: this.presentationId,
        slideId: this.activeSlideId == null ? "" : this.activeSlideId,
      }
      this._http.get(environment.MyApi + 'get-quiz-player-response?presentationId=' + obj.presentationId + "&slideId=" + obj.slideId).subscribe(
        (response: any) => {
          this.options = [];
          this.options = response?.slides.find(x=>x.slideId == this.activeSlideId)?.slideContentData;
          this.changeDataFormat(this.options);
          let slideDetais = response?.leaderBoard?.slidesQuizPlayer?.find(x=>x.slideId == this.activeSlideId);
          let quizVotedPlayers = slideDetais?.players;
          this.quizPlayers = slideDetais?.players;
          if(isRemote){
            this.dynamicComponent_Clone.instance.updatePlayerResponseViaRemote(quizVotedPlayers);
          }
          else{
          this.dynamicComponent_Clone.instance.updatePlayerResponse(quizVotedPlayers);
          }
          
          resolve(response);
        },
        (error: any) => {
          console.log(error?.error);
          resolve(error);
        }
      );
    })
  }
  //#endregion Quiz Slide Functions

  changeImportSlideLinkDataFormat(response:any){
    let importSlideLink: number | undefined;
    response.forEach((content: any) => {
      if (content.name === 'contentData' && Array.isArray(content.value)) {
        content.value.forEach((innerContent: any) => {
          if (innerContent.name === "ImportSlideLink") {
            importSlideLink = innerContent.value;
          }
        });
      }
    });
    return importSlideLink;
  }
  changeImportSlideNumberDataFormat(response:any){
    let importSlideNumber: number | undefined;
    response.forEach((content: any) => {
      if (content.name === 'contentData' && Array.isArray(content.value)) {
        content.value.forEach((innerContent: any) => {
          if (innerContent.name === "ImportSlideNumber") {
            importSlideNumber = innerContent.value;
            this.embeddedSlideIndex = innerContent.value;
          }
        });
      }
    });
    return importSlideNumber;
  }
  profanityWordsChecks(){
    var presentationsQuestions = [];
    var isProfanity = this.selectedProfantyLanguage.length;
    if(isProfanity > 0){
      this.presentationQuestions.filter((item:any)=>{
        var isProfanityContains = false;
          for(var i = 0; i < this.selectedProfantyLanguage.length; i++) {
            var language = this.selectedProfantyLanguage[i].language;
            var profanityWords = this.profanityLanguageWords[language];
            for(var j = 0; j < profanityWords.length; j++) {
              if(item.question.toLowerCase().includes(profanityWords[j].toLowerCase())) {
                isProfanityContains = true;
                break;
              }
            }
            if(isProfanityContains) {
              break;
          }
        }
        if(!isProfanityContains){
          presentationsQuestions.push(item);
        } else {
        }
      });
    }else{
      presentationsQuestions = this.presentationQuestions;
    }
    this.presentationQuestions = [];
    this.presentationQuestions = presentationsQuestions;
    this.presentationQuestionsLegnth = this.presentationQuestions?.length > 0 ? this.presentationQuestions.filter(q => !q.isAnswered).length : 0;
    return presentationsQuestions;
  }
  profanityWordsChecksForWord(data:any){
    if(data && Array.isArray(data)){
      var presentationsAnswer = [];
    var isProfanity = this.selectedProfantyLanguage.length;
    if(isProfanity > 0){
      data.filter((item:any)=>{
        var isProfanityContains = false;
        if(item.isProfanity){
          for(var i = 0; i < this.selectedProfantyLanguage.length; i++) {
            var language = this.selectedProfantyLanguage[i].language;
            var profanityWords = this.profanityLanguageWords[language];
            for(var j = 0; j < profanityWords.length; j++) {
              if(this.activeSlideTypeName == MasterSlideTypeName.TYPE_ANSWER_SLIDE_TYPE){
                if(item.answerdOptionId.toLowerCase().includes(profanityWords[j])) {
                  isProfanityContains = true;
                  break;
                }
              }else{
                if(item.Answer.toLowerCase().includes(profanityWords[j])) {
                  isProfanityContains = true;
                  break;
                }
              }
            }
            if(isProfanityContains) {
              break;
            }
          }
        }
        if(!isProfanityContains){
          presentationsAnswer.push(item);
        }
      });
    }else{
      presentationsAnswer = data;
      }
      return presentationsAnswer;
    }
    return [];
  }
  multipleChoicesResponseUpdate(data: any) {
    if (data != null && data?.optionIds?.length > 0) {
      if (data?.slideId === this.activeSlideId) {
        data?.optionIds.forEach(element => {
          let optionIndex = this.options.findIndex(x => x.OptionId == element);
          if (optionIndex != -1) {
            this.options[optionIndex].value++;
          }
          if (this.currentActiveSlide?.slideContentData) {
            const contentDataIndex = this.currentActiveSlide.slideContentData.findIndex(
              (content: any) => content.name === 'contentData'
            );

            if (contentDataIndex !== -1) {
              const optionsArray = this.currentActiveSlide.slideContentData[contentDataIndex].value.find(
                (item: any) => item.name === 'Options'
              );

              if (optionsArray && optionsArray.value) {
                const slideOptionIndex = optionsArray.value.findIndex(
                  (option: any[]) => option.find(o => o.name === 'OptionId')?.value === element
                );

                if (slideOptionIndex !== -1) {
                  const valueObj = optionsArray.value[slideOptionIndex].find(
                    (o: any) => o.name === 'value'
                  );
                  if (valueObj) {
                    valueObj.value++;
                  }
                }
              }
            }
          }
        });
        this.slideVotersCount = data.voterCount;
        this.dynamicComponent_Clone.instance.updateResult(this.dynamicChartData(this.options));
      }
      else {
        return;
      }
    }
    else {
      this.multipleChoiceIgnore = data.isIgnore;
      if (this.multipleChoiceIgnore) {
        this.slideVotersCount = data.voterCount;
      } else {
        this.slideVotersCount = data.voterCount;
        this.dynamicComponent_Clone.instance.updateResult(this.options);
      }
      return;
    }
  }
  selectAnswerResponseUpdate(data: any) {
    if (data != null && data?.optionId != null) {
      if (data?.slideId === this.activeSlideId) {
        let optionIndex = this.options.findIndex(x => x.OptionId == data?.optionId);
        if (optionIndex != -1) {
          this.options[optionIndex].value++;
          this.responseCountForQuiz += 1;
        }
        this.dynamicComponent_Clone.instance.updatePlayerResponse(this.responseCountForQuiz);
      }
      else {
        return;
      }
    }
    else {
      return;
    }
  }
  typeAnswerResponseUpdate(data: any) {
    if (data?.slideId === this.activeSlideId) {
      this.dynamicComponent_Clone.instance.updatePlayerResponse(data.players);
    }
  }
  scalesResponseUpdate(data: any) {
    // if (data != null && data?.optionIds?.length > 0) {
    //   data?.optionIds.forEach(element => {
    //     let optionIndex = this.options.findIndex(x => x.OptionId == element);
    //     if (optionIndex != -1) {
    //       this.options[optioIndex].value++;
    //     }
    //   });
    // }
    if (data != null && Array.isArray(data)) {
      if (data[0]?.slideId === this.activeSlideId) {
        if (data[0]?.isIgnore != true) {
          data.forEach(item => {
            // Find the index of the item in scalesResult using the OptionId
            let optionIndex = this.scalesResult.findIndex(x => x.OptionId == item.id);

            // If the option is found
            if (optionIndex !== -1) {
              // Find the specific score object where X matches
              let scoreIndex = this.scalesResult[optionIndex].Score.findIndex(score => score.X === item.x);

              // If the score object is found, update its Y value
              if (scoreIndex !== -1) {
                this.scalesResult[optionIndex].Score[scoreIndex].Y++;
              }
            }
            this.scalesResult[optionIndex].ResponseCount++;
            this.slideVotersCount = data[0].voterCount;
          });
          this.dynamicComponent_Clone.instance.totalResponseCount = this.slideVotersCount;
          this.dynamicComponent_Clone.instance.updateResult(this.scalesResult);
        } else {
          this.scalesIgnore = data[0].isIgnore;
          if (this.scalesIgnore) {
            this.slideVotersCount = data[0].voterCount;
          } else {
            this.slideVotersCount = data[0].voterCount;
            this.dynamicComponent_Clone.instance.totalResponseCount = this.slideVotersCount;
            this.dynamicComponent_Clone.instance.updateResult(this.scalesResult);
          }
        }
      }
      else {
        return;
      }
    }
    else {
      return;
    }

  }
  truthOrLieResponseUpdate(data: any[]) {
    if (data && data.length > 0) {
      if (data[0]?.slideId === this.activeSlideId) {
        data.forEach((element: any) => {
          const optionIndex = this.options.findIndex(option => option.OptionId === element.optionId);
          if (optionIndex !== -1) {
            this.options[optionIndex].truthCount = element.truthCount;
            this.options[optionIndex].falseCount = element.falseCount;
          }
          this.truthOrLieIgnore = element.isIgnore;
        });
        if(this.truthOrLieIgnore){
          this.slideVotersCount = data[0].voterCount;
        }else{
          this.slideVotersCount = data[0].voterCount;
          this.dynamicComponent_Clone.instance.updateChart(this.options);
        }
      }
      else {
        return;
      }
    }
    else {
      return
    }
  }

  guessTheNumberQuizResponseUpdate(data: any) {
    if (data != null && data.guesstheNumberQuizResult != null) {
      if (data?.slideId === this.activeSlideId) {
        var result = data.guesstheNumberQuizResult;
        var index = this.guessTheNumberResults.Score.findIndex(x => x.x == result.x);
        if (index != -1) {
          this.guessTheNumberResults.Score[index].y++;
          this.guessTheNumberResults.Score[index].selectedValue = result.selectedValue;
        }
        this.responseCountForQuiz += 1;
        this.dynamicComponent_Clone.instance.updatePlayerResponse(this.responseCountForQuiz);
      }
    }
  }
  lineupResponseUpdate(data: any) {
    if (data?.slideId === this.activeSlideId) {
      this.responseCountForQuiz += 1;
     this.dynamicComponent_Clone.instance.updatePlayerResponse(this.responseCountForQuiz);
    }
    
  }
  trafficLightsResponseUpdate(data: any) {
    if (data != null && data?.optionIds?.length > 0) {
      if (data?.slideId === this.activeSlideId) {
        data?.optionIds.forEach(element => {
          let optionIndex = this.options.findIndex(x => x.OptionId == element);
          if (optionIndex != -1) {
            this.options[optionIndex].value++;
          }
        });
        this.trafficLightIgnore = data.isIgnore;
        if(this.trafficLightIgnore){
          this.slideVotersCount = data.voterCount;
        }else{
          this.slideVotersCount = data.voterCount;
          this.dynamicComponent_Clone.instance.updateResult(this.options);
        }
      }
      else {
        return;
      }
    }
    else {
      return;
    }
  }
  guessTheNumberUpdate(data: any) {
    if (data != null && data.guesstheNumberResult != null) {
      if (data?.slideId === this.activeSlideId) {
        var result = data.guesstheNumberResult;
        var index = this.guessTheNumberResults.Score.findIndex(x => x.x == result[0].x);
        if (index != -1) {
          this.guessTheNumberResults.Score[index].y++;
          this.guessTheNumberResults.Score[index].selectedValue = result[0].selectedValue;
          this.slideVotersCount = data.voterCount;
          this.dynamicComponent_Clone.instance.updateResult(this.guessTheNumberResults);
        }
      }
      else {
        return;
      }

    }
    else {
      return;
    }
  }
  thisOrThatUpdate(data: any) {
    if(data != null){
      if (data?.slideId === this.activeSlideId) {
        var index = this.options.findIndex(x=>x.OptionId == data.optionId)
        if(index != -1){
          this.options[index].value++;
          this.slideVotersCount  = data.voterCount;
        }
        this.thisOrThatIgnore = data.isIgnore;
        if(this.thisOrThatIgnore){
          this.slideVotersCount = data.voterCount;
        }else{
          this.slideVotersCount = data.voterCount;
          this.dynamicComponent_Clone.instance.updateChart(this.options);
        }
       
      }
      else{
        return;
      }
    }
    else{
      return;
    }
  }
  
  rankingResponseUpdate(data: any) {
    if (data != null && data?.rankingResult?.length > 0) {
      if (data?.slideId === this.activeSlideId) {
        data?.rankingResult.forEach(element => {
          let optionIndex = this.options.findIndex(x => x.OptionId == element.optionId);
          if (optionIndex != -1) {
            this.options[optionIndex].value++;
            this.options[optionIndex].Position = this.options[optionIndex].Position + element.count;
          }
        });
        this.slideVotersCount = data.voterCount;
        this.dynamicComponent_Clone.instance.updateResult(this.dynamicChartData(this.options));
      }
      else {
        return;
      }
    }
    else {
      this.rankingIgnore = data.isIgnore;
        if(this.rankingIgnore){
          this.slideVotersCount = data.voterCount;
        }
        else{
          this.slideVotersCount = data.voterCount;
          this.dynamicComponent_Clone.instance.updateResult(this.dynamicChartData(this.options));
        }
      return;
    }
  }
  openEndedResponseUpdate(data: any) {
    if (data?.slideId === this.activeSlideId) {
      if (data.openEndedResult != null) {
        const newoptions = data.openEndedResult.map((item: any) => {
          return {
            Answer: item.answer,
            ModerateAnswer: item.moderateAnswers,
            AnswerId: item.answerId,
            isProfanity: item.isProfanity
          };
        });
        this.options = [...(this.options || []), ...newoptions];
        this.optionslength = this.options?.length;
        this.slideVotersCount = data.openEndedResult[0].voterCount;
        if (this.currentActiveSlide?.slideContentData) {
          const contentDataIndex = this.currentActiveSlide.slideContentData.findIndex(
            (content: any) => content.name === 'contentData'
          );
          if (contentDataIndex !== -1) {
            const answersArray = this.currentActiveSlide.slideContentData[contentDataIndex].value.find(
              (item: any) => item.name === 'Options'
            );

            if (answersArray) {
              // If Answers array exists, update it
              if (!Array.isArray(answersArray.value)) {
                answersArray.value = [];
              }

              // Add new answers to the content data
              data.openEndedResult.forEach((result: any) => {
                const newAnswer = [
                  {
                    name: 'AnswerId',
                    value: result.answerId
                  },
                  {
                    name: 'Answer',
                    value: result.answer
                  },
                  {
                    name: 'ModerateAnswer',
                    value: result.moderateAnswers
                  },
                  {
                    name: 'isProfanity',
                    value: result.isProfanity
                  }
                ];
                answersArray.value.push(newAnswer);
              });
            }
          }
        }
        this.dynamicComponent_Clone.instance.updateChart(this.options);
      }
      else {
        this.openEndedIgnore = data.isIgnore;
        if (this.openEndedIgnore) {
          this.slideVotersCount = data.voterCount;
        }
        return;
      }
    }
    else {
      return;
    }
  }
  wordCloudResponseUpdate(data:any){
    if (data?.slideId === this.activeSlideId) {
      if(data.wordCloudResult != null){
      const newOptions = data.wordCloudResult.map((item: any) => {
        return {
          Answer: item.answer,               
          ModerateAnswer: item.moderateAnswer, 
          AnswerId: item.answerId,
          isProfanity: item.isProfanity                 
        };
      });
      this.options = [...(this.options || []), ...newOptions];
      this.optionslength = this.options?.length;
      this.slideVotersCount  = data.voterCount;
      this.dynamicComponent_Clone.instance.updateChart(this.options);
    }
    else
    {
      this.wordCloudIgnore = data.isIgnore;
        if(this.wordCloudIgnore){
          this.slideVotersCount = data.voterCount;
        }else{
          this.slideVotersCount = data.voterCount;
          this.dynamicComponent_Clone.instance.updateChart(this.dynamicChartData(this.options));
        }
      return;
    }
  }
  }
  openEndedModerateAnswerUpdate(data: any) {
    this.options.forEach((option: any) => {
      if (option.Answer.trim().toLowerCase() === data.responseId.trim().toLowerCase()) {
        option.ModerateAnswer = data.moderateValue;
      }
    });
    this.dynamicComponent_Clone.instance.updateChart(this.options);
  }
  resetOpenEndedModerateAnswerUpdate(data: any) {
    this.options.forEach((option: any) => {
        option.ModerateAnswer = data.moderateValue;
    });
    this.dynamicComponent_Clone.instance.updateChart(this.options);
  }
  wordCloudModerateAnswerUpdate(data:any){
    this.options.forEach((option: any) => {
      if (option.Answer.trim().toLowerCase() === data.responseId.trim().toLowerCase()) {
        option.ModerateAnswer = data.moderateValue;
      }
    });
    this.dynamicComponent_Clone.instance.updateChart(this.options);
  }
  resetWordCloudModerateAnswerUpdate(data:any){
    this.options.forEach((option: any) => {
        option.ModerateAnswer = data.moderateValue;
    });
    this.dynamicComponent_Clone.instance.updateChart(this.options);
  }
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  setLoading(loading: boolean) {
    this.isLoadingSubject.next(loading);
  }
  checkOrientation(croppedPosition: { x1: number; y1: number; x2: number; y2: number }): string {
    const width = croppedPosition.x2 - croppedPosition.x1;
    const height = croppedPosition.y2 - croppedPosition.y1;
  
    const aspectRatio = width / height;
  
    if (aspectRatio > 2) {
      return 'Landscape';
    } else {
      return 'Portrait';
    } 
  }

  updateMultimediaSlideImage(multimediaImageCroppedUrl: string): Promise<any> {
    const updateMultiMediaSlideImageDTO = {
      ImageUrl: multimediaImageCroppedUrl,
    };
    return new Promise((resolve, reject) => {
      this._http.post(environment.MyApi + 'upload-multimedia-image', updateMultiMediaSlideImageDTO).subscribe(
        (response: any) => {
          if (response) {
            resolve(response);
          } else {
            console.error('No response received');
            reject('No response received');
          }
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }

  //#region Dynamic Slide type use ages
  convertDataFormat(response: any, conversionType: string): any {
    if (!response) return response;

    const slideContentData = response;
    const dataTypes = {
      options: [],
      suffledData: [],
      guesstheNumberoptionsData: [],
      guessTheNumberResultsData: [],
      scaleResultData: [],
      scalesDimensionsData: [], 
    };

    slideContentData.forEach((content: any) => {
      if (content.name === 'contentData' && Array.isArray(content.value)) {
        content.value.forEach((innerContent: any) => {
          switch (innerContent.name) {
            case 'Options':
              dataTypes.options = dataTypes.options.concat(innerContent.value);
              break;
            case 'GuessTheNumberOptions':
              dataTypes.guesstheNumberoptionsData = dataTypes.guesstheNumberoptionsData.concat(innerContent.value);
              break;
            case 'GuessTheNumberResults':
              dataTypes.guessTheNumberResultsData = dataTypes.guessTheNumberResultsData.concat(innerContent.value);
              break;
            case 'ScalesResult':
              dataTypes.scaleResultData = dataTypes.scaleResultData.concat(innerContent.value);
              break;
            case 'Dimensions':
              dataTypes.scalesDimensionsData = dataTypes.scalesDimensionsData.concat(innerContent.value);
              break;
          }
        });
      }
    });

    switch (conversionType) {
      case 'Options':
        return this.convertOptionsDataFormat(dataTypes.options);
      case 'GuessTheNumberOptions':
        return this.convertGuessTheNumberOptions(dataTypes.guesstheNumberoptionsData);
      case 'GuessTheNumberResults':
          return this.transformGuessTheNumberResults(dataTypes.guessTheNumberResultsData);
      case 'ScaleResult':
          return this.changeScalesData(dataTypes.scaleResultData);
      case 'Dimensions':
          return this.changeDimensionsData(dataTypes.scalesDimensionsData);
      default:
        return response;
    }
  }

  convertOptionsDataFormat(optionsData: any[]): any[] {
    if (optionsData.length === 0) return [];

    this.options = optionsData.map(optionArray => {
      return optionArray.reduce((acc, curr) => {
        acc[curr.name] = curr.value;
        return acc;
      }, {});
    });
    this.optionslength = this.options?.length;
    return this.options;
  }
  convertGuessTheNumberOptions(guessTheNumberOptions:any):any{
    if (guessTheNumberOptions?.length != 0) {
      return guessTheNumberOptions?.reduce((acc, curr) => {
        acc[curr.name] = curr.value;
        return acc;
      }, {});
    }
  }
  changeDimensionsData(scalesDimensions:any){
    if (scalesDimensions?.length != 0) {
      this.scalesDimensions = scalesDimensions?.map(optionArray => {
        return optionArray.reduce((acc, curr) => {
          acc[curr.name] = curr.value;
          return acc;
        }, {});
      });
     return this.scalesDimensions;
    }
  }
  TemplateProfanityWordsChecks(presentationQuestion:any){
    var presentationsQuestions = [];
    var isProfanity = this.selectedProfantyLanguage.length;
    if(isProfanity > 0){
      presentationQuestion.filter((item:any)=>{
        var isProfanityContains = false;
        if(item.isProfanity){
          for(var i = 0; i <= this.selectedProfantyLanguage.length; i++) {
            var language = this.selectedProfantyLanguage[i].language;
            var profanityWords = this.profanityLanguageWords[language];
            for(var j = 0; j < profanityWords.length; j++) {
              if(item.question.toLowerCase().includes(profanityWords[j])) {
                isProfanityContains = true;
                break;
              }
            }
            if(isProfanityContains) {
              break;
            }
          }
        }
        if(!isProfanityContains){
          presentationsQuestions.push(item);
        }
      });
    }else{
      presentationsQuestions = presentationQuestion;
    }
    return presentationsQuestions;
  }
  getCurrentSlidePlayerList(slidesQuizPlayerList:any,slideId:any): any[] {
    return slidesQuizPlayerList?.find(x => x.slideId == slideId)?.players?.filter(x => x.isVoted == true && x.answerdOptionId != '') || [];
  }
  updateChoicesCorrectAnswer() {
    if (this.currentActiveSlide?.slideContentData) {
      const contentDataIndex = this.currentActiveSlide.slideContentData.findIndex(
        (content: any) => content.name === 'contentData'
      );
      if (contentDataIndex !== -1) {
        const contentDataArray = this.currentActiveSlide.slideContentData[contentDataIndex].value;
        const chooseCorrectAnswer = contentDataArray.find(
          (item: any) => item.name === 'chooseCorrectAnswer'
        );
        if (chooseCorrectAnswer) {
          chooseCorrectAnswer.value = this.chooseCorrectAnswers;
        }
      }
    }
  }
  updateShowCorrectAnswer(showCorrectAnswer:boolean) {
    if (this.currentActiveSlide?.slideContentData) {
      const contentDataIndex = this.currentActiveSlide.slideContentData.findIndex(
        (content: any) => content.name === 'contentData'
      );
      if (contentDataIndex !== -1) {
        const contentDataArray = this.currentActiveSlide.slideContentData[contentDataIndex].value;
        const chooseCorrectAnswer = contentDataArray.find(
          (item: any) => item.name === 'showCorrectAnswer'
        );
        if (chooseCorrectAnswer) {
          chooseCorrectAnswer.value = showCorrectAnswer;
        }
      }
    }
  }

  updateOptionsVisualizationColor(colors: string[]) {
    if (this.currentActiveSlide?.slideContentData) {
      const contentDataIndex = this.currentActiveSlide.slideContentData.findIndex(
        (content: any) => content.name === 'contentData'
      );
      if (contentDataIndex !== -1) {
        const contentDataArray = this.currentActiveSlide.slideContentData[contentDataIndex].value;
        const options = contentDataArray.find(
          (item: any) => item.name === 'Options'
        );
        if (options && options.value) {
          options.value.forEach((option: any, index: number) => {
            const visualizationColor = option.find((item: any) => item.name === 'visualizationColor');
            if (visualizationColor && colors[index]) {
              visualizationColor.value = colors[index];
            }
          });
        }
      }
    }
  }
  triggerMultimediaImageAction(data: any) {
    this.multimediaImageActionSubject.next({
      ...data,
      presentationId: this.presentationId, slideId: this.activeSlideId,
      id: uuidv4() // make each action unique
    });
  }
  triggerAction(data:any) {
    this.multimediaActionSubject.next({
      ...data,
      presentationId: this.presentationId, slideId: this.activeSlideId,
      id: uuidv4() // make each action unique
    });
  }
  isAttendeeRole(): boolean {
    return localStorage.getItem('role') === 'attendee';
  }
  //#endregion Dynamic Slide type use ages
}