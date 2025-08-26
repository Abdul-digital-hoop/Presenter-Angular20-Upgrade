import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';

declare var $:any;
@Component({
    selector: 'app-import-powerpoint',
    templateUrl: './import-powerpoint.component.html',
    styleUrls: ['./import-powerpoint.component.scss'],
    standalone: false
})
export class ImportPowerpointComponent implements OnInit {
  sanitizedEmbedLink: SafeResourceUrl;
  sanitizedHtml: any;
  slideIndex: any;
  slideLink: any;
  openPopUp:boolean = false;
  constructor(private sanitizer: DomSanitizer,
    public workSpaceService:WorkspaceService
  ) {
    this.slideIndex = this.workSpaceService.ImportSlideNumber;
    this.slideLink = this.workSpaceService.ImportSlideLink;
   }

  ngOnInit() {
    this.linkGenerator();
  }
  linkGenerator() {
    const url = this.workSpaceService.ImportSlideLink + `&wdSlideIndex=${this.workSpaceService.ImportSlideNumber}`;
    const sanitizedEmbedLink = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.sanitizedHtml = sanitizedEmbedLink;             
  }
  EnterorExit(){
    this.workSpaceService.EmbeddedPPTpresenterEnterClick = true;
  }
  calculateBorderColor() {
    if(this.workSpaceService.slideDesign?.slideTextColor != '' || null){
      const backgroundRGB = this.hexToRgb(this.workSpaceService?.slideDesign?.slideBackgroundColor);
      const textRGB = this.hexToRgb(this.workSpaceService.slideDesign?.slideTextColor);
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
  updateChart(value){
    this.linkGenerator();
  }
}
