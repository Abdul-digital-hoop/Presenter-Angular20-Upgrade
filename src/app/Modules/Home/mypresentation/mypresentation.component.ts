import { AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, QueryList, Renderer2, TemplateRef, ViewChild, ViewChildren, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Profile } from 'src/app/core/Models/profile.model';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { TeamService } from 'src/app/core/Sevices/Team/team.service';
import { AccountService } from 'src/app/core/Sevices/account.service';
import { CommanService } from 'src/app/core/Sevices/comman.service';
import { TrashServiceService } from 'src/app/trash-service.service';
import { environment } from 'src/environments/environment';
import {  ErrorMessages, SuccessMessages } from 'src/app/core/SuccessResponse';
import { getErrorMessage, getMessage } from 'src/app/core/SuccessMessageHandler';
import { WorkSignalRServiceService } from 'src/app/core/Sevices/WorkSpace/work-signal-rservice.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { catchError, map, of } from 'rxjs';
import { CustomerPlanService } from 'src/app/core/Sevices/CustomerPlan/customer-plan.service';
import { CustomerLimitationsCount, CustomerPlan } from 'src/app/core/Models/customer-plan.model';
import { PrizeString } from 'src/app/utility/constants';
import { SlideType } from 'src/app/utility/MasterConstants';
import { MasterSlideTypeName } from 'src/app/utility/constants';
import { debounceTime } from 'rxjs/operators';
import { trigger, state, style, animate, transition, query, stagger } from '@angular/animations';
declare var $: any;
declare let zoomSdk: any;
declare const _IntegrationMediumZoom: boolean;

@Component({
    selector: 'app-mypresentation',
    templateUrl: './mypresentation.component.html',
    styleUrls: ['./mypresentation.component.scss'],
    animations: [
        trigger('slideUpAnimation', [
            transition('* => *', [
                query(':enter', [
                    style({ opacity: 0, transform: 'translateY(20px)' }),
                    stagger(100, [
                        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
                    ])
                ], { optional: true })
            ])
        ])
    ],
    standalone: false
})
export class MypresentationComponent implements OnInit {
  isConverting : boolean = false;
  categoryList: any;
  folderId:string;
  isSkeleton: boolean = true;
  public profile: Profile;
  userName: string;
  myForm: FormGroup;
  isLoading: boolean = false;
  submitted = false;
  userPresentation: any[]=[];
  presentation: any;
  folderpresentation:any;
  activeView: string = 'gridview';
  activeViews:string='home';
  activefolderView: string = 'presentationsDatalist';
  isToggleBoxOpen: boolean = false; 
  isModalVisible: boolean = false;
  closeResult: string;
  isModalOpen: boolean;
  isZoomVisible: boolean = false;
  isExploreVisible: boolean = true;
  hoveredItem: any;
  newmeetingUUID: any;
  imageURL: any;
  IntegrationMediumZoom: boolean = _IntegrationMediumZoom;
  dynamicContentElement: HTMLElement;
  searchTerm:any='';
  isFullScreen: boolean = false;
  folders: any[] = [];
  folderresponsive: any;
  presentationresponsive:any;
  folders1: any[] = [];
  folderdetail:any[] = [];
  PresentaionNamesubfolders:any[] = [];
  createdFolder: any;
  showDeleteConfirmation: boolean = false;
  selectedFolder: any;
  isSidebarOpen: false;
  selectedFolderName: string;
  currentFolderName: string = '';
  renameFolderForm: FormGroup;
  renamePresentationForm:FormGroup;
  currentFolder: any;
  submit: boolean = false;
  folderToDelete: any; 
  currentFolderId: string;
  selectedFolderId: string | null = null;
  currentFolderNameInHeader: string = '';
  allFoldersWithLogos: any[] = [];
  selectedItem: any;
  getFolderId:string;
  moveOptionClicked = false;
  targetFolderId: string | null = null;
  selectedSourceFolder: any;
  selectedDestinationFolder: any;
  moveFolderResponse:any[]=[];
  selectedPresentationName: any;
  presentationNameToDelete:string;
  presentationItems: any[] = [];
  currentPresentationName: string | undefined;
  movedFolder: any;
  isPopupAbove: boolean = true;
  folder_value: any;
  presentationsData: any[] = [];
  activeFolderName: string = '';
  openFolderMenuId: number | null = null;
  openPresenationMenuId: number | null = null;
  activatedRoute: any;
  breadcrumbs: { [key: string]: any }[] = [{ id: '', name: 'My Presentations' }];
   activefolder:any='';  
  isDataLoaded: any;
  folderNamesProperty :any[]=[];
  selectedFolderDetails: any[]=[];
  movepresentaionname: any[]=[];
  @Input('SlideDetails') public slideDetails;
  PresentationId: string;
  activefolders:string | null;
  clickedIndex:any;
  presentationnames:any;
  lastid:any;
  foldermovehere:any;
  showMenu: boolean = false;
  presentationName: string;
  originalFolderName: any;
  currentPresName: any;
  @Input() appCustomTooltip: string = '';
  currentPresId: string;
  initialData: any;
  Hovered: boolean[] = [];
  IsHovered: boolean[] = [];
  teamid:any;
  deleteFolderId:any;
  isLoadings: boolean = true;
  errorMessage: any = '';
  isTablehide:boolean = false;
  previousFolderId : any;
  openFolderId: any=null;
  isLoadingButton: boolean = false;
  marginTop: string = '0em';
  @ViewChild('view-menu menu-list') popupElement!: ElementRef;
  subFolderCount: number;
  selectPresentationId: string;
  pageNumber: number = 1;
  pageSize: number = 20;
  allDataLoaded: boolean = false;
  totalPresentationCount: any;
  isTypeDropdownOpen = false;
  isCategoryDropdownOpen = false;
  isTemplateButtonDisabled: boolean = false;
  customerPlan:CustomerPlan;
  customerLimitationCount:CustomerLimitationsCount;
  prizeString = PrizeString;
  isMoveFolderDisable: boolean = false;
  presentationId: any;
  activeSilideId: any;
  maxDescriptionLength = 150;
  selectedItemIndex: number | null = null;
  popularFeatures:string[] = [];
  isDropdownOpen = false;
  selectedCategory: string | null = null;
  selectedSlide:string;
  selectedslideList:any =[];
  PresentationResponse :any =[];
  selectedSlideId: string | null = null;
  isNameAscending: boolean = false;
  isNameascending: boolean = true;
  isFolderGridVisible: boolean = true;
  showAllFolders: boolean = false;
  sortOption: string = 'recentlyUpdated';
  sortOptionLabel: string = 'Recently Updated';
  isSortDropdownOpen = false;
  isDateAscending: boolean = false;
  selectAll: boolean = false;
  showDeleteModal: boolean = false;
  selectedPresentationsForDelete: any[] = [];
  panelWidth: string = "890px";
  panelHeight: string = "500px";
  masterSlideTypeName = MasterSlideTypeName;
  showPdf: boolean = false;
  slidePdfImage: any;
  isCreateTemplateModal:boolean=false;
  @ViewChildren('CenterPanel') CenterPanel!: QueryList<ElementRef>;
  @ViewChildren('InnerScreen') InnerScreen!: QueryList<ElementRef>;
  @ViewChildren('OuterScreen') OuterScreen!: QueryList<ElementRef>;
  @ViewChildren('slideImage') slideImages: QueryList<ElementRef<HTMLImageElement>>;
  isChartVisible: boolean=false;
  isAllPresentationsSelected: boolean = false;
  openMenu: { id: any, x: number, y: number } | null = null;
  menuScrollTop: number = 0;
  arrowLeft: number = 0;
  arrowTop: number = 0;
  gridSkeleton: boolean = false;
  constructor(
    private _accountservice: AccountService,
    private _presentationservice: PresentationService,
    private _formBuilder: FormBuilder,
    private _toastr: ToastrService,
    private _router: Router,
    private _sanitizer: DomSanitizer,
    private commanservice:CommanService,
    private el: ElementRef,
    private _activateRouter: ActivatedRoute,
    private trashServiceService: TrashServiceService,
    private router: Router,
    private fb: FormBuilder,
    private renderer: Renderer2,
    private teamservice:TeamService,
    public workSpaceService:WorkspaceService,
    public workSpaceSignalRService:WorkSignalRServiceService,
    public customerPlanService: CustomerPlanService,private route: ActivatedRoute
  ) { 
    this.myForm = this.fb.group({
      presentationName: ['', [Validators.required, Validators.maxLength(100)]]
    });
    this.renameFolderForm = this.fb.group({
      folderName: ['', Validators.required],
    });
    this.renamePresentationForm = this.fb.group({
      presentationId: ['', Validators.required],
      newPresentationName: ['', [Validators.required, Validators.maxLength(100)]]
    });
    this._activateRouter.firstChild?.params.subscribe(params => {
      if (params['folderId']) {
        this.openFolderId = params['folderId'];
        const folder = this.currentFolderCall(this.openFolderId);
      }
    });
    this.popularFeatures = SlideType
      .filter(slide => slide.ContentType === "POPULAR")
      .map(slide => slide.Name); 
      this.popularFeatures.unshift("Presentation");

      this.customerLimitationCount = this.customerPlanService.getCustomerLimitationsCounts();
      this.customerPlan = this.customerPlanService.getCustomerPlan();
  }
  private updateBreadcrumbs(folderId: string, folderName: string): void {
    if (!this.breadcrumbs) {
      this.breadcrumbs = [];
    }
    
    const existingIndex = this.breadcrumbs.findIndex(b => b.id === folderId);
    
    if (existingIndex === -1) {
      // Add new folder to breadcrumbs
      this.breadcrumbs.push({ id: folderId, name: folderName });
    } else {
      // Remove all breadcrumbs after the clicked one
      this.breadcrumbs = this.breadcrumbs.slice(0, existingIndex + 1);
    }
    
    // Save updated breadcrumbs to localStorage
    localStorage.setItem('breadcrumbs', JSON.stringify(this.breadcrumbs));
  }
  ngOnInit(): void {
    this._presentationservice.isOnPageLoad = true;
    // if(this.activeView === 'gridview'){
    //   this.hideSkeletonAfterLayout();
    // }
    this.getAllCategory();
    this.workSpaceService.search$.subscribe(term => {
    this.searchTerm = term;
    this.pageNumber = 1;
    this.allDataLoaded = false;
    this.userPresentation = [];
    this.GetAllPresentationWithDate();
    });
    this.workSpaceService.showSearch();
    this._accountservice.UserProfile.subscribe((userData) => {
      this.profile = userData;
      if (userData.ProfileSecondName) {
        this.userName = userData.ProfileFirstName.charAt(0).toLocaleUpperCase() + userData.ProfileSecondName.charAt(0).toLocaleUpperCase();
      } else {
        this.userName = userData.ProfileFirstName.charAt(0).toLocaleUpperCase()
      }
    });
    this.myForm = this.fb.group({
      presentationName: ['', Validators.required]
    });
    this.renamePresentationForm = this.fb.group({
      presentationId: ['', Validators.required],
      newPresentationName: ['', [Validators.required]]
    });
    this.renameFolderForm = this.fb.group({
      folderName: ['', Validators.required],
    });
    const savedView = localStorage.getItem('activeView');
    if (savedView) {
      this.activeView = savedView;
      this.activefolderView = savedView === 'listview' ? 'presentationsDatalist' : 'presentationsDatagrid';
    } else {
      this.activeView = 'listview';
      this.activefolderView = 'presentationsDatalist';
      localStorage.setItem('activeView', 'listview');
    }
    // this.GetAllPresentationWithDate();
    // this.GetAllFolder();
    // if(this.IntegrationMediumZoom){
    // zoomSdk.getMeetingUUID()
    //   .then((result) => {
    //     const newmeetingUUID = result.meetingUUID;
    //     this._presentationservice.setMeetingUUID(newmeetingUUID);
    //   })
    //   .catch((error) => {
    //     console.error('Error:', error);
    //   });
    // zoomSdk.getUserContext()
    //   .then((result) => {
    //     if (result && result.role) {
    //       const role = result.role;
    //       this._presentationservice.setRole(role);
    //     }
    //   });
    //   this.InCollaborate();
    // }
    // this.dynamicContentElement = document.getElementById('dynamicContent');
    // this.dynamicContentElement.style.display = 'none';
      
 
  this.originalFolderName = this.currentFolderNameInHeader;
  this.teamid = localStorage.getItem('teamId');
  this.customerLimitationCount = this.customerPlanService.getCustomerLimitationsCounts();
  this.GetAllFolderRefresh().subscribe(() => {
    this._activateRouter.queryParams.subscribe(params => {
      if (params['Id']) {
        this.openFolderId = params['Id'];
        this.currentFolderId = params['Id'];
        this._presentationservice.FolderToFolder(this.openFolderId).subscribe(
          (response: any) => {
            this.hideDiv();
            this.presentationsData = response.presentations.map((item: any) => item.properties).slice().reverse();
            this.folders = response.folders.map((item: any) => item.properties);
            this.folders1 = response.folders.map((item: any) => item.properties);
            if (this.activeView === 'listview') {
              this.activefolderView = 'presentationsDatalist';
            } else {
              this.activefolderView = 'presentationsDatagrid';
            }
            const savedBreadcrumbs = localStorage.getItem('breadcrumbs');
            if (savedBreadcrumbs) {
              this.breadcrumbs = JSON.parse(savedBreadcrumbs);
            } else {
              const folder = this.folders.find(f => f.id === this.openFolderId);
              if (folder) {
                this.breadcrumbs = [
                  { id: '', name: 'My Presentations' },
                  { id: folder.id, name: folder.folderName }
                ];
                localStorage.setItem('breadcrumbs', JSON.stringify(this.breadcrumbs));
              }
            }
          },
          (error: any) => {
            console.error('API call error:', error);
            if(this.activeView === 'gridview'){
              this.gridSkeleton = false;
            }
          }
        );
      } else {
        this.openFolderId = null;
        this.currentFolderId = ''; 
        this.activefolderView = '';
        this.breadcrumbs = [{ id: '', name: 'My Presentations' }];
        localStorage.removeItem('breadcrumbs');
        this.GetAllFolder();
        this.GetAllPresentationWithDate();
      }
    });
  });
  }

