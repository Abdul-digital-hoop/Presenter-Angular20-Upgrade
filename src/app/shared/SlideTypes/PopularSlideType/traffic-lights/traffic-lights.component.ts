import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef, DoCheck, OnDestroy } from '@angular/core';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-traffic-lights',
  templateUrl: './traffic-lights.component.html',
  styleUrls: ['./traffic-lights.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrafficLightsComponent implements OnInit, OnDestroy {
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
  @Input() slideDetails:any;
  @Input() presentationLevelTheme:any;
  @Input('screenOptions') public screenOptions: string;
  @Input() presentationMode: boolean = true;
  public correctAnswerIndex: number = 4;
  isShowLongerDescription = false;
  optionValueInPercentage: number = 0;
  contrastColorforTick: string;
  contrastColorforWrong: string;
  contrastColor: any;
  private subscription: Subscription = new Subscription();
  private previousTrafficLightOptions: any[] = [];
  public blinkingIndex: number | null = null;
  presentationTheme: { ThemeName: string; ThemeLogo: any; ThemeBackgroundColor: string; ThemeBackgroundImage: any;  ThemeTextColor: string; ThemeFontFamily: string; ThemeLineColor: string; ThemeVisualizationColor: any[]; slideTextBold: boolean; slideTextItalic: boolean; slideTextUnderLine: boolean; slideTextStrikeThrough: boolean; slidetextSize: number,backgroundColorOpacity:any};
  slidesTheme: { ThemeName: string; ThemeLogo: any; ThemeBackgroundColor: string; ThemeBackgroundImage: string; ThemeTextColor: string; ThemeFontFamily: string; ThemeLineColor: string; ThemeVisualizationColor: any[]; slideTextBold: boolean; slideTextItalic: boolean; slideTextUnderLine: boolean; slideTextStrikeThrough: boolean; slidetextSize: number };
  formatedOptions: any;
  chartUpdateInterval: any;
  previousIndex: number = -1;
  isFirstUpdate: boolean = true;
  currentIndex: number = -1;
  originalOptions: any[] = [];
  isAnimation: boolean = false;

  constructor(public _workspaceservice: WorkspaceService, private cdr: ChangeDetectorRef) {
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.trafficLightOptions = this._workspaceservice.dynamicChartData(this.formatedOptions);
    if (changes.trafficLightOptions) {
      this.updateTrafficLightOptions();
    }
  }
  ngOnInit(): void {
    this.presentationTheme = this.assignThemeProperties(this.presentationLevelTheme);
    this.slidesTheme = this.assignThemeProperties(this.presentationLevelTheme, this.slideDetails?.design,true);
    this.slideTheme = this.slideDetails?.design?.slideResetTheme ? this.slidesTheme: this.presentationTheme;
    this.formatedOptions = this._workspaceservice.convertDataFormat(this.slideDetails?.slideContentData,'Options');
    this.trafficLightOptions = this._workspaceservice.dynamicChartData(this.formatedOptions);
    this.originalOptions = [...this.trafficLightOptions];
    this.updateTrafficLightOptions();
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
  ngDoCheck(): void {
    this.cdr.markForCheck();
  }
  
  updateTrafficLightOptions(): void {
    const currentTrafficLightOptions = this._workspaceservice.dynamicChartData(this.formatedOptions);
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
    this.updateTrafficLightOptions();
  }
  updateResult(value: any) {
    this.formatedOptions.forEach((option) => {
      const matchedValue = value.find((val) => val.OptionId === option.OptionId);
      if (matchedValue) {
        option.value = matchedValue.value;
      }
    });
    this.trafficLightOptions = value;
    this.updateTrafficLightOptions();
  }

  updateTheme(data:any){
    this.slideTheme = data;
    this.updateTrafficLightOptions();
  }
  updatePresentationTheme(data: any) {
    if (!this.slideDetails?.design?.slideResetTheme) {
      this.slideTheme = data;
      this.updateTrafficLightOptions();
    } else {
      this.updateTrafficLightOptions();
    }
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
  
  updateChartWithRandomData(): void {
    try {
      if (this.isFirstUpdate) {
        this.formatedOptions = this.formatedOptions.map(option => ({
          OptionId: option?.OptionId,
          OptionTitle: option?.OptionTitle,
          value: 0,
          isCorrect: option?.isCorrect,
        }));
        this.isFirstUpdate = false;
      } else {
        const randomIndex = Math.floor(Math.random() * this.formatedOptions.length);
        this.formatedOptions = this.formatedOptions.map((option, index) => {
          if (index === randomIndex) {
            return {
              OptionId: option?.OptionId,
              OptionTitle: option?.OptionTitle,
              value: option?.value + 1,
              isCorrect: option?.isCorrect,
            };
          }
          return option;
        });
      }
      this.updateChart(this.formatedOptions);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error updating traffic lights data:', error);
      this.stopRandomDataUpdates();
    }
  }

  resetChart(): void {
    this.isFirstUpdate = true;
    this.previousIndex = -1;
  }

  startRandomDataUpdates(): void {
    // Check if animation is already running
    if (!this.isAnimation) {
      this.isAnimation = true;
      this.resetChart();
      
      if (this.chartUpdateInterval) {
        clearInterval(this.chartUpdateInterval);
      }
  
      this.chartUpdateInterval = setInterval(() => {
        this.updateChartWithRandomData();
        if (!this.isFirstUpdate) {
          clearInterval(this.chartUpdateInterval);
          this.chartUpdateInterval = setInterval(() => {
            this.updateChartWithRandomData();
          }, 2000);
        }
      }, 1000);
    }
  }
  

  stopRandomDataUpdates(): void {
    if (this.chartUpdateInterval) {
      clearInterval(this.chartUpdateInterval);
      this.chartUpdateInterval = null;
    }
    this.formatedOptions = this._workspaceservice.convertDataFormat(this.slideDetails?.slideContentData,'Options');
    this.isAnimation = false;
    this.isFirstUpdate = true;
    this.updateTrafficLightOptions();
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    // this.stopRandomDataUpdates();
  }
}
