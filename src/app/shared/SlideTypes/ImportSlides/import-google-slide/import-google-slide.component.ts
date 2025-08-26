import { Component, Input, OnInit, SimpleChanges, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';

@Component({
    selector: 'app-import-google-slide',
    templateUrl: './import-google-slide.component.html',
    styleUrls: ['./import-google-slide.component.scss'],
    standalone: false
})
export class ImportGoogleSlideComponent implements OnInit, OnDestroy {

  slidesLink: string = "";
  slideNumber: number;
  previousSlideNumber: number;
  public screenOptions: any;
  public slideData: any;
  public slideThemes: any;
  sanitizedUrl: SafeResourceUrl;
  showSlidesMessage: boolean = false;
  isFullScreen = true;
  isInvalidLink: boolean = false;
  @Input() slideTheme:any;
  @Input() slideDetails:any;
  @Input() template:any;
  @Input() presentationLevelTheme:any;
  @Input() presentationMode:any;
  presentationTheme: { ThemeName: string; ThemeLogo: any; ThemeBackgroundColor: string; ThemeBackgroundImage: any;  ThemeTextColor: string; ThemeFontFamily: string; ThemeLineColor: string; ThemeVisualizationColor: any[]; slideTextBold: boolean; slideTextItalic: boolean; slideTextUnderLine: boolean; slideTextStrikeThrough: boolean; slidetextSize: number,backgroundColorOpacity:any};
  slidesTheme: { ThemeName: string; ThemeLogo: any; ThemeBackgroundColor: string; ThemeBackgroundImage: string; ThemeTextColor: string; ThemeFontFamily: string; ThemeLineColor: string; ThemeVisualizationColor: any[]; slideTextBold: boolean; slideTextItalic: boolean; slideTextUnderLine: boolean; slideTextStrikeThrough: boolean; slidetextSize: number };
  importPPTLink: any;
  importPPTIndex: any;

  // Animation properties
  chartUpdateInterval: any;
  previousIndex: number = -1;
  isFirstUpdate: boolean = true;
  currentIndex: number = -1;
  isAnimation: boolean = false;
  originalData: any[] = [];

  constructor(private sanitizer: DomSanitizer, public workSpaceService:WorkspaceService) {
    
  }

  ngOnInit(): void {
    this.presentationTheme = this.assignThemeProperties(this.presentationLevelTheme);
    this.slidesTheme = this.assignThemeProperties(this.presentationLevelTheme, this.slideDetails?.design);
    this.slideTheme = this.slideDetails?.design.slideResetTheme ? this.slidesTheme: this.slidesTheme;
    this.importPPTLink = this.workSpaceService.changeImportSlideLinkDataFormat(this.slideDetails?.slideContentData);
    this.importPPTIndex = this.workSpaceService.changeImportSlideNumberDataFormat(this.slideDetails?.slideContentData);
    this.updateSanitizedUrl();
    this.updateSanitizedSlideNumber();
  }
  private assignThemeProperties(presentationLevelTheme: any, slideDetails?: any): any {
    return {
      ThemeName: presentationLevelTheme?.themeName,
      ThemeLogo: presentationLevelTheme?.themesLogo,
      ThemeTextColor: slideDetails?.slideTextColor || presentationLevelTheme?.themesFontColor,
      backgroundColorOpacity: presentationLevelTheme?.backgroundColorOpacity,
      ThemeFontFamily: slideDetails?.slideTextFontFamily || presentationLevelTheme?.themesFonts,
      ThemeBackgroundImage: presentationLevelTheme?.themesBackgroundImage,
      ThemeLineColor: slideDetails?.slideLineColor || presentationLevelTheme?.lineClour,
      ThemeBackgroundColor: slideDetails?.slideBackgroundColor || presentationLevelTheme?.themesBackgroundColor,
      ThemeVisualizationColor: presentationLevelTheme?.themesChartColor,
      slideTextBold: slideDetails?.slideTextBold || presentationLevelTheme?.textBold,
      slideTextItalic: slideDetails?.slideTextItalic || presentationLevelTheme?.textItalic,
      slideTextUnderLine: slideDetails?.slideTextUnderLine || presentationLevelTheme?.textUnderline,
      slideTextStrikeThrough: slideDetails?.slideTextStrikeThrough || presentationLevelTheme?.textStrikeout,
      slidetextSize: slideDetails?.slideTextFontSize || presentationLevelTheme?.fontSize
    };
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.slidesLink || changes.slideNumber) {
    if (changes.slidesLink) {
      this.slidesLink = changes.slidesLink.currentValue;
      this.updateSanitizedUrl();
    }
    if (changes.slideNumber) {
        this.updateSanitizedSlideNumber();
    }
  }
  }
  
  private updateSanitizedUrl() {
    
    const { slidesLink, slideNumber, sanitizer } = this;
    this.slideNumber = this.importPPTIndex;
    if (this.importPPTLink.trim() === '' || typeof slideNumber !== 'number' || slideNumber < 0) {
        return;
    }

    let url = this.importPPTLink.split('&rm=minimal')[0];
    if (url.startsWith('https://docs.google.com/presentation/d/')) {
        if (url.includes('/pub?')) {
            url = url.replace('/pub?', '/embed?');
        }
    } else {
        return;
    }

    if (slideNumber === 0) {
        this.slideNumber = 1;
    } else {
        this.sanitizedUrl = sanitizer.bypassSecurityTrustResourceUrl(
            `${url}&rm=minimal&slide=${this.importPPTIndex}`
        );
    }
}
updateSanitizedSlideNumber(){
  if( !((this.slideNumber == this.previousSlideNumber) || (this.slideNumber == null))){
  const {  slideNumber, sanitizer } = this;
  if (this.importPPTLink.trim() === '' || typeof slideNumber !== 'number' || slideNumber < 0) {
      return;
  }
  
  let url = this.importPPTLink.split('&rm=minimal')[0];
  if (url.startsWith('https://docs.google.com/presentation/d/')) {
      if (url.includes('/pub?')) {
          url = url.replace('/pub?', '/embed?');
      }
  } else {
      return;
  }
    const rmminimal = !this.presentationMode ? '&rm=minimal' : '';
    if (slideNumber === 0) {
      this.slideNumber = 1;
  }
    this.sanitizedUrl = sanitizer.bypassSecurityTrustResourceUrl(
      `${url}${rmminimal}&slide=${this.importPPTIndex}`
    );
  }
}

calculateBorderColor() {
  if(this.slideThemes?.ThemeTextColor != '' || null){
    const backgroundRGB = this.hexToRgb(this.slideThemes?.ThemeBackgroundColor);
    const textRGB = this.hexToRgb(this.slideThemes?.ThemeTextColor);
    const blendedRGB = {
      r: Math.floor((backgroundRGB.r + textRGB.r) / 2),
      g: Math.floor((backgroundRGB.g + textRGB.g) / 2),
      b: Math.floor((backgroundRGB.b + textRGB.b) / 2),
    };
    return `rgba(${blendedRGB.r}, ${blendedRGB.g}, ${blendedRGB.b}, 0.9)`;
  }
}

hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
    : undefined;
}
updateChart(value:any,index:any){
  this.importPPTLink = value;
  this.importPPTIndex = index;
  this.updateSanitizedUrl();
  this.updateSanitizedSlideNumber();
}