  loadSlides(i:any) {
    this.selectedslideList = this.PresentationResponse?.slides[i]?.slides
  }
  
  CategoryToggleDropdown(event?: Event) {
    event?.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  ngAfterViewChecked(){
    this.route.queryParams.subscribe(params => {
      this.previousFolderId = params['Id']; 
    });
  }
  clearSearch() {
    this.searchTerm = '';
    this.GetAllPresentationWithDate();
  }
  // GetAllPresentationWithDate(){
  //   this._presentationservice.GetAllPresentationWithDate().subscribe(
  //     (response: any) => {
  //       this.isLoadings=false;
  //         this.isTablehide = true;
  //         this.userPresentation = response.map((item: any) => item.properties).reverse();
  //         this.presentation =  this.userPresentation;
  //         this.isSkeleton = false;
  //     },
  //     (error: any) => {
  //       console.log(error);
  //     }
  //   )
  // }
  GetAllPresentationWithDate() {
    if (this.isLoading || this.allDataLoaded) return; 
    this.isLoading = true;
    this._presentationservice.GetAllPresentationLazyload(this.pageNumber, this.pageSize,this.searchTerm).subscribe(
        (response: any) => {
            this.isLoading = false;
            if (response.length > 0) {
              if(this.searchTerm != '')
              {
                this.PresentationResponse = response[0];
                this.totalPresentationCount = response[0].totalSlides; 
                this.userPresentation= response[0].slides.map((item: any) => item.properties);
                this.presentation = this.userPresentation;
                this.folders = response[0].folders.map((item: any) => item.properties).slice().reverse();
                this.folderpresentation =response[0].folders.map((item: any) => item.properties).slice().reverse();
                this.allFoldersWithLogos = response[0].folders.map(folder => ({
                  id: folder.properties.id,
                  folderName: folder.properties.folderName,
                  folderLogo: folder.properties.folderLogo, 
                }));
              }
              else
              {
                this.PresentationResponse = response[0];
                this.totalPresentationCount = response[0].totalSlides; 
                this.userPresentation.push(...response[0].slides.map((item: any) => item.properties));
                this.presentation = this.userPresentation;
                this.folders.push(...response[0].folders.map((item: any) => item.properties).slice().reverse());
                this.folderpresentation.push(...response[0].folders.map((item: any) => item.properties).slice().reverse());
                this.allFoldersWithLogos.push(...response[0].folders.map(folder => ({
                  id: folder.properties.id,
                  folderName: folder.properties.folderName,
                  folderLogo: folder.properties.folderLogo, 
                })));
              } 
              if(this.activeView === 'gridview'){
                this.hideSkeletonAfterLayout();
              }
            } else {
                this.allDataLoaded = true; 
            }
        this.totalPresentationCount = response[0].totalSlides;
        const newPresentations = response[0].slides.map((item: any) => item.properties);

        const selectedIds = this.presentation
          .filter(item => item.isSelected)
          .map(item => item.id);

        for (let i = 0; i < newPresentations.length; i++) {
          newPresentations[i].isSelected = selectedIds.includes(newPresentations[i].id);
        }

        this.presentation = newPresentations;

        this.PresentationResponse = response[0];
        this.PresentationResponse.slides = newPresentations;

        this.selectAll = this.presentation.length > 0 && this.presentation.every(item => item.isSelected);
        this.isSkeleton = false; 
        },
        (error: any) => {
            console.log(error);
            this.isLoading = false;
            if(this.activeView === 'gridview'){
              this.gridSkeleton = false;
            }
        }
    );
}
getDefautPresentation(){
  // this.isLoading = true;
 this.searchTerm == '' ? this.GetAllPresentationWithDate() : null;
}
  
getTimeAgo(updatedDateTime: any): string {
  if (!updatedDateTime) {
    return ''; 
  }
  const utcDate = new Date(updatedDateTime);
  const currentTime = new Date();
  const timeDifferenceInMilliseconds = currentTime.getTime() - utcDate.getTime();
  if (timeDifferenceInMilliseconds <= 0) {
    return '';
  } else if (timeDifferenceInMilliseconds <= 86400000) { 
    const hours = Math.floor(timeDifferenceInMilliseconds / 3600000);
    const minutes = Math.floor((timeDifferenceInMilliseconds % 3600000) / 60000);
    const seconds = Math.floor(((timeDifferenceInMilliseconds % 3600000) % 60000) / 1000);

    if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
    } else {
      return `${seconds} sec${seconds !== 1 ? 's' : ''} ago`;
    }
  } else if (timeDifferenceInMilliseconds <= 172800000 && timeDifferenceInMilliseconds > 86400000) { 
    return '1 day ago';
  } else if (timeDifferenceInMilliseconds <= 259200000 && timeDifferenceInMilliseconds > 172800000) { 
    return '2 days ago';
  } else {
    const day = utcDate.getDate().toString().padStart(2, '0');
    const month = utcDate.toLocaleString('en-US', { month: 'short' });
    const year = utcDate.getFullYear();
    return `${day}-${month}-${year}`;
  }
}
  ngAfterViewInit() {
    $("body").tooltip({ selector: '[data-bs-toggle=tooltip]', trigger: 'hover' });
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
  ngOnDestroy() {
    $("body").tooltip('dispose');
    this.workSpaceService.hideSearch();
  }
  // GetAllPresentation() {
  //   this._presentationservice.GetAllPresentation().subscribe(
  //     (response: any) => {
  //       this.userPresentation = response.slice().reverse();
  //       this.isSkeleton = false;

  //     },
  //     (error: any) => {
  //       console.log(error);
  //     }
  //   )
  // }
  CancelFolder(){
    this.myForm.reset();
    this.submitted=false;
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
  get f(): { [key: string]: AbstractControl } {
    return this.myForm.controls;
  }
  createNewPresentation(){
    if (this.customerLimitationCount?.balancePresentationLimit > 0) {
      $('#createNewPresentation').modal('show');
      this.myForm.reset();
    }else{
      return;
    }
  }
  onSubmit() {
    if (this.customerLimitationCount?.balancePresentationLimit > 0) {
      this.submitted = true;
      this.myForm.value.presentationName = this.myForm.value.presentationName.trim();
      if (this.myForm.value.presentationName == "") {
        this.myForm.get('presentationName').setErrors({ required: true });
        this.myForm.get('presentationName').markAsTouched();
        this.myForm.get('presentationName').invalid;
        return;
      }
      if (this.myForm.get('presentationName').invalid || this.myForm.get('presentationName').valid) {
        $('#createNewPresentation').modal('show');
        this.myForm.get('presentationName').markAsTouched();
      }
      if (this.myForm.valid) {
        this.isLoadingButton = true;
        var payload = {
          presentationName: this.myForm.value.presentationName,
          FolderId: this.activefolder ? this.activefolder : null
        }
        this._presentationservice.createWorkSpacePresentation(payload).subscribe(
          (response: any) => {
            //  this.customerPlanService.setCustomerPresentationLimite(response?.balancePresentationLimit)
           // localStorage.setItem("presentationId", response?.presentationId);
            //localStorage.removeItem('activeSlideId');
            this.workSpaceService.presentationId = response?.presentationId;
            this.workSpaceService.activeSlideId = response?.activeSlideId;
            this.isLoadingButton = false;
            this.myForm.reset();
            this.submitted = false;
            $('#createNewPresentation').modal('hide');
            if (this.openFolderId != undefined || this.activefolder != undefined) {
              this._router.navigate(['/WorkSpace/edit'], {
                queryParams: {
                  id: response?.presentationId,
                  folder: this.activefolder
                }
              });
            } else {
              this._router.navigate(['/WorkSpace/edit'], {
                queryParams: { id: response?.presentationId }
              });
            }
            this.workSpaceSignalRService.netWorkValidation();
            // this._router.navigateByUrl('/WorkSpace/edit/' + response?.presentationId);
          },
          (error: any) => {
            this.isLoadingButton = false;
            $('#createNewPresentation').modal('hide');
            const message = getErrorMessage(ErrorMessages.PresentationSection2000, ErrorMessages.Presentation2005);
            this._toastr.error(message, "", {
              timeOut: 5000,
            });
          }
        )
      }
    }
    else
    {
      return;
    }
    
  }
  onInput() {
    this.errorMessage = '';
  }
  CancelPresentation() {
    $('#createNewPresentation').modal('hide');
    this.myForm.reset();
    this.submitted = false;
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

  gridButton() {
    this.activeView = 'gridview';
  }

  listButton() {
    this.activeView = 'listview';
  }


  toggleMenu(event: MouseEvent, items) {
    event.stopPropagation();

    this.closeContextMenu();

    this.showMenu = !this.showMenu;

    const contextMenu = document.getElementById('presentation-' + items);

    if (contextMenu) {
      const maxMenuWidth = 200;
      const maxMenuHeight = 200;
      const menuWidth = contextMenu.offsetWidth;
      const maxX = Math.min(window.innerWidth - maxMenuWidth, window.innerWidth * 0.7);
      const menuX = event.clientX > maxX ? maxX : event.clientX;
      const maxY = Math.min(window.innerHeight - maxMenuHeight, window.innerHeight * 0.7);
      const menuY = event.clientY > maxY ? maxY : event.clientY;
      contextMenu.style.display = this.showMenu ? 'block' : 'none';
    }
  }
closeContextMenu() {
    this.showMenu = false;

    const contextMenus = document.getElementsByClassName('context-menu') as HTMLCollectionOf<HTMLElement>;
    for (let i = 0; i < contextMenus.length; i++) {
      const contextMenu = contextMenus[i];
      contextMenu.style.display = 'none';
    }
    const viewMenus = document.getElementsByClassName('view-menu') as HTMLCollectionOf<HTMLElement>;
    for (let i = 0; i < viewMenus.length; i++) {
      const viewMenu = viewMenus[i];
      viewMenu.style.display = 'none';
    }
}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
  const clickedElement = event.target as HTMLElement;
  const modalElement = document.getElementById('renamePresentation');
  const dropdown = document.querySelector('.sorting-dropdown-container');
  const target = event.target as HTMLElement; 

  if (modalElement && modalElement.contains(clickedElement)) {
    return;
  }
  if (dropdown && !dropdown.contains(target)) {
     this.isSortDropdownOpen = false;
  }
  if(this.openMenu){
    this.openMenu = null;
    this.unlockBodyScroll();
  }
    this.closeContextMenu();
    this.closeviewMenu();
    this.closetoggleFolderMenu();
    
  }
  @HostListener('window:click', ['$event'])
  onWindowClick(event: MouseEvent) {
    this.closevienWindow();
    this.unlockBodyScroll();
  }
  handleClick(presentationMode: any,presentationId?: any,activeSlideId?: any,presentationName?: any,presentedDateTime?:any
  ): void {
    if (presentationMode) {
      try {
        const currentUtc = new Date();
        currentUtc.setMinutes(currentUtc.getMinutes() - currentUtc.getTimezoneOffset());
        let presentedUtc: Date;
        if (presentedDateTime) {
          presentedUtc = new Date(presentedDateTime);
          presentedUtc.setMinutes(presentedUtc.getMinutes() - presentedUtc.getTimezoneOffset());
          if (isNaN(presentedUtc.getTime())) {
            presentedUtc = currentUtc;
          }
        } else {
          presentedUtc = currentUtc;
        }
        const timeDiffHours = (currentUtc.getTime() - presentedUtc.getTime()) / (1000 * 60 * 60);
        if (timeDiffHours < 6) {
          this.presentationId = presentationId;
          this.activeSilideId = activeSlideId; 
          this.presentationName = presentationName;
          $('#presentationMode-To-Open').modal('show');
        } else {
          this.openPresentation(presentationId, activeSlideId, presentationName);
        }
      } catch (error) {
        this.openPresentation(presentationId, activeSlideId, presentationName);
      }
    } else {
      this.openPresentation(presentationId, activeSlideId, presentationName);
    }
  }
  openPresentation(id:string,activeSlideId:any,presentationName:string) {
    $('#presentationMode-To-Open').modal('hide');
  //  localStorage.setItem('presentationId',id);
    //localStorage.setItem('activeSlideId',activeSlideId);
    this.workSpaceService.activeSlideId = activeSlideId;
    this.workSpaceService.presentationId = id;
    this.workSpaceService.setMyPresent(true);
    if(this.openFolderId != undefined || this.activefolder != undefined){
      this._router.navigate(['/WorkSpace/edit'], {
        queryParams: {
          id: id,
          folder: this.activefolder
        }
      });
      
      // this.router.navigate(['WorkSpace/edit', id], { queryParams: {folder: this.activefolder } });
    }else{
      this._router.navigate(['/WorkSpace/edit'], {
        queryParams: { id: id }
      });
    }
   
   // this._router.navigate(['WorkSpace/edit/' + id])
    //link.click();
  
}

  startCollaborate(presentationId: string, slideId: string): void {
    const PresenterDomain = environment.PresenterDomain;
    const url = `${PresenterDomain}presentation/present/${presentationId}/${slideId}/0`;
    zoomSdk.getRunningContext().then((resolvedValue: any) => {
      if (resolvedValue && resolvedValue.context) {
        const contextValue = resolvedValue.context;
        if (contextValue === 'inMeeting'){
          const meetingUUID = this._presentationservice.getMeetingUUID();

          zoomSdk.startCollaborate({ shareScreen: true }).then((response: any) => {
            zoomSdk.onCollaborateChange((event: any) => {
              if (event.action === 'start') {
                var element = document.getElementById('dashboardpage');
                element.style.display = 'none';
                  this.handleSuccess(url); 
              }
              if (event.action === 'end') {
                var element = document.getElementById('dynamicContent');
                element.style.display = 'none';
              
                element.style.height='100vh';
                var element2 = document.getElementById('dashboardpage');
                element2.style.display = 'block';
              }
            });
          }).catch((error: any) => {
            console.error('Error starting collaboration', error);
          });

          this.getPresDetails(presentationId, meetingUUID, slideId);
          const userData = this._accountservice.GetUserValue();
          this.setZoomClientData(userData, meetingUUID);
        }
      }
    });
  }

  toggleLogo(item: string) {
    if (item === 'explore') {
      this.isExploreVisible = true;
      this.isZoomVisible = false;
    } else {
      this.isExploreVisible = false;
      this.isZoomVisible = true;
    }
  }

  handleLogoClick() {
    this.isZoomVisible = true;
  }

  InsertMeeting(presentationId, slideId, meetingUUID) {
    this._presentationservice.InsertMeeting(presentationId, slideId, meetingUUID).subscribe(
      (response: any) => {
      },
      (error: any) => {
        console.log(error);
      }
    )
}
GetPresentationId(presentationId,slideId){
  this._presentationservice.GetPresentationId(presentationId).subscribe(
    (response: any) => {
      if (response) {   
        const code = response.code;
        const url = response.url;
      }
    },
    (error: any) => {
      console.log(error?.error);
    }
  );
}
updateMeeting(presentationId,PresentationCode,url){
  const meetingUUID = this._presentationservice.getMeetingUUID();
  this._presentationservice.updateMeeting(presentationId,meetingUUID,PresentationCode,url).subscribe(
    (response: any) => {
      if (response) { 
      }
    },
    (error: any) => {
      console.log(error?.error);
    }
   );
}

getPresDetails(presentationId: string, meetingUUID: string,slideId:string) {
  var data = {
    "PresentationId" : presentationId,
    "meetinUUID":meetingUUID,
    "SlideId":slideId
  }
  this._presentationservice.getPresDetails(data)
  .subscribe((response:any) => {
  }, (error: any) => {
    console.error(error);
  });
}
setZoomClientData(userData:any,meetingUUID:string){

    // this._presentationservice.setZoomClientData(userData.ProfileId, userData.ProfileRole, userData.ProfileEMail, meetingUUID).subscribe(
    //   (response: any) => {
    //     if (response) {
    //     } else {
    //     }
    //   },
    //   (error: any) => {
    //     console.error('Error while setting meeting data', error);
    //   }
    // );
  }
  getMeetingDetails(meetingUUID: string) {
    this._presentationservice.getMeetingDetails(meetingUUID).subscribe(
      (response: any) => {
        if (response) {
        }
      }, (error) => {
        console.error('Error fetching meeting details:', error);
      });
  }
  PresentationOpen(id) {
    if (_IntegrationMediumZoom) {
    } else {
      this._router.navigate(['/presentation/new-presentation/' + id]);
    }

  }
  ToStoppresent(presentationId) {
    {
      var obj = {
        Id: presentationId,
      };
      this._presentationservice.StopPresent(obj).subscribe(
        (response: any) => {
          if (response) {

          }
        },
        (error: any) => {
          console.log(error?.error);
        }
      );
    };
  }
  handleSuccess(urls: any) {
    if (this.dynamicContentElement) {
      const body = document.body;
      body.style.overflow = 'hidden';
      this.dynamicContentElement.style.display = 'block';
      const iframeElement = this.dynamicContentElement.querySelector('#customIframe') as HTMLIFrameElement | null;
      const urlValue = urls;
      this._presentationservice.setPresentationUrl(urlValue);
      if (iframeElement) {
        iframeElement.src = urlValue;
      } else {
        console.error('Iframe element not found.');
      }
    } else {
      console.error('Dynamic content element not found.');
    }
  }
  EndPresent(presentationId:any)
  {
  var obj = {
    Id: presentationId,
  };
  this._presentationservice.StopPresent(obj).subscribe(
    (response: any) => {
      if (response) {
      }
    },
    (error: any) => {
      console.log(error?.error);
    }
  );
}
  InCollaborate(){
    zoomSdk.getRunningContext().then((resolvedValue: any) => {
      if (resolvedValue && resolvedValue.context) {
        const contextValue: string = resolvedValue.context;
        if (contextValue === 'inCollaborate') {
          var element = document.getElementById('dashboardpage');
            element.style.display = 'none';
            this.dynamicContentElement.style.display = 'block';
            const iframeElement = this.dynamicContentElement.querySelector('#customIframe') as HTMLIFrameElement | null;
            const urlValue = this._presentationservice.getPresentationUrl();
            if (iframeElement) {
              iframeElement.src = urlValue;
              zoomSdk.onCollaborateChange((event) => {
                if (event.action === 'end') {
               const presentationId=  this._presentationservice.currentPresentationId();
                  this.EndPresent(presentationId);
                var dynamicContentElement = document.getElementById('dynamicContent');
                  if (dynamicContentElement) {
                    // dynamicContentElement.style.display = 'none';
                    // dynamicContentElement.style.height = '100vh';
                  }
                  var element2 = document.getElementById('dashboardpage');
                  if (element2) {
                    element2.style.display = 'block';
                  }
                }
              });
            } else {
              console.error('Iframe element not found.');
            }
        }
      }
    }).catch((error: any) => {
      console.error('Error getting running context:', error);
    });
  }
view(event: MouseEvent, item, index) {
  event.stopPropagation();
  this.closeviewMenu();
  this.closetoggleFolderMenu();
  this.checkTemplate(item.id);
  
  if (this.openPresenationMenuId === item.id) {
    item.showMenu = false;
    this.openPresenationMenuId = null;
  } else {
    const openPresentaion = this.userPresentation.find(f => f.id === this.openPresenationMenuId);
    if (openPresentaion) {
      openPresentaion.showMenu = false;
    }
    item.showMenu = true;
    this.openPresenationMenuId = item.id;
    setTimeout(() => {
      this.toggleMenuPosition(item.id, index);
    }, 0);
  }
}

togglePopupMenu(event: MouseEvent, item: any) {
  event.stopPropagation();
  const folderMenu = document.getElementById('folder-menu');
  if (folderMenu) {
    folderMenu.style.display = 'none';
  }
  if (this.openMenu && this.openMenu.id === item.id) {
    this.openMenu = null;
    this.unlockBodyScroll();
    return;
  }

  const button = (event.target as HTMLElement).closest('.gridview-menu-icon');
  if (!button) return;

  const rect = button.getBoundingClientRect();
  const popupWidth = 250;
  const popupHeight = 200;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const buffer = 10; 

  const spaceAbove = rect.top;
  const spaceBelow = viewportHeight - rect.bottom;

  let x = rect.left - 205;
  let y = rect.bottom - 150;
  let isFlipped = false;

  if (spaceBelow < (popupHeight + buffer) && spaceAbove > popupHeight) {
    y = rect.top - popupHeight - 55;
    isFlipped = true;
  }

  if (x + popupWidth > viewportWidth - buffer) {
    x = viewportWidth - popupWidth - buffer;
  }
  if (x < buffer) {
    x = buffer;
  }

  if (y + popupHeight > viewportHeight - buffer) {
    y = viewportHeight - popupHeight - buffer;
  }
  if (y < buffer) {
    y = buffer;
  }

  this.openMenu = {
    id: item.id,
    x,
    y
  };

  const arrowWidth = 20;
  const buttonCenterX = rect.left + rect.width / 2;

  let arrowLeft = buttonCenterX - x - arrowWidth / 2 - 25;
  arrowLeft = Math.max(10, Math.min(arrowLeft, popupWidth - arrowWidth - 10));

  let arrowTop = isFlipped ? popupHeight + 65 : 130;

  this.arrowLeft = arrowLeft;
  this.arrowTop = arrowTop;
  this.lockBodyScroll();
}
  lockBodyScroll() {
    window.addEventListener('wheel', this.preventScroll, { passive: false });
    window.addEventListener('touchmove', this.preventScroll, { passive: false });
    window.addEventListener('keydown', this.preventKeyScroll, { passive: false });
  }
  
  unlockBodyScroll() {
    window.removeEventListener('wheel', this.preventScroll);
    window.removeEventListener('touchmove', this.preventScroll);
    window.removeEventListener('keydown', this.preventKeyScroll);
  }
  
  preventScroll = (e: Event) => {
    e.preventDefault();
  };
  // @HostListener('document:mousedown', ['$event'])
  // onDocumentMouseDown(event: MouseEvent) {
  // const target = event.target as HTMLElement;
  // const isMenuClick = target.closest('.menu-container');
  // const isMenuButtonClick = target.closest('.gridview-menu-icon');

  // if (!isMenuClick && !isMenuButtonClick && this.openMenu) {
  //   this.openMenu = null;
  //   this.unlockBodyScroll();
  // }
  // }
  preventKeyScroll = (e: KeyboardEvent) => {
    const keys = ['ArrowUp', 'ArrowDown', 'Space', 'PageUp', 'PageDown', 'Home', 'End'];
  if (keys.includes(e.code)) {
    e.preventDefault();
  }
  };
closevienWindow(){
  const isOutsideMenu = !document.getElementById('presentation-' + this.openPresenationMenuId)?.contains(event.target as Node);

  if (this.openPresenationMenuId && isOutsideMenu) {
    const openPresentation = this.userPresentation.find(f => f.id === this.openPresenationMenuId);
    if (openPresentation) {
      openPresentation.showMenu = false;
      this.openPresenationMenuId = null;
    }
  }
}
  closeviewMenu() {
    this.showMenu = false;
  
    const viewMenus = document.getElementsByClassName('view-menu') as HTMLCollectionOf<HTMLElement>;
    const gridViewMenus = document.getElementsByClassName('grid-view-menu') as HTMLCollectionOf<HTMLElement>;
    
    for (let i = 0; i < viewMenus.length; i++) {
      const viewMenu = viewMenus[i];
      viewMenu.style.display = 'none';
    }
    
    for (let i = 0; i < gridViewMenus.length; i++) {
      const gridViewMenu = gridViewMenus[i];
      gridViewMenu.style.display = 'none';
    }
  }
  ToPresent(presentationId: any, slideId: any) {
    this._presentationservice
      .UpdateToPresent(presentationId, slideId)
      .subscribe(
        (response: any) => {
          if (response) {
            const url = `/presentation/present/${presentationId}/${slideId}/0`;
            this.router.navigate([url], { queryParams: { 'mypresent': 'true' } });
          }
          //this.FullScreen();
        },
        (error: any) => {
          this._toastr.error(error, "", {
            timeOut: 5000,
          });
        }
      );
  }
  FullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      this.isFullScreen = true;
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      this.isFullScreen = false;
    }
  }
  createFolder() {
    if (this.breadcrumbs.length < 5) {
      this.submitted = true;
      if (this.myForm.invalid) {
        return;
      }
      this.myForm.value.presentationName = this.myForm.value.presentationName.trim();
      if (!this.myForm.value.presentationName) {
        return;
      }
      const folderName = this.myForm.get('presentationName').value;
      if (folderName) {
        const requestData = {
          folderName: folderName,
          FolderId: [this.activefolder],
          folderDepth: this.breadcrumbs.length
        };
        this._presentationservice.CreateFolder(requestData).subscribe(
          (response: any) => {
            response = JSON.parse(response);
            const folderDetails = {
              folderName: response.folderName,
              id: response.id,
              CreatedBy: response.CreatedBy,
              FolderId: response.FolderId,
              CreatedDateTime: response.createdDateTime,
              UpdatedDateTime: response.updatedDateTime,
              presentationid_count: 0 
            };
            this.folders.push(folderDetails);
            this.folders1.push(folderDetails);
            this.allFoldersWithLogos.unshift(folderDetails);
            
            if (!this.folderpresentation) {
              this.folderpresentation = [];
            }
            this.folderpresentation.push(folderDetails);
            this.myForm.reset();
            this.submitted = false;
            $('#Folder').modal('hide');
            const message = getMessage(SuccessMessages.FolderSection9000, SuccessMessages.Folder9001);
            this._toastr.success(message, "", {
              timeOut: 5000,
            });
            
            this.GetAllFolder();
            
            if (this.activeView === 'gridview') {
              this.activefolderView = 'presentationsDatagrid';
            } else {
              this.activefolderView = 'presentationsDatalist';
            }
          },
          (error: any) => {
            this.isLoading = false;
            $('#createNewPresentation').modal('hide');
            const message = getErrorMessage(ErrorMessages.FolderSection9000, ErrorMessages.Folder9001);
            this._toastr.error(message, "", {
              timeOut: 5000,
            });
          }
        );
      }
    } else {
      const message = getErrorMessage(ErrorMessages.FolderSection9000, ErrorMessages.Folder9001);
      this._toastr.warning(message, "", {
        timeOut: 5000,
      });
    }
  }

