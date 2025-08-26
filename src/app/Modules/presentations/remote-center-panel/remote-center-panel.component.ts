import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DynamicChartComponent } from '../dynamic-chart/dynamic-chart.component';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { WorkSignalRServiceService } from 'src/app/core/Sevices/WorkSpace/work-signal-rservice.service';
import { PresenterToolbarService } from 'src/app/core/Sevices/Presentation/presenter-toolbar.service';
import { MasterSlideTypeName, QuizPresenterScreenManageConstant } from 'src/app/utility/constants';
import { CommanService } from 'src/app/core/Sevices/comman.service';
import { ToastrService } from 'ngx-toastr';
import { image } from 'd3';
import { DynamicSlideTypeDirective } from 'src/app/shared/directive/dynamic-slide-type.directive';
import { DynamicSlideTypeComponent } from 'src/app/shared/Component/dynamic-slide-type/dynamic-slide-type.component';

@Component({
    selector: 'app-remote-center-panel',
    templateUrl: './remote-center-panel.component.html',
    styleUrls: ['./remote-center-panel.component.scss'],
    standalone: false
})
export class RemoteCenterPanelComponent implements OnInit {
  @ViewChild('CenterPanel', { static: true }) CenterPanel: ElementRef;
  @ViewChild('InnerScreen', { static: true }) InnerScreen: ElementRef;
  @ViewChild('OuterScreen', { static: true }) OuterScreen: ElementRef;
  @ViewChild(DynamicSlideTypeDirective, { static: true }) appDynamicComponent!: DynamicSlideTypeDirective;
  @ViewChild('dynamicSlideComponent') dynamicSlideComponent!: DynamicSlideTypeComponent;
  @ViewChild('slideImage') slideImage: ElementRef<HTMLImageElement>;
  @Input('isLoading') public isLoading: boolean = false;
  @Input('presenterTime') public presenterTime: any;
  correctAnswersButtonText: string = this.workspaceService.multiplechoicepresenterEnterClick ? "Hide correct answer" : 'Show correct answer';
  correctAnswersButtonGuessTheNumberText: string = this.workspaceService.guessthenumberpresenterEnterClick ? "Hide correct" : 'Show correct';
  correctAnswersButtonTruthOrLieNumberText: string = this.workspaceService.truthorliepresenterEnterClick ? "Hide correct" : 'Show correct';
  masterSlideTypeName = MasterSlideTypeName;
  quizPresenterScreenManageConstant = QuizPresenterScreenManageConstant;
  isLastSlide: boolean;
  panelWidth: string;
  panelHeight: string;
  isStartQuiz: boolean = false;
  contrastColor: string;
  imageType: any;
  showPdf: boolean;
  slidePdfImage: any;
  questionLength:number;
  @Output() isPresentationResetResults = new EventEmitter();
  @Output() closeModalsEmitter = new EventEmitter();
  logoPositionType:string='';
  constructor(
    public workspaceService: WorkspaceService,
    public workSpaceSignalRService: WorkSignalRServiceService,
    public presenterToolbarService: PresenterToolbarService,
    private _CommanService:CommanService,
    private _toastr: ToastrService) { }

  ngOnInit(): void {
    if (!this.workspaceService.currentMasterSlideTypeId && localStorage.getItem('slideTypeId')) {
      this.workspaceService.currentMasterSlideTypeId = localStorage.getItem('slideTypeId');
    }
    this.multipleChoicesCorrectAnswers();
    this.isLastSlideOn();
    this.moveNextandPreviewsSlide();
    this.startQuizForRemote();
    this.setScaleForLayout();
    this.initialScreenSizeSet();
    this.checkImagePositionType();
    this.resetResultSubject();
    this.imageType = this.workspaceService.slideLayoutType;
    this.questionLength = this.workspaceService?.presentationQuestionsLegnth;
  }
  ngAfterViewInit() {
    this.setImageLayout();
    this.setScaleForLayout();
    this.initialScreenSizeSet();
    this.checkImagePositionType();
    this.QuizButtonUpdate();
    setTimeout(() => {
      this.updateDynamicComponent();
    }, 100);
  }
  ngDoCheck() {
  this.setScaleForLayout();
  this.setImageLayout();
  }

