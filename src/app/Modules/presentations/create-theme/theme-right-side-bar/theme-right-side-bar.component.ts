import { Component, EventEmitter, HostListener, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { PresentationThemeService } from 'src/app/core/Sevices/Presentation/presentation-theme.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { ImageUploadeModuleName } from 'src/app/utility/constants';
import { CustomerPlanService } from 'src/app/core/Sevices/CustomerPlan/customer-plan.service';

@Component({
  selector: 'app-theme-right-side-bar',
  templateUrl: './theme-right-side-bar.component.html',
  styleUrls: ['./theme-right-side-bar.component.scss']
})
export class ThemeRightSideBarComponent implements OnInit {
  @Input() public currentCustomerTheme: any;
  @Input() public customerRewards: any;
  @Output() public resetData:EventEmitter<any> = new EventEmitter<any>();
  themeName: string = "";
  themesLogo: any;
  themesFontColor: string = "";
  backgroundColorOpacity: any;
  themesFonts: string = "";
  themesBackgroundImage: any;
  lineClour: string = "";
  themesBackgroundColor: string = "";
  themesChartColor: any;
  textBold: boolean;
  textItalic: boolean;
  textUnderline: boolean;
  textStrikeout: boolean;
  fontSize: number;
  isPublic: boolean = false;
  orderId: number = 0;
  id: string = "";
  opacityAsPercentage: any;
  resetTheme:boolean = false;
  imageUploadeModuleName = ImageUploadeModuleName;
  isInitialLoader:boolean=false;
  constructor(public presentationThemeService: PresentationThemeService, public workSpaceService: WorkspaceService, public _router: Router,private route: ActivatedRoute,
    public _customerPlanSerive:CustomerPlanService
  ) {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.currentCustomerTheme && changes.currentCustomerTheme.currentValue) {
      this.setThemeValue(this.currentCustomerTheme).finally(()=>{
        this.isInitialLoader = false;
      });
    }
    var data = this.customerRewards;
  }

  ngOnInit(): void {
    this.workSpaceService.presentationId = this.route.snapshot.queryParamMap.get('presentation-id');
    this.customerRewards = this._customerPlanSerive.getCustomerPlan();
  }
  @HostListener('window:popstate', ['$event'])
  onPopState(event: PopStateEvent) {
    this.backToWorkSpace();
  }
  backToWorkSpace() {
    var presentationId = this.workSpaceService.presentationId;
    if(!this.workSpaceService.isTemplate){
      this._router.navigate(['/WorkSpace/edit'], {
        queryParams: { id: presentationId }
      });
    }
    else{
      this._router.navigate(['/WorkSpace/edit'], {
        queryParams: { id: presentationId, isTemplate: true },
      });
    }
  }
  onThemeNameChange(newThemeName: string) {
    this.resetTheme = true;
    newThemeName = newThemeName == "" ? "Untitled theme" : newThemeName;
    newThemeName = newThemeName.trim();
    this.themeName = newThemeName;
    if (this.currentCustomerTheme.themeName.trim() !== newThemeName) {
      this.presentationThemeService.updateThemeName(this.id, newThemeName).then((response: any) => {
        if (response) {
          this.currentCustomerTheme.themeName = newThemeName;
          this.presentationThemeService.updateCustomerTheme(this.currentCustomerTheme);
        } else {
          console.error('Failed to update theme name');
        }
      }).catch((error: any) => {
        console.error('Error updating newThemeName:', error);
      });
    }
  }
  changeFontFamily(newFontFamily: string) {
    this.resetTheme = true;
    if (this.currentCustomerTheme.themesFonts !== newFontFamily) {
      this.presentationThemeService.updateThemeFont(this.id, newFontFamily).then((response: any) => {
        if (response) {
          this.currentCustomerTheme.themesFonts = newFontFamily;
          this.presentationThemeService.updateCustomerTheme(this.currentCustomerTheme);
        } else {
          console.error('Failed to update font family');
        }
      }).catch((error: any) => {
        console.error('Error updating font family:', error);
      });
    }
  }
  onTextColorUpdate(newTextColor: string) {
    this.resetTheme = true;
    newTextColor = newTextColor.trim();
    if (this.currentCustomerTheme.themesFontColor.trim() !== newTextColor) {
      this.presentationThemeService.updateThemeTextColor(this.id, newTextColor).then((response: any) => {
        if (response) {
          this.currentCustomerTheme.themesFontColor = newTextColor;
          this.presentationThemeService.updateCustomerTheme(this.currentCustomerTheme);
        } else {
          console.error('Failed to update text color');
        }
      }).catch((error: any) => {
        console.error('Error updating text color:', error);
      });
    }
  }
  onBGColorUpdate(bgColor: string) {
    this.resetTheme = true;
    if (this.currentCustomerTheme.themesBackgroundColor !== bgColor) {
      this.presentationThemeService.updateThemeBackgroundColor(this.id, bgColor).then((response: any) => {
        if (response) {
          this.currentCustomerTheme.themesBackgroundColor = bgColor;
          this.presentationThemeService.updateCustomerTheme(this.currentCustomerTheme);
        } else {
          console.error('Failed to update background color');
        }
      }).catch((error: any) => {
        console.error('Error updating background color:', error);
      });
    }
  }
  onVisualizationColorUpdate(newVisualizationColor: string, index: number) {
    this.resetTheme = true;
    newVisualizationColor = newVisualizationColor.trim();
    if (this.currentCustomerTheme.themesChartColor[index].color.trim() !== newVisualizationColor) {
      this.currentCustomerTheme.themesChartColor[index].color = newVisualizationColor;
      this.presentationThemeService.updateThemeVisualizationColors(this.id,this.currentCustomerTheme.themesChartColor).then((response: any) => {
        if (response) {
          this.currentCustomerTheme.themesChartColor[index].color = newVisualizationColor;
          this.presentationThemeService.updateCustomerTheme(this.currentCustomerTheme);
        } else {
          console.error('Failed to update visualization color');
        }
      }).catch((error: any) => {
        console.error('Error updating visualization color:', error);
      });
    }
  }
  onBackgroundOpacityUpdate(backgroundColorOpacity: number) {
    this.resetTheme = true;
    this.opacityAsPercentage = (backgroundColorOpacity * 100).toFixed(0);
    if (this.currentCustomerTheme.backgroundColorOpacity !== backgroundColorOpacity) {
      this.presentationThemeService.updateThemeBackgroundColorOpacity(this.id, backgroundColorOpacity).then((response: any) => {
        if (response) {
          this.currentCustomerTheme.backgroundColorOpacity = backgroundColorOpacity;
          this.presentationThemeService.updateCustomerTheme(this.currentCustomerTheme);
        } else {
          console.error('Failed to update background opacity');
        }
      }).catch((error: any) => {
        console.error('Error updating background opacity:', error);
      });
    }
  }
  changesBackgroundOpacity(backgroundColorOpacity: number) {
    this.resetTheme = true;
    this.opacityAsPercentage = (backgroundColorOpacity * 100).toFixed(0);
  }
  onLineColorUpdate(lineColor: string) {
    this.resetTheme = true;
    if (this.currentCustomerTheme.lineClour !== lineColor) {
      this.presentationThemeService.updateThemeLineColor(this.id, lineColor).then((response: any) => {
        if (response) {
          this.currentCustomerTheme.lineClour = lineColor;
          this.presentationThemeService.updateCustomerTheme(this.currentCustomerTheme);
        } else {
          console.error('Failed to update line color');
        }
      }).catch((error: any) => {
        console.error('Error updating line color:', error);
      });
    }
  }
  onTextboldUpdate(isBold: boolean) {
    this.resetTheme = true;
    this.textBold = !isBold;
    this.presentationThemeService.updateThemeTextBold(this.id, this.textBold).then((response: any) => {
      if (response) {
        this.currentCustomerTheme.textBold = this.textBold;
        this.presentationThemeService.updateCustomerTheme(this.currentCustomerTheme);
      } else {
        console.error('Failed to update text bold');
      }
    }).catch((error: any) => {
      console.error('Error updating text bold:', error);
    });
  }
  onTextItalicUpdate(isItalic: boolean) {
    this.resetTheme = true;
    this.textItalic = !isItalic;
      this.presentationThemeService.updateThemeTextItalic(this.id, this.textItalic).then((response: any) => {
        if (response) {
          this.currentCustomerTheme.textItalic = this.textItalic;
          this.presentationThemeService.updateCustomerTheme(this.currentCustomerTheme);
        } else {
          console.error('Failed to update text italic');
        }
      }).catch((error: any) => {
        console.error('Error updating text italic:', error);
      });
  }
  onTextStrickUpdate(isStrick: boolean) {
    this.resetTheme = true;
    this.textStrikeout = !isStrick;
    this.presentationThemeService.updateThemeTextStrick(this.id, this.textStrikeout).then((response: any) => {
      if (response) {
        this.currentCustomerTheme.textStrikeout = this.textStrikeout;
        this.presentationThemeService.updateCustomerTheme(this.currentCustomerTheme);
      } else {
        console.error('Failed to update text strick');
      }
    }).catch((error: any) => {
      console.error('Error updating text strick:', error);
    });
  }
  onTextUnderLingUpdate(isUnderlined: boolean) {
    this.resetTheme = true;
    this.textUnderline = !isUnderlined;
      this.presentationThemeService.updateThemeTextUnderlined(this.id, this.textUnderline).then((response: any) => {
        if (response) {
          this.currentCustomerTheme.textUnderline = this.textUnderline;
          this.presentationThemeService.updateCustomerTheme(this.currentCustomerTheme);
        } else {
          console.error('Failed to update text underline');
        }
      }).catch((error: any) => {
        console.error('Error updating text underline:', error);
      });
  }
  onThemeTextFontSize(fontSize:any){
    this.resetTheme = true;
    this.workSpaceService.themeActiveFontSizeButton = fontSize ? 'increase' : 'decrease';
    var decreaseFontSize = fontSize ? this.fontSize +2 : this.fontSize-2;
    this.fontSize = decreaseFontSize;
    this.presentationThemeService.increaseFontSize(this.id, decreaseFontSize).then((response: any) => {
      if (response) {
        this.currentCustomerTheme.fontSize = decreaseFontSize;
        this.presentationThemeService.updateCustomerTheme(this.currentCustomerTheme);
      } else {
        console.error('Failed to update text underline');
      }
    }).catch((error: any) => {
      console.error('Error updating text underline:', error);
    });
  }
  resetThemeAPICall(themeId:any) {
    if(this.resetTheme){
      this.resetTheme = false;
      this.presentationThemeService.resetThemeToDefault(themeId).then((response: any) => {
        if (response) {
          this.resetData.emit(response);
          this.setThemeValue(response);
          this.presentationThemeService.updateCustomerTheme(this.currentCustomerTheme);
        } else {
          console.error('Failed to reset theme to default');
        }
      }).catch((error: any) => {
        console.error('Error resetting theme to default:', error);
      });
    }
  }
  isFocused(input: any): boolean {
    return input === document.activeElement;
  }
  setThemeValue(data:any): Promise<void> {
    this.isInitialLoader = true
    return new Promise<void>((resolve, reject) => {
      try {
        this.themeName = data?.themeName;
        this.themesLogo = data?.themesLogo;
        this.themesFontColor = data?.themesFontColor;
        this.backgroundColorOpacity = data?.backgroundColorOpacity;
        this.opacityAsPercentage = (this.backgroundColorOpacity * 100);
        this.themesFonts = data?.themesFonts;
        this.themesBackgroundImage = data?.themesBackgroundImage;
        this.lineClour = data?.lineClour;
        this.themesBackgroundColor = data?.themesBackgroundColor;
        this.themesChartColor = data?.themesChartColor;
        this.textBold = data?.textBold;
        this.textItalic = data?.textItalic;
        this.textUnderline = data?.textUnderline;
        this.textStrikeout = data?.textStrikeout;
        this.fontSize = data?.fontSize;
        this.isPublic = data?.isPublic;
        this.orderId = data?.orderId;
        this.id = data?.id;
        this.resetTheme = data?.resetTheme;
        this.presentationThemeService.customerThemeBackgroundImage = data?.themesBackgroundImage?.themeBackgroundImageCroppedUrl || "";
        this.presentationThemeService.customerThemeLogoImage = data?.themesLogo?.logoCroppedUrl || "";
        this.presentationThemeService.customerThemeLogoCropPosition = data?.themesLogo?.croppedposition || "";
        resolve();
      } catch (error) {
        this.isInitialLoader = true
        reject(error);
      }
    });
  }
  setUpdatedValueLogo(data:any){
    this.themesLogo.logoCroppedUrl = data?.logoCroppedUrl;
    this.themesLogo.logoOriginalUrl = data?.logoOriginalUrl;
    this.themesLogo.croppedposition = data?.croppedposition;
  }
  updatePresentationBackroundImages(data:any){
    this.resetTheme = true;
  }
  updatePresentationLogoImages(data:any){
    this.resetTheme = true;
  }
}
