import { animate, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { CommanService } from 'src/app/core/Sevices/comman.service';
import { settingVariables } from 'src/app/utility/SettingVariables';
declare var $: any;

@Component({
    selector: 'app-open-ended-flowing',
    templateUrl: './open-ended-flowing.component.html',
    styleUrls: ['./open-ended-flowing.component.scss'],
    animations: [
        trigger('slideInLeft', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateX(-850px)' }),
                animate('800ms ease-in-out', style({ opacity: 1, transform: 'translateX(0)' }))
            ])
        ]),
        trigger('slideInTop', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(-250px)' }),
                animate('800ms ease-in-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ]),
        trigger('slideInRight', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateX(850px)' }),
                animate('800ms ease-in-out', style({ opacity: 1, transform: 'translateX(0)' }))
            ])
        ])
    ],
    standalone: false
})
export class OpenEndedFlowingComponent implements OnInit {
  @Input('aboutTheSlides') public aboutTheSlideValue: any;
  @Input('questions') public questionsValue: any;
 isShowResults: boolean = true;
  @Input('longDescription') public longDescriptionValue: any;
  @Input('slidDetails') public slideData: any;
  @Input('presentationDetails') public presentationDetails: any;
  @Input('profanityWord') public profanityWord: any;
  isShowLongerDescription = true;
  @Output() isAnswed = new EventEmitter();
  selectedOptionIndex: number = 0;
  settingVariable = settingVariables;
  rgbColorCode: { r: number; g: number; b: number; };
  hexToRgbColor: any;
  @ViewChild('#scroller') scroller: ElementRef;
  isPrev: boolean = false;
  openEndedData: any[] = [];
  private isFirstScroll = true;
  @Input() slideTheme:any;
  @Input() slideDetails:any;
  @Input() presentationLevelTheme:any;
  @Input() presentationMode:boolean;
  @Input() isPreviewMode:boolean;
  @Input() isShowOptionDetails:boolean;
  @Input() screenOptions:string;
  defaultData = [
    { Answer: "Project management software's"},
    { Answer: "Time-blocking techniques"},
    { Answer: "Daily to-do lists"},
    { Answer: "Automation tools"},
    { Answer: "Collaboration platforms"},
    { Answer: "Focus methods"},
  ];
  presentationTheme: { ThemeName: string; ThemeLogo: any; ThemeBackgroundColor: string; ThemeBackgroundImage: any;  ThemeTextColor: string; ThemeFontFamily: string; ThemeLineColor: string; ThemeVisualizationColor: any[]; slideTextBold: boolean; slideTextItalic: boolean; slideTextUnderLine: boolean; slideTextStrikeThrough: boolean; slidetextSize: number,backgroundColorOpacity:any};
  slidesTheme: { ThemeName: string; ThemeLogo: any; ThemeBackgroundColor: string; ThemeBackgroundImage: string; ThemeTextColor: string; ThemeFontFamily: string; ThemeLineColor: string; ThemeVisualizationColor: any[]; slideTextBold: boolean; slideTextItalic: boolean; slideTextUnderLine: boolean; slideTextStrikeThrough: boolean; slidetextSize: number,slideTextColor:any };
  formatedOptions: any;
  chartUpdateInterval: any;
  previousIndex: number = -1;
  isFirstUpdate: boolean = true;
  currentIndex: number = -1;
  originalData: any[] = [];
  isAnimation: boolean = false;
  animationData: any[] = [];
  usedIndexes: Set<number> = new Set();
  
  constructor(private el: ElementRef, private renderer: Renderer2, private _commanservice:CommanService,  public _workspaceservice: WorkspaceService, private router: Router) {    
    this.screenOptions = "presentationScreen";
  }

  get isRemoteMode(): boolean {
    return this.router.url.includes('/WorkSpace/remote');
  }