   GetAllFolder() {
    this._presentationservice.Folderlist().subscribe(
      (response: any) => {
        this.isLoadings=false;
        this.isTablehide = true;
        this.folders = response.data.item.map((item: any) => item.properties).slice().reverse();
        this.folderpresentation =response.data.item.map((item: any) => item.properties).slice().reverse();
        this.allFoldersWithLogos = response.data.item.map(folder => ({
          id: folder.properties.id,
          folderName: folder.properties.folderName,
          folderLogo: folder.properties.folderLogo, 
        }));
      },
      (error: any) => {
          console.log(error);
      }
  )}
  GetAllFolderRefresh() {
    return this._presentationservice.Folderlist().pipe(
      map((response: any) => {
        this.isLoadings = false;
        this.isTablehide = true;
        this.folders = response.data.item.map((item: any) => item.properties).slice().reverse();
        this.folderpresentation = response.data.item.map((item: any) => item.properties).slice().reverse();
        const folderName = this.folderpresentation.find(f=>f.id == this.openFolderId);
        this.allFoldersWithLogos = response.data.item.map(folder => ({
          id: folder.properties.id,
          folderName: folder.properties.folderName,
          folderLogo: folder.properties.folderLogo,
        }));
      }),
      catchError((error: any) => {
        console.log(error);
        return of(null);  
      })
    );
  }
  toggleFolderMenu(event: Event, folder: any): void {
      event.stopPropagation();
    
    this.closeviewMenu();

  
    if (this.openFolderMenuId === folder.id) {
        folder.showMenu = false;
        this.openFolderMenuId = null;
        this.currentFolderNameInHeader = folder.folderName;
    } else {
        const openFolder = this.folders.find(f => f.id === this.openFolderMenuId);
        if (openFolder) {
            openFolder.showMenu = false;
        }
        folder.showMenu = true;
        this.openFolderMenuId = folder.id;

        this.selectedFolderId = folder.id;
        this.currentFolderNameInHeader = folder.folderName;
    }
}

closetoggleFolderMenu() {
this.showMenu = false;

const foldermenu = document.getElementsByClassName('popup-view') as HTMLCollectionOf<HTMLElement>;
for (let i = 0; i < foldermenu.length; i++) {
  const foldermenus = foldermenu[i];
  foldermenus.style.display = 'none';
}
}
  renameFolder(){
    this.closeviewMenu();
    this.submit = true;
    if (this.renameFolderForm.get('folderName').invalid || this.renameFolderForm.get('folderName').valid)  {
      $('#folder-mobile').modal('hide');
      $('#Renamefolder').modal('show');
      this.renameFolderForm.get('folderName').setValue(this.currentFolderNameInHeader);
      return;
     
   }
  }
    updateRenameFolder(){
    let folderName = this.renameFolderForm.get('folderName').value.trim();
    const newFolderName = this.renameFolderForm.get('folderName').value;
    if(!folderName || this.currentFolderNameInHeader === newFolderName){
      if(folderName == ""){
        $('#Renamefolder').modal('show');
        return;
      }
      $('#Renamefolder').modal('hide');
      return;
    }
    const folderId =this.selectedFolderId
    this._presentationservice.FolderRename(folderId,newFolderName).subscribe(
      (response: any) => {
        const updatedFolder = this.folders.find(folder => folder.id === folderId);
        if (updatedFolder) {
          updatedFolder.folderName = newFolderName;
        }
        const updatedFolder1 = this.folders1.find(folder => folder.id === folderId);
        if (updatedFolder1) {
          updatedFolder1.folderName = newFolderName;
        }
        this.renameFolderForm.reset();
        this.submitted = false;
        $('#Renamefolder').modal('hide');
        //this._toastr.success(`"${this.currentFolderNameInHeader}" rename to "${response.folderName}"`,)
        const message = getMessage(SuccessMessages.FolderSection9000,SuccessMessages.Folder9002); 
        this._toastr.success(message,"",{
        timeOut: 5000,
        });
      },
      (error: any) => {
        const message = getErrorMessage(ErrorMessages.FolderSection9000,ErrorMessages.Folder9002); 
        this._toastr.error(message, "", {
        timeOut: 5000,
        });  
     
  }
);}

deletepresentation(): void {
  this.selectedItem
  this._presentationservice.PresentationDelete(this.selectedItem).subscribe(
    (response:any) => {
      const index = this.userPresentation.findIndex(presentation => presentation.id === this.selectedItem);
      if (index !== -1) {
          this.userPresentation.splice(index, 1);
      }
    $('#presentationDelete').modal('hide');
    this.trashServiceService.setPresentationData(response);
    const message = getMessage(SuccessMessages.PresentationSection2000,SuccessMessages.Presentation2003);
    this._toastr.success(`${message}`,
    "", {
      timeOut: 5000,
    });
  },
    (error: any) => {
      const message = getErrorMessage(ErrorMessages.PresentationSection2000,ErrorMessages.Presentation2003); 
      this._toastr.error(message, "", {
      timeOut: 5000,
      });  
    }
  );
}
  
