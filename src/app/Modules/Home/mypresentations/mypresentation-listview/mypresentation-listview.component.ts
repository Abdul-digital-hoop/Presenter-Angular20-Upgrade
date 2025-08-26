import { Component, OnInit, Input, HostListener, ElementRef, ViewChild, Renderer2, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MypresentationsService } from '../Service/mypresentations.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { WorkSignalRServiceService } from 'src/app/core/Sevices/WorkSpace/work-signal-rservice.service';
import { CustomerPlanService } from 'src/app/core/Sevices/CustomerPlan/customer-plan.service';
import { CustomerLimitationsCount, CustomerPlan } from 'src/app/core/Models/customer-plan.model';
import { ToastrService } from 'ngx-toastr';
import { ErrorMessages, SuccessMessages } from 'src/app/core/SuccessResponse';
import { getErrorMessage, getMessage } from 'src/app/core/SuccessMessageHandler';
import { SlideType } from 'src/app/utility/MasterConstants';
import { TrashServiceService } from 'src/app/trash-service.service';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
declare var $: any;
declare const _IntegrationMediumOffice: boolean;
@Component({
  selector: 'app-mypresentation-listview',
  templateUrl: './mypresentation-listview.component.html',
  styleUrls: ['./mypresentation-listview.component.scss']
})
export class MypresentationListviewComponent implements OnInit, OnChanges {
  @Input() presentations: any[] = [];
  @Input() mainFolders: any[] = [];
  @Input() subFolders: any[] = [];
  customerPlan: CustomerPlan;
  customerLimitationCount: CustomerLimitationsCount;
  openFolderMenuId: number | null = null;
  openPresentationMenuId: number | null = null;
  deleteFolderId: string;
  isLoading: boolean = false;
  selectedFolderId: string | null = null;
  currentFolderNameInHeader: string = '';
  currentFolderIdInHeader: string = '';
  renameFolderForm: FormGroup;
  renamePresentationForm: FormGroup;
  submitted: boolean = false;
  presentationId: string;
  activeSlideId: string;
  presentationName: string;
  currentPresId: string;
  currentPresName: string;
  selectedPresentationId: string | null = null;
  isNameAscending: boolean = false;
  isNameascending: boolean = true;
  selectedItem: string = null;
  presentationnames: string = '';
  allFoldersWithLogos: any[] = [];
  selectedFolderDetails: any[] = [];
  movepresentaionname: any[] = [];
  foldermovehere: string = null;
  lastid: string = null;
  selectedFolder: string = null;
  userPresentation: any[] = [];
  IsHovered: boolean[] = [];
  Hovered: boolean[] = [];
  isCreateTemplateModal: boolean = false;
  selectPresentationId: string;
  isTemplateButtonDisabled: boolean = false;
  categoryList: any;
  popularFeatures: string[] = [];
  isDropdownOpen = false;
  selectedItemIndex: number | null = null;
  selectedslideList: any = [];
  selectedSourceFolder: any = null;
  selectedDestinationFolder: any = null;
  foldermove: any = null;
  isMoveFolderDisable: boolean = false;
  moveFolderResponse: any[] = [];
  previousFolderId: any = null;
  currentFolderDepth: number = 0;
  maxFolderDepth: number = 3;
  folderDepthHistory: number[] = [];
  private availableFolders: any[] = [];
  IntegrationMediumOffice: boolean = _IntegrationMediumOffice;
  constructor(private _sanitizer: DomSanitizer, public _mypresentationsService: MypresentationsService,
    private _formBuilder: FormBuilder, private _router: Router, private _workSpaceService: WorkspaceService,
    private _workSpaceSignalRService: WorkSignalRServiceService, private customerPlanService: CustomerPlanService,
    private _toastr: ToastrService, private renderer: Renderer2, private trashServiceService: TrashServiceService,
    private _presentationservice: PresentationService) {
    this.customerLimitationCount = this.customerPlanService.getCustomerLimitationsCounts();
    this.customerPlan = this.customerPlanService.getCustomerPlan();
  }

  ngOnInit(): void {
    this.renameFolderForm = this._formBuilder.group({
      folderName: ['', [Validators.required, Validators.maxLength(100)]]
    });
    this.renamePresentationForm = this._formBuilder.group({
      presentationId: [''],
      newPresentationName: ['', [Validators.required, Validators.maxLength(100)]]
    });
    const currentSortState = this._mypresentationsService.getCurrentListSortState();
    this.isNameAscending = currentSortState.isNameAscending;
    this.isNameascending = currentSortState.isDateAscending;
    this.staticDropdown();
    this.getCategory();
    document.addEventListener('scroll', this.onDocumentScroll.bind(this));
  }
  ngAfterViewInit() {
    this._mypresentationsService.updateSelectionOnPagination(this.presentations);
    this._mypresentationsService.cleanUpSelectionState();
  }

