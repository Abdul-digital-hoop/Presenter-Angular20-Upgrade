import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, QueryList, Renderer2, SimpleChanges, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CustomerPlanService } from 'src/app/core/Sevices/CustomerPlan/customer-plan.service';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { MasterSlideTypeName } from 'src/app/utility/constants';
import { debounceTime } from 'rxjs';
declare let zoomSdk: any;
declare var $: any;
declare const _IntegrationMediumZoom: boolean;
@Component({
    selector: 'app-popular-templates',
    templateUrl: './popular-templates.component.html',
    styleUrls: ['./popular-templates.component.scss'],
    standalone: false
})
export class PopularTemplatesComponent implements OnInit {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef
  previousScrollTop : number = 0;
  @ViewChildren('CenterPanel') CenterPanel!: QueryList<ElementRef>;
  @ViewChildren('InnerScreen') InnerScreen!: QueryList<ElementRef>;
  @ViewChildren('OuterScreen') OuterScreen!: QueryList<ElementRef>;
  masterSlideTypeName = MasterSlideTypeName;
  logoPositionType:string='';
  panelWidth: string = "890px";
  panelHeight: string = "500px";
  public userPreviewData : any = null;
  previewindex : any;
  userPresentation: any;
  ContentElement: HTMLElement;
  PresentationName: any;
  userSlides: any[] = []
  Id: any;
  showAnotherComponent: boolean = false;
  IntegrationMediumZoom: boolean = _IntegrationMediumZoom;
  isUseTemplateClicked: boolean = false;
  recentPresentation: any[];
  showPdf: boolean;
  slidePdfImage: any; 
  isSkeleton: boolean = true;
  isLoading: boolean = false;
  isPreviewClicked: boolean = false;
  @ViewChildren('slideImage') slideImages: QueryList<ElementRef<HTMLImageElement>>;
  customerLimitationCount: any;
  // showTempModal:boolean=false;
  constructor(private _presentationservice: PresentationService, private _router: Router,
    private renderer: Renderer2, private _sanitizer: DomSanitizer,private _customerPlanService:CustomerPlanService,public workSpaceService:WorkspaceService) { }

