import { Component, OnInit, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';

@Component({
    selector: 'app-import-google-slide',
    templateUrl: './import-google-slide.component.html',
    styleUrls: ['./import-google-slide.component.scss'],
    standalone: false
})
export class ImportGoogleSlideComponent implements OnInit {

  slidesLink: string = "";
  slideNumber: number;
  previousSlideNumber: number;
  public screenOptions: any;
  public slideData: any;
  public slideThemes: any;
  sanitizedUrl: SafeResourceUrl;
  showSlidesMessage: boolean = false;
  // settingVariable = settingVariables;
  isFullScreen = true;
  isInvalidLink: boolean = false;
  constructor(private sanitizer: DomSanitizer, public workSpaceService:WorkspaceService) {
    this.slidesLink = this.workSpaceService.ImportSlideLink;
    this.slideNumber = this.workSpaceService.ImportSlideNumber;
  }

  ngOnInit(): void {
    this.updateSanitizedUrl();
    this.updateSanitizedSlideNumber();
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
    if (this.workSpaceService.ImportSlideLink.trim() === '' || typeof slideNumber !== 'number' || slideNumber < 0) {
        return;
    }

    let url = this.workSpaceService.ImportSlideLink.split('&rm=minimal')[0];
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
            `${url}&rm=minimal&slide=${this.workSpaceService.ImportSlideNumber}`
        );
    }
}
updateSanitizedSlideNumber(){
  if( !((this.slideNumber == this.previousSlideNumber) || (this.slideNumber == null))){
  const {  slideNumber, sanitizer } = this;
  if (this.workSpaceService.ImportSlideLink.trim() === '' || typeof slideNumber !== 'number' || slideNumber < 0) {
      return;
  }
  
  let url = this.workSpaceService.ImportSlideLink.split('&rm=minimal')[0];
  if (url.startsWith('https://docs.google.com/presentation/d/')) {
      if (url.includes('/pub?')) {
          url = url.replace('/pub?', '/embed?');
      }
  } else {
      return;
  }
    const rmminimal = !this.workSpaceService.presentationMode ? '&rm=minimal' : '';
    if (slideNumber === 0) {
      this.slideNumber = 1;
  }
    this.sanitizedUrl = sanitizer.bypassSecurityTrustResourceUrl(
      `${url}${rmminimal}&slide=${this.workSpaceService.ImportSlideNumber}`
    );
  }
}

calculateBorderColor() {
  if(this.slideThemes?.themesFontColor != '' || null){
    const backgroundRGB = this.hexToRgb(this.slideThemes?.themesBackgroundColor);
    const textRGB = this.hexToRgb(this.slideThemes?.themesFontColor);
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
updateChart(){
  this.updateSanitizedUrl();
  this.updateSanitizedSlideNumber();
}
}