import { Component, OnInit } from '@angular/core';
import { MypresentationsService } from '../Service/mypresentations.service';
import { CustomerPlan } from 'src/app/core/Models/customer-plan.model';
import { ActivatedRoute, Router } from '@angular/router';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
declare let zoomSdk: any;
declare const _IntegrationMediumZoom: boolean;
declare const _IntegrationMediumOffice: boolean;
@Component({
    selector: 'app-mypresentations',
    templateUrl: './mypresentations.component.html',
    styleUrls: ['./mypresentations.component.scss'],
    standalone: false
})
export class MypresentationsComponent implements OnInit {
  customerPlan: CustomerPlan;
  IntegrationMediumZoom: boolean = _IntegrationMediumZoom;
  IntegrationMediumOffice: boolean = _IntegrationMediumOffice;
  private browserNavigationHandler: () => void;
  constructor(public _mypresentationsService: MypresentationsService, private route: ActivatedRoute, private router: Router, private _presentationservice: PresentationService) { }

  ngOnInit(): void {
    this._mypresentationsService.isLoading = true;
    this._mypresentationsService.resetFolderData();
    this._mypresentationsService.resetPagination();
    this._mypresentationsService.showSearch();
    this._mypresentationsService.clearSearchTerm();
    this._mypresentationsService.sortBy = 'updatedDateTime';
    this._mypresentationsService.sortOrder = 'desc';
    this._mypresentationsService.currentSortOption = 'recentlyUpdated';
    const lastViewPreference = this._mypresentationsService.getLastViewPreference();
    this._mypresentationsService.isListView = lastViewPreference;
    if(!this.IntegrationMediumOffice){
      this.browserNavigationHandler = this.handleBrowserNavigation.bind(this);
      window.addEventListener('popstate', this.browserNavigationHandler);
    }
    this._mypresentationsService.ensureBreadcrumbsIntegrity();
    this.handleNavigationFromWorkspace();
    this.route.queryParams.subscribe(params => {
      const folderId = params['Id'];
      let folderName = params['folderName'] || '';
      if (params['isListView'] !== undefined) {
        this._mypresentationsService.isListView = params['isListView'] === 'true';
        this._mypresentationsService.setLastViewPreference(this._mypresentationsService.isListView);
      }
      
      if (folderId) {
        this._mypresentationsService.ensureBreadcrumbsIntegrity();
        const currentCrumb = this._mypresentationsService.breadcrumbs.find(b => b.id === folderId);
        if (currentCrumb) {
          folderName = currentCrumb.name;
        }
        this.ensureBreadcrumbExists(folderId, folderName);
        this._mypresentationsService.handleFolderClick(folderId, folderName).subscribe({
          next: () => { this._mypresentationsService.isLoading = false; },
          error: () => { this._mypresentationsService.isLoading = false; }
        });
      } else {
        this._mypresentationsService.ensureBreadcrumbsIntegrity();
        if (this._mypresentationsService.breadcrumbs.length > 1) {
          const lastBreadcrumb = this._mypresentationsService.breadcrumbs[this._mypresentationsService.breadcrumbs.length - 1];
          if (lastBreadcrumb && lastBreadcrumb.id) {
            this.router.navigate(['/app/mypresentations'], { 
              queryParams: { 
                Id: lastBreadcrumb.id, 
                folderName: lastBreadcrumb.name,
                isListView: this._mypresentationsService.isListView 
              } 
            });
            this._mypresentationsService.handleFolderClick(lastBreadcrumb.id, lastBreadcrumb.name).subscribe({
              next: () => { this._mypresentationsService.isLoading = false; },
              error: () => { this._mypresentationsService.isLoading = false; }
            });
          } else {
            this.resetToRoot();
          }
        } else {
          this.resetToRoot();
        }
      }
    });
    this.InCollaborate();
  }

  private initializeBreadcrumbs(): void {
    this._mypresentationsService.ensureBreadcrumbsIntegrity();
  }

  private handleNavigationFromWorkspace(): void {
    if (this._mypresentationsService.breadcrumbs.length > 1) {
      this._mypresentationsService.ensureBreadcrumbsIntegrity();
    }
  }

  private ensureBreadcrumbExists(folderId: string, folderName: string): void {
    const existingCrumb = this._mypresentationsService.breadcrumbs.find(b => b.id === folderId);
    if (!existingCrumb) {
      this._mypresentationsService.breadcrumbs.push({ id: folderId, name: folderName });
      this._mypresentationsService.saveBreadcrumbs();
    } else if (existingCrumb.name === 'Folder' && folderName !== 'Folder') {
      existingCrumb.name = folderName;
      this._mypresentationsService.saveBreadcrumbs();
    }
  }

  private resetToRoot(): void {
    this._mypresentationsService.breadcrumbs = [{ id: '', name: 'My Presentations' }];
    this._mypresentationsService.saveBreadcrumbs();
    this._mypresentationsService.resetPagination();
    this._mypresentationsService.resetFolderData();
    this.loadPresentations();
  }

