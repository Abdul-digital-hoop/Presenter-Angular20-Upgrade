import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { PreventClickDirective } from 'src/app/shared/directive/prevent-click.directive';
import { TemplateService } from '../Service/template.service';
import { TemplatesPublishComponent } from '../templates-publish/templates-publish.component';
import { ToastrService } from 'ngx-toastr';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { MasterSlideTypeName } from 'src/app/utility/constants';
import { debounceTime } from 'rxjs';
declare var $ : any;

@Component({
  selector: 'app-templates-list',
  templateUrl: './templates-list.component.html',
  styleUrls: ['./templates-list.component.scss']
})
export class TemplatesListComponent implements OnInit, OnDestroy {
  selectedTemplateId:string;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef
  previousScrollTop : number = 0;
  @ViewChildren('CenterPanel') CenterPanel!: QueryList<ElementRef>;
  @ViewChildren('InnerScreen') InnerScreen!: QueryList<ElementRef>;
  @ViewChildren('OuterScreen') OuterScreen!: QueryList<ElementRef>;
  @Input()customerLimitation:any;
  @Input() templateList: any[] = [];
  @Input()categoryList :any;
  @Input()hasMoreTemplates : boolean ;
  @Input() templateSection : boolean;
  @Input() cardsPerRow: number = 3; // Default value
  @Output() loadMoreTemplates = new EventEmitter<void>();
  @Output() templateListChange = new EventEmitter<any>();
  @ViewChild(TemplatesPublishComponent)publishComponent! :TemplatesPublishComponent;
  @ViewChildren('slideImage') slideImages: QueryList<ElementRef<HTMLImageElement>>;
  public userPreviewData : any = null;
  private isProcessing = false; 
  isLoading:boolean = false;
  previewindex : any;
  isPreviewClicked: boolean;
  isPublishClicked :boolean;
  isEditClicked:boolean;
  isUseTemplate: boolean=false;
  isDescriptionEdit :boolean = false;
  usedTemplateIndex: number =-1;
  masterSlideTypeName = MasterSlideTypeName;
  logoPositionType:string='';
  panelWidth: string = "890px";
  panelHeight: string = "500px";
  selectedTemplate:any;
  @Output() public clearDynamicComponent: EventEmitter<any> = new EventEmitter<any>();  item = { showMenu: false };
  modalTitle: string = "Editing a Published Template";
  modalMessage: string = "";
  modalList: string[] = [];

  public readonly template_Status = {
    private: "Private",
    waitingForApproval: "Waiting for approval",
    approved: "Approved",
    rejected: "Rejected",
    public: "Public"
  };

  private debounceTimer : any = null;
  presentationId: any;
  activeSlideId: any;
  presentationName: any;
  removeTemplateId: string;
  showPdf: boolean;
  slidePdfImage: any;
  isDeleteClicked: boolean = false;
  elementWidth: string = '';
  private resizeObserver: ResizeObserver | null = null;
  private mutationObserver: MutationObserver | null = null;
  private resizeDebounceTimer: any = null;
  isChartVisible: boolean=false;

  constructor(private _sanitizer: DomSanitizer,private _toastr: ToastrService,public workSpaceService: WorkspaceService,private _router : Router,public _templateService : TemplateService,private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.workSpaceService.isTemplate = false;
    this.setupOptimizedObservers();
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    window.removeEventListener('resize', this.debouncedResize);
  }

  private debouncedResize = () => {
    if (this.resizeDebounceTimer) {
      clearTimeout(this.resizeDebounceTimer);
    }
    this.resizeDebounceTimer = setTimeout(() => {
      this.adjustHeight();
    }, 100);
  };

