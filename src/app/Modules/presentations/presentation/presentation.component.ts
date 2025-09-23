import { ChangeDetectionStrategy, Component, ComponentFactoryResolver, ComponentRef, ElementRef, EventEmitter, HostListener, OnDestroy, OnInit, Output, Renderer2, RendererFactory2, SimpleChanges, Type, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { CommanService } from 'src/app/core/Sevices/comman.service';
import { DynamicComponentDirective } from '../Common/dynamic-component.directive';
import { WorkSignalRServiceService } from 'src/app/core/Sevices/WorkSpace/work-signal-rservice.service';
import { MasterSlideTypeName, QuizPresenterScreenManageConstant } from 'src/app/utility/constants';
import { environment } from 'src/environments/environment';
import { Clipboard } from '@angular/cdk/clipboard';
import * as htmlToImage from 'html-to-image';
import { Modal } from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { PresenterToolbarService } from 'src/app/core/Sevices/Presentation/presenter-toolbar.service';
import { DynamicChartComponent } from '../dynamic-chart/dynamic-chart.component';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ProfanityFilterWords } from 'src/app/utility/ProfanityFilter';
import { CustomerPlanService } from 'src/app/core/Sevices/CustomerPlan/customer-plan.service';
import { CustomerPlan } from 'src/app/core/Models/customer-plan.model';
import { DynamicSlideTypeComponent } from 'src/app/shared/Component/dynamic-slide-type/dynamic-slide-type.component';
import { MypresentationsService } from '../../Home/mypresentations/Service/mypresentations.service';
import { AnnotationService } from 'src/app/core/Sevices/Presentation/annotation.service';
import { RemoteAccessNotificationService } from 'src/app/core/Sevices/remote-access-notification.service';
import { ChangeDetectorRef } from '@angular/core';
declare var $: any;
declare const Tawk_API: any;
declare const _IntegrationMediumZoom: boolean;
declare const _IntegrationMediumOffice: boolean;

