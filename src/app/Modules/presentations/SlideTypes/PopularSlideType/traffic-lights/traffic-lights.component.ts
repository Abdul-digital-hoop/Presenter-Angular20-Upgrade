import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef, DoCheck, OnDestroy } from '@angular/core';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-traffic-lights',
    templateUrl: './traffic-lights.component.html',
    styleUrls: ['./traffic-lights.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class TrafficLightsComponent implements OnInit {
  // @Input('aboutTheSlides') public aboutTheSlideValue: any;
  // @Input('questions') public questionsValue: any;
  // @Input('longDescription') public longDescriptionValue: any;
  // @Input('slidDetails') public slideDetails: any;
  // @Input('slideThemes') public slideThemes: any;
  // @Input('themesChartColor') public themesChartColor: any[];
  // @Input('themesBackgroundClour') public themesBackgroundClour: any;
  // @Input('screenOptions') public screenOptions: string;
  @Input('trafficLightsOptions') public trafficLightOptions: any[] = [];
  @Input() slideTheme:any;
  public correctAnswerIndex: number = 4;
  isShowLongerDescription = false;
  optionValueInPercentage: number = 0;
  contrastColorforTick: string;
  contrastColorforWrong: string;
  contrastColor: any;
  presentationMode: boolean = true;
  private subscription: Subscription = new Subscription();
  private previousTrafficLightOptions: any[] = [];
  public blinkingIndex: number | null = null;

  constructor(public _workspaceservice: WorkspaceService, private cdr: ChangeDetectorRef) {
    // if (this.trafficLightOptions?.length == 0) {
    //   this._workspaceservice.storeActiveSlideDetails();
    // }
    // else {
    //   this._workspaceservice.storeActiveSlideDetails();
    //   this.trafficLightOptions = this._workspaceservice.dynamicChartData(this._workspaceservice.options);
    // }
    this.trafficLightOptions = this._workspaceservice.dynamicChartData(this._workspaceservice.options);
    this.slideTheme = this._workspaceservice.presentationTheme;
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.trafficLightOptions = this._workspaceservice.dynamicChartData(this._workspaceservice.options);
    if (changes.trafficLightOptions) {
      this.updateTrafficLightOptions();
    }
  }
  ngOnInit(): void {
    this.presentationMode = this._workspaceservice.presentationMode;
    // this.calculateContrastColor(this.themesBackgroundClour)    
    this.updateTrafficLightOptions();
  }

  ngDoCheck(): void {
    this.cdr.markForCheck();
  }
  ngAfterViewInit() {
    // this._workspaceservice.getDataFromAPIActiveSlide().subscribe(
    //   (response: any) => {
    //     let presentationData = response['data'];
    //     this._workspaceservice.assignNewValueOnStore(presentationData);
    //     this.trafficLightOptions = this._workspaceservice.dynamicChartData(this._workspaceservice.options);
    //     this.PresentageCalculation(this.trafficLightOptions);
    //     this.contrastColor = this.calculateContrastColor(this.slideTheme?.ThemeBackgroundColor);
    //     this.cdr.markForCheck();  // Manually trigger change detection
    //     this.updateTrafficLightOptions();
    //   },
    //   (error: any) => {
    //     console.log(error)
    //   }
    // )
  }
  updateTrafficLightOptions(): void {
    const currentTrafficLightOptions = this._workspaceservice.dynamicChartData(this._workspaceservice.options);
    this.blinkingIndex = null;
    currentTrafficLightOptions.forEach((option, index) => {
      if (this.previousTrafficLightOptions[index] && option.value > this.previousTrafficLightOptions[index].value) {
        this.blinkingIndex = index;
      }
    });
    this.trafficLightOptions = currentTrafficLightOptions;
    this.PresentageCalculation(this.trafficLightOptions);
    this.contrastColor = this.calculateContrastColor(this.slideTheme?.ThemeBackgroundColor);
    this.cdr.detectChanges();
    this.previousTrafficLightOptions = [...this.trafficLightOptions];
    if (this.blinkingIndex !== null) {
      setTimeout(() => {
        this.blinkingIndex = null;
      }, 1000);
    }
  }
  PresentageCalculation(options: any) {
    var optionTotalValue = 0;
    for (let option of options) {
      optionTotalValue = optionTotalValue + option?.value;
    }
    if (optionTotalValue > 0) {
      this.optionValueInPercentage = 100 / optionTotalValue;
    }
    else {
      this.optionValueInPercentage = 0;
    }
  }
  calculateContrastColor(colorCode: any): any {

    if (colorCode?.includes('#')) {
      var hex = colorCode.replace(/^#/, '');
      // Parse the hex values
      const bigint = parseInt(hex, 16);
      // Extract RGB components
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      var rgbColor = `rgb(${r}, ${g}, ${b})`;
      const rgb = rgbColor.substring(4, rgbColor.length - 1)
        .replace(/ /g, '')
        .split(',');

      const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;

      return this.contrastColor = brightness >= 128 ? 'black' : 'black';
    }
    else {
      const rgb = colorCode?.substring(4, colorCode.length - 1)
        .replace(/ /g, '')
        .split(',');

      const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;

      return this.contrastColor = brightness >= 128 ? 'black' : 'black';
    }
  }
  // showLongerDescription(){
  //   if(this.screenOptions == 'presentationScreen')
  //   {
  //     this.isShowLongerDescription = true;
  //   }
  // }
  // hideLongerDescription(){
  //   if(this.screenOptions == 'presentationScreen')
  //   {
  //     this.isShowLongerDescription = false;
  //   }
  // }
  isCorrectOption(index: number): boolean {
    return this.correctAnswerIndex !== null && this.correctAnswerIndex === index;
  }
  calculateFontSize(text: string): string {
    const length = text ? text.length : 0;

    if (this.presentationMode) {
      if (length > 101) {
        return '22px';
      } else if (length >= 51 && length <= 100) {
        return '22px';
      } else {
        return '24px';
      }
    } else {
      if (length > 101) {
        return '14px';
      } else if (length >= 51 && length <= 100) {
        return '14px';
      } else {
        return '16px';
      }
    }
  }
  updateChart(value: any) {
    // this._workspaceservice.getDataFromAPIActiveSlide().subscribe(
    //   (response: any) => {
    //     let presentationData = response['data'];
    //     this._workspaceservice.assignNewValueOnStore(presentationData);
    //     this.trafficLightOptions = this._workspaceservice.dynamicChartData(this._workspaceservice.options);
    //     this.PresentageCalculation(this.trafficLightOptions);
    //     this.contrastColor = this.calculateContrastColor(this.slideTheme?.ThemeBackgroundColor);
    //     this.cdr.detectChanges();
    //   },
    //   (error: any) => {
    //     console.log('Error fetching data:', error);
    //   }
    // );
    this.updateTrafficLightOptions();
  }
  updateTheme(data:any){
    this.slideTheme = data;
    this.updateTrafficLightOptions();
  }
  getMaxIndex(): number | null {
    if (!this.trafficLightOptions || this.trafficLightOptions.length === 0) {
      return null;
    }
    const values = this.trafficLightOptions.map(option => option.value);
    const maxValue = Math.max(...values);
    const maxCount = values.filter(value => value === maxValue).length;
    if (maxCount > 1) {
      return null;
    }
    return values.indexOf(maxValue);
  }
  
}
