import { Component, OnInit } from '@angular/core';
import { MypresentationsService } from '../Service/mypresentations.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {  ErrorMessages, SuccessMessages } from 'src/app/core/SuccessResponse';
import { getErrorMessage, getMessage } from 'src/app/core/SuccessMessageHandler';
import { ToastrService } from 'ngx-toastr';
import { CustomerLimitationsCount, CustomerPlan } from 'src/app/core/Models/customer-plan.model';
import { CustomerPlanService } from 'src/app/core/Sevices/CustomerPlan/customer-plan.service';
declare var $: any;
declare const _IntegrationMediumZoom: boolean;
declare const _IntegrationMediumOffice: boolean;
@Component({
    selector: 'app-mypresentation-header',
    templateUrl: './mypresentation-header.component.html',
    styleUrls: ['./mypresentation-header.component.scss'],
    standalone: false
})
export class MypresentationHeaderComponent implements OnInit {
  folderForm: FormGroup;
  presentationForm: FormGroup;
  submitted = false;
  activeFolderId: string;
  currentFolderDepth: number;
  isLoading: boolean = false;
  showDeleteModal: boolean = false;
  customerPlan:CustomerPlan;
  customerLimitationCount:CustomerLimitationsCount;
  IntegrationMediumZoom: boolean = _IntegrationMediumZoom;
  IntegrationMediumOffice: boolean = _IntegrationMediumOffice;
  searchTerm: string = '';
  constructor(public _mypresentationsService: MypresentationsService, private router: Router, 
    private route: ActivatedRoute, private fb: FormBuilder, private toastr: ToastrService,
    private customerPlanService: CustomerPlanService) {
    this.customerLimitationCount = this.customerPlanService.getCustomerLimitationsCounts();
    this.customerPlan = this.customerPlanService.getCustomerPlan();
    this.folderForm = this.fb.group({
      folderName: ['', [Validators.required]]
    });
    this.presentationForm = this.fb.group({
      presentationName: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this._mypresentationsService.isListView = this._mypresentationsService.getLastViewPreference();
    this.route.queryParams.subscribe(params => {
      if (params['isListView'] !== undefined) {
        this._mypresentationsService.isListView = params['isListView'] === 'true';
        this._mypresentationsService.setLastViewPreference(this._mypresentationsService.isListView);
      }
    });
  }

  toggleListView(isListView: boolean) {
    this._mypresentationsService.isViewSwitching = true;
    const preservedState = this._mypresentationsService.preserveSelectionState();
    this._mypresentationsService.isListView = isListView;
    this._mypresentationsService.setLastViewPreference(isListView);
    const queryParams: any = { isListView: isListView };
    if (this._mypresentationsService.activeFolderId) {
      queryParams['Id'] = this._mypresentationsService.activeFolderId;
    }
    this.router.navigate([], { queryParams: queryParams }).then(() => {
      setTimeout(() => {
        this._mypresentationsService.restoreSelectionState(preservedState);
        this._mypresentationsService.cleanUpSelectionState();
      }, 150);
    });
  }
  createFolder(): void {
    this.submitted = true;
    if (this.folderForm.invalid) {
      return;
    }
    const folderName = this.folderForm.get('folderName').value.trim();
    if (!folderName) {
      this.folderForm.get('folderName').setErrors({ required: true });
      this.folderForm.get('folderName').markAsTouched();
      return;
    }

    const isCreatingMainFolder = !this._mypresentationsService.activeFolderId;
    const currentMainFoldersCount = this._mypresentationsService.mainFolders?.length || 0;
    const currentSubFoldersCount = this._mypresentationsService.subFolders?.length || 0;
    
    if (isCreatingMainFolder && currentMainFoldersCount >= 10) {
      this.toastr.warning('Folder limit reached. Maximum 10 can create.', '', { 
        timeOut: 5000,
      });
      return;
    }
    
    if (!isCreatingMainFolder && currentSubFoldersCount >= 10) {
      this.toastr.warning('Folder limit reached. Maximum 10 can create.', '', { 
        timeOut: 5000,
      });
      return;
    }

    this.isLoading = true;
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
  onBreadcrumbClick(crumb: any, index: number) {
    this._mypresentationsService.breadcrumbs = this._mypresentationsService.breadcrumbs.slice(0, index + 1);
    this._mypresentationsService.saveBreadcrumbs();
    this._mypresentationsService.clearSelection();
    this._mypresentationsService.clearSearchTerm();
    this._mypresentationsService.searchTerm = '';
    if (crumb.id) {
      this.router.navigate([], {
        queryParams: {
          Id: crumb.id,
          folderName: crumb.name,
          isListView: this._mypresentationsService.isListView
        },
        queryParamsHandling: 'merge'
      });
    } else {
      this.router.navigate(['/app/mypresentations'], { 
        queryParams: { isListView: this._mypresentationsService.isListView } 
      });
      this._mypresentationsService.isLoading = true;
    }
    this._mypresentationsService.cleanUpSelectionState();
  }
  get selectedCount(): number {
    return this._mypresentationsService.getSelectedCount();
  }

  openDeleteModal() {
    $('#deleteAllModal').modal('show');
  }

  closeDeleteModal() {
    $('#deleteAllModal').modal('hide');
  }

  confirmBulkDelete() {
    this.isLoading = true;
    const ids = Array.from(this._mypresentationsService.selectedPresentations);
    const folderId = this._mypresentationsService.activeFolderId;
    this._mypresentationsService.handleBulkDelete(ids, this._mypresentationsService.presentations).subscribe({
      next: () => {
        this.isLoading = false;
        this.closeDeleteModal();
      },
      error: () => {
        this.isLoading = false;
        this.closeDeleteModal();
      }
    });
  }
  onSearch() {
    this._mypresentationsService.updateSearch(this.searchTerm);
  }
  onInputChange() {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this._mypresentationsService.updateSearch('');
    }
  }
}