  deleteFolderpresentation(): void {
    this.selectedItem
    this._presentationservice.folderPresentationDelete(this.selectedItem,this.activefolder).subscribe(
      (response:any) => {
        const index = this.presentationsData.findIndex(presentation => presentation.id === this.selectedItem);
        if (index !== -1) {
            this.presentationsData.splice(index, 1);
        }
       this.FolderClick(this.activefolder,this.currentFolderName);
      $('#folderpresentationDelete').modal('hide');
      this.trashServiceService.setPresentationData(response);
      const message = getMessage(SuccessMessages.PresentationSection2000,SuccessMessages.Presentation2003);
      this._toastr.success(`${message}`,
      "", {
        timeOut: 5000,
      });
    },
      (error: any) => {
        const message = getErrorMessage(ErrorMessages.PresentationSection2000,ErrorMessages.Presentation2003); 
        this._toastr.error(message, "", {
        timeOut: 5000,
        });  
      }
    );
  }
  toggleSelectAll() {
    if (this.selectAll) {
        this.presentation.forEach(item => {
            item.isSelected = true;
        });
        this.isAllPresentationsSelected = true;
    } else {
        this.presentation.forEach(item => {
            item.isSelected = false;
        });
        this.isAllPresentationsSelected = false;
    }
}

onPresentationSelect(item: any) {
    item.isSelected = !item.isSelected;
    if (!item.isSelected && this.selectAll) {
        this.selectAll = false;
        this.isAllPresentationsSelected = false;
    } else if (item.isSelected) {
        this.selectAll = this.presentation?.every(p => p.isSelected) || false;
        this.isAllPresentationsSelected = this.selectAll;
    }
}

hasSelectedPresentations(): boolean {
    return this.presentation?.some(item => item.isSelected) || false;
}

getSelectedCount(): number {
    return this.presentation?.filter(item => item.isSelected).length || 0;
}

openDeleteModal(): void {
    this.selectedPresentationsForDelete = this.presentation.filter(item => item.isSelected);

    if (this.selectedPresentationsForDelete.length > 0) {
        $('#deleteAllModal').modal('show');
    }
}

closeDeleteModal(): void {
  $('#deleteAllModal').modal('hide');
  this.selectedPresentationsForDelete = [];
}

confirmDelete(): void {
  if (this.isLoading) return;
  this.isLoading = true;

  const presentationIds = this.selectedPresentationsForDelete.map(p => p.id);
  this.deleteSelectedPresentations(presentationIds);
}

private deleteSelectedPresentations(presentationIds: string[]): void {
  this._presentationservice.deleteMultiplePresentations(presentationIds)
      .subscribe({
          next: (response) => {
              this.handleDeleteSuccess(response);
          },
          error: (error) => {
              this.handleDeleteError(error);
          }
      });
}


private handleDeleteSuccess(response: any): void {
    const deletedIds = response.map((p: any) => p.id);
    this.presentation = this.presentation.filter(p => !deletedIds.includes(p.id));

    this.selectAll = false;

    this.trashServiceService.setPresentationData(response);

    const message = getMessage(SuccessMessages.PresentationSection2000, SuccessMessages.Presentation2003);
    this._toastr.success(message, "", {
        timeOut: 5000,
    });

    this.closeDeleteModal();
    this.GetAllPresentationWithDate();
}

private handleDeleteError(error: any): void {
    const message = getErrorMessage(ErrorMessages.PresentationSection2000, ErrorMessages.Presentation2003);
    this._toastr.error(message, "", {
        timeOut: 5000,
    });
    this.closeDeleteModal();
}
  cancelRenameFolders() {
    this.submitted = false;
    $('#RenameFolder').modal('hide');
    this.selectedFolderId = null;
    this.renameFolderForm.reset();
    Object.values(this.renameFolderForm.controls).forEach(control => {
      control.markAsUntouched();
    });
  
    this.currentFolderNameInHeader = this.originalFolderName;
  }
  cancelRenameFolder() {
    this.submitted = false;
    $('#RenameFolder').modal('hide');
    this.selectedFolderId = null;
  }
  cancelpresentaion(){
    $('#presentations-mobile').modal('hide');
    $('#presentation-mobile').modal('hide');
  }
  
