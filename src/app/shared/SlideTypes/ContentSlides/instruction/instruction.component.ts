import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { environment } from 'src/environments/environment';
import { Clipboard } from '@angular/cdk/clipboard';
import { CommanService } from 'src/app/core/Sevices/comman.service';

@Component({
  selector: 'app-instruction',
  templateUrl: './instruction.component.html',
  styleUrls: ['./instruction.component.scss']
})
export class InstructionComponent implements OnInit, OnDestroy {
  environmentDetails=environment;
  @Input() isPresenterEditorScreen: boolean;
  copied: boolean = false;
  ContrastColor: any;
  @Input() slideTheme:any;
  @Input() slideDetails:any;
  @Input() template:any;
  @Input() presentationLevelTheme:any;
  presentationTheme: { ThemeName: string; ThemeLogo: any; ThemeBackgroundColor: string; ThemeBackgroundImage: any;  ThemeTextColor: string; ThemeFontFamily: string; ThemeLineColor: string; ThemeVisualizationColor: any[]; slideTextBold: boolean; slideTextItalic: boolean; slideTextUnderLine: boolean; slideTextStrikeThrough: boolean; slidetextSize: number,backgroundColorOpacity:any};
  slidesTheme: { ThemeName: string; ThemeLogo: any; ThemeBackgroundColor: string; ThemeBackgroundImage: string; ThemeTextColor: string; ThemeFontFamily: string; ThemeLineColor: string; ThemeVisualizationColor: any[]; slideTextBold: boolean; slideTextItalic: boolean; slideTextUnderLine: boolean; slideTextStrikeThrough: boolean; slidetextSize: number };

  // Animation properties
  chartUpdateInterval: any;
  previousIndex: number = -1;
  isFirstUpdate: boolean = true;
  currentIndex: number = -1;
  isAnimation: boolean = false;
  originalData: any[] = [];
  url: string;

  constructor(public workSpaceService:WorkspaceService, private clipboard: Clipboard, public commonService:CommanService) { }

  ngOnInit(): void {
    this.presentationTheme = this.assignThemeProperties(this.presentationLevelTheme);
    this.slidesTheme = this.assignThemeProperties(this.presentationLevelTheme, this.slideDetails?.design);
    this.slideTheme = this.slideDetails?.design.slideResetTheme ? this.slidesTheme: this.presentationTheme;
    this.ContrastColor = this.commonService.getContrastColor(this.slidesTheme?.ThemeBackgroundColor);
    this.url=this.environmentDetails?.AudienceDomain+this.template?.presentationAccess?.url;
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

  ngOnchanges(){
    this.ContrastColor = this.commonService.getContrastColor(this.slidesTheme?.ThemeBackgroundColor);
  }

  ngAfterContentChecked() {
    this.ContrastColor = this.commonService.getContrastColor(this.slidesTheme?.ThemeBackgroundColor);
  }

  copyToClipboard() {
    if (this.workSpaceService.presentationURL) {
      this.clipboard.copy(this.workSpaceService.presentationURL);
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    }
  }

  updateChartWithRandomData(): void {
    try {
      if (this.isFirstUpdate) {
        this.originalData = [];
        this.currentIndex = 0;
        this.isFirstUpdate = false;
      } else {
        if (this.currentIndex >= this.originalData.length) {
          this.originalData = [];
          this.currentIndex = 0;
        }
        const nextItem = this.originalData[this.currentIndex];
        this.originalData.push(nextItem);
        this.currentIndex++;
      }
    } catch (error) {
      console.error('Error updating instruction data:', error);
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
      // this.updateChartWithRandomData();
      
      if (!this.isFirstUpdate) {
        clearInterval(this.chartUpdateInterval);
        this.chartUpdateInterval = setInterval(() => {
          // this.updateChartWithRandomData();
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
    }
  }

  ngOnDestroy() {
    this.stopRandomDataUpdates();
  }
}