  ngOnInit(): void {
    this.screenOptions = "presentationScreen";
    this.openEndedData = this._workspaceservice.convertDataFormat(this.slideDetails?.slideContentData,'Options');
    this.openEndedData = this._workspaceservice.profanityWordsChecksForWord(this.openEndedData);
    this.originalData = [...this.openEndedData];
    this.presentationTheme = this.assignThemeProperties(this.presentationLevelTheme);
    this.slidesTheme = this.assignThemeProperties(this.presentationLevelTheme, this.slideDetails?.design,true);
    this.slideTheme = this.slideDetails?.design?.slideResetTheme ? this.slidesTheme: this.presentationTheme;
    this.getRgbColr(this.slideTheme?.ThemeBackgroundColor);
    this.updateChart(this.openEndedData);
  }
  private assignThemeProperties(presentationLevelTheme: any, slideDetails?: any, isSlideTheme: boolean=false): any {
    const themeProperties = {
      ThemeName: presentationLevelTheme?.themeName,
      ThemeLogo: presentationLevelTheme?.themesLogo,
      ThemeTextColor: isSlideTheme ? slideDetails?.slideTextColor : presentationLevelTheme?.themesFontColor,
      backgroundColorOpacity: presentationLevelTheme?.backgroundColorOpacity,
      ThemeFontFamily: isSlideTheme ? slideDetails?.slideTextFontFamily : presentationLevelTheme?.themesFonts,
      ThemeBackgroundImage: presentationLevelTheme?.themesBackgroundImage,
      ThemeLineColor: isSlideTheme ? slideDetails?.slideLineColor : presentationLevelTheme?.lineClour,
      ThemeBackgroundColor: isSlideTheme ? slideDetails?.slideBackgroundColor : presentationLevelTheme?.themesBackgroundColor,
      ThemeVisualizationColor: presentationLevelTheme?.themesChartColor,
      slideTextBold: isSlideTheme ? slideDetails?.slideTextBold : presentationLevelTheme?.textBold,
      slideTextItalic: isSlideTheme ? slideDetails?.slideTextItalic : presentationLevelTheme?.textItalic,
      slideTextUnderLine: isSlideTheme ? slideDetails?.slideTextUnderLine : presentationLevelTheme?.textUnderline,
      slideTextStrikeThrough: isSlideTheme ? slideDetails?.slideTextStrikeThrough : presentationLevelTheme?.textStrikeout,
      slidetextSize: isSlideTheme ? slideDetails?.slideTextFontSize : presentationLevelTheme?.fontSize
    };
    return themeProperties;
  }
  ngOnChanges() {
    this.screenOptions = "presentationScreen";
    // this.slidesTheme = this.assignThemeProperties(this.presentationLevelTheme, this.slideDetails?.design,true);
    this.getRgbColr(this.slideTheme?.ThemeBackgroundColor);
    this.profanityFilterCheck(this.profanityWord);

    // // this.openEndedData = this.openEndedOptions;

  }
  ngAfterViewInit() {
    // this.el.nativeElement.querySelector('#focusDiv').target();
    if (this.presentationMode) {
      this.scrollToBottom();
    }
  }
  

  onKeyDown(event: KeyboardEvent) {
    const div = document.querySelector('#scroller');
    if (!div) return;

    const delta = 50; // You can adjust the scroll speed

    if (event.key === 'ArrowDown') {
      div.scrollTop += delta;
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      div.scrollTop -= delta;
      event.preventDefault();
    }
  }
  profanityFilterCheck(profanityWord: any) {
    // this.openEndedData = this.slidData.options.map(option => option.optionTitle);
    if (this.isShowResults) {
      // this.openEndedOptions.forEach((element: any) => {
      //   if(profanityWord?.length > 0){
      //     var isProfanityWord = profanityWord.some(badWord => element?.optionTitle.toLowerCase().trim().includes(badWord));
      //     if (!isProfanityWord) {
      //       this.openEndedData.push(element);
      //     }
      //   }
      //   else{
        // this.openEndedData = this.openEndedOptions;
      //   }
      // });
    }
  }
  scrollToBottom() {
    const container = $('.overflow');
    if (!container || !container[0]) {
      
      return;
    }
    
    setTimeout(() => {
      const scrollHeight = container[0]?.scrollHeight || 0;
      const clientHeight = container[0]?.clientHeight || 0;
      const maxScroll = scrollHeight - clientHeight;

      if (scrollHeight > 0) {
        if (maxScroll > 0) {
          
          this.incrementalScroll(2000);
        } else {
          container.scrollTop(scrollHeight);
        }
      }
    }, 100);
  }
  
    incrementalScroll( pause: number) {
    var step = 0;
    const container = $('.overflow');
    
    if (!container || !container[0]) {
      
      return;
    }
    
    const scrollHeight = container[0]?.scrollHeight || 0;
    const clientHeight = container[0]?.clientHeight || 0;
    const maxScroll = scrollHeight - clientHeight;
    
    if (maxScroll <= 0) {
      setTimeout(() => {
        const updatedScrollHeight = container[0]?.scrollHeight || 0;
        const updatedClientHeight = container[0]?.clientHeight || 0;
        const updatedMaxScroll = updatedScrollHeight - updatedClientHeight;
        
        
        if (updatedMaxScroll > 0) {
          this.performScrolling(container, updatedMaxScroll, pause);
                 } else {
           container.scrollTop(updatedScrollHeight);
           setTimeout(() => {
             const finalScrollHeight = container[0]?.scrollHeight || 0;
             const finalClientHeight = container[0]?.clientHeight || 0;
             const finalMaxScroll = finalScrollHeight - finalClientHeight;
             
             if (finalMaxScroll > 0) {
               this.performScrolling(container, finalMaxScroll, pause);
             }
           }, 1000);
         }
      }, 500);
      return;
    }
    
    this.performScrolling(container, maxScroll, pause);
  }

