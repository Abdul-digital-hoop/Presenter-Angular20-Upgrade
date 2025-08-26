import { Component, OnInit, Input, ViewChildren, QueryList, ElementRef, SimpleChanges, ViewChild, HostListener, OnChanges } from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { MypresentationsService } from '../Service/mypresentations.service';
import { MasterSlideTypeName } from 'src/app/utility/constants';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerPlanService } from 'src/app/core/Sevices/CustomerPlan/customer-plan.service';
import { CustomerLimitationsCount, CustomerPlan } from 'src/app/core/Models/customer-plan.model';
import { ToastrService } from 'ngx-toastr';
import { ErrorMessages, SuccessMessages } from 'src/app/core/SuccessResponse';
import { getErrorMessage, getMessage } from 'src/app/core/SuccessMessageHandler';
import { Router } from '@angular/router';
import { SlideType } from 'src/app/utility/MasterConstants';
import { TrashServiceService } from 'src/app/trash-service.service';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { environment } from 'src/environments/environment';
import { AccountService } from 'src/app/core/Sevices/account.service';
import { Profile } from 'src/app/core/Models/profile.model';
declare var $: any;
declare const _IntegrationMediumZoom: boolean;
declare const zoomSdk: any;
@Component({
    selector: 'app-mypresentation-gridview',
    templateUrl: './mypresentation-gridview.component.html',
    styleUrls: ['./mypresentation-gridview.component.scss'],
    standalone: false
})
export class MypresentationGridviewComponent implements OnInit, OnChanges {
  public profile: Profile;
  @Input() presentations: any[];
  @Input() mainFolders: any[];
  @Input() subFolders: any[];
  showAllFolders: boolean = false;
  masterSlideTypeName = MasterSlideTypeName;
  showPdf: boolean = false;
  slidePdfImage: any;
  isCreateTemplateModal: boolean = false;
  isChartVisible: boolean = false;
  panelWidth: string = "890px";
  panelHeight: string = "500px";
  isLoading: boolean = false;
  @ViewChildren('CenterPanel') CenterPanel!: QueryList<ElementRef>;
  @ViewChildren('InnerScreen') InnerScreen!: QueryList<ElementRef>;
  @ViewChildren('OuterScreen') OuterScreen!: QueryList<ElementRef>;
  @ViewChildren('slideImage') slideImages: QueryList<ElementRef<HTMLImageElement>>;
  presentationId: string;
  activeSlideId: string;
  presentationName: string;
  isFolderGridVisible: boolean = true;
  isSortDropdownOpen = false;
  isNameAscending: boolean = false;
  isNameascending: boolean = true;
  sortOptionLabel: string = 'Recently updated';
  sortOption: string = 'recentlyUpdated';
  openFolderMenuId: number | null = null;
  openPresentationMenuId: number | null = null;
  selectedFolderId: string | null = null;
  currentFolderNameInHeader: string = '';
  currentFolderIdInHeader: string = '';
  showMenu: boolean = false;
  submitted: boolean = false;
  renameFolderForm: FormGroup;
  deleteFolderId: string;
  renamePresentationForm: FormGroup;
  customerLimitationCount: CustomerLimitationsCount;
  customerPlan: CustomerPlan;
  currentPresId: string;
  currentPresName: string;
  selectedItem: string = null;
  presentationnames: string = '';
  selectedFolder: string;
  foldermovehere: string;
  lastid: string;
  allFoldersWithLogos: any[] = [];
  userPresentation: any[] = [];
  selectedFolderDetails: any[] = [];
  movepresentaionname: any[] = [];
  selectedPresentationId: string | null = null;
  arrowLeft: number = 0;
  arrowTop: number = 0;
  openMenu: { id: any, x: number, y: number, item: any } | null = null;
  categoryList: any;
  popularFeatures: string[] = [];
  isDropdownOpen = false;
  selectedItemIndex: number | null = null;
  selectedslideList: any = [];
  isTemplateButtonDisabled: boolean = false;
  selectPresentationId: string;
  selectedSourceFolder: any = null;
  selectedDestinationFolder: any = null;
  foldermove: any = null;
  isMoveFolderDisable: boolean = false;
  moveFolderResponse: any[] = [];
  previousFolderId: any = null;
  IntegrationMediumZoom: boolean = _IntegrationMediumZoom;
  @ViewChild('popupMenu') popupMenu: ElementRef;
  currentFolderDepth: number = 0;
  maxFolderDepth: number = 3;
  folderDepthHistory: number[] = [];
  private boundScrollHandler: () => void;
  dynamicContentElement: any;
  private availableFolders: any[] = [];
  constructor(public workSpaceService: WorkspaceService, public _mypresentationsService: MypresentationsService,
    public customerPlanService: CustomerPlanService, private _formBuilder: FormBuilder,
    private _toastr: ToastrService, private router: Router, private trashServiceService: TrashServiceService,
    private _presentationservice: PresentationService, private _accountservice: AccountService) {
    this.customerLimitationCount = this.customerPlanService.getCustomerLimitationsCounts();
    this.customerPlan = this.customerPlanService.getCustomerPlan();
  }