      moveFolder(folder: any): void {
          folder.showMenu = false;
          this.currentFolder = folder;
          this.selectedSourceFolder = folder;
          this.allFoldersWithLogos = this.folders.map(f => ({
          id: f.id,
          folderName: f.folderName,
          folderLogo: f.folderLogo, 
  }));
         $('#folder-mobile').modal('hide');
          $('#MoveFolder').modal('show');          
      }
     
      foldermove:any;
  Modalformovetofolder(folderId: any): void {
    const selectedFolder = this.allFoldersWithLogos.find(folder => folder.id === folderId);
    if (selectedFolder && selectedFolder.folderName === this.currentFolderNameInHeader) {
        return;
    }
    this.foldermove=folderId;
    this.selectedDestinationFolder = folderId;
    this._presentationservice.getSubFolderDetails(folderId).subscribe(
      (folderDetails: any) => {
        this.selectedFolderDetails = folderDetails;
        this.folderdetail=folderDetails.folders;
        this.PresentaionNamesubfolders=folderDetails.presentations;
        const detail=folderDetails.folders.find(folder => folder.id );
        const selectedFolder = this.allFoldersWithLogos.find(folder => folder.id === folderId);
        this.lastid = folderId; 
        $('#MoveFolder').modal('hide');
        $('#SecondModal').modal('show');
        if(detail == undefined){
          this.isMoveFolderDisable = true;
       }
       else{
        this.isMoveFolderDisable = false;
       }
      },
      
      (error) => {
        console.error('Error getting folder details:', error);
      }
    );
    }

  cancelMovefolderToPresentation1(): void {
    this.selectedSourceFolder = null;
    this.selectedDestinationFolder = null;
    $('.modal').modal('hide');
  }
  goBackToFirstModal(): void {
    $('#SecondModal').modal('hide');
    $('#MoveFolder').modal('show');
  }  
  goBackToFirstModal2(): void {
    $('#fourthModal').modal('hide');
    $('#SelectFolderModal').modal('show');
  }
  cancelMovefolderToPresentation2(): void {
    this.selectedFolder = null;
    $('#SelectFolderModal').modal('hide');
  }
  cancelMovefolderToPresentation3(): void {
    $('.modal').modal('hide');
  }

