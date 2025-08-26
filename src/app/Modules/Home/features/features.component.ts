import { Component, ElementRef, HostListener, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { debounceTime } from 'rxjs/operators';
import { CustomerLimitationsCount } from 'src/app/core/Models/customer-plan.model';
import { Profile } from 'src/app/core/Models/profile.model';
import { CustomerPlanService } from 'src/app/core/Sevices/CustomerPlan/customer-plan.service';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { AccountService } from 'src/app/core/Sevices/account.service';
import { getErrorMessage } from 'src/app/core/SuccessMessageHandler';
import { ErrorMessages } from 'src/app/core/SuccessResponse';
import { SlideType } from 'src/app/utility/MasterConstants';
import { MasterSlideTypeName } from 'src/app/utility/constants';
declare var $: any;
declare const _IntegrationMediumZoom: boolean;
@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss']
})
export class FeaturesComponent implements OnInit {
  previousScrollTop : number = 0;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef
  @ViewChildren('CenterPanel') CenterPanel!: QueryList<ElementRef>;
  @ViewChildren('InnerScreen') InnerScreen!: QueryList<ElementRef>;
  @ViewChildren('OuterScreen') OuterScreen!: QueryList<ElementRef>;
  userName: string;
  public profile: Profile;
  myForm: FormGroup;
  isLoading: boolean = false;
  isSkeleton: boolean = true;
  submitted = false;
  userPresentation: any;
  svgUrl: {contentType:string,id:string, imageURL: string,isOption:boolean,name: string,gifUrl:string,backgroundUrl:string,hoverColor:string
  orderId:Int32Array  }[] = [];
  slideTypeId: any;
  contentType: any;
  searchTerm:any='';
  isExtended: boolean = false;
  categoryName: string;
  hasMoreData:boolean = true;
  slideId: string;
  presentationId: string;
  IntegrationMediumZoom: boolean = _IntegrationMediumZoom;
  usercharts: any[];
  defaultcharts: any;
  pageNumber : number = 1;
  numberofRecords: number = 8;
  currentTypeName:string;
  masterSlideTypeName = MasterSlideTypeName;
  customerLimitationCount: CustomerLimitationsCount;
  masterSlideType= SlideType;
  private debounceTimer : any = null;
  iscreatePopularFeature: boolean = false;
  isUseTemplateClicked: boolean = false;
  hoveredItem: any = null;
  recentPresentation: any[];
  panelWidth: string = "890px";
  panelHeight: string = "500px";
  showPdf: boolean;
  slidePdfImage: any;
  isPreviewSkeleton:boolean = true;
  isPreviewClicked: boolean = false;
  public userPreviewData : any = null;
  @ViewChildren('slideImage') slideImages: QueryList<ElementRef<HTMLImageElement>>;
  @ViewChild('imgContainer') imgContainer: ElementRef<HTMLImageElement>;
  previewindex: any;
  selectedSlideType: string;
  constructor(
    private _accountservice: AccountService,
    private _presentationservice: PresentationService,
    private _formBuilder: FormBuilder,
    private _toastr: ToastrService,
    private _router: Router,
    private _sanitizer: DomSanitizer,
    public customerPlanService: CustomerPlanService,
    public workSpaceService:WorkspaceService
  ) { 
    this.customerLimitationCount = this.customerPlanService.getCustomerLimitationsCounts();
  }

  ngOnInit(): void {
    
    this._accountservice.UserProfile.subscribe((userData) => {
      this.profile = userData;
      if (userData.ProfileSecondName) {
        this.userName = userData.ProfileFirstName.charAt(0).toLocaleUpperCase() + userData.ProfileSecondName.charAt(0).toLocaleUpperCase();
      } else {
        this.userName = userData.ProfileFirstName.charAt(0).toLocaleUpperCase()
      }
    });
    this.myForm = this._formBuilder.group({
      presentationName: ['', Validators.required]
    });
    this.GetChartTypes();
    //this.GetCharts();
    this._presentationservice.presentation$.subscribe(data => {
      this.recentPresentation = data;
    });

  }