  private setupOptimizedObservers() {
    this.resizeObserver = new ResizeObserver((entries) => {
      this.debouncedResize();
    });

    this.mutationObserver = new MutationObserver((mutations) => {
      const shouldUpdate = mutations.some(mutation => 
        mutation.addedNodes.length > 0 && 
        Array.from(mutation.addedNodes).some(node => 
          node instanceof HTMLElement && 
          (node.classList.contains('middle-content-section') || 
           node.querySelector('.middle-content-section'))
        )
      );

      if (shouldUpdate) {
        this.debouncedResize();
      }
    });

    const container = document.querySelector('.container.list');
    if (container) {
      this.resizeObserver.observe(container);
      this.mutationObserver.observe(container, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
      });
    }
  }

  private adjustHeight() {
    requestAnimationFrame(() => {
      const elements = document.querySelectorAll('.middle-content-section') as NodeListOf<HTMLElement>;
      elements.forEach(element => {
        if (element.offsetParent !== null) { 
          const width = element.clientWidth;
          if (width > 0) {
            const newHeight = `${width / 1.777}px`;
            if (element.style.height !== newHeight) { 
              element.style.height = newHeight;
            }
          }
        }
      });
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.adjustHeight();
    if (changes['templateList']) {
      const currentValue = changes['templateList'].currentValue;
      if (currentValue && currentValue.length > 0) {
        this.isChartVisible = false;
        setTimeout(() => {
          this.waitForViewChildren();
          // Add height adjustment after view children are ready
          requestAnimationFrame(() => {
            this.adjustHeight();
          });
        });
      }
    }
    if (changes['hasMoreTemplates']) {
      // Reset scroll position when hasMoreTemplates changes
      if (this.scrollContainer?.nativeElement) {
        this.scrollContainer.nativeElement.scrollTop = 0;
      }
      this.previousScrollTop = 0;
    }
  }
  ngAfterContentInit() {
    //  this.setScaleForLayout();
  }
  ngDoCheck() {
    //  this.setScaleForLayout();
  }
  private waitForViewChildren(retryCount = 0) {
    const maxRetries = 3;
    if (this.checkViewChildrenReady()) {
      this.setScaleForLayout();    } else if (retryCount < maxRetries) {
      setTimeout(() => {
        this.waitForViewChildren(retryCount + 1);
      }, 100);
    }
  }
  private checkViewChildrenReady(): boolean {
    return !!(this.CenterPanel?.length > 0 && 
              this.InnerScreen?.length > 0 && 
              this.OuterScreen?.length > 0 &&
              this.CenterPanel.length === this.templateList.length);
  }
  ngAfterViewInit() {
    this.adjustHeight();
    this.scrollContainer.nativeElement.addEventListener('scroll', this.onsideScroll.bind(this));
    if (this.templateList.length > 0) {
      this.waitForViewChildren();
    }

    // Subscribe to view changes
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
  getCategoryNames(): string {
    return this.userPreviewData?.categories?.map(c => c.categoryName).join(', ') || 'Uncategorized';
  }
  activeCardMenu: number | null = null;

  toggleMenu(event: MouseEvent, index: number): void {
    event.stopPropagation();
    this.activeCardMenu = this.activeCardMenu === index ? null : index;
  }
  @HostListener('document:click', ['$event'])
  closeMenu(event: Event): void {
    const targetElement = event.target as HTMLElement;

    if (!targetElement.closest('.grid-btn')) {
      this.activeCardMenu = null;
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent): void {
    this.activeCardMenu = null;
  }

  @HostListener('document:focusin', ['$event'])
  handleFocusOut(event: FocusEvent): void {
    const targetElement = event.target as HTMLElement;

    if (!targetElement.closest('.grid-btn')) {
      this.activeCardMenu = null;
    }
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
  openPreviewModal(templateCard,index : any) {
    this.isPreviewClicked = true;
    this.previewindex = index;
    this.userPreviewData = templateCard;
  }
  closePreviewModal(isPreviewClosed:any){
    this.isPreviewClicked = isPreviewClosed;
  }
  onsideScroll(): void {
    if (!this.hasMoreTemplates || !this.scrollContainer?.nativeElement) return;

    const scrollableElement = this.scrollContainer.nativeElement;
    const { scrollHeight, scrollTop, clientHeight } = scrollableElement;

    // Check if we're near the bottom (within 100px)
    if (scrollTop > this.previousScrollTop && scrollTop + clientHeight >= scrollHeight - 100) {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      
      this.debounceTimer = setTimeout(() => {
        this.loadMoreTemplates.emit();
        // Use requestAnimationFrame for smoother performance
        requestAnimationFrame(() => {
          this.adjustHeight();
        });
      }, 300);
    }
    this.previousScrollTop = scrollTop;
  }

  useTemplate(id: string, index: any) {
    if (this.customerLimitation.balancePresentationLimit > 0) {
      this.isUseTemplate = true;
      this.usedTemplateIndex = index;
      this._templateService.convertPresentation(id).subscribe(
        (response) => {
          this.isUseTemplate = false;
          this.workSpaceService.activeSlideId = response.activeSlideId;
          this.workSpaceService.presentationId = response.presentationId;
          localStorage.setItem('slideVisualizationId', response.visualizationId);
          this._router.navigate(['/WorkSpace/edit'], {
            queryParams: { id: response.presentationId }
          }).then(() => {
            this.usedTemplateIndex = -1
          });
        },
        (error: any) => {
          this.isUseTemplate = false;
          this.usedTemplateIndex = -1;
          console.error('Error:', error);
        }
      );
    }
  }

  openPublishModal(templateCard){
    this.isPublishClicked = true;
    this.userPreviewData = templateCard
    $('#editTemplateModal').modal('hide');
  }

  closePublishModal(isPublishClosed: any) {
    if (this.isProcessing) return;
    this.isProcessing = true;
    this.isPublishClicked = isPublishClosed;
    this.isDescriptionEdit = false;
    if (this.publishComponent) {
      this.publishComponent.closeForm();
    }
    this.isProcessing = false;
  }
  
openEditModal(templateCard){
  this.userPreviewData = templateCard;
  this.isEditClicked = true;
}
closeEditModal(isEditClosed:any){
 this.isEditClicked = false;
}

updatedTemplateList(updatedTemplateEvent: any) {
  const responseTemplate = updatedTemplateEvent;
  const index = this.templateList.findIndex(template => template.templateId === responseTemplate.templateId);

  if (index !== -1) {
    this.templateList[index] = { ...responseTemplate };
  }
  this.templateList = [...this.templateList];
  setTimeout(() => {
    this.adjustHeight();
    requestAnimationFrame(() => {
      this.setScaleForLayout();
      this.isChartVisible = true;
    });
  });
}



  cancelPublishModal(templateId:string){
    this.selectedTemplateId = templateId;
    $('#cancelPublishingProgress').modal('show');
  }

editPublishModal(templateCard:any){
  this.isDescriptionEdit =true;
  this.openEditModal(templateCard);
   this.selectedTemplate = templateCard
}

openEditTemplate(templateCard){
  if(templateCard.status == this.template_Status.private || templateCard.status == this.template_Status.rejected){
    this.editTemplate(templateCard)
  }
  else{
    this.isEditClicked = true;
    this.openEditModal(templateCard);
    this.selectedTemplate = templateCard;
  }
}

confirmedEdit(){
  if(this.isDescriptionEdit){
      this.openPublishModal(this.selectedTemplate);
      this.isEditClicked = false;
  }
  else{
  this.isLoading = true;
  this._templateService.editTemplateConfirmation(this.selectedTemplate.templateId)
    .subscribe((response) => {
        this.editTemplate(this.selectedTemplate);
        this.isLoading = false;
      },
      (error) => {
        console.error("Error Editing template:", error);
        this._toastr.error("cannot Edit Template");
        this.isLoading = false;
      }
    );
  }
}
  cancelPublish() {
    this.isLoading = true;
    this._templateService.cancelPublishTemplate(this.selectedTemplateId).subscribe(
      (response) => {
        this._toastr.success("Request sent successfully");
        const index = this.templateList.findIndex(template => template.templateId === this.selectedTemplateId);
        if (index !== -1) {
          this.templateList[index] = {
            ...this.templateList[index], status: this.template_Status.private,
          };
        }
        this.templateList = [...this.templateList];
        setTimeout(() => {
          this.adjustHeight();
          requestAnimationFrame(() => {
            this.setScaleForLayout();
            this.isChartVisible = true;
          });
        });
        this.isLoading = false;
      },
      (error) => {
        this._toastr.error("Failed to Cancel Publishing ");
        console.error(error);
        this.isLoading = false;
      }
    );
    $('#cancelPublishingProgress').modal('hide');

  }
  cancelEditConfirmation(){
    $('#editConfirmaionModel').modal('hide');
  }
  editTemplate(templateData:any){
    let obj={
      presentationId:templateData.template.id,
      isTemplate:templateData.template.isTemplate
    }
    $('#editConfirmaionModel').modal('hide');
      this.workSpaceService.activeSlideId = templateData.template.activeSlideId;
      this.viewWorkSpace(templateData.template.id, templateData.template.activeSlideId, templateData.template.presentationName);
  }
  viewWorkSpace(presentationId: any, activeSlideId: any, presentationName: any): void {
    this.workSpaceService.isTemplate = true;
    this.clearDynamicComponent.emit();
   this.workSpaceService.activeSlideId = activeSlideId;
   this.workSpaceService.presentationId = presentationId;
    this.workSpaceService.setMyPresent(false);
    const currentQueryParams = { ...this.route.snapshot.queryParams, id: presentationId, isTemplate: true };
    this._router.navigate(['/WorkSpace/edit'], {
      queryParams: currentQueryParams,
    });
  }
  openDeleteTemplate(Id:string){
    this.removeTemplateId = Id;
    $('#templateDelete').modal('show');
  }
  deleteTemplate(Id:string){
    if(this.isDeleteClicked){
      return;
    }
    this.isDeleteClicked = true;
    $('#templateDelete').modal('hide');
    this._templateService.deleteTemplate(Id).subscribe(
      (response) => {
        if(response == true){
        this.templateListChange.emit(Id);
        }else{
          this._toastr.error("Failed to delete template");
        }
        this.isDeleteClicked = false;
      },(error) => {
        this._toastr.error("Failed to delete template");
        this.isLoading = false;
        $('#templateDelete').modal('hide');
        this.isDeleteClicked = false;
      }
    );
  }
  cancelTemplateDelete(){
    $('#templateDelete').modal('hide');
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
        innerElement.style.width = innerWidth * scale;
        innerElement.style.height = INNERHEIGHT * scale;
        outerElement.style.width = innerWidth * scale;
        outerElement.style.height = INNERHEIGHT * scale;
      }
    });
    setTimeout(() => {
      this.isChartVisible = true;
    }, 300);
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