  @ViewChild('showTempModal') showTempModal: any;
  @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;
  @ViewChild('container', { read: ElementRef }) containerElement: ElementRef;
  ngOnInit(): void {
    if (this.IntegrationMediumZoom) {
      zoomSdk.getMeetingUUID()
        .then((result) => {
          const newmeetingUUID = result.meetingUUID;
          this._presentationservice.setMeetingUUID(newmeetingUUID);
        })
        .catch((error) => {
          console.error('Error:', error);
        });

      zoomSdk.getUserContext()
        .then((result) => {
          if (result && result.role) {
            const role = result.role;
            this._presentationservice.setRole(role);
          }
        });
    }
    this.customerLimitationCount = this._customerPlanService.getCustomerLimitationsCounts();
    //this.RecentPresentation();
    this.GetTemplates();
    this._presentationservice.presentation$.subscribe(data => {
      this.recentPresentation = data;
    });
    // this.preventExternalNavigation();
  }
  ngAfterViewInit() {
    this.CenterPanel.changes
      .pipe(
        debounceTime(0)
      )
      .subscribe(() => {
        if (this.checkViewChildrenReady()) {
          this.setScaleForLayout();
        }
      });
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['templateList']) {
      const currentValue = changes['templateList'].currentValue;
      if (currentValue && currentValue.length > 0) {
        setTimeout(() => {
          this.waitForViewChildren();
        });
      }
    }
  }
  GetTemplates() {
    this._presentationservice.GetTemplates().subscribe(
      (response: any) => {
        this.userPresentation = response?.templates?.slice();
        this.isSkeleton = false;
        this.workSpaceService.isTemplate = false;
      },
      (error: any) => {
        console.log(error);
      }
    )
  }
  openTemplate(presentationId: string) {
    this.showAnotherComponent = false;
    this._presentationservice.GetPresentationId(presentationId).subscribe(
      (response: any) => {
        if (response) {
          this.userSlides = response.slide;
          this.PresentationName = response.presentationName;
          this.Id = response.id;
        }
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }
  useTemplate(id: string) {
    if(this.isUseTemplateClicked){
      return;
    }
    this.isUseTemplateClicked = true;
    this._presentationservice.UseTemplate(id).subscribe(
      (response) => {
        $('#templateView').modal('hide');
        if (response) {
         // localStorage.setItem('presentationId',response.id);
          //localStorage.setItem('activeSlideId',response.slides[0].slideId);
          this.workSpaceService.activeSlideId = response.activeSlideId;
          this.workSpaceService.presentationId = response.presentationId;
          localStorage.setItem('slideVisualizationId',response.visualizationId);
          this._router.navigate(['/WorkSpace/edit'], {
            queryParams: { id: response.presentationId }
          });
        } else {

        }
        this.isUseTemplateClicked = false;
      },
      (error: any) => {
        console.error('Error:', error);
        this.isUseTemplateClicked = false;
      }
    );

  }
  onBackButtonClick() {
    // Toggle the flag to show/hide AnotherComponent
    this.showAnotherComponent = !this.showAnotherComponent;
  }
  RemoveTitleFromSVG(data: any): string {
    const imgURL = data;
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(imgURL, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;
    const titleElement = svgElement.querySelector('title');
    if (titleElement) {
      titleElement.remove();
    }
    const modifiedSVGString = new XMLSerializer().serializeToString(svgElement);
    return modifiedSVGString;

  }
  GetSVGtoIMG(data: any) {
    var modifiedSVG = this.RemoveTitleFromSVG(data);
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(modifiedSVG, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;
    svgElement.setAttribute('width', '20px');
    svgElement.setAttribute('height', '20px');
    const serializer = new XMLSerializer();
    const updatedSVG = serializer.serializeToString(svgElement);
    return this._sanitizer.bypassSecurityTrustHtml(updatedSVG);
}

  showAllTemplates() {
    // $('#allTemplates').modal('show');
    this._router.navigateByUrl('/templates/all-templates');
  }

  handleContainerClick(event: MouseEvent): void {
    // Check if the clicked element is a button
    event.preventDefault();
    // Stop the event propagation to prevent the modal from closing
    event.stopPropagation();
  }
  private waitForViewChildren(retryCount = 0) {
    const maxRetries = 3;
    if (this.checkViewChildrenReady()) {
      this.setScaleForLayout();
    } else if (retryCount < maxRetries) {
      setTimeout(() => {
        this.waitForViewChildren(retryCount + 1);
      }, 100);
    }
  }
  private checkViewChildrenReady(): boolean {
    return !!(this.CenterPanel?.length > 0 && 
              this.InnerScreen?.length > 0 && 
              this.OuterScreen?.length > 0 );
  }
  getMasterLayoutData(id: any) {
    var layout = this.workSpaceService.getMasterLayoutData(id);
    return layout?.layoutType;
  }
  loadBGLayout(slideType:any,imageURL:any) {
    if (slideType === this.masterSlideTypeName.ImportDocument) {
      this.showPdf = true;
       this.slidePdfImage = imageURL;
       this.slideImages.forEach(image => this.checkImageOrientation(image.nativeElement));
    }  else{
      this.showPdf = false;
      var defaultImageUrl = "/assets/images/static_bg_image.svg";
      var fullImageUrl = imageURL;
      const finalImageUrl = fullImageUrl || defaultImageUrl;
      return {
        backgroundImage: `url(${finalImageUrl})`,
      };
    }
  }
  checkImageOrientation(image: HTMLImageElement) {
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    
    // Remove existing orientation classes
    image.classList.remove('landscape', 'portrait');
    
    // Add appropriate orientation class
    if (width > height) {
      image.classList.add('landscape');
    } else {
      image.classList.add('portrait');
    }
  }
  initialScreenSizeSet() {
    this.CenterPanel.forEach((centerPanel, index) => {
      let panelWidth: string;
      let panelHeight: string;
      panelWidth = '1280px';
      panelHeight = '700px';
      const innerScreen = this.InnerScreen.get(index);
      const outerScreen = this.OuterScreen.get(index);
  
      if (innerScreen && outerScreen) {
        innerScreen.nativeElement.style.width = panelWidth;
        innerScreen.nativeElement.style.height = panelHeight;
        outerScreen.nativeElement.style.width = panelWidth;
        outerScreen.nativeElement.style.height = panelHeight;
      }
    });
  }
  private setScaleForLayout() {
    this.CenterPanel.forEach((centerPanel, index) => {
      const innerScreen = this.InnerScreen.get(index);
      const outerScreen = this.OuterScreen.get(index);
  
      if (centerPanel && innerScreen && outerScreen) {
        const centerElement = centerPanel.nativeElement;
        const innerElement = innerScreen.nativeElement;
        const outerElement = outerScreen.nativeElement;
        const WIDTH = centerElement.offsetWidth;
        const HEIGHT = centerElement.offsetHeight;
        var innerWidth = innerElement.offsetWidth;
        const INNERHEIGHT = innerElement.offsetHeight;
        var ratio = innerWidth / INNERHEIGHT;
        if (ratio > 1.7) {
          innerWidth = INNERHEIGHT * 1.777;
          innerElement.style.width = innerWidth + 'px';
        }
        var scale = Math.min(WIDTH / innerWidth, HEIGHT / INNERHEIGHT);
        if (scale > 1) {
          scale = innerWidth / INNERHEIGHT;
          if (scale > 1) {
            scale = 1;
          }
        }
        innerElement.style.transform = `scale(${scale})`;
        innerElement.style.width = innerWidth * scale ;
        innerElement.style.height = INNERHEIGHT * scale;
        outerElement.style.width = innerWidth * scale ;
        outerElement.style.height = INNERHEIGHT * scale;
      }
    });
  }
  getQuestionData(slideData: any): string {
    if (!slideData?.slides?.slideContentData) {
      return '';
    }
    return this.workSpaceService.changeQuestionDataFormat(slideData?.slides?.slideContentData);
  }
  openPreviewModal(templateCard,index : any) {
    this.isPreviewClicked = true;
    this.previewindex = index;
    this.userPreviewData = templateCard;
  }
  closePreviewModal(isPreviewClosed:any){
    this.isPreviewClicked = isPreviewClosed;
  }
  getCategoryNames(): string {
    return this.userPreviewData?.categories?.map(c => c.categoryName).join(', ') || 'Uncategorized';
  }
  onTemplateHover(dynamicComponent: any) {
    if (dynamicComponent && dynamicComponent?.activeComponentReference?.instance && typeof dynamicComponent?.activeComponentReference?.instance.updateChart === 'function') {
      dynamicComponent?.activeComponentReference?.instance.startRandomDataUpdates();
    }
  }
  onTemplateLeave(dynamicComponent: any){
    if (dynamicComponent && dynamicComponent?.activeComponentReference?.instance && typeof dynamicComponent?.activeComponentReference?.instance.updateChart === 'function') {
      dynamicComponent?.activeComponentReference?.instance.stopRandomDataUpdates();
    }
  }
}
