import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { PresentationThemeService } from 'src/app/core/Sevices/Presentation/presentation-theme.service';
import { AssetsNewIconURL } from 'src/app/utility/constants';
import { Reactions } from 'src/app/utility/MasterConstants';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-theme-center-panel',
    templateUrl: './theme-center-panel.component.html',
    styleUrls: ['./theme-center-panel.component.scss'],
    standalone: false
})
export class ThemeCenterPanelComponent implements OnInit,OnChanges {
  @Input() public currentCustomerTheme: any;
  ContrastColor: string = 'black';
  emojiContrastColor: string = 'black';
  presentationReactionArray: any[];
  contentHeight: number = 0;
  reactionsList = Reactions;
  reactionURL = AssetsNewIconURL.NEWICONURL;
  environment = environment;
  constructor(public _presentationThemeService: PresentationThemeService ) { 
  }
  ngOnChanges(){
    this.setThemeValues();
  }

  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
    this.checkImagePositionType();
  }
  ngAfterContentChecked(){
    this.setThemeValues();
  }

  setThemeValues(){
    this.ContrastColor = this.getBackgroundColorWithOpacity(this.currentCustomerTheme?.themesBackgroundColor,0.2);
    this.emojiContrastColor = this.convertToRgb(this.ContrastColor);
  }
  checkImagePositionType(){
    if(this._presentationThemeService.customerThemeLogoImage != null || this._presentationThemeService.customerThemeLogoImage != ""){
     this._presentationThemeService.logoPositionType =  this._presentationThemeService.checkOrientation(this._presentationThemeService.customerThemeLogoCropPosition);
    }
  }
  getBackgroundColorWithOpacity(colorCode: any, opacity: any): string {
    let rgb: number[];
    if (colorCode?.startsWith('#')) {
      rgb = this.hexToRgb(colorCode);
    } else {
      rgb = colorCode?.match(/\d+/g).map(Number);
    }
    const contrastRgb = rgb?.map((val) => (val > 128 ? 0 : 255));
    return opacity == 2? `rgba(${contrastRgb})` : `rgba(${contrastRgb?.join(', ')}, ${opacity})`;
  }
  private hexToRgb(hex: string): number[] {
    const hexValue = hex?.replace(/^#/, '');
    const rgb = [];
    for (let i = 0; i < 3; i++) {
      rgb?.push(parseInt(hexValue.substr(i * 2, 2), 16));
    }    
    return rgb;
  }
  convertToRgb(rgba: string): string {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const [r, g, b] = match.slice(1).map(Number);
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      return brightness > 128 ? '#FFFFFF' : '#000000';
    }
    return '#FFFFFF';
  }
}