@Component({
  selector: 'app-presentation',
  templateUrl: './presentation.component.html',
  styleUrls: ['./presentation.component.scss'],
  standalone:false
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class PresentationComponent implements OnInit, OnDestroy {
  @Output() public clearDynamicComponent: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('InnerScreen', { static: true }) InnerScreen: ElementRef;
  @ViewChild('OuterScreen', { static: true }) OuterScreen: ElementRef;
  @ViewChild('popoverContent') popoverContent: ElementRef;
  @ViewChild(DynamicComponentDirective, { static: true }) appDynamicComponent!: DynamicComponentDirective;
  @ViewChild('dynamicSlideComponent') dynamicSlideComponent!: DynamicSlideTypeComponent;
  dynamicComponent: Type<any>;
  @Output() public slideTypeName: EventEmitter<any> = new EventEmitter<any>();
  @Output() public contentChanged: EventEmitter<any> = new EventEmitter<any>();
  activeComponentReference: ComponentRef<any> | null = null;
  activeslideTypeName: any;
  masterSlideTypeName = MasterSlideTypeName;
  environmentDetails = environment;
  textareaVisible: boolean = false;
  isLastSlide: boolean = false;
  imageType: any;
  isTimerPop: boolean = false;
  isToolTipPop: boolean = false;
  myPresentToPresent: boolean = false;
  valuesArray: any[];
  questions: any;
  filter: string = 'all';
  filteredQuestions: any[] = [];
  copied: boolean = false;
  themesBackgroundColor: any;
  correctAnswerShown: boolean = false;
  private renderer: Renderer2;
  qrModal: Modal | undefined;
  isLinkVisible: boolean = true;
  loadPresentationPage: boolean = false;
  enableKeydown: boolean = false;
  ContrastColor: string;
  selectedAnswersAudio: HTMLAudioElement = new Audio();
  showPdf: boolean = false;
  slidePdfImage: any;
  @ViewChild('slideImage') slideImage: ElementRef<HTMLImageElement>;
  private isEnterKeyHeld: boolean = false;
  musicTooltipTittle: string="";
  refreshHasTriggered: boolean=false;
  @ViewChild('qaContentModal', { static: true }) qaModal: ElementRef;
  activeQuestionIndex: number=0;
  @ViewChild('qrContent', { static: true }) qrContent: ElementRef;
  @ViewChild('hotKeyContent', { static: true }) hotKeyContent: ElementRef;
  @ViewChild('annotationCanvas', { static: false }) annotationCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('annotationContainer', { static: false }) annotationContainer: ElementRef<HTMLDivElement>;
  quizPresenterScreenManageConstant = QuizPresenterScreenManageConstant;
  customerPlan: CustomerPlan;
  //@ViewChild('qaModalContent', { static: false }) qaModalContent!: ElementRef;
  logoPositionType:string="";
  showTooltip: boolean = false;
  panelWidth : any;
  panelHeight : any;
  presentationMode: any;
  private isFullscreenToggle: boolean = false;
  IntegrationMediumZoom: boolean = _IntegrationMediumZoom;
  IntegrationMediumOffice: boolean = _IntegrationMediumOffice;
  isSingleSlideMode: boolean = false;
  
  // Annotation properties
  showAnnotationToolbar: boolean = false;
  annotationToolbarPosition: { x: number; y: number } = { x: 50, y: 50 };
  isAnnotationMode: boolean = false;
  showRemoteAccessPopup: boolean = false;
  showRemoteUrlPopup: boolean = false;
  showRemoteAccessNotification: boolean = false;
  private remoteAccessSubscription: Subscription = new Subscription();
  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _CommanService: CommanService,
    public workSpaceService: WorkspaceService,
    public presentationService: PresentationService,
    public workSpaceSignalRService: WorkSignalRServiceService,
    private _router: Router,
    rendererFactory: RendererFactory2,
    public presenterToolbarService: PresenterToolbarService,
    public customerPlanService: CustomerPlanService,
    public _toastr: ToastrService,private route: ActivatedRoute,
    public _mypresentationsService: MypresentationsService,
    private annotationService: AnnotationService,
    private remoteAccessNotificationService: RemoteAccessNotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.route.queryParams.subscribe(params => {
      this.workSpaceService.presentationId = params['id'];
      if ('isTemplate' in params) {
        this.workSpaceService.isTemplate = params['isTemplate'];
      }
      if ('mode' in params) {
        this.presentationMode = params['mode'];
      }
    });
    this.closeBlankScreenWithoutAPICall();
    this.renderer = rendererFactory.createRenderer(null, null);
    this.loadPresentationPage = false;
    if(!this.workSpaceService.isPreviewMode){
      this.workSpaceService.isPreviewMode = this.presentationMode == 'preview' ? true : false;
      this.updatePresentMode(true);
    }
  }
  //#region LifeCycle Hooks

  ngOnChanges(changes: SimpleChanges): void {
    // if (changes.backgroundColor && !changes.backgroundColor.firstChange) {
    //   this.captureScreenshot(changes.backgroundColor.currentValue);
    // }
  }

  ngOnInit(): void {
    if (this.workSpaceService.presentationId == null && this.workSpaceService.activeSlideId == null) {
      this._router.navigateByUrl('/app/home');
      return;
    }
    
    this.route.queryParamMap.subscribe(params => {
      const mode = params.get('mode');
      this.isSingleSlideMode = mode === 'single' && this.IntegrationMediumOffice;
    });
    
    document.body.style.overflow = 'hidden';
    this.onResize();
    //  this.presenterStartTimer(10);
    this.setImageLayout();
    this.myPresentToPresent = this.workSpaceService.getMyPresentToPresent();
    this.activeslideTypeName = this.workSpaceService.activeSlideTypeName;
    this.questions = this.workSpaceService.presentationQuestions;
    
    this.filterQuestion();
    if(this.presentationMode != 'preview' && !this.IntegrationMediumZoom){
      this.toggleFullScreen();
    }
    this.workSpaceSignalRService.netWorkValidation();
    this.workSpaceSignalRService.callSignalR();
    // const qrModalElement = document.getElementById('qrModal');
    // if (qrModalElement) {
    //   this.qrModal = new Modal(qrModalElement);
    // }
    this.imageType = this.workSpaceService.slideLayoutType;
    $('[data-bs-toggle="tooltip"], [title]:not([data-bs-toggle="popover"])').tooltip('hide');
    $("body").tooltip({ selector: '[data-bs-toggle=tooltip]', trigger: 'hover' });
    $(document).on('click', '[data-bs-toggle="tooltip"], [title]:not([data-bs-toggle="popover"])', function () {
      $(this).tooltip('hide');
    });
    $('[data-bs-toggle="popover"]').popover({
      html: true,
      content: () => this.popoverContent.nativeElement.innerHTML
    });
    this.workSpaceService.moveNextSlideBehavioursSubject = new BehaviorSubject<string>("");
    this.moveNextandPreviewsSlide();
    this.isLastSlideOn();
    this.hideandshowResults();
    this.hideandshowResponse();
    this.updatePercentage();
    this.updateSlideVisualizationsType();
    this.updateAccessCode();
    this.EnableDisableQuestions();
    this.EnableDisableComment();
    this.multipleChoicesCorrectAnswers();
    this.timerCountDown();
    this.hideShowQRCode();
    this.onlyQAEnableQuestion();
    this.openQA();
    this.openQAWithIndex();
    this.markAsAnsweredPinQuestion();
    this.updateAccessCodeManage();
    this.startQuizForRemote();
    this.blankScreenUpdateOn();
    this.resetResult();
    
    // Setup remote access listeners
    this.setupRemoteAccessListeners();
    
    // Initialize annotation service with current slide
    if (this.workSpaceService.activeSlideId) {
      this.annotationService.setCurrentSlide(this.workSpaceService.activeSlideId);
    }
    
    // Subscribe to slide changes from workspace service
    this.workSpaceService.slideChangeSubject?.subscribe((slideData: any) => {
      if (slideData && slideData.slideId) {
        this.onSlideChange(slideData.slideId, this.workSpaceService.activeSlideId);
        this.workSpaceService.activeSlideId = slideData.slideId;
      }
    });
    
    // Subscribe to annotation mode changes
    this.annotationService.isAnnotationMode$.subscribe(mode => {
      this.isAnnotationMode = mode;
    });
  }
 
  ngDoCheck() {
    this.setImageLayout();
    this.onResize();
    document.body.style.overflow = 'hidden';
  }

  ngAfterContentInit() {
    // console.log("AppComponent: AfterContentInit");
  }

  ngAfterContentChecked() {
    this.imageType = this.workSpaceService.slideLayoutType;
    this.activeslideTypeName = this.workSpaceService.activeSlideTypeName;
    //this.questions = this.workSpaceService.presentationQuestions;
    this.filterQuestion();
    // console.log("AppComponent:AfterContentChecked");
  }

  ngAfterViewInit() {
    this.checkImagePositionType();
    //this.captureScreenshot(this.themesBackgroundColor);
    
    // Initialize annotation canvas
    this.initializeAnnotationCanvas();
    

  }
  checkImagePositionType(){
    if(this.workSpaceService.presentationTheme?.ThemeLogo?.logoCroppedUrl != null || this.workSpaceService.presentationTheme?.ThemeLogo?.logoCroppedUrl != ""){
     this.logoPositionType =  this.workSpaceService.checkOrientation(this.workSpaceService.presentationTheme?.ThemeLogo?.croppedposition);
    }
  }

  ngAfterViewChecked() {
    // console.log("AppComponent:AfterViewChecked");
  }

  ngOnDestroy(): void {
    // Save current slide annotations before destroying
    if (this.workSpaceService.activeSlideId && this.isAnnotationToolbarOpen()) {
      this.annotationService.saveAnnotationsForSlide(this.workSpaceService.activeSlideId);
    }
    
    // Dispose annotation service
    this.annotationService.dispose();
    
    if (this.workSpaceService.slideTimerInterval) {
      //clearInterval(this.workSpaceService.slideTimerInterval);
      this.clearTimerIntervel();
    }
    // this.workSpaceSignalRService.callSignalR();
    if (this.workSpaceService.slideContentType == MasterSlideTypeName.QUIZ) {
      this.stopQuizMusic();
    }
    // if (typeof Tawk_API !== 'undefined' && Tawk_API.showWidget) {
    //   Tawk_API.showWidget();
    // }
    if (this.workSpaceSignalRService) {
      this.workSpaceSignalRService.stopConnection();
  }
    document.body.style.overflow = 'auto';
    
    // Clean up remote access subscriptions
    this.remoteAccessSubscription.unsubscribe();
    
  }

  //#region Annotation Methods

  /**
   * Initialize annotation canvas after view init
   */
  initializeAnnotationCanvas(): void {
    if (this.annotationCanvas && this.annotationContainer) {
      setTimeout(() => {
        this.annotationService.initializeCanvas(
          this.annotationCanvas.nativeElement,
          this.annotationContainer.nativeElement
        );
        
        // Set current slide after initialization
        if (this.workSpaceService.activeSlideId) {
          this.annotationService.setCurrentSlide(this.workSpaceService.activeSlideId);
        }
        
      }, 100);
    }
  }

  /**
   * Toggle annotation toolbar visibility
   */
  toggleAnnotationToolbar(): void {
    if (!this.showAnnotationToolbar) {
      this.annotationService.forceResetTool();
      this.showAnnotationToolbar = true;
      this.isAnnotationMode = true;
      this.annotationService.toggleAnnotationMode();
      setTimeout(() => this.initializeAnnotationCanvas(), 100);
    } else {
      this.showAnnotationToolbar = false;
      this.isAnnotationMode = false;
      this.annotationService.clearAnnotations();
      this.annotationService.toggleAnnotationMode();
    }
  }

  /**
   * Handle annotation toolbar close
   */
  onAnnotationToolbarClose(): void {
    this.showAnnotationToolbar = false;
    this.isAnnotationMode = false;
    this.annotationService.toggleAnnotationMode();
  }

  /**
   * Directly open annotation toolbar
   */
  openAnnotationToolbar(): void {
    if (!this.showAnnotationToolbar) {
      this.annotationService.forceResetTool();
      this.showAnnotationToolbar = true;
      this.isAnnotationMode = true;
      this.annotationService.toggleAnnotationMode();
      setTimeout(() => this.initializeAnnotationCanvas(), 100);
    }
  }

  /**
   * Directly close annotation toolbar
   */
  closeAnnotationToolbar(): void {
    if (this.showAnnotationToolbar) {
      this.showAnnotationToolbar = false;
      this.isAnnotationMode = false;
      this.annotationService.toggleAnnotationMode();
    }
  }

  /**
   * Check if annotation toolbar is open
   */
  isAnnotationToolbarOpen(): boolean {
    return this.showAnnotationToolbar;
  }

  /**
   * Check if annotations are active (toolbar is open)
   */
  isAnnotationActive(): boolean {
    return this.isAnnotationToolbarOpen();
  }

  /**
   * Force close annotation toolbar (useful for cleanup)
   */
  forceCloseAnnotationToolbar(): void {
    this.showAnnotationToolbar = false;
    this.isAnnotationMode = false;
    this.annotationService.toggleAnnotationMode();
  }

  /**
   * Stop annotation mode and close toolbar
   */
  stopAnnotation(): void {
    this.closeAnnotationToolbar();
  }

  /**
   * Check if annotation system is ready
   */
  isAnnotationSystemReady(): boolean {
    return !!(this.annotationService && this.annotationCanvas && this.annotationContainer);
  }



  /**
   * Handle slide change - save/load annotations
   */
  onSlideChange(newSlideId: string, oldSlideId?: string): void {
    if (oldSlideId && oldSlideId !== newSlideId) {
      if (this.isAnnotationToolbarOpen()) {
        this.annotationService.saveAnnotationsForSlide(oldSlideId);
      }
    }
    
    if (newSlideId) {
      this.annotationService.setCurrentSlide(newSlideId);
    }
  }



  /**
   * Handle annotation canvas resize
   */
  onAnnotationCanvasResize(): void {
    // if (this.annotationContainer) {
    //   const rect = this.annotationContainer.nativeElement.getBoundingClientRect();
    //   this.annotationService.resizeCanvas(rect.width, rect.height);
    // }
  }

  /**
   * Handle keyboard shortcuts for annotations
   */
  @HostListener('document:keydown', ['$event'])
  handleAnnotationKeyboard(event: KeyboardEvent): void {
    // Don't interfere with existing functionality
    if (event.target && (event.target as HTMLElement).tagName === 'INPUT') {
      return;
    }
    if (this.workSpaceService.isPreviewMode) {
      return;
    }
    switch (event.key.toLowerCase()) {
      case 'a':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.toggleAnnotationToolbar();
        }
        break;
      case 'escape':
        if (this.showAnnotationToolbar) {
          event.preventDefault();
          this.closeAnnotationToolbar();
        }
        break;
      case 'c':
        if ((event.ctrlKey || event.metaKey) && this.isAnnotationMode) {
          event.preventDefault();
          this.annotationService.clearAnnotations();
        }
        break;
    }
  }

  /**
   * Handle right-click context menu for annotations
   */
  @HostListener('contextmenu', ['$event'])
  handleRightClick(event: MouseEvent): void {
    if (this.isAnnotationMode) {
      // Allow annotation service to handle right-click
      return;
    }

  }

  //#endregion

  setScaleForLayout() {
    const WIDTH = window.innerWidth;
    const HEIGHT = window.innerHeight;
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
    const qrModal = this.qrContent.nativeElement;
   qrModal.style.scale = INNERSCREENELEMENT.style.scale;
  
   const hotKeyModal = this.hotKeyContent.nativeElement;
   hotKeyModal.style.scale = INNERSCREENELEMENT.style.scale;

   const qaModal = this.qaModal.nativeElement;
   qaModal.style.scale = INNERSCREENELEMENT.style.scale;
  }
  initialScreenSizeSet(){
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.panelWidth =  width + 'px';
    this.panelHeight =  height + 'px';
    this.panelWidth =  1680 + 'px';
    this.panelHeight =  945 + 'px';
    if(width > 1680 ){
      this.panelWidth =  height * 1.77777 + 'px';
      this.panelHeight =  height + 'px';
    }
    else{
      this.panelWidth =  1680 + 'px';
      this.panelHeight =  945 + 'px';
    }
  }
  // @HostListener('document:keydown.enter', ['$event'])
  // handleEnterKey(event: KeyboardEvent) {
  //   event.preventDefault();
  //   this.toggleCorrectAnswer();
  // }
  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKeyDown(event: KeyboardEvent) {
    if (!this.isEnterKeyHeld) {
      this.isEnterKeyHeld = true;
      this.toggleCorrectAnswer();
    }
    event.preventDefault();
  }

  @HostListener('document:keyup.enter', ['$event'])
  handleEnterKeyUp(event: KeyboardEvent) {
    this.isEnterKeyHeld = false;
    event.preventDefault();
  }
  handleToggleCorrectAnswer() {
    event.preventDefault();
    this.toggleCorrectAnswer();
  }
  private toggleCorrectAnswer() {
    if (this.activeslideTypeName === this.masterSlideTypeName.MULTIPLE_CHOICE_SLIDE_TYPE) {
      if(!this.workSpaceService.chooseCorrectAnswers){
        return;
      }
      this.workSpaceService.multiplechoicepresenterEnterClick = !this.workSpaceService.multiplechoicepresenterEnterClick;
      this.workSpaceService.updateShowCorrectAnswer(this.workSpaceService.multiplechoicepresenterEnterClick);
      this.workSpaceService.dynamicComponent_Clone.instance.multiplechoicepresenterEnterClick = this.workSpaceService.multiplechoicepresenterEnterClick;
      this.workSpaceService.dynamicChartResponseLoad();
      let showChooseCorrectAnswerDTO = {
        presentationId: this.workSpaceService.presentationId,
        slideId: this.workSpaceService.activeSlideId,
        isShowCorrectAnswers: this.workSpaceService.multiplechoicepresenterEnterClick,
        isTemplate: this.workSpaceService.isTemplate
      }
      this.presenterToolbarService.showCorrectAnswerUpdate(showChooseCorrectAnswerDTO);
    }
    else if (this.activeslideTypeName === this.masterSlideTypeName.GUESS_TEHE_NUMBER_SLIDE_TYPE) {
      this.workSpaceService.guessthenumberpresenterEnterClick = !this.workSpaceService.guessthenumberpresenterEnterClick;
      this.workSpaceService.updateShowCorrectAnswer(this.workSpaceService.guessthenumberpresenterEnterClick);
      this.workSpaceService.dynamicComponent_Clone.instance.guessthenumberpresenterEnterClick = this.workSpaceService.guessthenumberpresenterEnterClick;
      this.workSpaceService.dynamicChartResponseLoad();
      let showChooseCorrectAnswerDTO = {
        presentationId: this.workSpaceService.presentationId,
        slideId: this.workSpaceService.activeSlideId,
        isShowCorrectAnswers: this.workSpaceService.guessthenumberpresenterEnterClick,
        isTemplate: this.workSpaceService.isTemplate
      }
      this.presenterToolbarService.showCorrectAnswerUpdate(showChooseCorrectAnswerDTO);
    }
    else if (this.activeslideTypeName === this.masterSlideTypeName.TRUTH_OR_LIE_SLIDE_TYPE) {
      this.workSpaceService.truthorliepresenterEnterClick = !this.workSpaceService.truthorliepresenterEnterClick;
      this.workSpaceService.updateShowCorrectAnswer(this.workSpaceService.truthorliepresenterEnterClick);
      this.workSpaceService.dynamicChartResponseLoad();
      let showChooseCorrectAnswerDTO = {
        presentationId: this.workSpaceService.presentationId,
        slideId: this.workSpaceService.activeSlideId,
        isShowCorrectAnswers: this.workSpaceService.truthorliepresenterEnterClick,
        isTemplate: this.workSpaceService.isTemplate
      }
      this.presenterToolbarService.showCorrectAnswerUpdate(showChooseCorrectAnswerDTO);
    }
    else if (this.activeslideTypeName === this.masterSlideTypeName.POWER_POINT) {
      this.workSpaceService.EmbeddedPPTpresenterEnterClick = !this.workSpaceService.EmbeddedPPTpresenterEnterClick;
      // if(this.workSpaceService.EmbeddedPPTpresenterEnterClick){
      //   $("#myModal").modal("show");
      // }
    }
  }
  //#endregion LifeCycle Hooks
  //#region Component Level functions
  //#region API Call

  presenterHistroy() {

  }

  presenterPesentationResetResults() {

  }
  designSlideSelectVisualization(visualizationId: any) {
    if(this.workSpaceService.slideVisualizationId != visualizationId){
      this.workSpaceService.slideVisualizationId = visualizationId;
      this.workSpaceService.currentActiveSlide.design.slideVisualizationId = this.workSpaceService.slideVisualizationId;
      const foundSlide = this.workSpaceService.slideListArray.find(x => x.slideId == this.workSpaceService.activeSlideId);
      if (foundSlide) {
        this.valuesArray = [foundSlide];
        this.valuesArray.forEach(element => {
          this.activeSlide(element.slideId, element.slideTypeId);
        });
      }
      this.presenterToolbarService.designSlideSelectVisualization(visualizationId);
      this.dynamicSlideComponent.switchComponent(foundSlide.slideTypeId);
    }
    else{
      return;
    }
  }
  activeSlide(slideId: any, slideTypeId: any) {
    this.workSpaceService.activeSlideId = slideId;
     this.dynamicSlideComponent.switchComponent(slideTypeId);
  }
  markAsAnswered(questionId: any, isAnswered: boolean) {
    let index = this.workSpaceService?.presentationQuestions.findIndex(x => x.questionId == questionId);
    this.workSpaceService.presentationQuestions.filter(x => x.questionId == questionId)[0].isAnswered = true;
    this.activeQuestionIndex = index;
    this.presenterToolbarService.markAsAnswered(questionId, isAnswered);
    
  }
  markAsPinned(questionId: any, isPinned: boolean) {
    let index = this.workSpaceService.presentationQuestions.findIndex(x => x.questionId == questionId);
    this.workSpaceService.presentationQuestions.filter(x => x.questionId == questionId)[0].isPinned = true;
    this.activeQuestionIndex = index;
    this.presenterToolbarService.markAsPinned(questionId, isPinned);
  }
  presenterTrends() {

  }

  presenterSlideResetResults() {

  }

  presenterStartTimerSeconds(seconds: number) {
    this.presenterToolbarService.presenterStartTimer(seconds);
  }
  presenterStartTimer(seconds: number) {
    // if (this.workSpaceService.slideTimer == false) {
    //   this.startTimerAPICall();
    // }
    switch (seconds) {
      case 0: {
        this.clearTimerIntervel();
        break;
      }
      case 10: {
        let newSeconds = this.getTotalSecondswithRemaindingSeondsFromTimer(seconds);
        this.wrappingContdown(newSeconds);
        break;
      }
      case 30: {
        let newSeconds = this.getTotalSecondswithRemaindingSeondsFromTimer(seconds);
        this.wrappingContdown(newSeconds);
        break;
      }
      case 60: {
        let newSeconds = this.getTotalSecondswithRemaindingSeondsFromTimer(seconds);
        this.wrappingContdown(newSeconds);
        break;
      }
      case 120: {
        let newSeconds = this.getTotalSecondswithRemaindingSeondsFromTimer(seconds);
        this.wrappingContdown(newSeconds);
        break;
      }
      case 180: {
        let newSeconds = this.getTotalSecondswithRemaindingSeondsFromTimer(seconds);
        this.wrappingContdown(newSeconds);
        break;
      }
      case 240: {
        let newSeconds = this.getTotalSecondswithRemaindingSeondsFromTimer(seconds);
        this.wrappingContdown(newSeconds);
        break;
      }
      case 300: {
        let newSeconds = this.getTotalSecondswithRemaindingSeondsFromTimer(seconds);
        this.wrappingContdown(newSeconds);
        break;
      }
      default: {
        break;
      }
    }
  }
  startTimerAPICall() {
    let presentationDTO = {
      presentationId: this.workSpaceService.presentationId,
      slideId: this.workSpaceService.activeSlideId,
      isTemplate:this.workSpaceService.isTemplate
    }
    this.presentationService.presenterStarTimer(presentationDTO).subscribe(
      (response: any) => {
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }
  wrappingContdown(seconds: number) {
    if (this.workSpaceService.slideTimerInterval) {
      clearInterval(this.workSpaceService.slideTimerInterval);
    }
    this.workSpaceService.slideTimerCountShow = this.workSpaceService.slideEnableVoting == true ? true : false;
    let prefixSingleDigiteSecond: any = '0';
    let startingSecondsToDisplay: number = seconds % 60 || 60;
    let prefixSingleDigiteMinutes: any = seconds < 600 ? '0' : '';
    let initialWrappedTimer = prefixSingleDigiteMinutes + Math.floor(seconds / 60) + ':' + (startingSecondsToDisplay == 60 ? "00" : startingSecondsToDisplay);
    this.workSpaceService.slideTimerCountsToDisplay = initialWrappedTimer;
    this.workSpaceService.slideTimerInterval = setInterval(() => {
      seconds--;
      if (startingSecondsToDisplay != 0) {
        startingSecondsToDisplay--;
      } else {
        startingSecondsToDisplay = 59;
      }
      if (startingSecondsToDisplay < 10) {
        prefixSingleDigiteSecond = '0' + startingSecondsToDisplay;
      }
      else {
        prefixSingleDigiteSecond = 0;
        prefixSingleDigiteSecond = startingSecondsToDisplay;
      }
      let runtimeWrappedTimer = (prefixSingleDigiteMinutes + Math.floor(seconds / 60)) + ':' + prefixSingleDigiteSecond;
      this.workSpaceService.slideTimerCountsToDisplay = runtimeWrappedTimer;
      if (seconds == 0) {
        this.workSpaceService.slideTimerCountShow = false;
        clearInterval(this.workSpaceService.slideTimerInterval);
        if (this.workSpaceService.slideEnableVoting != false) {
          this.presenterLockVoting();
        }
      }
    }, 1000);
  }
  clearTimerIntervel() {
    this.workSpaceService.slideTimerCountsToDisplay = "";
    this.workSpaceService.slideTimerCountShow = false;
    clearInterval(this.workSpaceService.slideTimerInterval);
  }
  presenterToolTip() {

  }

  presenterEnableQuestion() {
    this.closemodels();
    if(this.customerPlan?.qa){
    this.workSpaceService.slideShowQuestions = !this.workSpaceService.slideShowQuestions;
    this.presenterToolbarService.enableQuestion();
  }else{
    return;
  }
}

  presenterEnableComment() {
    if(this.customerPlan?.comments){
    this.workSpaceService.slideShowComments = !this.workSpaceService.slideShowComments;
    this.presenterToolbarService.enableComment();
  }
  else{
    return;
  }
}
  toggleShowPercentage() {
    this.workSpaceService.slideResponseAsPercentage = !this.workSpaceService.slideResponseAsPercentage;
    this.presenterToolbarService.showPercentage();
  }
  presenterShowResponse() {
    if (this.activeslideTypeName === this.masterSlideTypeName.ImportDocument || this.activeslideTypeName === this.masterSlideTypeName.POWER_POINT || this.activeslideTypeName === this.masterSlideTypeName.GoogleSlides || this.workSpaceService.activeSlideTypeName === this.workSpaceService.masterSlideTypeName.SELECT_ANSWER_SLIDE_TYPE || this.workSpaceService.activeSlideTypeName == this.workSpaceService.masterSlideTypeName.LEADER_BOARD_SLIDE_TYPE || this.workSpaceService.activeSlideTypeName === this.workSpaceService.masterSlideTypeName.TYPE_ANSWER_SLIDE_TYPE) {
      return;
    }
    this.workSpaceService.slideShowInResults = !this.workSpaceService.slideShowInResults;
    this.presenterToolbarService.ShowResponse();
  }

  presenterLockVoting() {
    if(this.customerPlan?.audience_response_control){
    if (this.activeslideTypeName === this.masterSlideTypeName.ImportDocument || this.activeslideTypeName === this.masterSlideTypeName.POWER_POINT || this.activeslideTypeName === this.masterSlideTypeName.GoogleSlides || this.workSpaceService.activeSlideTypeName === this.workSpaceService.masterSlideTypeName.SELECT_ANSWER_SLIDE_TYPE || this.workSpaceService.activeSlideTypeName == this.workSpaceService.masterSlideTypeName.LEADER_BOARD_SLIDE_TYPE || this.workSpaceService.activeSlideTypeName === this.workSpaceService.masterSlideTypeName.TYPE_ANSWER_SLIDE_TYPE) {
      return;
    }
    this.clearTimerIntervel();
    this.workSpaceService.slideEnableVoting = !this.workSpaceService.slideEnableVoting;
    this.presenterToolbarService.lockVoting(this.workSpaceService.slideEnableVoting);
  }else{
    return;
  }
}
  updatePresentMode(ispresent: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      let presentDTO = {
        presentationId: this.workSpaceService.presentationId,
        presentationMode: ispresent,
        isTemplate: this.workSpaceService.isTemplate,  
        isPreview: this.workSpaceService.isPreviewMode
      }
      this.workSpaceService.presentationMode = ispresent;
      this.presentationService.updatePresentMode(presentDTO).subscribe(
        (response: any) => {
          resolve(response);
          this.workSpaceService.storeActiveSlideDetails().then(() => {
            this.loadPresentationPage = true;
            this.customerPlan = this.customerPlanService.getCustomerPlan();
            this.applyThemeLogic();
            this.playQuizMusic();
            this.createQuizSignalR();
          }).catch((error) => {
            console.error('Error in storeActiveSlideDetails(): ', error);
          });
            var contentDTO = {
              presentationId: this.workSpaceService.presentationId,
              slideId: this.workSpaceService.activeSlideId,
              presentationMode: this.workSpaceService.presentationMode,
              isPreview: this.workSpaceService.isPreviewMode
            }
          this.workSpaceSignalRService.UpdateContent(contentDTO);
        
          this.workSpaceService.currentMasterSlideTypeId = this.workSpaceService.slideTypeId;
          this.workSpaceService.slideVisualizationId = localStorage.getItem('slideVisualizationId');
          this.workSpaceService.isPreviewMode = response.isPreview;
          
        },
        (error: any) => {
          console.log(error?.error);
        }
      );
    });
  }
  //#endregion API Call
  //#region Without API Call

createQuizSignalR(){
  if(this.workSpaceService.slideContentType == MasterSlideTypeName.QUIZ && this.workSpaceService.activeSlideTypeName != MasterSlideTypeName.LEADER_BOARD_SLIDE_TYPE){
    let quizCreatedDTO = {
      presentationId: this.workSpaceService.presentationId,
      activeSlideId: this.workSpaceService.activeSlideId,
      isPreview: this.workSpaceService.isPreviewMode
    }
    this.workSpaceSignalRService.quizCreated(quizCreatedDTO);
  }
}

  setImageLayout() {
    if (this.activeslideTypeName !== "Import Document") {
      this.imageType = this._CommanService.GetSelectLayoutImage();
      this.showPdf = false;
    } else {
      this.showPdf = true;
      this.slidePdfImage = this.workSpaceService.slidePptImage;
    }
  }

  loadBGLayout() {
    if (this.activeslideTypeName === "Import Document") {
      //this.activePptImage = false;
      this.showPdf = true;
      this.slidePdfImage = this.workSpaceService.slidePptImage;
    } else {

      this.showPdf = false;
      var defaultImageUrl = "/assets/images/static_bg_image.svg";
      const fullImageUrl = this.workSpaceService.slideLayoutImage;
      const finalImageUrl = fullImageUrl || defaultImageUrl;
      return {
        backgroundImage: `url(${finalImageUrl})`,
      };
    }
  }

  LoadBGLayoutForOuter() {
    if (this.imageType == 'Outer right') {
      const BgLayout = {
        backgroundImage: 'url(https://images.mentimeter.com/images/0382ec61-ad78-45a5-9b68-89fc09eaa369.jpeg?auto=compress%2Cformat&fm=jpg&expires=1717718399&s=1d2ef2b…)',
      }
      return BgLayout;
    }
    else if (this.imageType == 'Outer left') {
      const BgLayout = {
        backgroundImage: 'url(https://images.mentimeter.com/images/0382ec61-ad78-45a5-9b68-89fc09eaa369.jpeg?auto=compress%2Cformat&fm=jpg&expires=1717718399&s=1d2ef2b…)',
      }
      return BgLayout;
    }
  }

  backToWorkSpace() {
    if (this.isAnnotationToolbarOpen()) {
      this.annotationService.clearAnnotations();
      this.closeAnnotationToolbar();
    }
    
    this.setNullonBehaviourSubject();
    this.workSpaceService.EmbeddedPPTpresenterEnterClick = false;
    if (this.workSpaceService.isLastSlide) {
      this.workSpaceService.isLastSlide = false;
      var isLastSlideDTO = {
        presentationId: this.workSpaceService.presentationId,
        isLastSlide: this.workSpaceService.isLastSlide
      }
      this.workSpaceSignalRService.isLastSlide(isLastSlideDTO);
    }
    this.exitFullScreen();
    if (this.workSpaceService.isShowOptionDetails) {
      this.workSpaceService.isShowOptionDetails = false;
      return;
    }
    if(this.workSpaceService.isBlackOverlayVisible){
      this.workSpaceService.isBlackOverlayVisible = false;
      this.workSpaceService.slideEnableVoting = true;
     this.closeBlankScreenWithoutAPICall();
    }
    this.closeQaModal();
    this.loadPresentationPage = false;
    if (this.myPresentToPresent == true) {
      this.workSpaceService.setMyPresentToPresent(false);
      // this.updatePresentMode(false).then(() => {
        this._router.navigate(['/app/mypresentations'], { 
          queryParams: { 
            isListView: this._mypresentationsService.isListView
          } 
        });
        this.clearDynamicComponent.emit();
        if (this.workSpaceService.slideContentType == MasterSlideTypeName.QUIZ && this.workSpaceService.activeSlideTypeName != MasterSlideTypeName.LEADER_BOARD_SLIDE_TYPE) {
          this.stopQuizMusic();
          this.workSpaceService.dynamicComponent_Clone.instance.clearTimerWhenDestroy();
        }
        this.loadPresentationPage = true;
      // }).catch((error) => {
      //   console.error('Error in updatePresentMode(): ', error);
      // });
    }
    else {
      // this.updatePresentMode(false).then(() => {
        this.clearDynamicComponent.emit();
        if (this.workSpaceService.slideContentType == MasterSlideTypeName.QUIZ && this.workSpaceService.activeSlideTypeName != MasterSlideTypeName.LEADER_BOARD_SLIDE_TYPE) {
          this.stopQuizMusic();
          this.workSpaceService.dynamicComponent_Clone.instance.clearTimerWhenDestroy();

        }
        this.loadPresentationPage = true;
        if (this.IntegrationMediumOffice) {
          window.location.href = `#/WorkSpace/edit?id=${this.workSpaceService.presentationId}`;
        } else {
          this._router.navigate(['/WorkSpace/edit'], {
            queryParams: { id: this.workSpaceService.presentationId }
          });
        }
      // }).finally(()=>{
      //   this._router.navigateByUrl('/WorkSpace/edit/' + this.workSpaceService.presentationId);
      // })
      // .catch((error) => {
      //   console.error('Error in updatePresentMode(): ', error);
      // });
      
    }
  }
  setNullonBehaviourSubject() {
    this.workSpaceService.moveNextSlideBehavioursSubject.next("");
    this.workSpaceService.isLastBehavioursSubject.next(null);
    this.workSpaceService.updateContentBehavioursSubject.next(null);
    this.workSpaceService.hideandShowResultsBehavioursSubject.next(null);
    this.workSpaceService.hideandShowResponseBehavioursSubject.next(null);
    this.workSpaceService.updatePercentageBehavioursSubject.next(null);
    this.workSpaceService.updateVisualizationsTypeChangeBehavioursSubject.next(null);
    this.workSpaceService.enableDisableCommentsBehavioursSubject.next(null);
    this.workSpaceService.enableDisableQuestionsBehavioursSubject.next(null);
    this.workSpaceService.timerCountDownBehavioursSubject.next(null);
    this.workSpaceService.hideShowQRDownBehavioursSubject.next(null);
    this.workSpaceService.onlyQAEnableBehavioursSubject.next(null);
    this.workSpaceService.openQABehavioursSubject.next(null);
    this.workSpaceService.openQAWithIndexBehavioursSubject.next(null);
    this.workSpaceService.markAsAnswerPinQuestionBehavioursSubject.next(null);
    this.workSpaceService.getQuestionBehavioursSubject.next(null);
    this.workSpaceService.getQuestionBehavioursSubject.next(null);
    this.workSpaceService.blankScreenUpdateBehavioursSubject.next(null);
  }
  getTotalSecondswithRemaindingSeondsFromTimer(newSeconds: number): number {
    let seconds = 0;
    if (this.workSpaceService.slideTimerCountsToDisplay != "") {
      // * Get RemainingSeconds Form Existing Timer
      // todo Then get remainingseconds add newseconds to remainingseconds then return newsconds.
      let [minute, second] = this.workSpaceService.slideTimerCountsToDisplay.split(':').map(Number);
      let remainingSeconds = minute * 60 + second;
      seconds = remainingSeconds + newSeconds;
      return seconds;
    }
    else {
      // * If Existingtimer is not started or this is first our timer so consider the exitingtimer is "0" and add the newSeconds and return.
      return seconds + newSeconds;
    }
  }

  //#endregion Without API Call
  // @HostListener('window:popstate', ['$event'])
  // onPopState(event: PopStateEvent) {
  //   this.backToWorkSpace();
  //   this.clearDynamicComponent.emit();
  // }
  @HostListener('document:fullscreenchange', ['$event'])
  onFullscreenChange() {
    // Only navigate back if we're not in preview mode and the fullscreen was exited
    // This prevents navigation on refresh and when using the toggle button
    if (!document.fullscreenElement && !this.workSpaceService.isPreviewMode && !this.workSpaceService.isFullscreenToggle) {
      this.backToWorkSpace();
    }
    // Reset the toggle flag
    this.workSpaceService.isFullscreenToggle = false;
  }
  @HostListener('window:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    
    if (event.ctrlKey) {
      return;
    }

    if (this.handleNavigationKeys(key, event)) {
      return;
    }

    if (this.handleTimerKeys(key)) {
      return;
    }
    if (localStorage.getItem('role') != 'attendee') {
      if(!this.isAnnotationToolbarOpen()){
        this.handleFunctionalityKeys(key);
      }
    }
  }

  private handleNavigationKeys(key: string, event: KeyboardEvent): boolean {
    if (localStorage.getItem('role') == 'attendee') {
      return false;
    }
    
    if (this.isSingleSlideMode && this.IntegrationMediumOffice && (key === 'arrowleft' || key === 'arrowright')) {
      return true;
    }
    
    switch (key) {
      case 'arrowleft':
        this.previousSlide();
        return true;
      case 'arrowright':
        this.nextSlide();
        return true;
      case 'escape':
        if (this.workSpaceService.slideContentType !== this.masterSlideTypeName.QUIZ) {
          $('[data-bs-toggle="tooltip"]').tooltip('hide');
        }
        if (!this.workSpaceService.isPreviewMode && !this.IntegrationMediumZoom) {
          if (document.fullscreenElement) {
            this.exitFullScreen();
          } else {
            this.backToWorkSpace();
          }
        }
        return true;
      default:
        return false;
    }
  }

  private handleTimerKeys(key: string): boolean {
    if (localStorage.getItem('role') === 'attendee') {
      return false;
    }
    const timerDurations: { [key: string]: number } = {
      '0': 0, '1': 60, '2': 120, '3': 180, '4': 240, '5': 300, '8': 30, '9': 10
    };

    if (key in timerDurations) {
      const isValidSlideType = 
        this.activeslideTypeName !== this.masterSlideTypeName.ImportDocument && 
        this.activeslideTypeName !== this.masterSlideTypeName.INSTRUCTION_SLIDE_TYPE &&
        this.workSpaceService.slideContentType !== this.masterSlideTypeName.QUIZ &&
        this.workSpaceService.slideContentType !== this.masterSlideTypeName.IMPORT && this.activeslideTypeName !== this.masterSlideTypeName.QUESTIONS_AND_ANSWER_SLIDE_TYPE && this.activeslideTypeName !== this.masterSlideTypeName.MULTIMEDIA;

      if (isValidSlideType) {
        this.presenterStartTimer(timerDurations[key]);
        return true;
      }
    }
    return false;
  }

  private handleFunctionalityKeys(key: string): void {
    const keyActions: { [key: string]: () => void } = {
      'f': () => {
        if (!this.workSpaceService.isPreviewMode && !this.IntegrationMediumZoom) {
          this.toggleFullScreen();
        }
      },
      'c': () => {
        if (this.activeslideTypeName !== this.masterSlideTypeName.ImportDocument && 
          this.activeslideTypeName !== this.masterSlideTypeName.LINEUP_SLIDE_TYPE &&  this.activeslideTypeName !== this.masterSlideTypeName.INSTRUCTION_SLIDE_TYPE &&
          this.activeslideTypeName !== this.masterSlideTypeName.QUESTIONS_AND_ANSWER_SLIDE_TYPE && this.activeslideTypeName !== this.masterSlideTypeName.GUESS_THE_NUMBER_QUIZ && this.activeslideTypeName !== this.masterSlideTypeName.MULTIMEDIA) {
        this.presenterLockVoting();
      }
      },
      'h': () => {
        if (this.activeslideTypeName !== this.masterSlideTypeName.ImportDocument && 
            this.activeslideTypeName !== this.masterSlideTypeName.LINEUP_SLIDE_TYPE && 
            this.activeslideTypeName !== this.masterSlideTypeName.QUESTIONS_AND_ANSWER_SLIDE_TYPE && 
            this.activeslideTypeName !== this.masterSlideTypeName.INSTRUCTION_SLIDE_TYPE && this.activeslideTypeName !== this.masterSlideTypeName.GUESS_THE_NUMBER_QUIZ && this.activeslideTypeName !== this.masterSlideTypeName.MULTIMEDIA) {
          this.presenterShowResponse();
        }
      },
      'v': () => this.presenterEnableComment(),
      'i': () => {
        this.closemodels();
        const qrModal = $("#qrModal");
        qrModal.hasClass("show") ? this.closeQRCode() : this.presenterShowQRCode();
      },
      'b': () => this.toggleBlackOverlay(),
      'l': () => this.toggleLinkVisibility(),
      'q': () => this.presenterEnableQuestion(),
      'k': () => {
        this.closemodels();
        this.openHotKeys()
      }
    };

    if (key in keyActions) {
      keyActions[key]();
    }
  }

  toggleBlackOverlay() {
    this.workSpaceService.isBlackOverlayVisible = !this.workSpaceService.isBlackOverlayVisible;
    const overlay = document.getElementById('blackOverlay');
    if (overlay) {
      overlay.style.visibility = this.workSpaceService.isBlackOverlayVisible ? 'visible' : 'hidden';
    }
    if (this.workSpaceService.isBlackOverlayVisible) {
      if ((this.workSpaceService.slideContentType != this.masterSlideTypeName.QUIZ && this.workSpaceService.activeSlideTypeName != this.masterSlideTypeName.ImportDocument && this.workSpaceService.activeSlideTypeName != this.masterSlideTypeName.GoogleSlides && this.workSpaceService.activeSlideTypeName != this.masterSlideTypeName.POWER_POINT)) {
        this.workSpaceService.slideEnableVoting = false;
      }
      var objWhenTrue = {
        presentationId: this.workSpaceService.presentationId,
        isOpenBlankScreen: this.workSpaceService.isBlackOverlayVisible,
        slideId: this.workSpaceService.activeSlideId,
        lookVoting: this.workSpaceService.slideEnableVoting,
        isTemplate: this.workSpaceService.isTemplate
      }
      this.presenterToolbarService.blankScreenUpdate(objWhenTrue);
    }
    else {
      var objWhenFalse = {
        presentationId: this.workSpaceService.presentationId,
        isOpenBlankScreen: this.workSpaceService.isBlackOverlayVisible,
        slideId: this.workSpaceService.activeSlideId,
        lookVoting:true,
        isTemplate: this.workSpaceService.isTemplate
      }
      this.presenterToolbarService.blankScreenUpdate(objWhenFalse);
    }

  }
  closeBlankScreen(){
    if(this.workSpaceService.isBlackOverlayVisible){
      this.workSpaceService.isBlackOverlayVisible = false;
      this.workSpaceService.slideEnableVoting = true;
      var obj = {
        presentationId:this.workSpaceService.presentationId,
        isOpenBlankScreen:this.workSpaceService.isBlackOverlayVisible,
        slideId:this.workSpaceService.activeSlideId,
        lookVoting:true,
        isTemplate: this.workSpaceService.isTemplate
      }
      this.presenterToolbarService.blankScreenUpdate(obj);
    }
  }
  closeBlankScreenWithoutAPICall(){
    const overlay = document.getElementById('blackOverlay');
    if (overlay) {
      overlay.style.visibility = this.workSpaceService.isBlackOverlayVisible ? 'visible' : 'hidden';
    }
  }
  toggleFullScreen() {
    this.workSpaceService.isFullscreenToggle = true;
    if (!document.fullscreenElement) {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if ((elem as any).mozRequestFullScreen) {
        (elem as any).mozRequestFullScreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  }
  exitFullScreen() {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
    this.workSpaceService.isFullscreenToggle = false;
  }
  toggleLinkVisibility() {
    this.isLinkVisible = !this.isLinkVisible;
  }
  presenterShowQRCode() {
    var qrModal = $("#qrModal");
    if (qrModal.hasClass("show")) {
      qrModal.modal("hide");
    } else {
      qrModal.modal("show");
    }
    if(!this.IntegrationMediumZoom){
      let obj = {
        presentationId: this.workSpaceService.presentationId,
        isShowQR: true
      }
      this.workSpaceSignalRService.hideShowQRCode(obj);
    }
  }

  async clearActiveComponent() {
    if (this.workSpaceService.dynamicComponent_Clone) {
      this.workSpaceService.dynamicComponent_Clone.destroy();
      this.workSpaceService.dynamicComponent_Clone = null;
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  themesDataPassToDynamicComponent(data: any) {
    this.workSpaceService.dynamicComponent_Clone.instance.slideTheme = data;
    this.workSpaceService.dynamicComponent_Clone.instance.updateTheme(data);
  }
  selectAnswersDataPassToDynamicComponet() {
    this.workSpaceService.dynamicComponent_Clone.instance.addNewPlayerList(this.workSpaceService.currentquizDetails?.players);
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
      this.selectedAnswersAudio.loop = true;
      this.musicTooltipTittle = "Mute";
    }
    else {
      this.musicTooltipTittle = "No music added";
    }
  }
  stopQuizMusic() {
    if (this.workSpaceService.quizIsEnableMusic) {
      if (!this.selectedAnswersAudio.paused) {
        this.selectedAnswersAudio.pause();
        this.selectedAnswersAudio.currentTime = 0;
      }
    }
  }


  applyThemeLogic() {
    // * Apply Themes Logic
    if (this.workSpaceService.slideDesign.slideResetTheme) {
      let updatedThemes = this.workSpaceService.setSlideThemes(this.workSpaceService.slideDesign);
      this.ContrastColor = this._CommanService.getContrastColor(this.workSpaceService?.slideDesign?.slideBackgroundColor);
      // this.themesDataPassToDynamicComponent(updatedThemes);
    }
    else {
      this.ContrastColor = this._CommanService.getContrastColor(this.workSpaceService?.slideDesign?.slideBackgroundColor);
      // this.themesDataPassToDynamicComponent(this.workSpaceService.presentationTheme);
    }
  }
  nextSlide() {
    if (this.isSingleSlideMode && this.IntegrationMediumOffice) {
      return;
    }
    
    // Handle annotation slide change
    const currentSlideId = this.workSpaceService.activeSlideId;
    
    if (this.workSpaceService.slideCount + 1 == this.workSpaceService.currentSlideIndex + 2) {
      this.workSpaceService.isLastSlide = true;
      var isLastSlideDTO = {
        presentationId: this.workSpaceService.presentationId,
        isLastSlide: this.workSpaceService.isLastSlide
      }
      this.workSpaceSignalRService.isLastSlide(isLastSlideDTO);
    } else {
      let nextSlideId = this.workSpaceService.slideListArray[this.workSpaceService.currentSlideIndex + 1]?.slideId;
      if (nextSlideId != null || nextSlideId != undefined) {
        // Handle annotation slide change
        this.onSlideChange(nextSlideId, currentSlideId);
        
        this.workSpaceService.activeSlideId = nextSlideId;
        this.presenterToolbarService.nextSlide().then((response: any) => {
          let presentationData = response['data'];
          var nextandPreviousRemote = {
            presentationId: this.workSpaceService.presentationId,
            activeSlideId:nextSlideId,
            activeSlideTypeId: presentationData?.masterSlideTypeId,
            isPreview: this.workSpaceService.isPreviewMode
          }
          this.ContrastColor = this._CommanService.getContrastColor(this.workSpaceService?.slideDesign?.slideBackgroundColor);
          // this.dynamicSlideComponent.switchComponent(presentationData?.masterSlideTypeId);
          this.workSpaceSignalRService.moveNextandPerviousFromRemote(nextandPreviousRemote);
          this.createQuizSignalR();
          this.workSpaceService.slideTypeId = presentationData?.masterSlideTypeId;
          this.workSpaceService.currentMasterSlideTypeId = presentationData?.masterSlideTypeId;
        }).catch((error) => {
          console.error('Error in storeActiveSlideDetails(): ', error);
        });
      }
    }
  }

  previousSlide() {
    if (this.isSingleSlideMode && this.IntegrationMediumOffice) {
      return;
    }
    
    var previousSlideId = "";
    if (this.workSpaceService.isLastSlide) {
      this.workSpaceService.isLastSlide = false;
      previousSlideId = this.workSpaceService.slideListArray[this.workSpaceService.currentSlideIndex]?.slideId;
    }
    else {
      previousSlideId = this.workSpaceService.slideListArray[this.workSpaceService.currentSlideIndex - 1]?.slideId;
    }
    if (previousSlideId != null || previousSlideId != undefined) {
      this.onSlideChange(previousSlideId, this.workSpaceService.activeSlideId);
      this.workSpaceService.activeSlideId = previousSlideId;
      this.presenterToolbarService.previousSlides().then((response: any) => {
        let presentationData = response['data'];
        var nextandPreviousRemote = {
          presentationId: this.workSpaceService.presentationId,
          activeSlideId:previousSlideId,
          activeSlideTypeId: presentationData?.masterSlideTypeId,
          isPreview: this.workSpaceService.isPreviewMode
        }
        this.ContrastColor = this._CommanService.getContrastColor(this.workSpaceService?.slideDesign?.slideBackgroundColor);
        // this.workSpaceService.dynamicComponent_Clone.switchComponent(presentationData?.masterSlideTypeId);
        this.workSpaceSignalRService.moveNextandPerviousFromRemote(nextandPreviousRemote);
        this.createQuizSignalR();
        this.workSpaceService.slideTypeId = presentationData?.masterSlideTypeId;
        this.workSpaceService.currentMasterSlideTypeId = presentationData?.masterSlideTypeId;
      }).catch((error) => {
        console.error('Error in storeActiveSlideDetails(): ', error);
      });
    }
  }

  getReactionsCount(reactionId: any): number {
    if (this.workSpaceService.slideReactionsCountList?.length > 0) {
      var reaction = this.workSpaceService.slideReactionsCountList.find(x => x.reactionId == reactionId);
      if (reaction != undefined) {
        return reaction?.reactionCount;
      }
      else {
        return 0;
      }
    }
    else {
      return 0;
    }
  }
  setFilterQuestion(filter: string) {
    this.filter = filter;
    this.filterQuestion();
  }

  filterQuestion() {
    if (this.filter === 'all') {
      this.filteredQuestions = this.workSpaceService.presentationQuestions;
    } else if (this.filter === 'pinned') {
      this.filteredQuestions = this.workSpaceService.presentationQuestions.filter(q => q.isPinned);
    } else if (this.filter === 'answered') {
      this.filteredQuestions = this.workSpaceService.presentationQuestions.filter(q => q.isAnswered);
    }
  }
  slideLevelFunctions() {
    let slideTypeName = this.workSpaceService.activeSlideTypeName;
    switch (slideTypeName) {
      case (this.workSpaceService.masterSlideTypeName.MULTIPLE_CHOICE_SLIDE_TYPE):
        //this.workSpaceService.multiplechoicepresenterEnterClick = false;
        break;
      case (this.workSpaceService.masterSlideTypeName.GUESS_TEHE_NUMBER_SLIDE_TYPE):
        //this.workSpaceService.guessthenumberpresenterEnterClick = false;
        break;
      case (this.workSpaceService.masterSlideTypeName.TRUTH_OR_LIE_SLIDE_TYPE):
        //this.workSpaceService.truthorliepresenterEnterClick = false;
        break;
    }
  }

  //#endregion Component Level functions

  toggleTimerButton() {
    if (this.activeslideTypeName === this.masterSlideTypeName.ImportDocument || this.activeslideTypeName === this.masterSlideTypeName.POWER_POINT || this.activeslideTypeName === this.masterSlideTypeName.GoogleSlides) {
      return;
    }
    if (this.isToolTipPop == true) {
      this.isToolTipPop = !this.isToolTipPop;
      this.isTimerPop = !this.isTimerPop;
    }
    else {
      this.isTimerPop = !this.isTimerPop;
    }
  }

  toggleCelebration() {
    if (this.isTimerPop == true) {
      this.isTimerPop = !this.isTimerPop;
      this.isToolTipPop = !this.isToolTipPop;
    }
    else {
      this.isToolTipPop = !this.isToolTipPop;
    }
  }

  //#region Common Methods
  @HostListener('window:resize')

  onResize() {
      this.initialScreenSizeSet();
        this.setScaleForLayout();
        
        if(this.isAnnotationToolbarOpen()){
          // Update annotation canvas size
          this.onAnnotationCanvasResize();
        }
  }
  copyToClipboard() {
    const presentationURL = this.workSpaceService.presentationURL;
    if (!presentationURL) {
      return;
    }
    navigator.clipboard.writeText(presentationURL).then(() => {
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    }).catch(err => {
    });
  }

  //#endregion Common Metods

  async captureScreenshot(backgroundColor: string): Promise<string> {
    const screenshotElement = document.getElementById('screenshot');
    if (!screenshotElement) {
      console.error('Unable to find screenshot element');
      throw new Error('Unable to find screenshot element');
    }

    try {
      screenshotElement.style.backgroundColor = "#FFFFF";
      screenshotElement.style.width = '2000px';
      screenshotElement.style.height = '800px'
      await new Promise(resolve => setTimeout(resolve, 1000));

      const dataUrl = htmlToImage.toPng(screenshotElement);
      screenshotElement.style.backgroundColor = '';
      screenshotElement.style.width = '';
      screenshotElement.style.height = '';
      //this._presentationService.storeScreenshotValue(dataUrl);
      // this.sendImageToApi(await dataUrl);
      this.handleImageUrl(await dataUrl);
      return dataUrl;
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      throw error;
    }
  }
  async handleImageUrl(imageUrl: string): Promise<void> {
    if (!this.workSpaceService.presentationId || !this.workSpaceService?.activeSlideId) {
      console.error("Invalid presentationId or slideId provided.");
      return;
    }
    const newPayload = {
      presentationId: this.workSpaceService.presentationId,
      slideId: this.workSpaceService?.activeSlideId,
      resultscreenshot: imageUrl
    };
    this.presentationService.storeScreenshotValue(newPayload);
  }
  async sendImageToApi(): Promise<void> {
    try {
      if (!this.workSpaceService.slideDetails) {
        console.error('slideDetails is not properly initialized');
        return Promise.reject('slideDetails is not properly initialized');
      }
      if (!this.workSpaceService.presentationId) {
        console.error('PresentationId is not available');
        return Promise.reject('PresentationId is not available');
      }
      if (!this.workSpaceService.activeSlideId) {
        console.error('SlideId is not available');
        return Promise.reject('SlideId is not available');
      }
      const imageData = this.presentationService.getStoredScreenshotValues();
      const newPayload = {
        presentationId: this.workSpaceService.presentationId,
        slideId: this.workSpaceService.activeSlideId,
        resultscreenshot: imageData
      };
      //const response = await this._presentationService.Updatescreenshot(newPayload).toPromise();
      //  console.log('Slide created successfully:', response);
      this.presentationService.clearScreenshotValues();
    } catch (error) {
      console.error('Error sending image:', error);
      return Promise.reject(error);
    }
  }
  getContrastColor() {
    return this.getBackgroundColorWithOpacity(this.workSpaceService?.slideDesign?.slideBackgroundColor, 0.2)
  }
  getBackgroundColorWithOpacity(colorCode: any, opacity: any): string {
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
    return `rgba(${contrastRgb?.join(', ')}, ${opacity})`;
  }
  private hexToRgb(hex: string): number[] {
    const hexValue = hex?.replace(/^#/, '');
    const rgb = [];
    for (let i = 0; i < 3; i++) {
      rgb?.push(parseInt(hexValue.substr(i * 2, 2), 16));
    }
    return rgb;
  }
  //#region Select Answers
  muteAndMunte() {
    if (this.workSpaceService.quizIsEnableMusic) {
      this.workSpaceService.isMusicMute = !this.workSpaceService.isMusicMute;
      if (this.workSpaceService.isMusicMute) {
        this.selectedAnswersAudio.muted = true;
        this.musicTooltipTittle = "UnMute";
      }
      else {
        this.selectedAnswersAudio.muted = false;
        this.musicTooltipTittle = "Mute";
      }
    }
  }
  updatePlayerPoints(isBool:any) {
    this.workSpaceService.isPresentationPoints = isBool;
    if (this.workSpaceService.isPresentationPoints) {
      this.workSpaceService.leaderBoardState = this.workSpaceService.isLastLeaderBoard? QuizPresenterScreenManageConstant.CHAMPION_SCORE : QuizPresenterScreenManageConstant.LEADING_SCORE;
      this.workSpaceService.currentPresentation.leaderBoard.leaderBoardState = this.workSpaceService.leaderBoardState;
      this.leaderBoardState(this.workSpaceService.isLastLeaderBoard? QuizPresenterScreenManageConstant.CHAMPION_SCORE : QuizPresenterScreenManageConstant.LEADING_SCORE);
      this.dynamicSlideComponent.switchComponent(this.workSpaceService.currentMasterSlideTypeId);
      this.workSpaceService.dynamicComponent_Clone.instance.updatePresentationPoints(this.workSpaceService.presentationQuizPlayerList);
    }
    else {
      this.workSpaceService.leaderBoardState = QuizPresenterScreenManageConstant.QUIZ_SCORE;
      this.workSpaceService.currentPresentation.leaderBoard.leaderBoardState = this.workSpaceService.leaderBoardState;
      this.leaderBoardState(QuizPresenterScreenManageConstant.QUIZ_SCORE);
      this.dynamicSlideComponent.switchComponent(this.workSpaceService.currentMasterSlideTypeId);
      this.workSpaceService.dynamicComponent_Clone.instance.updatePresentationPoints(this.workSpaceService.quizResultLeaderboard);
    }
  }
  leaderBoardState(state:any){
    var obj={
      presentationId : this.workSpaceService.presentationId,
      slideId : this.workSpaceService.activeSlideId,
      leaderBoardState : state,
      isPreview : this.workSpaceService.isPreviewMode,
      isTemplate : this.workSpaceService.isTemplate,
    }
    console.log(this.workSpaceService.isPreviewMode);
    this.workSpaceService.leaderBoardState = state;
    this.presentationService.leaderBoardState(obj).subscribe(
      (response:any)=>{
      },(error:any)=>{
        console.log(error)
      }
    );
  }
  openHotKeys() {
    const modal = $('#hotKeyModal');
    if (modal.hasClass('show')) {
      modal.modal('hide');
    } else {
      modal.modal('show');
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
  onHover() {
    let elements = document.getElementsByClassName('hover-target');
    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.add('hover-to-show-values');
    }
  }
  onHoverOut() {
    let elements = document.getElementsByClassName('hover-target');
    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.remove('hover-to-show-values');
    }
  }

  
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent) {
    if (!this.refreshHasTriggered) {
      if (this.workSpaceService.slideContentType == this.workSpaceService.masterSlideTypeName.QUIZ && this.workSpaceService.activeSlideTypeName != this.workSpaceService.masterSlideTypeName.LEADER_BOARD_SLIDE_TYPE) {
        if (this.workSpaceService.quizState != this.workSpaceService.quizPresenterScreen.RESULT_SCREEN) {
          this.workSpaceSignalRService.quizScreenMaintenance(this.workSpaceService.presentationId, this.workSpaceService.quizPresenterScreen.REFRESH_SCREEN);
        }
      }
      this.closeBlankScreen();
    }
    if (this.workSpaceService.activeSlideId && this.isAnnotationMode) {
      this.annotationService.saveAnnotationsForSlide(this.workSpaceService.activeSlideId);
    }
  }

  /**
   * Handle page visibility change (tab switching, minimizing)
   */
  @HostListener('document:visibilitychange')
  onVisibilityChange(): void {
    if (document.hidden && this.workSpaceService.activeSlideId && this.isAnnotationMode) {
      // Save annotations when tab becomes hidden
      this.annotationService.saveAnnotationsForSlide(this.workSpaceService.activeSlideId);
    }
  }


  quizScreenState(screenName: any) {
    let presentationDTO = {
      presentationId: this.workSpaceService.presentationId,
      slideId: this.workSpaceService.activeSlideId,
      state: screenName,
      isTemplate: this.workSpaceService.isTemplate
    }
    this.presentationService.quizStateUpdate(presentationDTO).subscribe(
      (response: any) => {
        this.workSpaceService.quizState = screenName;
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }
  //#endregion Select Answers

  //#region Toolbar Component Emites
  moveSlidesFromToolbarComponent(event: any): void {
    // Handle annotation slide change
    const currentSlideId = this.workSpaceService.activeSlideId;
    let nextSlideId = this.workSpaceService.slideListArray[this.workSpaceService.currentSlideIndex + 1]?.slideId;
    
    if (nextSlideId && nextSlideId !== currentSlideId) {
      this.onSlideChange(nextSlideId, currentSlideId);
    }
  }

  movePreviousSlidesFromToolbarComponent(event: any): void {
    // Handle annotation slide change
    const currentSlideId = this.workSpaceService.activeSlideId;
    let previousSlideId = this.workSpaceService.slideListArray[this.workSpaceService.currentSlideIndex - 1]?.slideId;
    
    if (previousSlideId && previousSlideId !== currentSlideId) {
      this.onSlideChange(previousSlideId, currentSlideId);
    }
  }

  openQAModal() {
    this.closemodels();
    if(this.customerPlan?.qa == true){
      if(this.workSpaceService.activeSlideTypeName != this.masterSlideTypeName.QUESTIONS_AND_ANSWER_SLIDE_TYPE){
        if (this.workSpaceService.questions?.length > 0) {
          var indexObj = {
            presentationId: this.workSpaceService.presentationId,
            isOpenQA: true,
            questionIndex: 0
          }
          this.workSpaceSignalRService.OpenQAModalQuestionIndex(indexObj);
        }
        else {
          var obj = {
            presentationId: this.workSpaceService.presentationId,
            isOpenQA: true,
          }
          this.workSpaceSignalRService.OpenQAModal(obj);
        }
      }
    }
    else{
      return;
    }
    
  }
  closeQaModal() {
    var qaModal = $("#qaModal");
    qaModal.modal("hide");
    $('.modal-backdrop').remove();
    var obj = {
      presentationId: this.workSpaceService.presentationId,
      isOpenQA: false,
    }
    this.workSpaceSignalRService.OpenQAModal(obj);
  }
  closeQRCode() {
    var qrModal = $("#qrModal");
    qrModal.modal("hide");
    if(!this.IntegrationMediumZoom){
    let obj = {
      presentationId: this.workSpaceService.presentationId,
      isShowQR: false
      }
      this.workSpaceSignalRService.hideShowQRCode(obj);
    }
  }

  moveNextandPreviewsSlide() {
    this.workSpaceService.moveNextSlideBehavioursSubject.subscribe((data: any) => {
      if (data.activeSlideTypeId != undefined || data.activeSlideId != null) {
        // Handle annotation slide change
        const currentSlideId = this.workSpaceService.activeSlideId;
        const newSlideId = data.activeSlideId;
        
        //localStorage.setItem('activeSlideId', data.activeSlideId);
        this.workSpaceService.activeSlideId = data.activeSlideId;
        localStorage.setItem('slideTypeId', data.activeSlideTypeId);
        
        // Handle annotation slide change
        if (currentSlideId !== newSlideId) {
          this.onSlideChange(newSlideId, currentSlideId);
        }
        
        this.workSpaceService.storeActiveSlideDetails().then(
          (response: any) => {
            let presentationData = response['data'];
            if (this.workSpaceService.isLastSlide) {
              this.workSpaceService.isLastSlide = false;
            }
            this.workSpaceService.dynamicComponent_Clone.switchComponent(presentationData?.masterSlideTypeId);
          },
          (error: any) => {
            console.log(error);
          }
        )
      }
    });
  }
  isLastSlideOn() {
    this.workSpaceService.isLastBehavioursSubject.subscribe((data: any) => {
      if (data != undefined || data != null) {
        this.workSpaceService.isLastSlide = data?.isLastSlide;

      }
    });
  }
  hideandshowResults() {
    this.workSpaceService.hideandShowResultsBehavioursSubject.subscribe((data: any) => {
      if (data != null) {
        this.workSpaceService.slideShowInResults = data?.isResults;
        this.workSpaceService.currentActiveSlide.settings.showInResults = this.workSpaceService.slideShowInResults;
        this.workSpaceService.dynamicChartResponseLoad();
      }
    });
  }
  hideandshowResponse() {
    this.workSpaceService.hideandShowResponseBehavioursSubject.subscribe((data: any) => {
      if (data != null) {
        this.workSpaceService.slideEnableVoting = data?.enableDisableValues;
      }
    });
  }
  updatePercentage() {
    this.workSpaceService.updatePercentageBehavioursSubject.subscribe((data: any) => {
      if (data != null) {
        this.workSpaceService.slideResponseAsPercentage = data?.isPercentage;
        this.workSpaceService.currentActiveSlide.design.slideResponseAsPercentage = this.workSpaceService.slideResponseAsPercentage;
        this.workSpaceService.dynamicChartResponseLoad();
      }
    });
  }
  updateSlideVisualizationsType() {
    this.workSpaceService.updateVisualizationsTypeChangeBehavioursSubject.subscribe((data: any) => {
      if (data != null) {
        this.workSpaceService.slideVisualizationId = data?.visualizationType;
        this.workSpaceService.currentActiveSlide.design.slideVisualizationId = this.workSpaceService.slideVisualizationId;
        this.dynamicSlideComponent.switchComponent(this.workSpaceService.slideTypeId);
      }
    });
  }
  updateAccessCode() {
    this.workSpaceService.updateAccessCodeBehavioursSubject.subscribe((data: any) => {
      if (data != null) {
        this.workSpaceService.presentationSettingJoiningInstructions = data?.isAccessCode;
      }
    });
  }
  EnableDisableQuestions() {
    this.workSpaceService.enableDisableQuestionsBehavioursSubject.subscribe((data: any) => {
      if (data != null) {
        this.workSpaceService.slideShowQuestions = data?.enableDisableValues;
        if (!this.workSpaceService.slideShowQuestions) {
          var qaModal = $("#qaModal");
          if ($('#qaModal').hasClass('show')) {
            qaModal.modal("hide");
            $('.modal-backdrop').remove();
          } else {
           // console.log("Modal is closed");
          }
        }
      }
    });
  }
  EnableDisableComment() {
    this.workSpaceService.enableDisableCommentsBehavioursSubject.subscribe((data: any) => {
      if (data != null) {
        this.workSpaceService.slideShowComments = data?.enableDisableValues;
      }
    });
  }
  multipleChoicesCorrectAnswers() {
    this.workSpaceService.multipleChoicesCorrectAnswersBehavioursSubject.subscribe((data: any) => {
      if (data != null) {
        switch (this.workSpaceService.activeSlideTypeName) {
          case this.masterSlideTypeName.MULTIPLE_CHOICE_SLIDE_TYPE: {
            this.workSpaceService.multiplechoicepresenterEnterClick = data?.isShowCorrectAnswers;
            this.workSpaceService.dynamicComponent_Clone.instance.multiplechoicepresenterEnterClick =  data?.isShowCorrectAnswers;
            break;
          }
          case this.masterSlideTypeName.GUESS_TEHE_NUMBER_SLIDE_TYPE: {
            this.workSpaceService.guessthenumberpresenterEnterClick = data?.isShowCorrectAnswers;
            this.workSpaceService.dynamicComponent_Clone.instance.guessthenumberpresenterEnterClick =  data?.isShowCorrectAnswers;
            break;
          }
          case this.masterSlideTypeName.TRUTH_OR_LIE_SLIDE_TYPE: {
            this.workSpaceService.truthorliepresenterEnterClick = data?.isShowCorrectAnswers;
            this.workSpaceService.dynamicComponent_Clone.instance.truthorliepresenterEnterClick =  data?.isShowCorrectAnswers;
            break;
          }
          default: {
            console.log("Slide not fount");
            break;
          }
        }
        this.workSpaceService.dynamicChartResponseLoad();
      }
    });
  }

  timerCountDown() {
    this.workSpaceService.timerCountDownBehavioursSubject.subscribe((data: any) => {
      if (data != null) {
        this.presenterToolbarService.wrappingContdown(data?.seconds);
      }
    });
  }
  hideShowQRCode() {
    this.workSpaceService.hideShowQRDownBehavioursSubject.subscribe((data: any) => {
      if (data != null) {
        var qrModal = $("#qrModal");
        if (data?.isShowQR) {
          qrModal.modal("show");
        }
        else {
          qrModal.modal("hide");
          $('.modal-backdrop').remove();
        }
      }
    });
  } 
  onlyQAEnableQuestion() {
    this.workSpaceService.onlyQAEnableBehavioursSubject.subscribe((data: any) => {
      if (data != null) {
        this.workSpaceService.slideShowQuestions = data?.isShowQuestion;
        this.workSpaceService.OnlyQA = data?.isOnlyQA;
        
      }
    });
  }
  openQA() {
    this.workSpaceService.openQABehavioursSubject.subscribe((data: any) => {
      if (data != null) {
        var qaModal = $("#qaModal");
        this.closemodels();
        if (data?.isOpenQA) {
          qaModal.modal("show");
        }
        else {
          qaModal.modal("hide");
          $('.modal-backdrop').remove();
        }
      }
    });
  }
  openQAWithIndex() {
    this.workSpaceService.openQAWithIndexBehavioursSubject.subscribe((data: any) => {
      if (data != null) {
        if(this.workSpaceService.activeSlideTypeName != this.masterSlideTypeName.QUESTIONS_AND_ANSWER_SLIDE_TYPE){
          if (this.workSpaceService.slideShowQuestions) {
            var qaModal = $("#qaModal");
            if (data?.isOpenQA) {
              qaModal.modal("show");
              this.activeQuestionIndex = data?.questionIndex;
            }
            else {
              qaModal.modal("hide");
              $('.modal-backdrop').remove();
            }
          }
        }
      }
    });
  }
  markAsAnsweredPinQuestion() {
    this.workSpaceService.markAsAnswerPinQuestionBehavioursSubject.subscribe((data: any) => {
      if (data != null) {
        if(this.workSpaceService.activeSlideTypeName != this.masterSlideTypeName.QUESTIONS_AND_ANSWER_SLIDE_TYPE)
        {
          if (this.workSpaceService.slideShowQuestions) {
            var qaModal = $("#qaModal");
            if (data?.isOpenQA) {
              qaModal.modal("show");
              this.activeQuestionIndex = data?.questionIndex;
            }
            else {
              qaModal.modal("hide");
              $('.modal-backdrop').remove();
            }
          }
        }
        else{
          this.workSpaceService.dynamicComponent_Clone.instance.updateChart(this.workSpaceService.presentationQuestions);
        }
      }
    });
  }
  updateAccessCodeManage() {
    this.workSpaceService.updateAccessCodeBehavioursSubject.subscribe((data: any) => {
      if (data != null) {
        this.workSpaceService.presentationSettingJoiningInstructions = data?.isAccessCode;
      }
    });
  }
  startQuizForRemote() {
    this.workSpaceService.startQuizforRemoteBehavioursSubject.subscribe((data: any) => {
      if (data != null) {
        this.workSpaceService.dynamicComponent_Clone.instance.startQuiz();
      }
    });
  }
  blankScreenUpdateOn() {
    this.workSpaceService.blankScreenUpdateBehavioursSubject.subscribe((data: any) => {
      if (data != null) {
        this.workSpaceService.isBlackOverlayVisible = data?.isOpenBlankScreen;
        if(data?.slideId != ""){
          this.workSpaceService.slideEnableVoting = data?.lookVoting;
        }
        const overlay = document.getElementById('blackOverlay');
        if (overlay) {
          overlay.style.visibility = this.workSpaceService.isBlackOverlayVisible ? 'visible' : 'hidden';
        }
      }
    });
  }
  resetResult() {
    this.workSpaceService.resetResultBehavioursSubject.subscribe((data: any) => {
      if (data != null) {
        this.workSpaceService.storeActiveSlideDetails().then(
          (response: any) => {
            let presentationData = response['data'];
            this.slideTypeName.emit(presentationData?.masterSlideTypeId);
            this.contentChanged.emit("content");
            // this.workSpaceService.dynamicComponent_Clone.switchComponent(presentationData?.masterSlideTypeId);
          },
          (error: any) => {
            console.log(error);
          }
        )
      }
    });
  }
  openSlideOneRemote() {
    if(this.customerPlan?.remote){
      // Show remote access management popup
      this.showRemoteAccessPopup = true;
    }else{
      // this._toastr.warning("You don't have access remote" , '', {
      //   timeOut: 5000
      // });
    }
  }

  openRemoteUrlPopup() {
    if(this.customerPlan?.remote){
      // Show remote URL popup
      this.showRemoteUrlPopup = true;
    }else{
      // this._toastr.warning("You don't have access remote" , '', {
      //   timeOut: 5000
      // });
    }
  }

  openRemoteUrlWindow() {
    if(this.customerPlan?.remote){
      // Show remote URL window
      this.showRemoteUrlWindow();
    }else{
      // this._toastr.warning("You don't have access remote" , '', {
      //   timeOut: 5000
      // });
    }
  }

  onRemoteAccessPopupClosed(): void {
    this.showRemoteAccessPopup = false;
  }

  onRemoteUrlPopupClosed(): void {
    this.showRemoteUrlPopup = false;
  }

  onOpenUrlPopup(): void {
    this.showRemoteUrlPopup = true;
  }

  showRemoteUrlWindow() {
    const remoteUrl = `${window.location.origin}/auth/remote-access?id=${this.workSpaceService.presentationId}`;
  }
  playQuizMusic(){
    if (this.workSpaceService.slideContentType == MasterSlideTypeName.QUIZ) {
      this.playBackgroundMusic(this.workSpaceService.quizMusicURL);
    }
    else {
      if (!this.selectedAnswersAudio.paused) {
        this.selectedAnswersAudio.pause();
        this.selectedAnswersAudio.currentTime = 0;
        this.selectedAnswersAudio.src = "";
      }
    }
  }
  checkTooltipVisibility() {
    if (this.workSpaceService.longerDescription && this.workSpaceService.longerDescription.trim() !== '') {
      this.showTooltip = true;
    } else {
      this.showTooltip = false;
    }
  }
  closemodels(){
    $("#qaModal").modal("hide");
    $("#qrModal").modal("hide");
    $("#hotKeyModal").modal("hide");
  }


getVisibilityClass(): any {
  if (this.workSpaceService.activeSlideTypeName == this.masterSlideTypeName.INSTRUCTION_SLIDE_TYPE) {
    const element = document.getElementById('font-style-presentation');
    if (element) {
      this.removeClass(element, 'visibility-hidden');
    }
    return { 'visibility-hidden': false };
  }
  if (this.workSpaceService.slideContentType !== this.masterSlideTypeName.QUIZ) {
    return { 'visibility-hidden': true };
  }
  
  // If content type is quiz and it's a leaderboard slide, hide
  if (this.workSpaceService.activeSlideTypeName === this.masterSlideTypeName.LEADER_BOARD_SLIDE_TYPE || this.workSpaceService.activeSlideTypeName === this.masterSlideTypeName.INSTRUCTION_SLIDE_TYPE) {
    return { 'visibility-hidden': false };
  }
  
  if (this.workSpaceService.slideContentType === this.masterSlideTypeName.QUIZ) {
  const shouldHide = this.workSpaceService.quizState === this.quizPresenterScreenManageConstant.FAST_ANSWERS_SCREEN || 
  this.workSpaceService.quizState === this.quizPresenterScreenManageConstant.WAITING_FOR_QUIZ_PLAYERS;
  return { 'visibility-hidden': shouldHide };
  }
  return { 'visibility-hidden': false };
}

removeClass(element: ElementRef | HTMLElement, className: string): void {
  const nativeElement = element instanceof ElementRef ? element.nativeElement : element;
  this.renderer.removeClass(nativeElement, className);
}

// Remote Access Notification Methods
onRemoteAccessNotificationVisibilityChange(isVisible: boolean): void {
  this.showRemoteAccessNotification = isVisible;
}

onRemoteAccessRequestApproved(request: any): void {
  this._toastr.success(`${request.remoteUserName} has been granted remote access`, 'Access Approved');
}

onRemoteAccessRequestRejected(request: any): void {
  this._toastr.info(`${request.remoteUserName} has been denied remote access`, 'Access Denied');
}

private setupRemoteAccessListeners(): void {
  this.showRemoteAccessNotification = this.remoteAccessNotificationService.shouldShowNotificationForComponent();
  this.cdr.detectChanges();
  
  this.remoteAccessSubscription.add(
    this.remoteAccessNotificationService.newRequest$.subscribe(newRequest => {
      if (newRequest) {
        this.showRemoteAccessNotification = true;
        this.cdr.detectChanges();
      }
    })
  );
  
  this.remoteAccessSubscription.add(
    this.remoteAccessNotificationService.requests$.subscribe(requests => {
      if (requests.length === 0 && this.showRemoteAccessNotification) {
        this.showRemoteAccessNotification = false;
        this.cdr.detectChanges();
      }
    })
  );
}

}