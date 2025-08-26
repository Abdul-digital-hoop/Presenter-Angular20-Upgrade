import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { MasterSlideTypeName } from 'src/app/utility/constants';
import { DynamicSlideTypeComponent } from '../../Component/dynamic-slide-type/dynamic-slide-type.component';

@Component({
  selector: 'app-slides-preview',
  templateUrl: './slides-preview.component.html',
  styleUrls: ['./slides-preview.component.scss']
})
export class SlidesPreviewComponent implements OnInit {
  @Input() isPresentation: boolean = false; // Indicates whether the parent component is a presentation, template, website, or admin
  @Input() slidesRenderingData: any; // Indicates whether the entrie presentation or template.
  @Output() nextSlideEmitted = new EventEmitter();
  @Output() previousSlideEmitted = new EventEmitter();
  @ViewChild('slideImage') slideImage: ElementRef<HTMLImageElement>;
  @ViewChild('CenterPanel', {static: true}) CenterPanel: ElementRef;
  @ViewChild('InnerScreen', {static: true}) InnerScreen: ElementRef;
  @ViewChild('OuterScreen', {static: true}) OuterScreen: ElementRef;
  @ViewChild('dynamicChart') dynamicSlidesComponent: DynamicSlideTypeComponent;
  public activeSlide:any;
  public templateData:any;
  public presentationLevelTheme:any;
  public layoutImageType: any;
  public panelWidth : any;
  public panelHeight: any;
  public currentRenderingSlidesList:any[];
  activePptImage: boolean;
  showPdf: boolean;
  slidePdfImage: any;
  currentIndex: number = 0;
  masterSlideTypeName=MasterSlideTypeName;
  rollingClass = '';
  isInitialLoad: boolean = true;
  @Input() isAdminPreview: boolean = false;
  constructor(public workSpaceService:WorkspaceService,public presentationService:PresentationService) { }