  ngOnInit(): void {
    this._accountservice.UserProfile.subscribe((userData) => {
      this.profile = userData;
    });
    this.renameFolderForm = this._formBuilder.group({
      folderName: ['', [Validators.required, Validators.maxLength(100)]]
    });
    this.renamePresentationForm = this._formBuilder.group({
      presentationId: [''],
      newPresentationName: ['', [Validators.required, Validators.maxLength(100)]]
    });
    this.sortOption = this._mypresentationsService.getCurrentSortOption() || 'recentlyUpdated';
    this.sortOptionLabel = this._mypresentationsService.getCurrentSortOptionLabel();
    this.staticDropdown();
    this.getCategory();
    this.boundScrollHandler = this.onDocumentScroll.bind(this);
    document.addEventListener('scroll', this.boundScrollHandler);
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
      this.InCollaborate();
    }
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
    if (changes['presentations']) {
      const currentValue = changes['presentations'].currentValue;
      if (currentValue && currentValue.length > 0) {
        const prev = changes['presentations'].previousValue || [];
        const prevIds = new Set(prev.map((p: any) => p.id));
        
        const presentationsWithSlides: any[] = [];
        const presentationsWithoutSlides: any[] = [];
        
        for (const item of currentValue) {
          if (!prevIds.has(item.id)) {
            item.isChartVisible = false;
            
            if (item?.slides && item.slides.length > 0 && item.slides[0]?.slideTypeImage != null) {
              presentationsWithSlides.push(item);
            } else {
              presentationsWithoutSlides.push(item);
            }
          }
        }
        
        for (const item of presentationsWithoutSlides) {
          item.isChartVisible = true;
        }
        
        if (presentationsWithSlides.length > 0) {
          setTimeout(() => {
            this.waitForViewChildren();
          });
        } else {
          setTimeout(() => {
            this.waitForViewChildren();
          });
        }
      }
    }
    if (changes['mainFolders'] && changes['mainFolders'].currentValue) {
      this.availableFolders = changes['mainFolders'].currentValue;
    }
    this.sortOption = this._mypresentationsService.getCurrentSortOption() || 'recentlyUpdated';
    this.sortOptionLabel = this._mypresentationsService.getCurrentSortOptionLabel();
  }
  ngOnDestroy() {
    document.removeEventListener('scroll', this.boundScrollHandler);
  }
  onDocumentScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= documentHeight - 200 && !this._mypresentationsService.isInSubFolder) {
      this.loadMorePresentations();
    }
  }
  onScroll() {
    this.onDocumentScroll();
  }
  private waitForViewChildren(retryCount = 0) {
    const maxRetries = 3;
    if (this.checkViewChildrenReady()) {
      this.setScaleForLayout();
    } else if (retryCount < maxRetries) {
      setTimeout(() => {
        this.waitForViewChildren(retryCount + 1);
      }, 100);
    } else {
      if (this.presentations) {
        for (const item of this.presentations) {
          if (item.isChartVisible === false) {
            item.isChartVisible = true;
          }
        }
      }
    }
  }
  private checkViewChildrenReady(): boolean {
    return !!(this.CenterPanel?.length > 0 &&
      this.InnerScreen?.length > 0 &&
      this.OuterScreen?.length > 0);
  }
  getMasterLayoutData(id: any) {
    var layout = this.workSpaceService.getMasterLayoutData(id);
    return layout?.layoutType;
  }
  loadBGLayout(slideType: any, imageURL: any) {
    if (slideType === this.masterSlideTypeName.ImportDocument) {
      //this.activePptImage = false;
      this.showPdf = true;
      this.slidePdfImage = imageURL;
      this.slideImages.forEach(image => this.checkImageOrientation(image.nativeElement));
    } else {
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
        innerElement.style.width = innerWidth * scale;
        innerElement.style.height = INNERHEIGHT * scale;
        outerElement.style.width = innerWidth * scale;
        outerElement.style.height = INNERHEIGHT * scale;
      }
    });
    
    setTimeout(() => {
      if (this.presentations) {
        for (const item of this.presentations) {
          if (item.isChartVisible === false) {
            item.isChartVisible = true;
          }
        }
      }
    }, 200);
  }
  getQuestionData(slideData: any): string {
    if (!slideData?.slides[0]?.slideContentData) {
      return '';
    }
    return this.workSpaceService.changeQuestionDataFormat(slideData?.slides[0]?.slideContentData);
  }
  truncateText(text: string, limit: number): string {
    if (text.length <= limit) {
      return text;
    } else {
      return text.substring(0, limit) + '...';
    }
  }
  handlePresentationClick(presentation: any): void {
    if (this.IntegrationMediumZoom ) {
      if(presentation.slides.length > 0){
        this.startCollaborate(presentation.id, presentation.activeSlideId);
        return;
      }
      return;
    }
    const presentationData = {
      presentationMode: presentation.presentationMode,
      presentationId: presentation.id,
      activeSlideId: presentation.activeSlideId,
      presentationName: presentation.presentationName,
      presentedDateTime: presentation.presentedDateTime,
      folderId: this._mypresentationsService.activeFolderId
    };

    if (presentation.presentationMode) {
      this.presentationId = presentation.id;
      this.activeSlideId = presentation.activeSlideId;
      this.presentationName = presentation.presentationName;
      $('#presentationMode-To-Open').modal('show');
    } else {
      this._mypresentationsService.handlePresentationOpen(presentationData);
    }
  }

  confirmOpenPresentation(): void {
    const presentationData = {
      presentationMode: false,
      presentationId: this.presentationId,
      activeSlideId: this.activeSlideId,
      presentationName: this.presentationName,
      presentedDateTime: null,
      folderId: this._mypresentationsService.activeFolderId
    };

    this._mypresentationsService.handlePresentationOpen(presentationData);
    $('#presentationMode-To-Open').modal('hide');
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
  setSortOption(option: string) {
    this._mypresentationsService.clearSelection();
    this.sortOption = option;
    if (option === 'oldestFirst') {
      this.sortOptionLabel = 'Recently created';
      this._mypresentationsService.updateSorting('CreatedDateTime', 'desc', option);
    } else {
      const sortParams = this._mypresentationsService.getSortParameters(option);

      switch (option) {
        case 'alphabetical':
          this.sortOptionLabel = 'Alphabetical';
          break;
        case 'alphabeticalReversed':
          this.sortOptionLabel = 'Alphabetical (reversed)';
          break;
        case 'recentlyUpdated':
          this.sortOptionLabel = 'Recently updated';
          break;
        default:
          this.sortOptionLabel = 'Recently updated';
          break;
      }
      this._mypresentationsService.updateSorting(sortParams.sortBy, sortParams.sortOrder, option);
    }

    this.isSortDropdownOpen = false;
  }

  sortByName() {
    this.presentations.sort((a, b) => {
      const nameA = a.presentationName.toLowerCase();
      const nameB = b.presentationName.toLowerCase();
      return this.isNameAscending ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
  }

  toggleFolderMenu(event: Event, folder: any): void {
    event.stopPropagation();

    if (this.mainFolders && Array.isArray(this.mainFolders)) {
      this.mainFolders.forEach(f => {
        if (f.id !== folder.id) {
          f.showMenu = false;
        }
      });
    }
    if (this.subFolders && Array.isArray(this.subFolders)) {
      this.subFolders.forEach(f => {
        if (f.id !== folder.id) {
          f.showMenu = false;
        }
      });
    }
    if (this.openFolderMenuId === folder.id && folder.showMenu) {
      folder.showMenu = false;
      this.openFolderMenuId = null;
      this.currentFolderNameInHeader = folder.folderName;
    } else {
      folder.showMenu = true;
      this.openFolderMenuId = folder.id;
      this.selectedFolderId = folder.id;
      this.currentFolderNameInHeader = folder.folderName;
    }
    if (this.presentations && Array.isArray(this.presentations)) {
      this.presentations.forEach(p => p.showMenu = false);
    }
    this.openPresentationMenuId = null;
  }
  @HostListener('window:click', ['$event'])
  onWindowClick(event: MouseEvent) {
    this.closeAllpopup();
  }
  @HostListener('document:mousedown', ['$event'])
  onDocumentMouseDown(event: MouseEvent) {
    if (this.openMenu && this.popupMenu) {
      if (!this.popupMenu.nativeElement.contains(event.target)) {
        this.openMenu = null;
      }
    }
  }
  closeAllpopup() {
    if (this.mainFolders && Array.isArray(this.mainFolders)) {
      this.mainFolders.forEach(folder => folder.showMenu = false);
    }
    if (this.subFolders && Array.isArray(this.subFolders)) {
      this.subFolders.forEach(folder => folder.showMenu = false);
    }
    this.presentations.forEach(presentation => presentation.showMenu = false);
    this.openPresentationMenuId = null;
    this.openFolderMenuId = null;
    this.openMenu = null;
  }
  renameFolder(folder: any): void {
    this.submitted = true;
    this.currentFolderNameInHeader = folder.folderName;
    this.selectedFolderId = folder.id;

    $('#folder-mobile').modal('hide');
    $('#Renamefolder').modal('show');
    this.renameFolderForm.patchValue({
      folderName: this.currentFolderNameInHeader
    });
  }

  updateRenameFolder(): void {
    if (this.renameFolderForm.invalid) {
      return;
    }
    let folderName = this.renameFolderForm.get('folderName').value.trim();
    if (!folderName || this.currentFolderNameInHeader === folderName) {
      if (folderName === "") {
        $('#Renamefolder').modal('show');
        return;
      }
      $('#Renamefolder').modal('hide');
      return;
    }
    this.isLoading = true;
    this._mypresentationsService.handleFolderRename(this.selectedFolderId, folderName)
      .subscribe({
        next: () => {
          this.renameFolderForm.reset();
          this.submitted = false;
          this.isLoading = false;
          $('#Renamefolder').modal('hide');
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  cancelRenameFolder(): void {
    this.renameFolderForm.reset();
    this.submitted = false;
    $('#Renamefolder').modal('hide');
  }
  showDeleteConfirmationDialog(folderId: string): void {
    this.deleteFolderId = folderId;
    const folder = this.mainFolders.find(f => f.id === folderId);
    if (folder) {
      folder.showMenu = false;
    }
    $('#FolderDelete').modal('show');
  }
  deleteFolder(): void {
    if (!this.deleteFolderId) return;
    this.isLoading = true;
    this._mypresentationsService.handleFolderDeletion(this.deleteFolderId).subscribe({
      next: () => {
        $('#FolderDelete').modal('hide');
        this.isLoading = false;
      },
      error: () => {
        const folder = this.mainFolders.find(f => f.id === this.deleteFolderId);
        if (folder) {
          folder.showMenu = true;
        }
      }
    });
  }
  getItem(id: string) {
    return this.presentations.find(item => item.id === id);
  }
  closeModal() {
    $('#FolderDelete').modal('hide');
  }
  preventKeyScroll = (e: KeyboardEvent) => {
    const keys = ['ArrowUp', 'ArrowDown', 'Space', 'PageUp', 'PageDown', 'Home', 'End'];
    if (keys.includes(e.code)) {
      e.preventDefault();
    }
  };
  preventScroll = (e: Event) => {
    e.preventDefault();
  };
  renamePresentation(id: string, name: string) {
    this.currentPresId = id;
    this.currentPresName = name;
    $('#presentations-mobile').modal('hide');
    $('#presentation-mobile').modal('hide');
    $('#renamePresentation').modal('show');
    this.renamePresentationForm.patchValue({
      presentationId: id,
      newPresentationName: name
    });
  }
  updatePresentation() {
    if (this.renamePresentationForm.invalid) {
      return;
    }
    const presentationName = this.renamePresentationForm.get('newPresentationName').value.trim();
    if (!presentationName || presentationName === this.currentPresName) {
      this.renamePresentationForm.get('newPresentationName').markAsTouched();
      if (presentationName === "") {
        return;
      }
      $('#renamePresentation').modal('hide');
      return;
    }
    this.isLoading = true;
    this._mypresentationsService.handlePresentationRename(this.currentPresId, presentationName, this.presentations)
      .subscribe({
        next: () => {
          this.isLoading = false;
          $('#renamePresentation').modal('hide');
          this.renamePresentationForm.reset();
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }
  handleDuplicatePresentation() {
    if (this.openMenu && this.openMenu.item) {
      const item = this.getItem(this.openMenu.item.id);
      if (item?.slides && item.slides.length > 0 && this.customerLimitationCount?.balancePresentationLimit > 0) {
        this.duplicatePresentation(this.openMenu.id);
      }
      this.openMenu = null;
    }
  }
  duplicatePresentation(id: string) {
    if (this.customerLimitationCount?.balancePresentationLimit > 0) {
      const folderId = this._mypresentationsService.isInSubFolder ? this._mypresentationsService.activeFolderId : null;
      const data = { presentationId: id, folderId: folderId };
      this._mypresentationsService.duplicatePresentation(data).subscribe(
        (response: any) => {
          this.customerLimitationCount.balancePresentationLimit -= 1;
          if (response) {
            const newPresentation = {
              ...response,
              id: response.id || response.presentationId
            };
            this.presentations.unshift(newPresentation);
          }
          const message = getMessage(SuccessMessages.PresentationSection2000, SuccessMessages.Presentation2002);
          this._toastr.success(`${message}`, "", { enableHtml: true, timeOut: 5000 });
        },
        (error) => {
          const message = getErrorMessage(ErrorMessages.PresentationSection2000, ErrorMessages.Presentation2002);
          this._toastr.error(message, "", { timeOut: 5000 });
        }
      );
    }
  }
  openSlideOneRemote(presentationId: string, activeSlideId: string): void {
    if (this.customerPlan?.remote) {
      this.workSpaceService.activeSlideId = activeSlideId;
      this.workSpaceService.presentationId = presentationId;
      const url = `/WorkSpace/remote?id=${presentationId}`;
      window.location.href = url;
    }
  }
  openSelectFolderModal(item: any) {
    this.selectedItem = item.id;
    this.presentationnames = item.presentationName;
    this.selectedFolder = null;
    this.foldermovehere = null;
    this.lastid = null;

    let allFoldersWithLogos = [];
    if (this.availableFolders && this.availableFolders.length > 0) {
      allFoldersWithLogos = this.availableFolders;
    } else if (this._mypresentationsService.mainFolders && this._mypresentationsService.mainFolders.length > 0) {
      allFoldersWithLogos = this._mypresentationsService.mainFolders;
    } else if (this.mainFolders && this.mainFolders.length > 0) {
      allFoldersWithLogos = this.mainFolders;
    }

    this.allFoldersWithLogos = allFoldersWithLogos;
    this.userPresentation = this._mypresentationsService.presentations || [];

    if (!allFoldersWithLogos || allFoldersWithLogos.length === 0) {
      this._mypresentationsService.getFolderContents().subscribe({
        next: (response: any) => {
          if (response && response.data && response.data.item && response.data.item.length > 0) {
            this.allFoldersWithLogos = response.data.item.map(folder => ({
              id: folder.properties.id,
              folderName: folder.properties.folderName,
              folderLogo: folder.properties.folderLogo,
            }));
            $('#SelectFolderModal').modal('show');
          } else {
            this._toastr.warning('No folders found. Create one to move your presentation.', '', { timeOut: 5000 });
          }
        },
        error: (error) => {
          this._toastr.warning('No folders found. Create one to move your presentation.', '', { timeOut: 5000 });
        }
      });
    } else {
      $('#SelectFolderModal').modal('show');
    }
  }

  moveAndShowSubfolders(folderId: string) {
    this.foldermovehere = folderId;
    this.selectedFolder = folderId;
    this._mypresentationsService.getSubFolderDetails(folderId).subscribe(
      (folderDetails: any) => {
        this.selectedFolderDetails = folderDetails.folders || [];
        this.movepresentaionname = folderDetails.presentations || [];
        this.lastid = folderId;
        $('#SelectFolderModal').modal('hide');
        $('#fourthModal').modal('show');
      },
      (error) => {
        this._toastr.error(error, "", { timeOut: 5000 });
      }
    );
  }

  goBackToFirstModal2() {
    $('#fourthModal').modal('hide');
    $('#SelectFolderModal').modal('show');
    this.currentFolderDepth = 0;
  }

  cancelMovefolderToPresentation2(): void {
    this.selectedFolder = null;
    $('#SelectFolderModal').modal('hide');
  }

  cancelMovefolderToPresentation3(): void {
    this.selectedFolder = null;
    $('#fourthModal').modal('hide');
  }

  movePresentationToFolder(folderId: string) {
    const presentationId = this.selectedItem;
    if (presentationId) {
      this._mypresentationsService.PresentationMovedToFolder(folderId, presentationId).subscribe(
        (response: any) => {
          this._toastr.success('Presentation moved successfully!', '', { timeOut: 3000 });
          $('#fourthModal').modal('hide');
          $('#SelectFolderModal').modal('hide');

          const destinationFolder = this._mypresentationsService.mainFolders.find(f => f.id === folderId) ||
            this._mypresentationsService.subFolders.find(f => f.id === folderId);
          if (destinationFolder) {
            destinationFolder.presentationid_count = (destinationFolder.presentationid_count || 0) + 1;
          }

          if (this._mypresentationsService.isInSubFolder && this._mypresentationsService.activeFolderId) {
            const sourceFolder = this._mypresentationsService.subFolders.find(f => f.id === this._mypresentationsService.activeFolderId) ||
              this._mypresentationsService.mainFolders.find(f => f.id === this._mypresentationsService.activeFolderId);
            if (sourceFolder && sourceFolder.presentationid_count > 0) {
              sourceFolder.presentationid_count -= 1;
            }
          }

          if (folderId) {
            const presentationIndex = this._mypresentationsService.presentations.findIndex(p => p.id === presentationId);
            if (presentationIndex > -1) {
              this._mypresentationsService.presentations.splice(presentationIndex, 1);
            }
          } else {
            this._mypresentationsService.getPresentationFolders(
              this._mypresentationsService.pageNumber,
              this._mypresentationsService.pageSize,
              this._mypresentationsService.searchTerm
            );
          }
        },
        (error) => {
          this._toastr.error('Failed to move presentation.', '', { timeOut: 5000 });
        }
      );
    } else {
      this._toastr.error('Presentation ID or Folder ID is undefined.', '', { timeOut: 5000 });
    }
  }
  showDeletePresentationDialog(presentationId: string): void {
    this.selectedPresentationId = presentationId;
    $('#presentations-mobile').modal('hide');
    $('#presentation-mobile').modal('hide');
    $('#presentationDelete').modal('show');
  }

  deletePresentation(): void {
    if (!this.selectedPresentationId) return;

    this.isLoading = true;
    this._mypresentationsService.handlePresentationDeletion(this.selectedPresentationId, this.presentations)
      .subscribe({
        next: () => {
          this.isLoading = false;
          $('#presentationDelete').modal('hide');
          this.selectedPresentationId = null;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }
  openFolderDeletePresentation(id: string, presentationName: string) {
    this.selectedItem = id;
    this.presentationName = presentationName;
    this.presentationName = this.presentations.find(item => item.id === id)?.presentationName;
    $('#folderpresentationDelete').modal('show');
  }
  deleteFolderpresentation(): void {
    this.isLoading = true;
    this._mypresentationsService.folderPresentationDelete(this.selectedItem, this._mypresentationsService.activeFolderId).subscribe(
      (response: any) => {
        const index = this.presentations.findIndex(presentation => presentation.id === this.selectedItem);
        if (index !== -1) {
          this.presentations.splice(index, 1);
        }
        const folder =
          this._mypresentationsService.mainFolders.find(f => f.id === this._mypresentationsService.activeFolderId) ||
          this._mypresentationsService.subFolders.find(f => f.id === this._mypresentationsService.activeFolderId);
        const folderName = folder ? folder.folderName : '';
        this.onFolderClick(this._mypresentationsService.activeFolderId, folderName);
        $('#folderpresentationDelete').modal('hide');
        this.trashServiceService.setPresentationData(response);
        const message = getMessage(SuccessMessages.PresentationSection2000, SuccessMessages.Presentation2003);
        this._toastr.success(`${message}`,
          "", {
          timeOut: 5000,
        });
        this.isLoading = false;
      },
      (error: any) => {
        const message = getErrorMessage(ErrorMessages.PresentationSection2000, ErrorMessages.Presentation2003);
        this._toastr.error(message, "", {
          timeOut: 5000,
        });
        this.isLoading = false;
      }
    );
  }

  cancelDeletePresentation(): void {
    $('#presentationDelete').modal('hide');
    this.selectedPresentationId = null;
  }
  cancelRenamePresentation() {
    this.submitted = false;
    $('#renamePresentation').modal('hide');
    this.renamePresentationForm.reset();
  }
  togglePopupMenu(event: MouseEvent, item: any) {
    event.stopPropagation();
    this.checkTemplate(item.id);
    const folderMenu = document.getElementById('folder-menu');
    if (folderMenu) {
      folderMenu.style.display = 'none';
    }
    if (this.openMenu && this.openMenu.id === item.id) {
      this.openMenu = null;
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
      y,
      item: item
    };

    const arrowWidth = 20;
    const buttonCenterX = rect.left + rect.width / 2;

    let arrowLeft = buttonCenterX - x - arrowWidth / 2 - 25;
    arrowLeft = Math.max(10, Math.min(arrowLeft, popupWidth - arrowWidth - 10));

    let arrowTop = isFlipped ? popupHeight + 65 : 130;

    this.arrowLeft = arrowLeft;
    this.arrowTop = arrowTop;
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
    if (this.openMenu) {
      this.openMenu = null;
    }
  }
  @HostListener('window:wheel', ['$event'])
  onMouseWheel(event: WheelEvent): void {
    this.openMenu = null;
  }
  onFolderClick(folderId: string, folderName: string): void {
    this.router.navigate(['/app/mypresentations'], {
      queryParams: {
        Id: folderId,
        folderName: folderName,
        isListView: this._mypresentationsService.isListView
      }
    });
    this._mypresentationsService.searchTerm = '';
    this._mypresentationsService.clearSearchTerm();
  }
  staticDropdown() {
    this.popularFeatures = SlideType
      .filter(slide => slide.ContentType === "POPULAR")
      .map(slide => slide.Name);
    this.popularFeatures.unshift("Presentation");
  }
  createTemplate(id: string, i: any, slideCount: any) {
    if (slideCount == null) {
      this._toastr.error('Can\'t create template. No slides found.', '', {
        timeOut: 5000,
      });
      return;
    }
    this.isCreateTemplateModal = true;
    this.selectedItemIndex = i;
    if (!(this.customerLimitationCount?.templateCount >= this.customerPlan?.create_presentation_templates)) {
      this.loadSlides(i);
      $('#createTemplate').modal('show');
      this.selectPresentationId = id;
    }
    else {
      return;
    }
  }
  loadSlides(i: number) {
    this.selectedslideList = this.presentations[i]?.slides;
  }
  storeTemplate($event: any): void {
    if ($event) {
      $('#createTemplate').modal('hide');
      this.router.navigate(['/app/templates'], { queryParams: { isPublished: false, selectedCategory: "All Templates" } });
    }
    else {
      return;
    }
  }
  closeCreateTemplateModal() {
    this.isCreateTemplateModal = false;
  }
  CategoryToggleDropdown(event?: Event) {
    event?.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  getCategory() {
    this._mypresentationsService.getCategory().subscribe((response: any) => {
      this.categoryList = response;
    });
  }
  moveFolder(folder: any): void {
    folder.showMenu = false;
    this.selectedSourceFolder = folder;
    this.previousFolderId = Array.isArray(folder.folderId) && folder.folderId.length > 0 ? folder.folderId[0] : null;
    this.currentFolderDepth = Array.isArray(folder.folderId) ? folder.folderId.length : 0;
    this.folderDepthHistory = [this.currentFolderDepth];
    this.allFoldersWithLogos = this.mainFolders.map(f => ({
      id: f.id,
      folderName: f.folderName,
      folderLogo: f.folderLogo,
    }));
    this.currentFolderNameInHeader = folder.folderName;
    this.currentFolderIdInHeader = folder.id;
    this.selectedDestinationFolder = null;
    this.foldermove = null;
    $('#MoveFolder').modal('show');
  }

  Modalformovetofolder(folderId: any): void {
    const selectedFolder = this.allFoldersWithLogos.find(folder => folder.id === folderId);
    if (selectedFolder && selectedFolder.id === this.currentFolderIdInHeader) {
      return;
    }
    const newDepth = this.currentFolderDepth + 1;
    this.foldermove = folderId;
    this.selectedDestinationFolder = folderId;
    this._mypresentationsService.getSubFolderDetails(folderId).subscribe(
      (folderDetails: any) => {
        this.selectedFolderDetails = folderDetails.folders;
        this.movepresentaionname = folderDetails.presentations;
        this.lastid = folderId;
        this.currentFolderDepth = newDepth;
        this.folderDepthHistory.push(this.currentFolderDepth);
        $('#MoveFolder').modal('hide');
        $('#SecondModal').modal('show');
        if (!folderDetails.folders || folderDetails.folders.length === 0) {
          this.isMoveFolderDisable = true;
        } else {
          this.isMoveFolderDisable = false;
        }
      },
      (error) => {
        this._toastr.error('Error getting folder details', '', { timeOut: 5000 });
      }
    );
  }

  goBackToFirstModal(): void {
    $('#SecondModal').modal('hide');
    $('#MoveFolder').modal('show');
    this.currentFolderDepth = 0;
  }

  moveFolderToFolder() {
    if (this.selectedSourceFolder && this.selectedDestinationFolder) {
      if (this.previousFolderId == undefined) {
        this.previousFolderId = this.selectedSourceFolder.id;
      }
      this._mypresentationsService.FolderMoveToFolder(
        this.previousFolderId,
        this.selectedSourceFolder.id,
        this.selectedDestinationFolder
      ).subscribe(
        (response: any) => {
          this.moveFolderResponse = response.folderIds;
          let sourceIndex = this.mainFolders.findIndex(f => f.id === this.selectedSourceFolder.id);
          if (sourceIndex !== -1) {
            this.mainFolders.splice(sourceIndex, 1);
          } else {
            sourceIndex = this.subFolders.findIndex(f => f.id === this.selectedSourceFolder.id);
            if (sourceIndex !== -1) {
              this.subFolders.splice(sourceIndex, 1);
            }
          }
          const destinationFolder =
            this.mainFolders.find(f => f.id === this.selectedDestinationFolder) ||
            this.subFolders.find(f => f.id === this.selectedDestinationFolder);

          if (destinationFolder) {
            if (!destinationFolder.FolderId) {
              destinationFolder.FolderId = [];
            }
            destinationFolder.FolderId = [
              this.selectedSourceFolder.id,
              ...destinationFolder.FolderId.filter(id => id !== this.selectedSourceFolder.id)
            ];

            if (destinationFolder.subFolders) {
              destinationFolder.subFolders = [
                this.selectedSourceFolder,
                ...destinationFolder.subFolders.filter(f => f.id !== this.selectedSourceFolder.id)
              ];
            }
          }
          $('#MoveFolder').modal('hide');
          $('#SecondModal').modal('hide');
          const message = getMessage(SuccessMessages.FolderSection9000, SuccessMessages.Folder9003);
          this._toastr.success(`${message}`, '', {});
        },
        (error) => {
          const message = getErrorMessage(ErrorMessages.FolderSection9000, ErrorMessages.Folder9003);
          this._toastr.error(message, '', { timeOut: 5000 });
        }
      );
    }
  }

  moveFolderToFolder1() {
    if (this.selectedSourceFolder && this.foldermove) {
      if (this.currentFolderDepth > this.maxFolderDepth) {
        const message = getErrorMessage(ErrorMessages.FolderSection9000, ErrorMessages.Folder9001);
        this._toastr.warning(message, "", { timeOut: 5000 });
        return;
      }
      if (!this.previousFolderId) {
        this.previousFolderId = Array.isArray(this.selectedSourceFolder.folderId) && this.selectedSourceFolder.folderId.length > 0
          ? this.selectedSourceFolder.folderId[0]
          : this.selectedSourceFolder.id;
      }
      this._mypresentationsService.FolderMoveToFolder(
        this.previousFolderId,
        this.selectedSourceFolder.id,
        this.foldermove
      ).subscribe(
        (response: any) => {
          this.moveFolderResponse = response.folderIds;
          const index1 = this.mainFolders.findIndex(f => f.id === this.selectedSourceFolder.id);
          if (index1 !== -1) {
            this.mainFolders.splice(index1, 1);
          }
          this._mypresentationsService.getPresentationFolders(
            this._mypresentationsService.pageNumber,
            this._mypresentationsService.pageSize,
            this._mypresentationsService.searchTerm,
            this._mypresentationsService.sortBy,
            this._mypresentationsService.sortOrder
          );
          $('#MoveFolder').modal('hide');
          $('#SecondModal').modal('hide');
          this.currentFolderDepth = 0;
          this.folderDepthHistory = [];
          const message = getMessage(SuccessMessages.FolderSection9000, SuccessMessages.Folder9003);
          this._toastr.success(`${message}`, '', {});
        },
        (error) => {
          const message = getErrorMessage(ErrorMessages.FolderSection9000, ErrorMessages.Folder9003);
          this._toastr.error(message, '', { timeOut: 5000 });
        }
      );
    } else {

    }
  }
  cancelMovefolderToPresentation1(): void {
    this.selectedSourceFolder = null;
    this.selectedDestinationFolder = null;
    this.currentFolderDepth = 0;
    this.folderDepthHistory = [];
    $('.modal').modal('hide');
  }
  InCollaborate() {
    zoomSdk.getRunningContext().then((resolvedValue: any) => {
      if (resolvedValue && resolvedValue.context) {
        const contextValue: string = resolvedValue.context;
        if (contextValue === 'inCollaborate') {
          var element = document.getElementById('dashboardpage');
          element.style.display = 'none';
          this._mypresentationsService.zoomMeeting = true;
          var appMyPresentationsElement = document.querySelector('app-mypresentations');
          this.dynamicContentElement = appMyPresentationsElement;
          this.dynamicContentElement.style.display = 'block';
          const iframeElement = this.dynamicContentElement.querySelector('#customIframe') as HTMLIFrameElement | null;
          const urlValue = this._presentationservice.getPresentationUrl();
          setTimeout(() => {
            this.handleSuccess(urlValue);
          }, 500);
          zoomSdk.onCollaborateChange((event) => {
            if (event.action === 'end') {
              var appMyPresentationsElement = document.querySelector('app-mypresentations');
              if (appMyPresentationsElement) {
                (appMyPresentationsElement as HTMLElement).style.display = 'block';
              }

              var element2 = document.getElementById('dashboardpage');
              element2.style.display = 'block';
              this._mypresentationsService.zoomMeeting = false;
              var element = document.getElementById('dynamicContent');
              element.style.display = 'none';

              element.style.height = '100vh';
              // Set iframe to empty
              const iframeElement = document.getElementById('customIframe');
              if (iframeElement && iframeElement.parentNode) {
                iframeElement.parentNode.removeChild(iframeElement);
              }
              // var appMyPresentationsElement = document.querySelector('app-mypresentations');
              // if (appMyPresentationsElement) {
              //   (appMyPresentationsElement as HTMLElement).style.display = 'block';
              // }
              // Show app-mypresentations component again when collaboration ends
            }

          });
        }
      }
    }).catch((error: any) => {
      console.error('Error getting running context:', error);
    });
  }
  EndPresent(presentationId: any) {
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
  handleSuccess(urls: any) {
    if (this.dynamicContentElement) {
      this.dynamicContentElement.style.display = 'block';
      var element = document.getElementById('dynamicContent');
      element.style.display = 'block';
      const existingIframe = this.dynamicContentElement.querySelector('#customIframe');
      if (existingIframe) {
        existingIframe.remove(); // Remove old iframe completely
      }

      const box = this.dynamicContentElement.querySelector('#box');
      if (box) {
        const iframe = document.createElement('iframe');
        iframe.id = 'customIframe';
        iframe.src = urls;
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '9px';
        iframe.style.margin = '0 auto';  // ✅ center it inside parent
        iframe.style.display = 'block';
        iframe.allowFullscreen = true;
        iframe.allow =
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';

        box.appendChild(iframe);
      } else {
        console.error('Box container not found.');
      }

      this._presentationservice.setPresentationUrl(urls);
    } else {
      console.error('Dynamic content element not found.');
    }
  }

  startCollaborate(presentationId: string, slideId: string): void {
    const PresenterDomain = environment.PresenterDomain;
    const url = `${PresenterDomain}WorkSpace/presentation?id=${presentationId}`;
    zoomSdk.getRunningContext().then((resolvedValue: any) => {
      if (resolvedValue && resolvedValue.context) {
        const contextValue = resolvedValue.context;
        if (contextValue === 'inMeeting') {
          const meetingUUID = this._presentationservice.getMeetingUUID();

          zoomSdk.startCollaborate({ shareScreen: true }).then((response: any) => {
            zoomSdk.onCollaborateChange((event: any) => {
              if (event.action === 'start') {
                var element = document.getElementById('dashboardpage');
                element.style.display = 'none';
                this._mypresentationsService.zoomMeeting = true;
                // Set app-mypresentations component to display none
                var appMyPresentationsElement = document.querySelector('app-mypresentations');
                this.dynamicContentElement = appMyPresentationsElement;
                if (appMyPresentationsElement) {
                  (appMyPresentationsElement as HTMLElement).style.display = 'none';
                }
                setTimeout(() => {
                  this.handleSuccess(url);
                }, 500);
                //this.InsertMeeting(presentationId,slideId,meetingUUID);
              }
              if (event.action === 'end') {
                this._mypresentationsService.zoomMeeting = false;
                var element = document.getElementById('dynamicContent');
                element.style.display = 'none';

                element.style.height = '100vh';
                // Set iframe to empty
                const iframeElement = document.getElementById('customIframe');
                if (iframeElement && iframeElement.parentNode) {
                  iframeElement.parentNode.removeChild(iframeElement);
                }

                var element2 = document.getElementById('dashboardpage');
                element2.style.display = 'block';
                // var appMyPresentationsElement = document.querySelector('app-mypresentations');
                // if (appMyPresentationsElement) {
                //   (appMyPresentationsElement as HTMLElement).style.display = 'block';
                // }
                // Show app-mypresentations component again when collaboration ends
                var appMyPresentationsElement = document.querySelector('app-mypresentations');
                if (appMyPresentationsElement) {
                  (appMyPresentationsElement as HTMLElement).style.display = 'block';
                }
              }
            });
          }).catch((error: any) => {
            console.error('Error starting collaboration', error);
          });

          this.getPresDetails(presentationId, meetingUUID, slideId);
          // const userData = this._accountservice.GetUserValue();
          this.setZoomClientData(this.profile, meetingUUID);
        }
      }
    });
  }

  // toggleLogo(item: string) {
  //   if (item === 'explore') {
  //     this.isExploreVisible = true;
  //     this.isZoomVisible = false;
  //   } else {
  //     this.isExploreVisible = false;
  //     this.isZoomVisible = true;
  //   }
  // }

  // handleLogoClick() {
  //   this.isZoomVisible = true;
  // }

  InsertMeeting(PresentationId, SlideId, MeetingUUID) {
    this._presentationservice.InsertMeeting(PresentationId, SlideId, MeetingUUID).subscribe(
      (response: any) => {
      },
      (error: any) => {
        console.log(error);
      }
    )
  }
  GetPresentationId(presentationId, slideId) {
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
  updateMeeting(presentationId, PresentationCode, url) {
    const meetingUUID = this._presentationservice.getMeetingUUID();
    this._presentationservice.updateMeeting(presentationId, meetingUUID, PresentationCode, url).subscribe(
      (response: any) => {
        if (response) {
        }
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }

  getPresDetails(presentationId: string, meetingUUID: string, slideId: string) {
    var data = {
      "PresentationId": presentationId,
      "MeetingUUID": meetingUUID,
      "SlideId": slideId
    }
    this._presentationservice.getPresDetails(data)
      .subscribe((response: any) => {
      }, (error: any) => {
        console.error(error);
      });
  }
  setZoomClientData(userData: any, meetingUUID: string) {
    this._presentationservice.setZoomClientData(userData.ProfileId, userData.ProfileRole, userData.RewardId, userData.PlanId, userData.PlanName, userData.ProfileEMail, meetingUUID).subscribe(

      (response: any) => {
        if (response) {
        } else {
        }
      },
      (error: any) => {
        console.error('Error while setting meeting data', error);
      }
    );
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
      //this._router.navigate(['/presentation/new-presentation/' + id]);
    }

  }
  loadMorePresentations() {
    if (this._mypresentationsService.isLoadingMore || !this._mypresentationsService.hasMorePresentations) return;
    this._mypresentationsService.loadMorePresentations();
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
}