  deleteFolder(): void {
    this.showDeleteConfirmation = false;
    this._presentationservice.FolderDelete(this.deleteFolderId).subscribe(
        (response: any) => {
            const index1 = this.folders1.findIndex(f => f.id === this.deleteFolderId);
            if (index1 !== -1) {
                this.folders1.splice(index1, 1);
                
            }
            const index = this.folders.findIndex(f => f.id === this.deleteFolderId);
            if (index !== -1) {
                this.folders.splice(index, 1);
                
            }
            const deletedIndex = this.allFoldersWithLogos.findIndex(f => f.id === this.deleteFolderId);
            if (deletedIndex !== -1) {
                this.allFoldersWithLogos.splice(deletedIndex, 1);
            }
            this.trashServiceService.setPresentationData(response);
            this.FolderClick(this.activefolder,this.currentFolderName);
            const message = getMessage(SuccessMessages.FolderSection9000,SuccessMessages.Folder9004);
            this._toastr.success(message, "", {
            timeOut: 5000,
            });
            $('#FolderDelete').modal('hide');
        },
        (error: any) => {
          const message = getErrorMessage(ErrorMessages.FolderSection9000,ErrorMessages.Folder9004); 
          this._toastr.error(message, "", {
          timeOut: 5000,
          });  
            this.folderToDelete.id.showMenu = true;
        }
    );
}


renamePresentation(id: string, name: string) {
  this.showMenu = false;
  this.closevienWindow()
  this.currentPresId = id;
  this.currentPresName = name;
  
  if (this.renamePresentationForm.get('newPresentationName').invalid) {
    $('#presentations-mobile').modal('hide');
    $('#presentation-mobile').modal('hide');
    $('#renamePresentation').modal('show');
    this.renamePresentationForm.get('newPresentationName').setValue(this.currentPresName);
    return;
  }
  this.renamePresentationForm.reset();
}
invitetoedit() {
  this.showMenu = false;
  this.closeviewMenu()
  this.closevienWindow()
  $('#presentations-mobile').modal('hide');
  $('#presentation-mobile').modal('hide');
    $('#invitetoedit').modal('show');
   
}

updatePresentation() {
  const id = this.currentPresId;
  const presentationName = this.renamePresentationForm.get('newPresentationName').value.trim();
  const originalPresentationName = this.currentPresName;

  if (!presentationName || presentationName === originalPresentationName) {
    this.renamePresentationForm.get('newPresentationName').markAsTouched();
    if(presentationName == ""){
      return;
    }
    $('#renamePresentation').modal('hide');
    return;
  }

  if (!id || !presentationName) {
    console.error('Invalid id or presentationName');
    return;
  }

  this._presentationservice.renamePresentation(id, presentationName)
    .subscribe(
      (response) => {
        console.log(response);
        $('#renamePresentation').modal('hide');
        this.renamePresentationForm.reset();
        const updatedPresentation = this.presentation.find(presentation => presentation.id === id);
        if (updatedPresentation) {
          updatedPresentation.presentationName = presentationName;
          const index = this.presentation.findIndex(p => p.id === id);
          if (index > -1) {
            this.presentation.splice(index, 1);
          }
          this.presentation.unshift(updatedPresentation);
        }
        const message = getMessage(SuccessMessages.PresentationSection2000,SuccessMessages.Presentation2001); 
        this._toastr.success(`${message}`, "", {
          timeOut: 5000,
        });
      },
      (error) => {
        console.log(error);
        const message = getErrorMessage(ErrorMessages.PresentationSection2000,ErrorMessages.Presentation2001); 
        this._toastr.error(message, "", {
        timeOut: 5000,
        }); 
      }
    );
}

 
cancelRenamePresentation() {
  this.submitted = false;
  
  $('#RenameFolder').modal('hide');
  
  this.renamePresentationForm.reset();
  
 
}
openfolderresponsive(folders:any){
  this.selectedFolderId = folders.id;
  this.currentFolderNameInHeader = folders.folderName;
this.folderresponsive=folders;
$('#folder-mobile').modal('show');
}
openfolderresponsive1(folders:any){
  this.selectedFolderId = folders.id;
  this.currentFolderNameInHeader = folders.folderName;
  this.folderresponsive=folders;
  $('#folders-mobile').modal('show');
  }
  openpresentationresponsive(items:any){
    this.presentationresponsive=items;
    $('#presentation-mobile').modal('show');
    }
    openpresentationresponsive1(items:any){
      this.presentationresponsive=items;
      $('#presentations-mobile').modal('show');
      }
openSelectFolderModal(id:string,name:any){
  this.selectedItem = id;
  this.presentationnames=name;
  $('#presentations-mobile').modal('hide');
  $('#presentation-mobile').modal('hide');
  $('#SelectFolderModal').modal('show');
}
openPresentationModal(id:string){
  this.selectedItem =id;
  this.currentPresentationName = this.userPresentation.find(item => item.id === id)?.presentationName;
  $('#renamePresentation').modal('show');
  
}

openDeletePresentation(id:string,presentationName: string){
  this.selectedItem =id;
  this.currentPresentationName = presentationName;
  this.currentPresentationName = this.userPresentation.find(item => item.id === id)?.presentationName;
  $('#presentations-mobile').modal('hide');
  $('#presentation-mobile').modal('hide');
  $('#presentationDelete').modal('show');
}
openFolderDeletePresentation(id:string,presentationName: string){
  this.selectedItem =id;
  this.currentPresentationName = presentationName;
  this.currentPresentationName = this.userPresentation.find(item => item.id === id)?.presentationName;
  $('#presentations-mobile').modal('hide');
  $('#presentation-mobile').modal('hide');
  $('#folderpresentationDelete').modal('show');
}
showDeleteConfirmationDialog(folderId: string): void {
  this.deleteFolderId = folderId;
  $('#folder-mobile').modal('hide');
  this.folderToDelete = this.folders.find(folder => folder.id === folderId);
  this.closeviewMenu();
  this.showDeleteConfirmation = true;
}


movePresentationToFolder(folderId: any) {
  const presentationId = this.selectedItem;
  if (presentationId && folderId) {
    this._presentationservice.PresentationMovedToFolder(folderId,presentationId).subscribe(
      (response: any) => {
        this.GetAllPresentationWithDate();
        const specificFolder = this.allFoldersWithLogos.find(folder => folder.id === folderId);
    if (specificFolder) {
      const folderName = specificFolder.folderName;
      const message = getMessage(SuccessMessages.PresentationSection2000,SuccessMessages.Presentation2004); 
      this._toastr.success(`${message}`, "", {
      });
    }
        $('#fourthModal').modal('hide');
      },
      (error) => {
       const message = getErrorMessage(ErrorMessages.PresentationSection2000,ErrorMessages.Presentation2004); 
       this._toastr.error(message, "", {
       timeOut: 5000,
       });  
      }
    );
  } else {
    console.error('Presentation ID or Folder ID is undefined.');
  }
}

moveFolderToFolder() {
  if (this.selectedSourceFolder && this.selectedDestinationFolder) {
    if(this.previousFolderId == undefined){
      this.previousFolderId = this.selectedSourceFolder.id;
    }
    if(this.breadcrumbs.length == 4){
      return;
    }
    this._presentationservice.FolderMoveToFolder(this.previousFolderId,this.selectedSourceFolder.id, this.selectedDestinationFolder).subscribe(
    (response: any) => {
      this.moveFolderResponse = response.folderIds;
      const index1 = this.folders1.findIndex(f => f.id === this.selectedSourceFolder.id);
      if (index1 !== -1) {
          this.folders1.splice(index1, 1);
          
      }
      this.GetAllPresentationWithDate();
      this.GetAllFolder();
      const subfoldername=response.foldername;
    
      $('#MoveFolder').modal('hide');
      $('#SecondModal').modal('hide');
      const sourcefolder = this.allFoldersWithLogos.find(folder => folder.id ===  this.selectedSourceFolder.id);
        const folderNames = sourcefolder.folderName;
        const message = getMessage(SuccessMessages.FolderSection9000,SuccessMessages.Folder9003); 
        this._toastr.success(`${message}`, "", {
        });
      
      },
    
    (error) => {
      const message = getErrorMessage(ErrorMessages.FolderSection9000,ErrorMessages.Folder9003); 
      this._toastr.error(message, "", {
      timeOut: 5000,
      });  
    }
  );
} else {
  (error) => {
    this._toastr.error(error, "", {
      timeOut: 5000,
    });
      }
}
}
moveFolderToFolder1() {
  if (this.selectedSourceFolder && this.foldermove) {
    if(this.previousFolderId == undefined){
      this.previousFolderId = this.selectedSourceFolder.id;
    }
    if(this.breadcrumbs.length == 4){
     return;
   }
    this._presentationservice.FolderMoveToFolder(this.previousFolderId,this.selectedSourceFolder.id,this.foldermove).subscribe(
    (response: any) => {
      this.moveFolderResponse = response.folderIds;
      const index1 = this.folders1.findIndex(f => f.id === this.selectedSourceFolder.id);
      if (index1 !== -1) {
          this.folders1.splice(index1, 1);
          
      }
      const subfoldername=response.foldername;
      this.GetAllPresentationWithDate();
      this.GetAllFolder();
      $('#MoveFolder').modal('hide');
      $('#SecondModal').modal('hide');
      const sourcefolder = this.allFoldersWithLogos.find(folder => folder.id ===  this.selectedSourceFolder.id);
      const message = getMessage(SuccessMessages.FolderSection9000,SuccessMessages.Folder9003); 
      this._toastr.success(`${message}`, "", {
      });
    },
    (error) => {
      const message = getErrorMessage(ErrorMessages.FolderSection9000,ErrorMessages.Folder9003); 
      this._toastr.error(message, "", {
      timeOut: 5000,
      }); 
    }
  );
} else {
  console.error('Selected folder ID is undefined.');
}
}
moveAndShowSubfolders(folderId: string) {
  this.foldermovehere = folderId;
  this._presentationservice.getSubFolderDetails(folderId).subscribe(
    (folderDetails: any) => {
      this.selectedFolderDetails = folderDetails.folders;
      this.movepresentaionname=folderDetails.presentations;
      const selectedFolder = this.allFoldersWithLogos.find(folder => folder.id === folderId);
      this.lastid = folderId;  
      $('#SelectFolderModal').modal('hide');
      $('#fourthModal').modal('show');
      if(this.selectedFolder == undefined){
        this.isMoveFolderDisable = true;
     }
     else{
      this.isMoveFolderDisable = false;
     }
    },
    (error) => {
      this._toastr.error(error, "", {
        timeOut: 5000,
      });
    }
  );
}

closeContextMenu1(event: Event): void {
  event.stopPropagation();
  this.folders.forEach(folder => folder.showMenu = false);
}

FolderClick(folderId,folderName): void {
  this.searchTerm = '';
  this.activefolder = folderId;
 // this.previousFolderId = folderId;
  const breadcrumbIndex = this.breadcrumbs.findIndex(item => item.id === folderId);
  if (breadcrumbIndex === -1) {
    if (folderName != 'My Presentations') {
      this.breadcrumbs.push({ id: folderId, name: folderName });
    }
  } else {
    if(folderName == ''){
      folderName ='My Presentations';
    }
    this.breadcrumbs[breadcrumbIndex].name = folderName;
  }
  this.currentFolderName = folderName;
  this.clickedIndex = breadcrumbIndex !== -1 ? breadcrumbIndex : this.breadcrumbs.length - 1;
  localStorage.setItem('breadcrumbs', JSON.stringify(this.breadcrumbs));
  if (folderId !== '' && folderId !== null) {
    this.currentFolderId = folderId;
    this._presentationservice.FolderToFolder(folderId).subscribe(
      (response: any) => {
        this.hideDiv();
        this.presentationsData=response.presentations.map((item: any) => item.properties).slice().reverse();
        this.folders = response.folders.map((item: any) => item.properties);
        this.folders1 = response.folders.map((item: any) => item.properties);
        if(this.activeView == 'listview'){
          this.activefolderView = 'presentationsDatalist';
        }else{
          this.activefolderView = 'presentationsDatagrid';
        }
      },
      (error: any) => {
        console.error('API call error:', error);
      }
    );
  } else {
    this.GetAllFolder();
    this.GetAllPresentationWithDate();
  }
}
onBreadcrumbClick(event:MouseEvent,breadcrumb: any): void {
  const target = event.currentTarget as HTMLElement;
  $(target).tooltip('hide');
  $(target).tooltip('dispose');

  const index = this.breadcrumbs.findIndex(item => item.id === breadcrumb.id);
  this.breadcrumbs = this.breadcrumbs.slice(0, index + 1);
  localStorage.setItem('breadcrumbs', JSON.stringify(this.breadcrumbs));
  this.currentFolderName = this.breadcrumbs[index]?.name;
  if (breadcrumb.id) {
    this.activefolder = breadcrumb.id;
    if(breadcrumb.id != null){
    this.router.navigate(['/app/dashboard/'], { queryParams: { Id:breadcrumb.id} });
    }else{
      this.router.navigate(['/app/dashboard']);
    }
    this._presentationservice.FolderToFolder(breadcrumb.id).subscribe(
      (response: any) => {
        this.presentationsData=response.presentations.map((item: any) => item.properties);
        this.folders = response.folders.map((item: any) => item.properties);
        this.folders1 = response.folders.map((item: any) => item.properties);
        if(this.activeView == 'listview'){
          this.activefolderView = 'presentationsDatalist';
        }else{
          this.activefolderView = 'presentationsDatagrid';
        }
      },
      (error: any) => {
        console.error('API call error:', error);
      }
    );
  } else {
    this.router.navigate(['/app/dashboard']);
    this.showDiv();
    this.activefolder = ''; 
    this.activefolderView = '';
    this.currentFolderId = '';
    this.workSpaceService.showSearch();
    this.workSpaceService.updateSearch('');
  }
}
onKeyUp(event: KeyboardEvent) {
  const key = event.key;
  if (key === 'Backspace' && this.searchTerm.trim() !== '') {
    this.searchAndSortPresentations();
  }
}


searchAndSortPresentations() {
  if (!this.initialData) {
    this.initialData = {
      presentation: [...this.presentation],
      folderpresentation: [...this.folderpresentation]
    };
  }

  if (this.searchTerm) {
    this.presentation = [];
    this.folderpresentation = [];

    this.initialData.presentation.forEach(item => {
      if (item.presentationName.toLowerCase().includes(this.searchTerm.toLowerCase())) {
        this.presentation.push(item);
      }
    });

    this.initialData.folderpresentation.forEach(item => {
      if (item.folderName.toLowerCase().includes(this.searchTerm.toLowerCase())) {
        this.folderpresentation.push(item);
      }
    });
  } else {
    this.presentation = [...this.initialData.presentation];
    this.folderpresentation = [...this.initialData.folderpresentation];
  }
}


gridfolder() {
  this.activefolderView = 'presentationsDatagrid';
}

listfolder() {
  this.activefolderView = 'presentationsDatalist';
}
truncateText(text: string, limit: number): string {
  if (text.length <= limit) {
    return text;
  } else {
    return text.substring(0, limit) + '...';
  }
}
getFormattedTooltip(name: string): string | null {
  if (name.length > 16) {
    if (!isNaN(Number(name)) && !isNaN(parseFloat(name))) {
     const value =  name.replace(/(\d)(?=(\d{0})+(?!\d))/g, '$1,');
     return value;
    }
    return name;
  }
  return null;
}


onMouseOver(event: MouseEvent, breadcrumb: any) {
  const tooltipText = breadcrumb.name;

  if (tooltipText.length > 22) {
    const tooltipSpan = this.renderer.createElement('span');
    this.renderer.addClass(tooltipSpan, 'custom-tooltip');
    this.renderer.appendChild(tooltipSpan, this.renderer.createText(tooltipText));

    const topValue = (event.clientY + 10) + 'px';
    const leftValue = (event.clientX + 10) + 'px';
    this.renderer.setStyle(tooltipSpan, 'top', topValue);
    this.renderer.setStyle(tooltipSpan, 'left', leftValue);

    this.renderer.appendChild(document.body, tooltipSpan);

    this.renderer.listen(this.el.nativeElement, 'mouseout', () => {
      this.renderer.removeChild(document.body, tooltipSpan);
    });
  }
}
createTemplate(id:string ,i : any){
  this.isCreateTemplateModal = true;
  this.selectedItemIndex = i;
  if(!(this.customerLimitationCount?.templateCount >= this.customerPlan?.create_presentation_templates)){
    this.loadSlides(i);
    $('#createTemplate').modal('show');
    this.selectPresentationId = id;
  }
  else
 {
    return;
  }
}
closeCreateTemplateModal(){
  this.isCreateTemplateModal = false;
}
openSlideOneRemote(id:any,activeSlideId:any) {
  if(this.customerPlan?.remote){
   // localStorage.setItem('presentationId',id);
    //localStorage.setItem('activeSlideId',activeSlideId);
    this.workSpaceService.activeSlideId = activeSlideId;
    this.workSpaceService.presentationId = id;
    const url = `/WorkSpace/remote?id=${id}`;
    window.location.href = url; 
  }else{
    // this._toastr.warning("You don't have access remote" , '', {
    //   timeOut: 5000
    // });
  }
}
isHovered = false;
  isClicked = false;

