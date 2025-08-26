import { Component, OnInit, Input, ViewChild, ElementRef, ViewContainerRef, Renderer2, ViewChildren, QueryList, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CustomerPlan, CustomerLimitationsCount } from 'src/app/core/Models/customer-plan.model';
import { CustomerPlanService } from 'src/app/core/Sevices/CustomerPlan/customer-plan.service';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { MasterSlideTypeName } from 'src/app/utility/constants';
import { MypresentationsService } from '../Service/mypresentations.service';
import { debounceTime } from 'rxjs/operators';
declare var $: any;
declare const _IntegrationMediumZoom: boolean;
@Component({
  selector: 'app-empty-presentation-page',
  templateUrl: './empty-presentation-page.component.html',
  styleUrls: ['./empty-presentation-page.component.scss']
})
export class EmptyPresentationPageComponent implements OnInit {
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
  customerLimitationCount: CustomerLimitationsCount;
  folderForm: FormGroup;
  presentationForm: FormGroup;
  customerPlan:CustomerPlan;
  submitted = false;
  @Input() presentations: any[] = [];
  // showTempModal:boolean=false;
  constructor(private _presentationservice: PresentationService, private _router: Router,
    private renderer: Renderer2, private _sanitizer: DomSanitizer,private _customerPlanService:CustomerPlanService,
    public workSpaceService:WorkspaceService,private fb: FormBuilder,private customerPlanService: CustomerPlanService,private toastr: ToastrService,
    private _mypresentationsService: MypresentationsService) { 
      this.folderForm = this.fb.group({
        folderName: ['', [Validators.required]]
      });
      this.presentationForm = this.fb.group({
        presentationName: ['', [Validators.required]]
      });
      this.customerLimitationCount = this.customerPlanService.getCustomerLimitationsCounts();
      this.customerPlan = this.customerPlanService.getCustomerPlan();
    }

  @ViewChild('showTempModal') showTempModal: any;
  @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;
  @ViewChild('container', { read: ElementRef }) containerElement: ElementRef;

  ngOnInit(): void {
    this.customerLimitationCount = this._customerPlanService.getCustomerLimitationsCounts();
    this.GetTemplates();
    this._presentationservice.presentation$.subscribe(data => {
      this.recentPresentation = data;
    });
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
        
      }
    )
  }
  closePreviewModal(isPreviewClosed:any){
    this.isPreviewClicked = isPreviewClosed;
  }
  getCategoryNames(): string {
    return this.userPreviewData?.categories?.map(c => c.categoryName).join(', ') || 'Uncategorized';
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
onBackButtonClick() {
  // Toggle the flag to show/hide AnotherComponent
  this.showAnotherComponent = !this.showAnotherComponent;
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
getQuestionData(slideData: any): string {
  if (!slideData?.slides?.slideContentData) {
    return '';
  }
  return this.workSpaceService.changeQuestionDataFormat(slideData?.slides?.slideContentData);
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
createFolder(): void {
  this.submitted = true;
  if (this.folderForm.invalid) {
    return;
  }
  this.isLoading = true;
  const folderName = this.folderForm.get('folderName').value.trim();
  if (!folderName) {
    return;
  }

  const isCreatingMainFolder = !this._mypresentationsService.activeFolderId;
  const currentMainFoldersCount = this._mypresentationsService.mainFolders?.length || 0;
  const currentSubFoldersCount = this._mypresentationsService.subFolders?.length || 0;
  
  if (isCreatingMainFolder && currentMainFoldersCount >= 10) {
    this.toastr.warning('Folder limit reached. Maximum 10 can create.', '', { 
      timeOut: 5000,
    });
    this.isLoading = false;
    return;
  }
  
  if (!isCreatingMainFolder && currentSubFoldersCount >= 10) {
    this.toastr.warning('Folder limit reached. Maximum 10 can create.', '', { 
      timeOut: 5000,
    });
    this.isLoading = false;
    return;
  }

  let currentDepth = 0;
  if (this._mypresentationsService.breadcrumbs && this._mypresentationsService.breadcrumbs.length) {
    currentDepth = this._mypresentationsService.breadcrumbs.length;
  }

  const folderData = {
    folderName: folderName,
    FolderId: [this._mypresentationsService.activeFolderId],
    folderDepth: currentDepth
  };

  this._mypresentationsService.handleFolderCreation(folderData, currentDepth)
    .subscribe({
      next: () => {
        this.isLoading = false;
        this.folderForm.reset();
        this.submitted = false;
        $('#Folder').modal('hide');
      },
      error: () => {
        this.isLoading = false;
      }
    });
}
CancelFolder() {
  this.folderForm.reset();
  this.submitted = false;
  $('#Folder').modal('hide');
}
openPreviewModal(templateCard,index : any) {
  this.isPreviewClicked = true;
  this.previewindex = index;
  this.userPreviewData = templateCard;
}
openCreateModal(): void {
  if (this._mypresentationsService.customerLimitationCount?.balancePresentationLimit > 0) {
    $('#createNewPresentation').modal('show');
    this.presentationForm.reset();
  }
}
createNewPresentation(){
  if (this.customerLimitationCount?.balancePresentationLimit > 0) {
    $('#createNewPresentation').modal('show');
    this.presentationForm.reset();
  }else{
    return;
  }
}
onSubmit(): void {
  if (this._mypresentationsService.customerLimitationCount?.balancePresentationLimit <= 0) {
    return;
  }

  this.submitted = true;
  const presentationName = this.presentationForm.get('presentationName').value.trim();

  if (!presentationName) {
    this.presentationForm.get('presentationName').setErrors({ required: true });
    this.presentationForm.get('presentationName').markAsTouched();
    return;
  }

  if (this.presentationForm.valid) {
    this.isLoading = true;

    this._mypresentationsService.handlePresentationCreation(presentationName, this._mypresentationsService.activeFolderId)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.presentationForm.reset();
          this.submitted = false;
          $('#createNewPresentation').modal('hide');
        },
        error: () => {
          this.isLoading = false;
          $('#createNewPresentation').modal('hide');
        }
      });
  }
}

cancelPresentation(): void {
  $('#createNewPresentation').modal('hide');
  this.presentationForm.reset();
  this.submitted = false;
}
}