  ngOnChanges(changes: SimpleChanges) {
    const currentSortState = this._mypresentationsService.getCurrentListSortState();
    this.isNameAscending = currentSortState.isNameAscending;
    this.isNameascending = currentSortState.isDateAscending;
    if (changes['mainFolders'] && changes['mainFolders'].currentValue) {
      this.availableFolders = changes['mainFolders'].currentValue;
    }
    this._mypresentationsService.cleanUpSelectionState();
  }

  ngOnDestroy() {
    document.removeEventListener('scroll', this.onDocumentScroll.bind(this));
    this._mypresentationsService.cleanUpSelectionState();
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
  staticDropdown() {
    this.popularFeatures = SlideType
      .filter(slide => slide.ContentType === "POPULAR")
      .map(slide => slide.Name);
    this.popularFeatures.unshift("Presentation");
  }
  loadMorePresentations() {
    if (this._mypresentationsService.isLoadingMore || !this._mypresentationsService.hasMorePresentations) return;
    this._mypresentationsService.loadMorePresentations().then(() => {
      this._mypresentationsService.cleanUpSelectionState();
    });
  }
  truncateText(text: string, limit: number): string {
    if (text.length <= limit) {
      return text;
    } else {
      return text.substring(0, limit) + '...';
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
  toggleFolderMenu(event: any, folder: any) {
    event.stopPropagation();
    if (this.openFolderMenuId && this.openFolderMenuId !== folder.id) {
      const prevFolder = this.mainFolders.find(f => f.id === this.openFolderMenuId) 
        || (this.subFolders && this.subFolders.find(f => f.id === this.openFolderMenuId));
      if (prevFolder) {
        prevFolder.showMenu = false;
      }
    }
    if (this.openPresentationMenuId) {
      const prevPresentation = this.presentations.find(p => p.id === this.openPresentationMenuId);
      if (prevPresentation) {
        prevPresentation.showMenu = false;
      }
      this.openPresentationMenuId = null;
    }
    folder.showMenu = !folder.showMenu;
    this.openFolderMenuId = folder.showMenu ? folder.id : null;
  }
  togglePresentationMenu(event: any, presentation: any) {
    event.stopPropagation();
    this.checkTemplate(presentation.id);
    if (this.openPresentationMenuId && this.openPresentationMenuId !== presentation.id) {
      const prevPresentation = this.presentations.find(p => p.id === this.openPresentationMenuId);
      if (prevPresentation) {
        prevPresentation.showMenu = false;
      }
      this.openPresentationMenuId = null;
    }
    if (this.openFolderMenuId) {
      let prevFolder = this.mainFolders.find(f => f.id === this.openFolderMenuId);
      if (!prevFolder && this.subFolders) {
        prevFolder = this.subFolders.find(f => f.id === this.openFolderMenuId);
      }
      if (prevFolder) {
        prevFolder.showMenu = false;
      }
      this.openFolderMenuId = null;
    }
    presentation.showMenu = !presentation.showMenu;
    this.openPresentationMenuId = presentation.showMenu ? presentation.id : null;
    this.presentations.forEach(p => {
      if (p.id !== presentation.id && p.showMenu) {
        p.showMenu = false;
      }
    });

    if (presentation.showMenu) {
      const button = event.target as HTMLElement;
      const rect = button.getBoundingClientRect();
      const popupHeight = 260;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      presentation.menuFlipUp = spaceBelow < popupHeight && spaceAbove > popupHeight;
      presentation.menuButtonRect = rect;
    }
  }
  @HostListener('window:wheel', ['$event'])
  onMouseWheel(event: WheelEvent): void {
    this.presentations.forEach(p => p.showMenu = false);
  }
  @HostListener('window:click')
  windowClick() {
    if (this.openFolderMenuId) {
      let folder = this.mainFolders.find(f => f.id === this.openFolderMenuId) || this.subFolders.find(f => f.id === this.openFolderMenuId);
      if (folder) {
        folder.showMenu = false;
      }
      this.openFolderMenuId = null;
    }
    if (this.openPresentationMenuId) {
      let presentation = this.presentations.find(p => p.id === this.openPresentationMenuId);
      if (presentation) {
        presentation.showMenu = false;
      }
      this.openPresentationMenuId = null;
    }
    this.Hovered.fill(false);
    this.IsHovered.fill(false);
    const allHoveredElements = document.querySelectorAll('.hovered');
    allHoveredElements.forEach(element => {
      this.renderer.removeClass(element, 'hovered');
    });
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
  closeModal() {
    $('#FolderDelete').modal('hide');
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
  handlePresentationClick(presentation: any): void {
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

  openPresentation(): void {
    $('#presentationMode-To-Open').modal('hide');
    this._mypresentationsService.openPresentation({
      presentationId: this.presentationId,
      activeSlideId: this.activeSlideId,
      folderId: this._mypresentationsService.activeFolderId
    });
  }
  presentThePresentation(id: string, activeslideId: string) {
    this._workSpaceService.storeActiveSlideDetails();
    this._workSpaceService.activeSlideId = activeslideId;
    this._workSpaceService.presentationId = id;
    this._workSpaceSignalRService.stopConnection();
    this._workSpaceService.setMyPresentToPresent(true);
    const url = 'WorkSpace/presentation';
    const queryParams = { id: id };

    this._router.navigate([url], { queryParams });

    this._workSpaceSignalRService.callSignalR();
  }
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

  cancelRenamePresentation() {
    this.submitted = false;
    $('#renamePresentation').modal('hide');
    this.renamePresentationForm.reset();
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
          this._mypresentationsService.clearSelection();
          this.selectedPresentationId = null;
          this._mypresentationsService.cleanUpSelectionState();
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
    this.selectedItem
    this._mypresentationsService.folderPresentationDelete(this.selectedItem, this._mypresentationsService.activeFolderId).subscribe(
      (response: any) => {
        const index = this.presentations.findIndex(presentation => presentation.id === this.selectedItem);
        if (index !== -1) {
          this.presentations.splice(index, 1);
        }
        const folder = this._mypresentationsService.mainFolders.find(f => f.id === this._mypresentationsService.activeFolderId) ||
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
      },
      (error: any) => {
        const message = getErrorMessage(ErrorMessages.PresentationSection2000, ErrorMessages.Presentation2003);
        this._toastr.error(message, "", {
          timeOut: 5000,
        });
      }
    );
  }
  cancelDeletePresentation(): void {
    $('#presentationDelete').modal('hide');
    this.selectedPresentationId = null;
  }
  openSlideOneRemote(presentationId: string, activeSlideId: string): void {
    if (this.customerPlan?.remote) {
      this._workSpaceService.activeSlideId = activeSlideId;
      this._workSpaceService.presentationId = presentationId;
      const url = `/WorkSpace/remote?id=${presentationId}`;
      window.location.href = url;
    }
  }
  onFolderClick(folderId: string, folderName: string): void {
    this._router.navigate(['/app/mypresentations'], {
      queryParams: {
        Id: folderId,
        folderName: folderName,
        isListView: this._mypresentationsService.isListView
      }
    });
    this._mypresentationsService.searchTerm = '';
    this._mypresentationsService.clearSearchTerm();
  }
  get isAllSelected(): boolean {
    return this._mypresentationsService.isAllSelected(this.presentations);
  }

  onSelectAllChange(event: any) {
    if (event.target.checked) {
      this._mypresentationsService.selectAllCurrentPage(this.presentations);
    } else {
      this._mypresentationsService.deselectAllCurrentPage(this.presentations);
    }
    this._mypresentationsService.cleanUpSelectionState();
  }

  onPresentationCheckboxChange(id: string, event: any) {
    this._mypresentationsService.togglePresentationSelection(id);
    
    if (this._mypresentationsService.selectAllActive) {
      this._mypresentationsService.selectAllActive = false;
      this._mypresentationsService.originalSelectedPresentations.clear();
    }
  }
  presentationSortByName() {
    this._mypresentationsService.clearSelection();
    this.isNameAscending = !this.isNameAscending;
    const sortOption = this.isNameAscending ? 'alphabetical' : 'alphabeticalReversed';
    const sortParams = this._mypresentationsService.getSortParameters(sortOption);
    
    this._mypresentationsService.updateSorting(sortParams.sortBy, sortParams.sortOrder, sortOption);
  }
  presentationSortByDate() {
    this._mypresentationsService.clearSelection();
    this.isNameascending = !this.isNameascending;
    const sortOption = this.isNameascending ? 'oldestFirst' : 'newestFirst';
    const sortParams = this._mypresentationsService.getSortParameters(sortOption);
    this._mypresentationsService.updateSorting(sortParams.sortBy, sortParams.sortOrder, sortOption);
  }
  openSelectFolderModal(id: string, name: string) {
    this.selectedItem = id;
    this.presentationnames = name;
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
          
          const destinationFolder = this.allFoldersWithLogos.find(f => f.id === folderId);
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
              this._mypresentationsService.searchTerm,
              this._mypresentationsService.sortBy,
              this._mypresentationsService.sortOrder
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
  folderhover(index: number, IsHovered: boolean): void {
    this.IsHovered[index] = IsHovered;

    const rowElement = document.querySelector('.folder-container-' + index) as HTMLElement;

    if (IsHovered) {
      this.renderer.addClass(rowElement, 'hovered');

    } else {
      this.renderer.removeClass(rowElement, 'hovered');
    }
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
  createTemplate(id: string, i: any,slideCount:any) {
    if(slideCount==null){
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
  closeCreateTemplateModal() {
    this.isCreateTemplateModal = false;
  }
  storeTemplate($event: any): void {
    if ($event) {
      $('#createTemplate').modal('hide');
      this._router.navigate(['/app/templates'], { queryParams: { isPublished: false, selectedCategory: "All Templates" } });
    }
    else {
      return;
    }
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
  viewResult(id:string,activeslideId:string): string | any[]{
    if(this.customerPlan?.view_result){
      this._workSpaceService.activeSlideId = activeslideId;
      this._workSpaceService.presentationId = id;
      this._router.navigateByUrl('/presentation/' + id + '/view-results');
      return [];
    }
  }
}