  ngAfterContentInit() {
    this.setScaleForLayout();
    this.imageType = this.workspaceService.slideLayoutType;
  }
  checkImagePositionType(){
    if(this.workspaceService.presentationTheme?.ThemeLogo?.logoCroppedUrl != null || this.workspaceService.presentationTheme?.ThemeLogo?.logoCroppedUrl != ""){
     this.logoPositionType =  this.workspaceService.checkOrientation(this.workspaceService.presentationTheme?.ThemeLogo?.croppedposition);
    }
  }
  moveNextSlide() {
    let slideTheme: any;
    if (this.workspaceService.slideDesign) {
      if (this.workspaceService.slideDesign.slideResetTheme) {
        slideTheme = this.workspaceService.setSlideThemes(this.workspaceService.slideDesign);
      } else {
        slideTheme = this.workspaceService.presentationTheme;
      }
      this.contrastColor = this.getBackgroundColorWithOpacity(slideTheme.ThemeBackgroundColor);
      this.isLoading = true;
    }
    if (this.workspaceService.slideCount + 1 == this.workspaceService.currentSlideIndex + 2) {
      this.isLoading = false;
      this.workspaceService.isLastSlide = true;
      var isLastSlideDTO = {
        presentationId: this.workspaceService.presentationId,
        isLastSlide: this.workspaceService.isLastSlide
      }
      this.workSpaceSignalRService.isLastSlide(isLastSlideDTO);
    } else {
      let nextSlideId = this.workspaceService.slideListArray[this.workspaceService.currentSlideIndex + 1]?.slideId;
      if (nextSlideId != null || nextSlideId != undefined) {
      //  localStorage.setItem('activeSlideId', nextSlideId);
      this.workspaceService.activeSlideId = nextSlideId;
        this.presenterToolbarService.nextSlide().then((response: any) => {
          let presentationData = response['data'];
          var nextandPreviousRemote = {
            presentationId: this.workspaceService.presentationId,
            activeSlideId:nextSlideId,
            activeSlideTypeId: presentationData?.masterSlideTypeId,
          }
          this.isLoading = false;
          this.workSpaceSignalRService.moveNextandPerviousFromRemote(nextandPreviousRemote);
          //  this.dynamicSlideComponent.switchComponent(presentationData?.masterSlideTypeId);
          if (this.workspaceService.slideContentType == this.workspaceService.masterSlideTypeName.QUIZ) {
            this.isPresentationResetResults.emit(true);
            if (this.workspaceService.slideContentType == this.workspaceService.masterSlideTypeName.QUIZ && this.workspaceService.activeSlideTypeName != this.workspaceService.masterSlideTypeName.LEADER_BOARD_SLIDE_TYPE){
              if (this.workspaceService.quizState == this.quizPresenterScreenManageConstant.WAITING_FOR_QUIZ_PLAYERS) {
                this.isStartQuiz = false;
              }
              else {
                this.isStartQuiz = true;
              }  
            }
          }
          if(this.workspaceService.activeSlideTypeName == this.masterSlideTypeName.ImportDocument){
            this.setImageLayout();
          }
          this.imageType = this.workspaceService.slideLayoutType;
          this.buttonContentUpdate();
        }).catch((error) => {
          console.error('Error in storeActiveSlideDetails(): ', error);
        });
      }
    }
  }
  movePreviousSlide() {
    let slideTheme: any;
    if (this.workspaceService.slideDesign) {
      if (this.workspaceService.slideResetTheme) {
        slideTheme = this.workspaceService.setSlideThemes(this.workspaceService.slideDesign);
      } else {
        slideTheme = this.workspaceService.presentationTheme;
      }
      this.contrastColor = this.getBackgroundColorWithOpacity(slideTheme.ThemeBackgroundColor);
      this.isLoading = true;
    }
    if (this.workspaceService.isLastSlide) {
      var nextandPreviousRemote = {
        presentationId: this.workspaceService.presentationId,
        activeSlideId:this.workspaceService.activeSlideId,
        activeSlideTypeId: this.workspaceService?.slideTypeId,
      }
      this.workSpaceSignalRService.moveNextandPerviousFromRemote(nextandPreviousRemote);
      this.workspaceService.isLastSlide = false;
      var isLastSlideDTO = {
        presentationId: this.workspaceService.presentationId,
        IsLastSlide: this.workspaceService.isLastSlide
      }
      this.workSpaceSignalRService.isLastSlide(isLastSlideDTO);
      this.isLoading = false;
      return;
    }
    let perivousSlideId = this.workspaceService.slideListArray[this.workspaceService.currentSlideIndex - 1]?.slideId;
    if (perivousSlideId != null || perivousSlideId != undefined) {
    this.workspaceService.activeSlideId = perivousSlideId;
      this.presenterToolbarService.previousSlides().then((response: any) => {
        let presentationData = response['data'];
        var nextandPreviousRemote = {
          presentationId: this.workspaceService.presentationId,
          activeSlideId:perivousSlideId,
          activeSlideTypeId: presentationData?.masterSlideTypeId,
        }
        this.workSpaceSignalRService.moveNextandPerviousFromRemote(nextandPreviousRemote);
        // this.dynamicSlideComponent.switchComponent(presentationData?.masterSlideTypeId);
        this.isLoading = false;
        if (this.workspaceService.slideContentType == this.workspaceService.masterSlideTypeName.QUIZ ) {
          this.isPresentationResetResults.emit(true);
          if(this.workspaceService.slideContentType == this.workspaceService.masterSlideTypeName.QUIZ&& this.workspaceService.activeSlideTypeName != this.workspaceService.masterSlideTypeName.LEADER_BOARD_SLIDE_TYPE){
            if (this.workspaceService.quizState == this.quizPresenterScreenManageConstant.WAITING_FOR_QUIZ_PLAYERS) {
              this.isStartQuiz = false;
            }
            else {
              this.isStartQuiz = true;
            }
          }
        }
        if(this.workspaceService.activeSlideTypeName == this.masterSlideTypeName.ImportDocument){
          this.setImageLayout();
        }
        this.imageType = this.workspaceService.slideLayoutType;
        this.buttonContentUpdate();
      }).catch((error) => {
        console.error('Error in storeActiveSlideDetails(): ', error);
      });
    }
  }
  multipleChoiceCorrectAnswersUpdate() {
    this.workspaceService.multiplechoicepresenterEnterClick = !this.workspaceService.multiplechoicepresenterEnterClick;
    if (this.workspaceService.multiplechoicepresenterEnterClick) {
      this.correctAnswersButtonText = "Hide correct answer";
    }
    else {
      this.correctAnswersButtonText = "Show correct answer";
    }
    let showChooseCorrectAnswerDTO = {
      presentationId: this.workspaceService.presentationId,
      slideId: this.workspaceService.activeSlideId,
      isShowCorrectAnswers: this.workspaceService.multiplechoicepresenterEnterClick
    }
    this.presenterToolbarService.showCorrectAnswerUpdate(showChooseCorrectAnswerDTO);
  }
  guesstheNumberCorrectAnswersUpdate() {
    this.workspaceService.guessthenumberpresenterEnterClick = !this.workspaceService.guessthenumberpresenterEnterClick;
    if (this.workspaceService.guessthenumberpresenterEnterClick) {
      this.correctAnswersButtonGuessTheNumberText = "Hide correct";
    }
    else {
      this.correctAnswersButtonGuessTheNumberText = "Show correct";
    }
    let showChooseCorrectAnswerDTO = {
      presentationId: this.workspaceService.presentationId,
      slideId: this.workspaceService.activeSlideId,
      isShowCorrectAnswers: this.workspaceService.guessthenumberpresenterEnterClick
    }
    this.presenterToolbarService.showCorrectAnswerUpdate(showChooseCorrectAnswerDTO);
  }
  truthOrLieCorrectAnswersUpdate() {
    this.workspaceService.truthorliepresenterEnterClick = !this.workspaceService.truthorliepresenterEnterClick;
    if (this.workspaceService.truthorliepresenterEnterClick) {
      this.correctAnswersButtonTruthOrLieNumberText = "Hide correct";
    }
    else {
      this.correctAnswersButtonTruthOrLieNumberText = "Show correct";
    }
    let showChooseCorrectAnswerDTO = {
      presentationId: this.workspaceService.presentationId,
      slideId: this.workspaceService.activeSlideId,
      isShowCorrectAnswers: this.workspaceService.truthorliepresenterEnterClick
    }
    this.presenterToolbarService.showCorrectAnswerUpdate(showChooseCorrectAnswerDTO);
  }
  startQuizFromRemote() {
    this.isStartQuiz = true;
    let QuizDTO = {
      presentationId: this.workspaceService.presentationId,
      slideId: this.workspaceService.activeSlideId
    }
    this.workSpaceSignalRService.startQuizForRemote(QuizDTO);
  }
  dynamicComponentUpdate(slideId: any,isRemote:boolean=false) {
     this.dynamicSlideComponent.switchComponent(slideId,isRemote);
  }
  initialScreenSizeSet() {
    const CenterScreenElement = this.CenterPanel.nativeElement;
    const width = CenterScreenElement.offsetWidth;
    const height = CenterScreenElement.offsetHeight;
    if (width > 1500) {
      this.panelWidth = height * 1.555 + 'px';
      this.panelHeight = (height * 1.777) / 1.777 + 'px';
    } else {
      this.panelWidth = 1280 + 'px';
      this.panelHeight = 700 + 'px';
    }
  }
  setScaleForLayout() {
    const CENTERSCREENELEMENT = this.CenterPanel.nativeElement;
    const WIDTH = CENTERSCREENELEMENT.offsetWidth;
    const HEIGHT = CENTERSCREENELEMENT.offsetHeight;
    const INNERSCREENELEMENT = this.InnerScreen.nativeElement;
    var innerWidth = INNERSCREENELEMENT.offsetWidth;
    const INNERHEIGHT = INNERSCREENELEMENT.offsetHeight;
    var ratio = innerWidth / INNERHEIGHT;
    if (ratio > 1.7) {
      innerWidth = INNERHEIGHT * 1.777;
      INNERSCREENELEMENT.style.width = innerWidth;
    }
    var scale = Math.min(WIDTH / innerWidth, HEIGHT / INNERHEIGHT);
    if (scale > 1) {
      scale = innerWidth / INNERHEIGHT;
      if (scale > 1) {
        scale = 1;
      }
    }
    INNERSCREENELEMENT.style.scale = scale;
    INNERSCREENELEMENT.style.width = innerWidth * scale;
    INNERSCREENELEMENT.style.height = INNERHEIGHT * scale;
    const OuterElement = this.OuterScreen.nativeElement;
    OuterElement.style.width = innerWidth * scale;
    OuterElement.style.height = INNERHEIGHT * scale;
  }
  @HostListener('window:resize')
  onResize() {
    this.setScaleForLayout();
    if (window.innerWidth < 768 || window.innerWidth > 1024) {
      this.setScaleForLayout();
     // this.dynamicChartComponent.switchComponent(this.workspaceService?.masterSlideTypeId);
    }
  }
  getBackgroundColorWithOpacity(colorCode: any): string {
    let rgb: number[];
    // Check if the input is a hex code
    if (colorCode?.startsWith('#')) {
      rgb = this.hexToRgb(colorCode);
    } else {
      // Assume it's an rgb string
      rgb = colorCode?.match(/\d+/g).map(Number);
    }
    // Calculate the contrast color
    const contrastRgb = rgb?.map((val) => (val > 128 ? 0 : 255));
    // Return the contrast color with opacity
    return `rgba(${contrastRgb?.join(', ')})`;
  }
  private hexToRgb(hex: string): number[] {
    const hexValue = hex?.replace(/^#/, '');
    const rgb = [];
    for (let i = 0; i < 3; i++) {
      rgb?.push(parseInt(hexValue.substr(i * 2, 2), 16));
    }
    return rgb;
  }
  setImageLayout() {
    if (this.workspaceService.activeSlideTypeName !== this.masterSlideTypeName.ImportDocument) {
      this.imageType = this._CommanService.GetSelectLayoutImage();
      this.showPdf = false;
    } else {
      this.showPdf = true;
      this.slidePdfImage = this.workspaceService.slidePptImage;
    }
  }
  loadBGLayout() {
    if (this.workspaceService.activeSlideTypeName === this.masterSlideTypeName.ImportDocument) {
      //this.activePptImage = false;
      this.showPdf = true;
      this.slidePdfImage = this.workspaceService.slidePptImage;
    }  else{
      //this.activePptImage = false;
      this.showPdf = false;
      var defaultImageUrl = "/assets/images/static_bg_image.svg";
      var fullImageUrl = this.workspaceService.slideLayoutImage;
      if(this.workspaceService.activeSlideId ===''){
        this.imageType ='Default';
        this.workspaceService.slideLayoutType = this.imageType;
      }
      else{
        this.imageType = this.workspaceService.slideLayoutType;
      }
      const finalImageUrl = fullImageUrl || defaultImageUrl;
      return {
        backgroundImage: `url(${finalImageUrl})`,
      };
    }
  }
  checkImageOrientation() {
    const image = this.slideImage.nativeElement;
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    if (width > height) {
      image.classList.add('landscape');
      image.classList.remove('portrait');
    } else {
      image.classList.add('portrait');
      image.classList.remove('landscape');
    }
  }
  clickEventPrevent(){
    this._toastr.success('The action could not be performed.', "", {
      timeOut: 3000,
    });
  }

  // * =================== Behaviour Subject =======================

  multipleChoicesCorrectAnswers() {
    this.workspaceService.multipleChoicesCorrectAnswersBehavioursSubject.subscribe((data: any) => {
      if (data != null || data != undefined) {
        switch (this.workspaceService.activeSlideTypeName) {
          case this.masterSlideTypeName.MULTIPLE_CHOICE_SLIDE_TYPE: {
            this.workspaceService.multiplechoicepresenterEnterClick = data?.isShowCorrectAnswers;
            if (this.workspaceService.multiplechoicepresenterEnterClick) {
              this.correctAnswersButtonText = "Hide correct answer";
            }
            else {
              this.correctAnswersButtonText = "Show correct answer";
            }
            this.workspaceService.dynamicComponent_Clone.instance.multiplechoicepresenterEnterClick =  data?.isShowCorrectAnswers;
            break;
          }
          case this.masterSlideTypeName.GUESS_TEHE_NUMBER_SLIDE_TYPE: {
            this.workspaceService.guessthenumberpresenterEnterClick = data?.isShowCorrectAnswers;
            if (this.workspaceService.guessthenumberpresenterEnterClick) {
              this.correctAnswersButtonGuessTheNumberText = "Hide correct";
            }
            else {
              this.correctAnswersButtonGuessTheNumberText = "Show correct";
            }
            this.workspaceService.dynamicComponent_Clone.instance.guessthenumberpresenterEnterClick =  data?.isShowCorrectAnswers;
            break;
          }
          case this.masterSlideTypeName.TRUTH_OR_LIE_SLIDE_TYPE: {
            this.workspaceService.truthorliepresenterEnterClick = data?.isShowCorrectAnswers;
            if (this.workspaceService.truthorliepresenterEnterClick) {
              this.correctAnswersButtonTruthOrLieNumberText = "Hide correct";
            }
            else {
              this.correctAnswersButtonTruthOrLieNumberText = "Show correct";
            }
            this.workspaceService.dynamicComponent_Clone.instance.truthorliepresenterEnterClick =  data?.isShowCorrectAnswers;
            break;
          }
          default: {
            console.log("Slide not fount");
            break;
          }
        }
        this.workspaceService.dynamicChartResponseLoad();
      }
    });
  }
  isLastSlideOn() {
    this.workspaceService.isLastBehavioursSubject.subscribe((data: any) => {
      if (data != undefined || data != null) {
        this.workspaceService.isLastSlide = data?.isLastSlide;

      }
    });
  }
  startQuizForRemote() {
    this.workspaceService.startQuizforRemoteBehavioursSubject.subscribe((data: any) => {
      if (data != null) {
        this.isStartQuiz = true;
      }
    });
  }
  updateDynamicComponent() {
    if (this.workspaceService.currentMasterSlideTypeId && this.dynamicSlideComponent) {
      this.dynamicSlideComponent.switchComponent(this.workspaceService.currentMasterSlideTypeId);
    }
  }
  moveNextandPreviewsSlide() {
    this.workspaceService.moveNextSlideBehavioursSubject.subscribe((data: any) => {
      if(data != null || data != undefined){
      if (data.activeSlideTypeId != undefined || data.activeSlideId != null) {
        //localStorage.setItem('activeSlideId', data.activeSlideId);
        if(!data.isPreview){
          this.workspaceService.activeSlideId =  data.activeSlideId;
          localStorage.setItem('slideTypeId', data.activeSlideTypeId);
          this.workspaceService.storeActiveSlideDetails().then(
            (response: any) => {
              let presentationData = response['data'];
              this.closeModalsEmitter.emit(true);
              // this.dynamicSlideComponent.switchComponent(presentationData?.masterSlideTypeId);
              if(this.workspaceService.activeSlideTypeName == this.masterSlideTypeName.ImportDocument){
                this.setImageLayout();
              }
              if (this.workspaceService.slideContentType == this.workspaceService.masterSlideTypeName.QUIZ) {
                this.isPresentationResetResults.emit(true);
                if(this.workspaceService.slideContentType == this.workspaceService.masterSlideTypeName.QUIZ&& this.workspaceService.activeSlideTypeName != this.workspaceService.masterSlideTypeName.LEADER_BOARD_SLIDE_TYPE){
                  if (this.workspaceService.quizState == this.quizPresenterScreenManageConstant.WAITING_FOR_QUIZ_PLAYERS) {
                    this.isStartQuiz = false;
                  }
                  else {
                    this.isStartQuiz = true;
                  }
                }
              }
              this.buttonContentUpdate();
              setTimeout(() => {
                this.updateDynamicComponent();
              }, 100);
            },
            (error: any) => {
              console.log(error);
            }
          )
        }
      }
    }
    });
  }
  resetResultSubject() {
    this.workspaceService.resetResultBehavioursSubject.subscribe((data: any) => {
      if (data != null) {
        this.workspaceService.storeActiveSlideDetails().then(
          (response: any) => {
            let presentationData = response['data'];
            this.buttonContentUpdate();
            this.QuizButtonUpdate();
          },
          (error: any) => {
            console.log(error);
          }
        )
      }
    });
  }
  buttonContentUpdate() {
    switch (this.workspaceService.activeSlideTypeName) {
      case this.masterSlideTypeName.MULTIPLE_CHOICE_SLIDE_TYPE: {
        if (this.workspaceService.multiplechoicepresenterEnterClick) {
          this.correctAnswersButtonText = "Hide correct answer";
        }
        else {
          this.correctAnswersButtonText = "Show correct answer";
        }
        break;
      }
      case this.masterSlideTypeName.GUESS_TEHE_NUMBER_SLIDE_TYPE: {
        if (this.workspaceService.guessthenumberpresenterEnterClick) {
          this.correctAnswersButtonGuessTheNumberText = "Hide correct";
        }
        else {
          this.correctAnswersButtonGuessTheNumberText = "Show correct";
        }
        break;
      }
      case this.masterSlideTypeName.TRUTH_OR_LIE_SLIDE_TYPE: {
        if (this.workspaceService.truthorliepresenterEnterClick) {
          this.correctAnswersButtonTruthOrLieNumberText = "Hide correct";
        }
        else {
          this.correctAnswersButtonTruthOrLieNumberText = "Show correct";
        }
        break;
      }
      case this.masterSlideTypeName.SELECT_ANSWER_SLIDE_TYPE : 
      case this.masterSlideTypeName.TYPE_ANSWER_SLIDE_TYPE  :
      case this.masterSlideTypeName.GUESS_THE_NUMBER_QUIZ :
      case this.masterSlideTypeName.LINEUP_SLIDE_TYPE: {
        if (this.workspaceService.quizState == this.quizPresenterScreenManageConstant.WAITING_FOR_QUIZ_PLAYERS) {
            this.isStartQuiz = false;
          }
          else {
            this.isStartQuiz = true;
          }
        break;
      }
      default: {
        console.log("Slide not fount");
        break;
      }
    }
  }
  QuizButtonUpdate(){
     if (this.workspaceService.slideContentType == this.workspaceService.masterSlideTypeName.QUIZ) {
        this.isPresentationResetResults.emit(true);
        if(this.workspaceService.slideContentType == this.workspaceService.masterSlideTypeName.QUIZ&& this.workspaceService.activeSlideTypeName != this.workspaceService.masterSlideTypeName.LEADER_BOARD_SLIDE_TYPE){
          if (this.workspaceService.quizState == this.quizPresenterScreenManageConstant.WAITING_FOR_QUIZ_PLAYERS) {
            this.isStartQuiz = false;
          }
          else {
            this.isStartQuiz = true;
          }
        }
      }
  }
  ngOnDestroy(){
    this.workspaceService.resetResultBehavioursSubject.next(null);
    this.workspaceService.moveNextSlideBehavioursSubject.next(null);
    this.workspaceService.startQuizforRemoteBehavioursSubject.next(null);
    this.workspaceService.isLastBehavioursSubject.next(null);
    this.workspaceService.multipleChoicesCorrectAnswersBehavioursSubject.next(null);
  }
}