  private performScrolling(container: any, maxScroll: number, pause: number) {
    let currentScrollPosition = container.scrollTop();
    var step = 0;

    const scrollStep = () => {
      if( this.isFirstScroll){
        step = 0;
      }else{
        step = 150;
      }
      if (currentScrollPosition < maxScroll) {
        currentScrollPosition = Math.min(currentScrollPosition + step, maxScroll);
        container.animate({
          scrollTop: currentScrollPosition
        }, 500, () => {
          if (currentScrollPosition < maxScroll) {
            setTimeout(scrollStep, pause);
          }
        });
      }
    };

    scrollStep();
    this.isFirstScroll = false;
  }
  
  showOptionDetails(index: number) {
   // document.getElementById('overflow-scroll').classList.remove("overflow"); 
    this.isShowOptionDetails = this.isShowOptionDetails ? false : true;
    this.isAnswed.emit(this.isShowOptionDetails);
    this.selectedOptionIndex = index;
  }
  nextOption() {
    if (this.openEndedData.length > this.selectedOptionIndex + 1) {
      this.isPrev = true;
      this.selectedOptionIndex++;
    }
    else {

    }
  }
  previousOption() {
    if (!(this.selectedOptionIndex == 0)) {
      this.isPrev = false;
      this.selectedOptionIndex--;
    }
    else {

    }
  }
  displayAllAnswers() {
    document.getElementById('overflow-scroll').classList.add("overflow"); 
    this.isShowOptionDetails = !this.isShowOptionDetails;
  }
  // @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
  //      this.isShowOptionDetails = !this.isShowOptionDetails;
  //      setTimeout(() => {
  //      this.isAnswed.emit(this.isShowOptionDetails);
  //     }, 1000);
  // }
  showLongerDescription(){
    if(this.screenOptions == 'presentationScreen')
    {
      this.isShowLongerDescription = true;
    }
  }
  hideLongerDescription(){
    if(this.screenOptions == 'presentationScreen')
    {
      this.isShowLongerDescription = false;
    }
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
  updateChart(value: any) {
    var openEndedData = value;
    if(this.isPreviewMode){
      this.openEndedData = [];  
      this.openEndedData = openEndedData.filter((item, i, arr) => item.Answer && typeof item.Answer === 'string' && item.Answer.trim() !== '' && item.ModerateAnswer === false && arr.findIndex(opt => opt.AnswerId === item.AnswerId) === i);
      // this.openEndedData = this._workspaceservice.profanityWordsChecksForWord(this.openEndedData);
  }else{
    this.openEndedData = openEndedData.filter((item, i, arr) => item.Answer && typeof item.Answer === 'string' && item.Answer.trim() !== '' && item.ModerateAnswer === false && arr.findIndex(opt => opt.AnswerId === item.AnswerId) === i);
    
    // Give more time for DOM to update with new content before scrolling
    setTimeout(() => {
      this.scrollToBottom();
    }, 1200);
    // this.openEndedData = this._workspaceservice.profanityWordsChecksForWord(this.openEndedData);
  }
}

  updateTheme(data: any) {
    this.slideTheme = data;
    this.getRgbColr(this.slideTheme?.ThemeBackgroundColor);
  }
  updatePresentationTheme(data:any){
    if (!this.slideDetails?.design?.slideResetTheme) {
      this.slideTheme = data;
    this.getRgbColr(this.slideTheme?.ThemeBackgroundColor);
    }
  }
  chunkArray(arr: any[], size: number) {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, index) =>
      arr.slice(index * size, index * size + size)
    );
  }
  ngOnDestroy(): void {
    this.stopRandomDataUpdates();
  }
  updateChartWithRandomData(): void {
    if (this.isFirstUpdate) {
      this.animationData = [];
      this.usedIndexes.clear();
      this.isFirstUpdate = false;
      return;
    }
    if (this.usedIndexes.size >= this.originalData.length) {
      this.animationData = [];
      this.usedIndexes.clear();
      return;
    }
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * this.originalData.length);
    } while (this.usedIndexes.has(randomIndex));
    this.usedIndexes.add(randomIndex);
    this.animationData.push(this.originalData[randomIndex]);
    this.openEndedData = [...this.animationData];
  }
  resetChart(): void {
    this.isFirstUpdate = true;
    this.currentIndex = 0;
  }

  startRandomDataUpdates(): void {
    if (!this.isAnimation) {
      this.isAnimation = true;
      this.resetChart();
      
      if (this.chartUpdateInterval) {
        clearInterval(this.chartUpdateInterval);
      }

      setTimeout(() => {
        this.updateChartWithRandomData();
        
        this.chartUpdateInterval = setInterval(() => {
          this.updateChartWithRandomData();
        }, 2000);
      }, 1000);
    }
  }
  stopRandomDataUpdates(): void {
    if (this.chartUpdateInterval) {
      clearInterval(this.chartUpdateInterval);
      this.chartUpdateInterval = null;
    }
    this.isAnimation = false;
    this.isFirstUpdate = true;
    this.openEndedData = [...this.originalData];
  }
}