updateChartWithRandomData(): void {
  try {
    if (this.isFirstUpdate) {
      this.importPPTIndex = 1;
      this.isFirstUpdate = false;
    } else {
      this.importPPTIndex++;
    }
    console.log(this.importPPTLink,this.importPPTIndex);
    this.updateChart(this.importPPTLink,this.importPPTIndex);
  } catch (error) {
    console.error('Error updating google slide data:', error);
    this.stopRandomDataUpdates();
  }
}

resetChart(): void {
  this.isFirstUpdate = true;
  this.importPPTIndex = 1;
}

startRandomDataUpdates(): void {
  this.resetChart();
  if (this.chartUpdateInterval) {
    clearInterval(this.chartUpdateInterval);
  }

  // First update with 1000ms interval
  this.chartUpdateInterval = setInterval(() => {
    this.updateChartWithRandomData();
    
    if (!this.isFirstUpdate) {
      clearInterval(this.chartUpdateInterval);
      this.chartUpdateInterval = setInterval(() => {
        this.updateChartWithRandomData();
      }, 1000);
    }
  }, 1000);
}

stopRandomDataUpdates(): void {
  if (this.chartUpdateInterval) {
    clearInterval(this.chartUpdateInterval);
    this.chartUpdateInterval = null;
    this.isAnimation = false;
    this.originalData = [];
  }
}

ngOnDestroy() {
  this.stopRandomDataUpdates();
}
}