  private handleBrowserNavigation(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const currentFolderId = urlParams.get('Id');
    this._mypresentationsService.ensureBreadcrumbsIntegrity();
    
          if (currentFolderId) {
        const existingCrumb = this._mypresentationsService.breadcrumbs.find(b => b.id === currentFolderId);
        if (!existingCrumb) {
          let folderName = urlParams.get('folderName');
          if (!folderName || folderName === 'Folder') {
            folderName = this._mypresentationsService.getFolderNameById(currentFolderId) || 'Folder';
          }
          this._mypresentationsService.breadcrumbs.push({ id: currentFolderId, name: folderName });
          this._mypresentationsService.saveBreadcrumbs();
          this._mypresentationsService.handleFolderClick(currentFolderId, folderName).subscribe({
            next: () => { this._mypresentationsService.isLoading = false; },
            error: () => { this._mypresentationsService.isLoading = false; }
          });
        } else {
          let folderName = existingCrumb.name;
          if (folderName === 'Folder') {
            folderName = this._mypresentationsService.getFolderNameById(currentFolderId) || folderName;
            existingCrumb.name = folderName;
            this._mypresentationsService.saveBreadcrumbs();
          }
          this._mypresentationsService.handleFolderClick(currentFolderId, folderName).subscribe({
            next: () => { this._mypresentationsService.isLoading = false; },
            error: () => { this._mypresentationsService.isLoading = false; }
          });
        }
      } else {
      if (this._mypresentationsService.breadcrumbs.length > 1) {
        const previousCrumb = this._mypresentationsService.breadcrumbs[this._mypresentationsService.breadcrumbs.length - 2];
        if (previousCrumb && previousCrumb.id) {
          this._mypresentationsService.breadcrumbs = this._mypresentationsService.breadcrumbs.slice(0, this._mypresentationsService.breadcrumbs.length - 1);
          this._mypresentationsService.saveBreadcrumbs();
          this._mypresentationsService.handleFolderClick(previousCrumb.id, previousCrumb.name).subscribe({
            next: () => { this._mypresentationsService.isLoading = false; },
            error: () => { this._mypresentationsService.isLoading = false; }
          });
        } else {
          this.resetToRoot();
        }
      } else {
        this.resetToRoot();
      }
    }
    this._mypresentationsService.clearSelection();
    this._mypresentationsService.clearSearchTerm();
  }
 
 
  ngOnDestroy(): void {
    this._mypresentationsService.hideSearch();
    this._mypresentationsService.clearSelectionOnPageLeave();
    this._mypresentationsService.clearSearchTerm();
    if (this.browserNavigationHandler) {
      window.removeEventListener('popstate', this.browserNavigationHandler);
    }
    const shouldPreserveBreadcrumbs = this.shouldPreserveBreadcrumbs();
    if (!shouldPreserveBreadcrumbs) {
      localStorage.removeItem('mypresentations_breadcrumbs');
    }
  }

  private shouldPreserveBreadcrumbs(): boolean {
    if (this.IntegrationMediumOffice) {
      const currentHash = window.location.hash;
      return currentHash.includes('/WorkSpace/edit') || 
             currentHash.includes('/app/mypresentations')
    }
    return window.location.pathname.includes('/WorkSpace/edit') || window.location.pathname.includes('/app/mypresentations');
  }

  private async loadPresentations(): Promise<void> {
    try {
      await this._mypresentationsService.getPresentationFolders(
        this._mypresentationsService.pageNumber,
        this._mypresentationsService.pageSize,
        this._mypresentationsService.searchTerm,
        this._mypresentationsService.sortBy,
        this._mypresentationsService.sortOrder
      );
      if (this._mypresentationsService.searchTerm && this._mypresentationsService.searchTerm.trim() !== '') {
        this._mypresentationsService.filterExistingData(this._mypresentationsService.searchTerm);
      }
    } catch (error) {
    } finally {
      this._mypresentationsService.isLoading = false;
    }
  }
  InCollaborate(){
    zoomSdk.getRunningContext().then((resolvedValue: any) => {
      if (resolvedValue && resolvedValue.context) {
        const contextValue: string = resolvedValue.context;
        if (contextValue === 'inCollaborate') {
          var element = document.getElementById('dashboardpage');
            element.style.display = 'none';
            var appMyPresentationsElement = document.querySelector('app-mypresentations');
            const iframeElement = appMyPresentationsElement.querySelector('#customIframe') as HTMLIFrameElement | null;
            const urlValue = this._presentationservice.getPresentationUrl();
            if (iframeElement) {
              iframeElement.src = urlValue;
              zoomSdk.onCollaborateChange((event) => {
                if (event.action === 'end') {
               const presentationId=  this._presentationservice.currentPresentationId();
                  this.EndPresent(presentationId);
                var dynamicContentElement = document.getElementById('dynamicContent');
                  if (dynamicContentElement) {
                    dynamicContentElement.style.display = 'none';
                    dynamicContentElement.style.height = '100vh';
                  }
                  const iframeElement = document.getElementById('customIframe');
if (iframeElement && iframeElement.parentNode) {
  iframeElement.parentNode.removeChild(iframeElement);
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
}