  ngOnInit(): void {
    this.setScaleForLayout();
    this.initialScreenSizeSet();
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.setScaleForLayout();
      this.initialScreenSizeSet();
      this.adjustHeight();
    },100);
  }
  private adjustHeight() {
    const elements = document.querySelectorAll('.middle-content-section') as NodeListOf<HTMLElement>;
    elements.forEach(element => {
      const width = element.clientWidth;
      element.style.height = `${width / 1.777}px`;
    });
  }
  setScaleForLayout() {
    const CENTERSCREENELEMENT = this.CenterPanel.nativeElement;
    const WIDTH = CENTERSCREENELEMENT.offsetWidth;
    const HEIGHT = CENTERSCREENELEMENT.offsetHeight;
    const INNERSCREENELEMENT = this.InnerScreen.nativeElement;
    var innerWidth = INNERSCREENELEMENT.offsetWidth;
    const INNERHEIGHT = INNERSCREENELEMENT.offsetHeight;
    var ratio = innerWidth/INNERHEIGHT;
    if(ratio > 1.7){
      innerWidth =  INNERHEIGHT * 1.777;
      INNERSCREENELEMENT.style.width = innerWidth;
    }
    var scale = Math.min(WIDTH/innerWidth, HEIGHT/INNERHEIGHT);
    if(scale > 1){
      scale =innerWidth/INNERHEIGHT;
      if(scale > 1){
        scale =1;
      }
    }
    INNERSCREENELEMENT.style.scale= scale;
    INNERSCREENELEMENT.style.width = innerWidth * scale;
    INNERSCREENELEMENT.style.height = INNERHEIGHT * scale;
    const OuterElement = this.OuterScreen.nativeElement;
    OuterElement.style.width = innerWidth * scale;
    OuterElement.style.height = INNERHEIGHT * scale;
  }
  initialScreenSizeSet() {
    if (this.isAdminPreview) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.panelWidth = width + 'px';
      this.panelHeight = height + 'px';
      if (width > 1200) {
        this.panelWidth = height * 1.77777 + 'px';
        this.panelHeight = height + 'px';
      }
      else {
        this.panelWidth = 890 + 'px';
        this.panelHeight = 500 + 'px';
      }
    }
    else {
      const CenterScreenElement = this.CenterPanel.nativeElement;
      const width = CenterScreenElement.offsetWidth;
      const height = CenterScreenElement.offsetHeight;
      if (width > 992) {
        this.panelWidth = 890 + 'px';
        this.panelHeight = 500 + 'px';
      } else {
        this.panelWidth = 890 + 'px';
        this.panelHeight = 500 + 'px';
      }
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    this.isInitialLoad = true;
    if (changes.slidesRenderingData) {
      this.presentationLevelTheme = this.isPresentation ? this.slidesRenderingData?.presentationThemes :  this.slidesRenderingData?.template?.presentationThemes;
      var previewDataId = this.isPresentation ? this.slidesRenderingData?.presentationId :  this.slidesRenderingData?.templateId;
      this.getPreviewData(previewDataId,this.isPresentation).then(response => {
      }).catch(error => {
        console.error(error);
      }).finally(() => {
        this.isInitialLoad = false;
        console.log('Preview data retrieval completed');
      });
    }
  }
  getMasterLayoutData(id: any) {
    var layout = this.workSpaceService.getMasterLayoutData(id);
    return layout?.layoutType;
  }
  loadBGLayout() {
    if (this.activeSlide?.slideTypeName === "Import Document") {
      this.activePptImage = true;
      this.showPdf = true;
      this.slidePdfImage = this.workSpaceService.changepptImgDataFormat(this.activeSlide?.slideContentData);
    }
    else {
      this.activePptImage = false;
      this.showPdf = false;
      var defaultImageUrl = "/assets/images/static_bg_image.svg";
      var fullImageUrl = this.activeSlide?.contentImage ? this.activeSlide?.contentImage?.croppedUrl : this.workSpaceService.slideLayoutDefaultImage;
      const finalImageUrl = fullImageUrl || defaultImageUrl;
      return {
        backgroundImage: `url(${finalImageUrl})`,
      };
    }
  }
  checkImageOrientation() {
    const image = this.slideImage.nativeElement;
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    if (width > height) {
      image.classList.add('landscape');
      image.classList.remove('portrait');
    } else {
      image.classList.add('portrait');
      image.classList.remove('landscape');
    }
  }
  @HostListener('window:resize')
  onResize() {
    this.setScaleForLayout();
  }
  getPreviewData(presentationId:any,isPresentation:boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      this.presentationService.getPreviewData(presentationId, isPresentation).subscribe(
        (response: any) => {
          if (!isPresentation) {
            this.currentRenderingSlidesList = response?.data?.template?.slides?.sort((a: any, b: any) => a.index - b.index);
            this.activeSlide = this.currentRenderingSlidesList[0];
            this.layoutImageType = this.getMasterLayoutData(this.activeSlide?.design?.slideLayoutId);
            if(this.activeSlide?.slideTypeName === "Import Document"){
              this.loadBGLayout();
            }
          } else {
            this.currentRenderingSlidesList = response?.data?.slides?.sort((a: any, b: any) => a.index - b.index);
            this.activeSlide = this.currentRenderingSlidesList[0];
            this.layoutImageType = this.getMasterLayoutData(this.activeSlide?.design?.slideLayoutId);
            if(this.activeSlide?.slideTypeName === "Import Document"){
              this.loadBGLayout();
            }
          }
          resolve(response);
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }
  moveToNextSlide(currentSlideId:any) {
    let nextSlideIndex = this.currentRenderingSlidesList.findIndex(slide => slide?.slideId === currentSlideId);
    if (nextSlideIndex !== -1 && nextSlideIndex < this.currentRenderingSlidesList.length - 1) {
      this.rollingClass = 'rolling-up';
      setTimeout(() => {
        this.currentIndex = nextSlideIndex + 1;
        this.activeSlide = this.currentRenderingSlidesList[this.currentIndex];
        this.layoutImageType = this.isPresentation ? 
          this.getMasterLayoutData(this.activeSlide?.design?.slideLayoutId) : 
          this.getMasterLayoutData(this.activeSlide?.design?.slideLayoutId);
        
        if (this.activeSlide?.slideTypeName === "Import Document") {
          this.loadBGLayout();
        } else {
          this.cleanupSlideState();
        }
      }, 500);
      setTimeout(() => {
        this.rollingClass = '';
      }, 1000);
    }
  }
  moveToPreviousSlide(currentSlideId:any) {
    let previousSlideIndex = this.currentRenderingSlidesList.findIndex(slide => slide?.slideId === currentSlideId);
    if (previousSlideIndex > 0) {
      this.rollingClass = 'rolling-down';
      setTimeout(() => {
        this.currentIndex = previousSlideIndex - 1;
        this.activeSlide = this.currentRenderingSlidesList[this.currentIndex];
        this.layoutImageType = this.isPresentation ? 
          this.getMasterLayoutData(this.activeSlide?.design?.slideLayoutId) : 
          this.getMasterLayoutData(this.activeSlide?.design?.slideLayoutId);
        
        if (this.activeSlide?.slideTypeName === "Import Document") {
          this.loadBGLayout();
        } else {
          this.cleanupSlideState();
        }
      }, 500);
      setTimeout(() => {
        this.rollingClass = '';
      }, 1000);
    }
  }
  private cleanupSlideState() {
    this.activePptImage = false;
    this.showPdf = false;
    this.slidePdfImage = null;
  }
}
