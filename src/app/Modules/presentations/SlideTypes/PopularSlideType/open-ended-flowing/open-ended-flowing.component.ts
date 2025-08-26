import { animate, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
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
  ] 
})
export class OpenEndedFlowingComponent implements OnInit {

  
  // @Input('openEndedOptions') public openEndedOptions: any[];
  // @Input('screenOptions') public screenOptions: string;
  screenOptions ='presentationScreen';
  @Input('aboutTheSlides') public aboutTheSlideValue: any;
  @Input('questions') public questionsValue: any;
 isShowResults: boolean = true;
  @Input('longDescription') public longDescriptionValue: any;
  @Input('slidDetails') public slideData: any;
  @Input('slideThemes') public slideThemes: any;
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
  presentationMode: boolean = true;
  private isFirstScroll = true;
  @Input() slideTheme:any;
  defaultData = [
    { Answer: "Project management software's"},
    { Answer: "Time-blocking techniques"},
    { Answer: "Daily to-do lists"},
    { Answer: "Automation tools"},
    { Answer: "Collaboration platforms"},
    { Answer: "Focus methods"},
  ];
  constructor(private el: ElementRef, private renderer: Renderer2, private _commanservice:CommanService,  public _workspaceservice: WorkspaceService,) {    
    this.openEndedData = this._workspaceservice.options.filter((item, i, arr) => item.Answer && typeof item.Answer === 'string' && item.Answer.trim() !== '' && item.ModerateAnswer === false && arr.findIndex(opt => opt.AnswerId === item.AnswerId) === i);
    this.openEndedData = this._workspaceservice.profanityWordsChecksForWord(this.openEndedData);
    if (this._workspaceservice.presentationMode) {
      this.scrollToBottom();
    }
    //this.presentationMode = this._workspaceservice.presentationMode === 'true';
   }

  ngOnInit(): void {
    // this.profanityFilterCheck(this.profanityWord);
    // this.openEndedData = this.openEndedOptions;
    this.presentationMode = this._workspaceservice.presentationMode;
    this.slideTheme = this._workspaceservice.presentationTheme;
    this.getRgbColr(this.slideTheme?.ThemeBackgroundColor);
  }
  ngOnChanges() {
    this.getRgbColr(this.slideTheme?.ThemeBackgroundColor);
    this.profanityFilterCheck(this.profanityWord);
    // this.openEndedData = this.openEndedOptions;

  }
  ngAfterViewInit() {
    // this.el.nativeElement.querySelector('#focusDiv').target();
    if (this._workspaceservice.presentationMode) {
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
    const documentHeight = container[0]?.scrollHeight || 0;
  
    if (documentHeight > 0) {     
        
        this.incrementalScroll(2000);
    }
  }
  
  incrementalScroll( pause: number) {
    var step = 0;
    const container = $('.overflow');
    const maxScroll = container[0]?.scrollHeight - container[0]?.clientHeight || 0;
    let currentScrollPosition = container.scrollTop();
  
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
    document.getElementById('overflow-scroll').classList.remove("overflow"); 
    this._workspaceservice.isShowOptionDetails = this._workspaceservice.isShowOptionDetails ? false : true;
    this.isAnswed.emit(this._workspaceservice.isShowOptionDetails);
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
    this._workspaceservice.isShowOptionDetails = !this._workspaceservice.isShowOptionDetails;
  }
  // @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
  //      this._workspaceservice.isShowOptionDetails = !this._workspaceservice.isShowOptionDetails;
  //      setTimeout(() => {
  //      this.isAnswed.emit(this._workspaceservice.isShowOptionDetails);
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
    debugger
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
    if(this._workspaceservice.isPreviewMode){
      this.openEndedData = [];
      this.openEndedData = value.filter((item, i, arr) => item.Answer && typeof item.Answer === 'string' && item.Answer.trim() !== '' && item.ModerateAnswer === false && arr.findIndex(opt => opt.AnswerId === item.AnswerId) === i);
      this.openEndedData = this._workspaceservice.profanityWordsChecksForWord(this.openEndedData);
  }else{
    this.openEndedData = value.filter((item, i, arr) => item.Answer && typeof item.Answer === 'string' && item.Answer.trim() !== '' && item.ModerateAnswer === false && arr.findIndex(opt => opt.AnswerId === item.AnswerId) === i);
    this.openEndedData = this._workspaceservice.profanityWordsChecksForWord(this.openEndedData);
  }
  if (this._workspaceservice.presentationMode) {
    setTimeout(() => {
      this.scrollToBottom();
    }, 1000);
  }
}

  updateTheme(data: any) {
    this.slideTheme = data;
    this.getRgbColr(this.slideTheme?.ThemeBackgroundColor);
  }
  chunkArray(arr: any[], size: number) {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, index) =>
      arr.slice(index * size, index * size + size)
    );
  }
}