  ngAfterViewInit() {
    this.scrollContainer.nativeElement.addEventListener('scroll', this.onsideScroll.bind(this));
    this.CenterPanel.changes
      .pipe(
        debounceTime(0)
      )
      .subscribe(() => {
        if (this.checkViewChildrenReady()) {
          setTimeout(() => {
            this.setScaleForLayout();
          }, 100);

          this.isPreviewSkeleton = false;
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
  ngOnDestroy(){
    this.pageNumber =1;
    this.numberofRecords = 8;
    this.hasMoreData = true;
  }

  searchshowResults: boolean = false;

  expandSearch() {
    document.getElementById('searchContainer').classList.add('expanded');
    this.searchshowResults = true;
  }

  collapseSearch() {
    document.getElementById('searchContainer').classList.remove('expanded');
    this.searchshowResults = false;
  }
  toggleSearch() {
    this.isExtended = !this.isExtended;
}

searchText = '';
items: any[] = [ // Replace with your actual data source
  { name: 'Item 1' },
  { name: 'Item 2' },
  { name: 'Item 3' },
];
filteredItems: any[] = [];
showResults = false;

onSearchKeyUp() {
  this.filteredItems = this.items.filter(item => item.name.toLowerCase().includes(this.searchText.toLowerCase()));
  this.showResults = this.filteredItems.length > 0;
}

selectItem(item: any) {
  // Handle item selection here
  this.searchText = item.name;
  this.showResults = false;
}

toggleDropdown() {
  this.isExtended = true; // Set isExtended to true to extend the dropdown
}
  get f(): { [key: string]: AbstractControl } {
    return this.myForm.controls;
  }
  onSubmit() {
    this.submitted = true;
    if (this.myForm.invalid) {
      return;
    }
    if (this.myForm.valid) {
      this.isLoading = true;
      var payload = this.myForm.value;
      this._presentationservice.CreatePresentation(payload).subscribe(
        (response: any) => {
          this.isLoading = false;
          this.myForm.reset();
          this.submitted = false;
          $('#createNewPresentation').modal('hide');
          this._router.navigateByUrl('/presentation/new-presentation/' + response.id);
        },
        (error: any) => {
          this.isLoading = false;
          $('#createNewPresentation').modal('hide');
          const message = getErrorMessage(ErrorMessages.PresentationSection2000,ErrorMessages.Presentation2005); 
          this._toastr.error(message, "", {
          timeOut: 5000,
          });  
        }
      )
    }
  }
  CancelPresentation() {
    this.myForm.reset();
    this.submitted = false;
  }
  clearSearch() {
    this.searchTerm = '';
  }
  GetChartTypes(){
    const defaultOrder = ['Multiple Choice', 'Word Cloud', 'Open Ended','Ranking','QA'];
    this._presentationservice.GetPopularSlideTypes().subscribe(
      (response: any) => {
        response.forEach((data: any) => {
        this.slideTypeId=data.id,
        this.contentType=data.contentType,

          data.imageURL = this.RemoveTitleFromSVG(data?.imageURL);
          this.svgUrl.push({ contentType:data.contentType, id:data.id,imageURL: data.imageURL,isOption:data.isOption,name: data.name,orderId:data.orderId, gifUrl: data.gifUrl || '',
            backgroundUrl: data.backgroundUrl || '',
            hoverColor: data.hoverColor });
        });
      // this._presentationservice.SaveSlideType(response)
        this.isSkeleton = false;
      },
      (error: any) => {
        console.log(error);
      }
    )
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

 viewSlideType(slideTypeId:any){
  var presentationName={presentationName:"slideType"};
  this._presentationservice.CreatePresentation(presentationName).subscribe(
    (response: any) => {
      this.isLoading = false;
      //this.newPresentationForm.reset();
      this.submitted = false;
      $('#createNewPresentation').modal('hide');
      //this._presentationservice.setSlideTypeId(slideTypeId);
      // this._router.navigateByUrl('/presentation/new-presentation/' + response.id, { state: { slideTypeId: slideTypeId } });
      this._router.navigate(['/presentation/new-presentation', response.id]);
    },
    (error: any) => {
      this.isLoading = false;
      $('#createNewPresentation').modal('hide');
      this._toastr.error(error, "", {
        timeOut: 5000,
      });
    }
  )
}
GetCharts(name:string){
  this.pageNumber = 1;
  this.numberofRecords ;
  this.currentTypeName=name;
  this.isLoading = true; 
  this.hasMoreData = true;
  this.isPreviewSkeleton = true;
  this._presentationservice.GetCharts(name,this.pageNumber,this.numberofRecords).subscribe(
    (response: any[]) => {
      $('#featuresView').modal('show');
      this.usercharts = response.slice();
      this.defaultcharts = response[0];
      this.isSkeleton = false;
      this.isLoading = false;
      setTimeout(() => this.isPreviewSkeleton = false, 2000);
      if (response.length < this.numberofRecords) {
        this.hasMoreData = false;

    }},
    (error: any) => {
      console.log(error);
      this.isLoading = false;
      this.isPreviewSkeleton = false;
    }
  )
}
 openModal(name:string){
  this.selectedSlideType = name;
  this.hasMoreData = true; 
  this.GetCharts(name);
   // Add timeout to wait for modal to open

}

useTemplate(id:string){
  if(this.isUseTemplateClicked){
    return;
  }
  this.isUseTemplateClicked = true;
  this._presentationservice.UseTemplate(id).subscribe(
    (response) => {
      $('#templateView').modal('hide');
      if (response) {
        $('#featuresView').modal('hide');
       // localStorage.setItem('presentationId',response.id);
        //localStorage.setItem('activeSlideId',response.slides[0].slideId);
        this.workSpaceService.activeSlideId = response.activeSlideId;
        this.workSpaceService.presentationId = response.presentationId;
        localStorage.setItem('slideVisualizationId',response.visualizationId);
        this._router.navigate(['/WorkSpace/edit'], {
          queryParams: { id: response.presentationId }
        });
       // this._router.navigate(['/presentation/new-presentation/' + response]);
      } else {
        console.error('Invalid response:', response);
        // Handle the case when the response is not valid
      }
      this.isUseTemplateClicked = false;
    },
    (error: any) => {
      console.error('Error:', error);
      this.isUseTemplateClicked = false;
      // Handle the error appropriately
    }
  );
  
 
 // this._router.navigate(['/presentation/new-presentation/' + id]);
 }
 
  createPopularFeature(slideTypeName: string) {
    if (this.customerLimitationCount?.balancePresentationLimit > 0) {
      if (this.iscreatePopularFeature) {
        return;
      }
      this.iscreatePopularFeature = true;
      var currentSlideTypeId = this.masterSlideType.find(x => x?.Name == slideTypeName)?.id;
      const index =1;
      this._presentationservice.createPopularFeature(slideTypeName, currentSlideTypeId,index).subscribe(
        (response) => {
          $('#templateView').modal('hide');
          if (response) {
            $('#featuresView').modal('hide');
            // localStorage.setItem('presentationId',response.id);
            //localStorage.setItem('activeSlideId',response.slides[0].slideId);
            this.workSpaceService.activeSlideId = response.activeSlideId;
            this.workSpaceService.presentationId = response.presentationId;
            localStorage.setItem('slideVisualizationId', response.visualizationId);
            this._router.navigate(['/WorkSpace/edit'], {
              queryParams: { id: response.presentationId }
            });
            // this._router.navigate(['/presentation/new-presentation/' + response]);
          } else {
            console.error('Invalid response:', response);
            // Handle the case when the response is not valid
          }
        },
        (error: any) => {
          console.error('Error:', error);
          // Handle the error appropriately
        },
        () => {
          this.iscreatePopularFeature = false;
        }
      );
    } else { return; }


  }

onsideScroll(): void {
  const scrollableElement = this.scrollContainer.nativeElement;
  const scrollHeight = scrollableElement.scrollHeight;
  const scrollTop = scrollableElement.scrollTop;
  const clientHeight = scrollableElement.clientHeight;
  if (this.isLoading || !this.hasMoreData) {
    return;
  }

  if (scrollTop + clientHeight >= scrollHeight - 10) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.loadMoreData();
    }, 300);
  }
}

loadMoreData() {
  if (this.isLoading || !this.hasMoreData) {
    return;
  }

  this.isLoading = true;
  this.pageNumber++;

  this._presentationservice.GetCharts(this.currentTypeName, this.pageNumber, this.numberofRecords).subscribe(
    (response: any[]) => {
      if (response.length > 0) {
        this.usercharts = [...this.usercharts, ...response];
        if (response.length < this.numberofRecords) {
          this.hasMoreData = false;
        }
      } else {
        this.hasMoreData = false;
      }
      this.isLoading = false;
    },
    (error: any) => {
      console.log(error);
      this.isLoading = false; 
    }
  );
}
closeModal(){
  $('#featuresView').modal('hide');
   this.usercharts = []; 
}

getMasterLayoutData(id: any) {
  var layout = this.workSpaceService.getMasterLayoutData(id);
  return layout?.layoutType;
}
loadBGLayout(slideType:any,imageURL:any) {
  if (slideType === this.masterSlideTypeName.ImportDocument) {
    //this.activePptImage = false;
    this.showPdf = true;
     this.slidePdfImage = imageURL;
     this.slideImages.forEach(image => this.checkImageOrientation(image.nativeElement));
  }  else{
    //this.activePptImage = false;
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
getQuestionData(slideData: any): string {
  if (!slideData?.template?.slides?.slideContentData) {
    return '';
  }
  return this.workSpaceService.changeQuestionDataFormat(slideData?.template?.slides?.slideContentData);
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
openPreviewModal(templateCard,index : any) {
  this.isPreviewClicked = true;
  this.previewindex = index;
  this.userPreviewData = templateCard;
  this.closeModal();  
}
closePreviewModal(isPreviewClosed:any){
  this.isPreviewClicked = isPreviewClosed;
  this.openModal(this.selectedSlideType);
}
getCategoryNames(): string {
  return this.userPreviewData?.categories?.map(c => c.categoryName).join(', ') || 'Uncategorized';
}
@HostListener('window:resize', ['$event'])
onResize(event) {
  this.setLayoutForLayout();
}
setLayoutForLayout() {
  this.setScaleForLayout();
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
