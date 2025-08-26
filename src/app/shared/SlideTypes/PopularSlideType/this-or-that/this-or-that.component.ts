import { ChangeDetectorRef, Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommanService } from 'src/app/core/Sevices/comman.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';

@Component({
    selector: 'app-this-or-that',
    templateUrl: './this-or-that.component.html',
    styleUrls: ['./this-or-that.component.scss'],
    standalone: false
})
export class ThisOrThatComponent implements OnInit, OnDestroy {
// screenOptions :any='presentationScreen' ;
  isShowLongerDescription = false;
  options: any[] = [];
  
@Input() slideTheme:any;
@Input() slideDetails:any;
@Input() presentationLevelTheme:any;
@Input() presentationMode:any;
@Input() screenOptions:any;
formatedOptions: any[]=[];
  ContrastColor: any;
  presentationTheme: { ThemeName: string; ThemeLogo: any; ThemeBackgroundColor: string; ThemeBackgroundImage: any;  ThemeTextColor: string; ThemeFontFamily: string; ThemeLineColor: string; ThemeVisualizationColor: any[]; slideTextBold: boolean; slideTextItalic: boolean; slideTextUnderLine: boolean; slideTextStrikeThrough: boolean; slidetextSize: number,backgroundColorOpacity:any};
  slidesTheme: { ThemeName: string; ThemeLogo: any; ThemeBackgroundColor: string; ThemeBackgroundImage: string; ThemeTextColor: string; ThemeFontFamily: string; ThemeLineColor: string; ThemeVisualizationColor: any[]; slideTextBold: boolean; slideTextItalic: boolean; slideTextUnderLine: boolean; slideTextStrikeThrough: boolean; slidetextSize: number };
  chartUpdateInterval: any;
  previousIndex: number = -1;
  isFirstUpdate: boolean = true;
  currentIndex: number = -1;
  originalOptions: any[] = [];
  isAnimation: boolean = false;

  constructor(public workSpaceService: WorkspaceService,public commonService: CommanService,private cdr: ChangeDetectorRef) {
    
  }

  animate = false;
  ngOnInit(): void {
    this.options = this.workSpaceService.convertDataFormat(this.slideDetails?.slideContentData,'Options');
    this.originalOptions = [...this.options];
    this.presentationTheme = this.assignThemeProperties(this.presentationLevelTheme);
    this.slidesTheme = this.assignThemeProperties(this.presentationLevelTheme, this.slideDetails?.design,true);
    this.slideTheme = this.slideDetails?.design.slideResetTheme ? this.slidesTheme: this.presentationTheme;
    this.ContrastColor = this.commonService.getContrastColor(this.slideTheme?.ThemeBackgroundColor);
    setInterval(() => {
      this.animate = false;
      setTimeout(() => {
        this.animate = true;
      }, 20);
    }, 1000); 
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
  ngAfterContentChecked() {
    this.ContrastColor = this.commonService.getContrastColor(this.slideTheme?.ThemeBackgroundColor);
  }
  public thisOrThatValue(index: number): boolean {
    if (!this.slideDetails.settings.showInResults) {
        return true;
    } else {
        var maxValue = Math.max(this.options[0]?.value, this.options[1]?.value);
        return this.options[index]?.value == maxValue;
    }
}
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
  
  updateChart(value:any){
    this.options =value;
    this.cdr.detectChanges();
  }
  calculateFontSize(text: string, isMaxValue: boolean): string {
    const length = text ? text.length : 0;
    let fontSize = 20;

    // Determine the base font size based on text length
    if (this.presentationMode) {
        if (length > 35) {
            fontSize = 16;
        } else if (length >= 20 && length <= 35) {
            fontSize = 18;
        } else {
            fontSize = 20;
        }
    } else {
        if (length > 35) {
            fontSize = 8;
        } else if (length >= 20 && length <= 35) {
            fontSize = 10;
        } else {
            fontSize = 14;
        }
    }

    // Apply the same font size for options with the maximum value
    return isMaxValue ? `${fontSize}px` : `${fontSize}px`;
}
  calculatePercentage(value: number): number {
    const totalValue = this.options.reduce((acc, option) => acc + option.value, 0);
    if (totalValue === 0) {
      return 0;
    }
    return (value / totalValue) * 100;
  }
  updateTheme(data: any) {
    this.slideTheme = data;
    const colors = this.slideTheme.ThemeVisualizationColor.map(item => item.color);

    this.options.forEach((option, index) => {
      if (colors[index]) {
        option.visualizationColor = colors[index];
      }
    });
     this.workSpaceService.dynamicChartData(this.options);
  }
  updatePresentationTheme(data: any) {
    if (!this.slideDetails?.design?.slideResetTheme) {
      this.slideTheme = data;

      const colors = this.slideTheme.ThemeVisualizationColor.map(item => item.color);

      this.options.forEach((option, index) => {
        if (colors[index]) {
          option.visualizationColor = colors[index];
        }
      });
      this.workSpaceService.dynamicChartData(this.options);
    } else {
      this.workSpaceService.dynamicChartData(this.options);
    }
  }
  calculateCircleSize(value: number): string {
    if (value === 0) {
      return '0px';
    }

    const totalValue = this.options.reduce((acc, option) => acc + option.value, 0);
    if (totalValue === 0) {
      return '7.5px';
    }

    const percentage = (value / totalValue) * 100;
    
    const minSize = 7.5;
    const maxSize = 150;
    
    let size = Math.max(minSize, (percentage / 100) * maxSize);
    
    size = Math.round(size / 7.5) * 7.5;
    
    return `${size}px`;
  }

  updateChartWithRandomData(): void {
    try {
      if (this.isFirstUpdate) {
        // Initialize with empty values
        this.options = this.options.map(option => ({
          ...option,
          value: 0
        }));
        this.isFirstUpdate = false;
      } else {
        // Randomly select one option to increment
        const randomIndex = Math.floor(Math.random() * this.options.length);
        
        // Update the selected option by incrementing its value
        this.options = this.options.map((option, index) => {
          if (index === randomIndex) {
            return {
              ...option,
              value: option.value + 1
            };
          }
          return option;
        });
      }
      this.updateChart(this.options);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error updating this-or-that data:', error);
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
  
      // First update after 1000ms
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
    this.options = [...this.originalOptions];
      this.isAnimation = false;
      this.isFirstUpdate = true;
      this.updateChart(this.options);
      this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.stopRandomDataUpdates();
  }
}
