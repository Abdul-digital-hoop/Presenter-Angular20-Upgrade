import { ChangeDetectorRef, Component, Input, OnInit, OnDestroy } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';

declare var $:any;
@Component({
  selector: 'app-import-powerpoint',
  templateUrl: './import-powerpoint.component.html',
  styleUrls: ['./import-powerpoint.component.scss']
})
export class ImportPowerpointComponent implements OnInit, OnDestroy {
  sanitizedEmbedLink: SafeResourceUrl;
  sanitizedHtml: any;
  slideIndex: any;
  slideLink: any;
  openPopUp:boolean = false;
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

  constructor(private sanitizer: DomSanitizer,
    public workSpaceService:WorkspaceService
  ) {
    
   }

  ngOnInit() {
    this.presentationTheme = this.assignThemeProperties(this.presentationLevelTheme);
    this.slidesTheme = this.assignThemeProperties(this.presentationLevelTheme, this.slideDetails?.design);
    this.slideTheme = this.slideDetails?.design.slideResetTheme ? this.slidesTheme: this.slidesTheme;
    this.importPPTLink = this.workSpaceService.changeImportSlideLinkDataFormat(this.slideDetails?.slideContentData);
    this.importPPTIndex = this.workSpaceService.changeImportSlideNumberDataFormat(this.slideDetails?.slideContentData);
    this.linkGenerator();
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
  linkGenerator() {
    const url = this.importPPTLink + `&wdSlideIndex=${this.importPPTIndex}`;
    const sanitizedEmbedLink = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.sanitizedHtml = sanitizedEmbedLink;             
  }
  EnterorExit(){
    this.workSpaceService.EmbeddedPPTpresenterEnterClick = true;
  }
  calculateBorderColor() {
    if(this.slideTheme?.ThemeTextColor != '' || null){
      const backgroundRGB = this.hexToRgb(this.slideTheme?.ThemeBackgroundColor);
      const textRGB = this.hexToRgb(this.slideTheme?.ThemeTextColor);
      const blendedRGB = {
        r: Math.floor((backgroundRGB.r + textRGB.r) / 2),
        g: Math.floor((backgroundRGB.g + textRGB.g) / 2),
        b: Math.floor((backgroundRGB.b + textRGB.b) / 2),
      };
      return `rgba(${blendedRGB.r}, ${blendedRGB.g}, ${blendedRGB.b}, 0.7)`;
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
    this.linkGenerator();
  }

  updateChartWithRandomData(): void {
    try {
      if (this.isFirstUpdate) {
        this.importPPTIndex = 1;
        this.isFirstUpdate = false;
      } else {
        this.importPPTIndex++;
      }
      this.updateChart(this.importPPTLink,this.importPPTIndex);
    } catch (error) {
      console.error('Error updating powerpoint data:', error);
      this.stopRandomDataUpdates();
    }
  }

  resetChart(): void {
    this.isFirstUpdate = true;
    this.previousIndex = -1;
  }

  startRandomDataUpdates(): void {
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

  stopRandomDataUpdates(): void {
    if (this.chartUpdateInterval) {
      clearInterval(this.chartUpdateInterval);
      this.chartUpdateInterval = null;
      this.isAnimation = false;
      this.originalData = [];
      this.importPPTIndex = 1;
    }
  }

  ngOnDestroy() {
    this.stopRandomDataUpdates();
  }
}