  toggleHover(hovered: boolean): void {
    this.isHovered = hovered;
  }

  toggleColor(): void {
    this.isClicked = !this.isClicked;
  }
  toggleHoverClass(index: number, Hovered: boolean): void {
    this.Hovered[index] = Hovered;

    const rowElement = document.querySelector('.userpresentation-' + index) as HTMLElement;

    if (Hovered) {
      this.renderer.addClass(rowElement, 'hovered');
     
    } else {
      this.renderer.removeClass(rowElement, 'hovered');
    }
  }
  folderhover(index: number, IsHovered: boolean): void {
    this.IsHovered[index] = IsHovered;

    const rowElement = document.querySelector('.folder-container-' + index) as HTMLElement;

    if (IsHovered) {
      this.renderer.addClass(rowElement, 'hovered');
     
    } else {
      this.renderer.removeClass(rowElement, 'hovered');
    }
  }
  duplicatePresentation(id:string){
    if(this.customerLimitationCount?.balancePresentationLimit > 0){
      $('#presentation-mobile').modal('hide');
    const data = {presentationId:id,
      folderId:this.openFolderId};
    this._presentationservice.duplicatePresentation(data)
    .subscribe(
      (response) => {
        this.customerLimitationCount.balancePresentationLimit = this.customerLimitationCount.balancePresentationLimit - 1;
        if (response) {
          this.presentation.unshift(response);
          if (this.userPresentation) {
            this.userPresentation.unshift(response);
          }
        }
        const link = `<a href="/app/dashboard"><u>MyPresentations</u></a>`;
        const message = getMessage(SuccessMessages.PresentationSection2000,SuccessMessages.Presentation2002); 
        this._toastr.success(`${message}`, "", {
          enableHtml: true,
          timeOut: 5000 
        });
      
      },
      (error) => {
       // console.error('Error renaming presentation:', error);
       const message = getErrorMessage(ErrorMessages.PresentationSection2000,ErrorMessages.Presentation2002); 
       this._toastr.error(message, "", {
       timeOut: 5000,
       });  
      }
    );
    }
    
  }
  subduplicatePresentation(activefolder:string,id:string){
    $('#presentations-mobile').modal('hide');
    const data = {presentationId:id,
      folderId:activefolder};
    this._presentationservice.duplicatePresentation(data)
    .subscribe(
      (response) => {

       this._presentationservice.FolderToFolder(activefolder).subscribe(
        (response: any) => {
          this.presentationsData=response.presentations.map((item: any) => item.properties).slice().reverse();
          this.folders = response.folders.map((item: any) => item.properties);
          this.folders1 = response.folders.map((item: any) => item.properties);
          if(this.activeView == 'listview'){
          this.activefolderView = 'presentationsDatalist';
        }else{
          this.activefolderView = 'presentationsDatagrid';
        }
        },
        (error: any) => {
          console.error('API call error:', error);
        }
      );
      const message = getMessage(SuccessMessages.PresentationSection2000,SuccessMessages.Presentation2002); 
      this._toastr.success(`${message}`, "", {
        enableHtml: true,
        timeOut: 5000 
      });
      },

      (error) => {
       const message = getErrorMessage(ErrorMessages.PresentationSection2000,ErrorMessages.Presentation2002); 
       this._toastr.error(message, "", {
       timeOut: 5000,
       }); 
      }
    );
  }
  setSortOption(option: string) {
    this.sortOption = option;
    
    switch (option) {
      case 'alphabetical':
        this.isNameAscending = true;
        this.sortByName();
        this.sortOptionLabel = 'Alphabetical';
        break;
      case 'alphabeticalReversed':
        this.isNameAscending = false;
        this.sortByName();
        this.sortOptionLabel = 'Alphabetical (reversed)';
        break;
      case 'oldestFirst':
        this.sortByCreatedDate();
        this.sortOptionLabel = 'Recently Created';
        break;
      default:
        this.sortByUpdatedDate();
        this.sortOptionLabel = 'Recently Updated';
        break;
    }
    this.isSortDropdownOpen = false;
  }
  
  sortByName() {
    this.folders.sort((a, b) => {
      const nameA = a.folderName.toLowerCase();
      const nameB = b.folderName.toLowerCase();
      return this.isNameAscending ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
  
    this.presentation.sort((a, b) => {
      const nameA = a.presentationName.toLowerCase();
      const nameB = b.presentationName.toLowerCase();
      return this.isNameAscending ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
  }
  
  sortByCreatedDate() {
    this.folders.sort((a, b) => {
      const dateA = new Date(a.CreatedDateTime).getTime();
      const dateB = new Date(b.CreatedDateTime).getTime();
      return dateB - dateA;
    });
  
    this.presentation.sort((a, b) => {
      const dateA = new Date(a.CreatedDateTime).getTime();
      const dateB = new Date(b.CreatedDateTime).getTime();
      return dateB - dateA;
    });
  }
  
  sortByUpdatedDate() {
    this.folders.sort((a, b) => {
      const dateA = new Date(a.UpdatedDateTime || a.CreatedDateTime).getTime();
      const dateB = new Date(b.UpdatedDateTime || b.CreatedDateTime).getTime();
      return dateB - dateA;
    });
  
    this.presentation.sort((a, b) => {
      const dateA = new Date(a.UpdatedDateTime || a.CreatedDateTime).getTime();
      const dateB = new Date(b.UpdatedDateTime || b.CreatedDateTime).getTime();
      return dateB - dateA;
    });
  }
MovoteteamSpace(presentationId:any): void {
  const id=this.teamid;
  this._presentationservice.Movetoteamspace(id,presentationId).subscribe(
    (response:any) => {
      this.GetAllPresentationWithDate();
      this.teamservice.setPresentationData(response);
    //   const message = getMessage(SuccessMessages.TeamSection8000,SuccessMessages.TeamSection8001);
    // this._toastr.success(`${message}`, "", {
    //   timeOut: 5000,
    // });
  },
    (error: any) => {
      this._toastr.error(error, "", {
        timeOut: 15000,
      });
     // console.error('Error deleting presentation:', error);
    }
  );
}

hideDiv() {
  const elements = {
    search: document.getElementById('search'),
    ascendingName: document.getElementById('ascending-name'),
    descendingName: document.getElementById('descending-name'),
    ascendingDate: document.getElementById('ascending-date'),
    descendingDate: document.getElementById('descending-date'),
    dashboardLeftSec: document.getElementById('dashboard-left-sec')
  };

  if (elements.search) elements.search.style.display = "none";
  if (elements.ascendingName) elements.ascendingName.style.display = "none";
  if (elements.descendingName) elements.descendingName.style.display = "none";
  if (elements.ascendingDate) elements.ascendingDate.style.display = "none";
  if (elements.descendingDate) elements.descendingDate.style.display = "block";
  if (elements.dashboardLeftSec) elements.dashboardLeftSec.style.width = "100%";
}

showDiv() {
  const elements = {
    search: document.getElementById('search'),
    ascendingName: document.getElementById('ascending-name'),
    descendingName: document.getElementById('descending-name'),
    ascendingDate: document.getElementById('ascending-date'),
    descendingDate: document.getElementById('descending-date'),
    dashboardLeftSec: document.getElementById('dashboard-left-sec')
  };

  if (elements.search) elements.search.style.display = "block";
  if (elements.ascendingName) elements.ascendingName.style.display = "block";
  if (elements.descendingName) elements.descendingName.style.display = "block";
  if (elements.ascendingDate) elements.ascendingDate.style.display = "block";
  if (elements.descendingDate) elements.descendingDate.style.display = "none";
  if (elements.dashboardLeftSec) elements.dashboardLeftSec.style.width = "75%";
}
presentThePresentation(id:string,activeslideId:string){
  this.workSpaceService.storeActiveSlideDetails();
 // localStorage.setItem('presentationId',id);
  //localStorage.setItem('activeSlideId',activeslideId);
  this.workSpaceService.activeSlideId = activeslideId;
  this.workSpaceService.presentationId = id;
  this.workSpaceSignalRService.stopConnection();
  //this._router.navigateByUrl('WorkSpace/presentation');
  this.workSpaceService.setMyPresentToPresent(true);
  const url = 'WorkSpace/presentation';
  const queryParams = { id: id };
  
  this.router.navigate([url], { queryParams });
  
  this.workSpaceSignalRService.callSignalR();
}
viewResult(id:string,activeslideId:string): string | any[]{
  if(this.customerPlan?.view_result){
   // localStorage.setItem('presentationId',id);
    //localStorage.setItem('activeSlideId',activeslideId);
    this.workSpaceService.activeSlideId = activeslideId;
    this.workSpaceService.presentationId = id;
    this._router.navigateByUrl('/presentation/' + id + '/view-results');
    return [];
  }
}
currentFolderCall(folderId:any){
  this._presentationservice.GetCurrentFolder(folderId).subscribe(
    (response:string) => {
      const savedBreadcrumbs = localStorage.getItem('breadcrumbs');
      if (savedBreadcrumbs) {
        this.breadcrumbs = JSON.parse(savedBreadcrumbs);
        this.clickedIndex = this.breadcrumbs.length - 1;
      }
      this.hideDiv();
      this.FolderClick(folderId,response);
  });
    //var folderName = localStorage.getItem('currentFolderName');
 }
// toggleMenuPosition(itemId: string) {
//   const menuElement = document.getElementById(`presentation-${itemId}`) as HTMLElement;
//   if (!menuElement) return;
//   const arrowElement = document.querySelector(`.presentation-arrow`) as HTMLElement;
//   const viewportHeight = window.innerHeight;
//   const menuRect = menuElement.getBoundingClientRect();
//   const spaceBelow = viewportHeight - menuRect.bottom;
//   const spaceAbove = menuRect.top;
//   if (spaceBelow < menuElement.offsetHeight && spaceAbove > menuElement.offsetHeight) {
//     menuElement.style.top = 'auto';
//     menuElement.style.transform = 'translateY(-70%)';
//     arrowElement.style.top = '80%';
//   } else {
//     menuElement.style.transform = 'translateY(0)';
//   }

//   menuElement.classList.add('show'); 
//   }

toggleMenuPosition(itemId: string,i:number) {
  const menuElement = document.getElementById(`presentation-${itemId}`) as HTMLElement;
  if (!menuElement) return;
  const arrowElement = document.querySelector(`.presentation-arrow`) as HTMLElement;
  if (!arrowElement) return;

  const viewportHeight = window.innerHeight;
  const menuRect = menuElement.getBoundingClientRect();
  const spaceBelow = viewportHeight - menuRect.bottom;
  const spaceAbove = menuRect.top;
  const isPageScrolledToBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight;
  const isPageScrolledToTop = window.scrollY === 0;

  if (i>2 && !isPageScrolledToTop && (spaceBelow < menuElement.offsetHeight && spaceAbove > menuElement.offsetHeight)) {
    menuElement.style.top = 'auto';
    menuElement.style.transform = 'translateY(-83%)';
    arrowElement.style.top = '92%';
  } else if (isPageScrolledToTop || i == 0) {
    menuElement.style.top = '0';
    menuElement.style.transform = 'translateY(0%)';
    arrowElement.style.top = '9%';
  } else {
    menuElement.style.transform = 'translateY(-40%)';
    arrowElement.style.top = '50%';
  }

  menuElement.classList.add('show');
}



storeTemplate($event:any): void {
  if($event){
    $('#createTemplate').modal('hide');
    this._router.navigate(['/app/templates'], { queryParams: { isPublished: false,selectedCategory:"All Templates" } });
  }
  else{
    return;
  }
}
// clearTemplateForm(){
//   this.templateForm.reset(); 
//   this.templateForm.controls['Type'].setValue(''); 
//   this.templateForm.controls['CategoryName'].setValue('');
//   this.templateForm.controls['Description'].setValue('');
//   this.selectCategory = "";
// }
onScroll(event: any) {
  const element = event.target;
  const atBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 600;
   
  if (atBottom && !this.isLoading && !this.allDataLoaded) {
    this.GetAllPresentationScroll();
  }
}

GetAllPresentationScroll() {
  if (this.isLoading || this.allDataLoaded) return;

  const expectedDataLength = this.pageNumber * this.pageSize;
  if (expectedDataLength >= this.totalPresentationCount) {
    this.allDataLoaded = true;
    return;
  }

  this.isLoading = true;

  this._presentationservice.GetAllPresentationLazyload(this.pageNumber, this.pageSize, this.searchTerm).subscribe(
    (response: any) => {
      if (response.length > 0) {
        this.totalPresentationCount = response[0].totalSlides;
        const newPresentations = response[0].slides.map((item: any) => item.properties);
        const existingIds = new Set(this.presentation.map(p => p.id));
        const uniqueNewPresentations = newPresentations.filter(p => !existingIds.has(p.id));
        this.selectAll = false;
        this.selectedPresentationsForDelete = [];
        uniqueNewPresentations.forEach(p => {
          p.isSelected = false;
        });
        this.presentation = [...this.presentation, ...uniqueNewPresentations];
        this.PresentationResponse = {
          ...this.PresentationResponse,
          ...response[0],
          slides: [...this.PresentationResponse.slides || [], ...uniqueNewPresentations]
        };
        this.pageNumber++;
      }
      const expectedDataLength = this.pageNumber * this.pageSize;
      if (expectedDataLength >= this.totalPresentationCount) {
        this.allDataLoaded = true;
      }
      this.isLoading = false;
      this.isSkeleton = false;
    },
    (error) => {
      this.isLoading = false;
      console.error("Error loading presentations:", error);
    }
  );
}
toggleDropdown(dropdown: string) {
  if (dropdown === 'type') {
    this.isTypeDropdownOpen = !this.isTypeDropdownOpen;
    if (this.isCategoryDropdownOpen) {
      this.isCategoryDropdownOpen = false;
    }
  } else if (dropdown === 'category') {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
    if (this.isTypeDropdownOpen) {
      this.isTypeDropdownOpen = false; 
    }
  }
}
checkTemplate(PresentationId:string){
  const presentationId = PresentationId;
  this._presentationservice.CheckResponseBeforeTemplate(presentationId).subscribe(
    (response) => {
      if(response == true){
        this.isTemplateButtonDisabled = true;
      }else{
        this.isTemplateButtonDisabled = false;
      }
    });
}
openFolderModal(){
    if(this.customerPlan?.folder){
      $("#Folder").modal("show");
    }
}

getAllCategory(){
  this._presentationservice.getAllCategory().then((response:any)=>{
    this._presentationservice.isOnPageLoad = false;
    this.categoryList = response.filter(category => category.categoryName !== 'All Templates');
  }).finally(() => {
    this._presentationservice.isOnPageLoad = false;
  })
}
toggleView(view: string) {
  this.activeView = view;
  if (this.activeView === 'gridview') {
    this.gridSkeleton = true;
    this.hideSkeletonAfterLayout();
  }
  if (this.currentFolderId) {
    this.activefolderView = view === 'listview' ? 'presentationsDatalist' : 'presentationsDatagrid';
    this._presentationservice.FolderToFolder(this.currentFolderId).subscribe(
      (response: any) => {
        const selectedIds = this.presentation
          .filter(item => item.isSelected)
          .map(item => item.id);
        
        this.presentationsData = response.presentations.map((item: any) => item.properties).slice().reverse().map(item => ({
            ...item,
            isSelected: selectedIds.includes(item.id)
          }));
        
        this.presentation = this.presentationsData;
        this.folders = response.folders.map((item: any) => item.properties);
        this.folders1 = response.folders.map((item: any) => item.properties);
        this.selectAll = this.presentation.length > 0 && this.presentation.every(item => item.isSelected);
      },
      (error: any) => {
        console.error('Error loading folder contents:', error);
      }
    );
  } 
  else {
    this.activefolderView = '';
    const selectedIds = this.presentation
      .filter(item => item.isSelected)
      .map(item => item.id);
    
      if (!this.searchTerm) {
        this.GetAllPresentationWithDate();
        this.GetAllFolder();
      }
    
    setTimeout(() => {
      this.presentation = this.presentation.map(item => ({
        ...item,
        isSelected: selectedIds.includes(item.id)
      }));
      this.selectAll = this.presentation.length > 0 && this.presentation.every(item => item.isSelected);
    }, 100);
  }
  
  localStorage.setItem('activeView', view);
}

toggleFolderGrid() {
  this.isFolderGridVisible = !this.isFolderGridVisible;
  if (!this.isFolderGridVisible) {
      this.showAllFolders = false;
  }
}

viewAll() {
  this.showAllFolders = true;
}

showLess() {
  this.showAllFolders = false;
}

toggleSortDropdown() {
  this.isSortDropdownOpen = !this.isSortDropdownOpen;
}
presentationSortByName() {
  this.isNameAscending = !this.isNameAscending;

  this.folders.sort((a, b) => {
    const nameA = a.folderName.toLowerCase();
    const nameB = b.folderName.toLowerCase();

    if (this.isNameAscending) {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });

  this.presentation.sort((a, b) => {
    const nameA = a.presentationName.toLowerCase();
    const nameB = b.presentationName.toLowerCase();

    if (this.isNameAscending) {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });
  
}
presentationSortByDate() {
  this.isNameascending = !this.isNameascending;

  this.folders.sort((a, b) => {
    const nameA = a.CreatedDateTime.toLowerCase();
    const nameB = b.CreatedDateTime.toLowerCase();

    if (this.isNameascending) {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });

  this.presentation.sort((a, b) => {
    const nameA = a.CreatedDateTime.toLowerCase();
    const nameB = b.CreatedDateTime.toLowerCase();

    if (this.isNameascending) {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });
  
}
ngOnChanges(changes: SimpleChanges) {
  // if (changes['templateList']) {
  //   const currentValue = changes['templateList'].currentValue;
  //   if (currentValue && currentValue.length > 0) {
  //     setTimeout(() => {
  //       // this.waitForViewChildren();
  //     });
  //   }
  // }
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
  image.classList.remove('landscape', 'portrait');
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
  this.isChartVisible = true; 
}
getQuestionData(slideData: any): string {
  if (!slideData?.slides[0]?.slideContentData) {
    return '';
  }
  return this.workSpaceService.changeQuestionDataFormat(slideData?.slides[0]?.slideContentData);
}
getItemById(id: any) {
  return this.userPresentation?.find(item => item.id === id);
}
private hideSkeletonAfterLayout() {
  setTimeout(() => {
    if (this.checkViewChildrenReady()) {
      this.setScaleForLayout();
      this.gridSkeleton = false;
    } else {
      const observer = new MutationObserver((mutations, obs) => {
        if (this.checkViewChildrenReady()) {
          this.setScaleForLayout();
          this.gridSkeleton = false;
          obs.disconnect();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        this.gridSkeleton = false;
      }, 2000);
    }
  });
}
}
