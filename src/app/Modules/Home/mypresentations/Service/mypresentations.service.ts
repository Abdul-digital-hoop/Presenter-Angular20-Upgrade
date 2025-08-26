import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { getMessage, getErrorMessage } from 'src/app/core/SuccessMessageHandler';
import { SuccessMessages, ErrorMessages } from 'src/app/core/SuccessResponse';
import { Router } from '@angular/router';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { TrashServiceService } from 'src/app/trash-service.service';
import { WorkSignalRServiceService } from 'src/app/core/Sevices/WorkSpace/work-signal-rservice.service';
import { CustomerLimitationsCount } from 'src/app/core/Models/customer-plan.model';
declare const _IntegrationMediumOffice: boolean;
@Injectable({
  providedIn: 'root'
})
export class MypresentationsService {
  isListView: boolean = false;
  pageNumber: number = 1;
  pageSize: number = 20;
  searchTerm: string = '';
  sortBy: string = 'updatedDateTime';
  sortOrder: string = 'desc';
  currentSortOption: string = 'recentlyUpdated';
  presentations: any[] = [];
  mainFolders: any[] = [];
  subFolders: any[] = [];
  activeFolderId: string = null;
  customerLimitationCount: CustomerLimitationsCount;
  currentFolderName: string = '';
  isInSubFolder: boolean = false;
  isLoadingMore: boolean = false;
  hasMorePresentations: boolean = true;
  searchVisible: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  searchTerm$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  selectedPresentations: Set<string> = new Set();
  selectAllActive: boolean = false;
  originalSelectedPresentations: Set<string> = new Set();
  breadcrumbs: { [key: string]: any }[] = [{ id: '', name: 'My Presentations' }];
  categoryList: any[] = [];
  isSearchTransitioning: boolean = false;
  isLoading: boolean = false;
  zoomMeeting: boolean = false;
  isViewSwitching: boolean = false;
  hasInitialDataLoaded: boolean = false;
  IntegrationMediumOffice: boolean = _IntegrationMediumOffice;
  constructor(private route: ActivatedRoute, private _http: HttpClient, private _toastr: ToastrService, private _router: Router,
    private _workSpaceService: WorkspaceService, private trashServiceService: TrashServiceService, private workSpaceSignalRService: WorkSignalRServiceService) {
    this.route.queryParams.subscribe(params => {
      this.isListView = params['isListView'] !== undefined ? params['isListView'] === 'true' : this.getLastViewPreference();
    });
    
    this.sortBy = 'updatedDateTime';
    this.sortOrder = 'desc';
    this.currentSortOption = 'recentlyUpdated';
    
    this.searchTerm$.next(this.searchTerm);
  }

  // All API call for My Presentations
  GetAllPresentationFolders(pageNumber: number, pageSize: number, searchTerm: string, sortBy?: string, sortOrder?: string): Observable<any[]> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('searchTerm', searchTerm.toString())
      .set('sortBy', sortBy || this.sortBy)
      .set('sortOrder', sortOrder || this.sortOrder);

    return this._http.get<any[]>(environment.MyApi + 'get-all-presentations', { params });
  }
  createFolder(folderData: { folderName: string, FolderId: string[], folderDepth: number }): Observable<any> {
    return this._http.post(environment.MyApi + 'folder', folderData, { responseType: 'text' });
  }
  createWorkSpacePresentation(presentationData: any) {
    return this._http.post(environment.MyApi + 'createnewpresentation', presentationData);
  }
  deleteFolder(folderId: string): Observable<any> {
    return this._http.delete(environment.MyApi + `folderdelete?id=${folderId}`);
  }
  deletePresentation(id: string): Observable<any> {
    return this._http.delete(environment.MyApi + `presentationdelete?id=${id}`);
  }
  folderPresentationDelete(id:string,folderid:any):Observable<any>{
    return this._http.delete(environment.MyApi+`folderpresentationdelete?id=${id}&folderid=${folderid}`)
  }
  deleteMultiplePresentations(ids: string[], folderId?: string): Observable<any> {
    let options: any = {
      body: ids
    };
    if (this.activeFolderId) {
      options['params'] = { folderId: this.activeFolderId };
    }
    return this._http.delete(environment.MyApi + 'delete-multiple-presentations', options);
  }
  renameFolder(folderId: string, newFolderName: string): Observable<any> {
    return this._http.put(environment.MyApi + `folderupdate?id=${folderId}&folderName=${newFolderName}`, {});
  }
  renamePresentation(presentationId: string, presentationName: string): Observable<any> {
    const data = {
      presentationId: presentationId,
      presentationName: presentationName
    };

    return this._http.post(environment.MyApi + 'update-presentationName', data);
  }
  getFolderContents(folderId: string = null, sortBy?: string, sortOrder?: string): Observable<any> {
    if (folderId) {
      const params = new HttpParams()
        .set('sortBy', sortBy || this.sortBy)
        .set('sortOrder', sortOrder || this.sortOrder);
      return this._http.get(environment.MyApi + `foldermovepresentation?id=${folderId}`, { params });
    }
    return this._http.get(environment.MyApi + 'folderlist');
  }
  PresentationMovedToFolder(folderId: string, PresentationId: string): Observable<any> {
    const data = {
      folderId: folderId,
      presentationId: PresentationId
    };
    return this._http.put(environment.MyApi + `presentationmove?id=${folderId}&presentationId=${PresentationId}`, data);
  }
  getSubFolderDetails(folderId: any): Observable<any> {
    return this._http.get(environment.MyApi + 'GetSubFoldersDetails', { params: { id: folderId } });
  }
  duplicatePresentation(data: any) {
    return this._http.post(environment.MyApi + 'duplicate-presentation',data);
  }
  subfolderduplicatePresentation(folderId: string,presentationId:string): Observable<any> {
    return this._http.put(environment.MyApi + `duplicate-folderpresentation?folderid=${folderId}&presentationId=${presentationId}`, {});
  }
  getCategory(): Observable<any> {
    return this._http.get<any>(environment.MyApi + 'get-all-categories');
  }
  // common method for the component
  getPresentationFolders(pageNumber: number, pageSize: number, searchTerm: string, sortBy?: string, sortOrder?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.GetAllPresentationFolders(pageNumber, pageSize, searchTerm, sortBy, sortOrder)
        .subscribe(
          (response) => {
            if (response) {
              this.presentations = response['presentations'];
              this.mainFolders = response['folders'];
              this.isSearchTransitioning = false;
              this.isLoading = false;
              this.hasMorePresentations = response['presentations'] && response['presentations'].length >= pageSize;
              this.hasInitialDataLoaded = true;
              resolve(response);
            }
            else {
              this.isSearchTransitioning = false;
              this.isLoading = false;
              this.hasMorePresentations = false;
              this.hasInitialDataLoaded = true;
              resolve(response);
            }
          },
          (error) => {
            this.isSearchTransitioning = false;
            this.isLoading = false;
            this.hasInitialDataLoaded = true;
            reject(error);
          }
        );
    });
  }
  loadMorePresentations(): Promise<any> {
    if (this.isLoadingMore || !this.hasMorePresentations) return Promise.resolve();

    this.isLoadingMore = true;
    this.pageNumber += 1;

    return new Promise((resolve, reject) => {
      if (this.isInSubFolder && this.activeFolderId) {
        this.getFolderContents(this.activeFolderId, this.sortBy, this.sortOrder).subscribe({
          next: (response: any) => {
            const allPresentations = (response.presentations || []).map((item: any) => {
              const props = item.properties || item;
              return {
                ...props,
                createdDateTime: props.CreatedDateTime ? new Date(props.CreatedDateTime) : (props.createdDateTime ? new Date(props.createdDateTime) : null),
                updatedDateTime: props.UpdatedDateTime ? new Date(props.UpdatedDateTime) : (props.updatedDateTime ? new Date(props.updatedDateTime) : null)
              };
            });

            const allSubFolders = (response.folders || []).map((item: any) => {
              const props = item.properties || item;
              return {
                ...props,
                createdDateTime: props.CreatedDateTime ? new Date(props.CreatedDateTime) : (props.createdDateTime ? new Date(props.createdDateTime) : null),
                updatedDateTime: props.UpdatedDateTime ? new Date(props.UpdatedDateTime) : (props.updatedDateTime ? new Date(props.updatedDateTime) : null)
              };
            });

            let filteredPresentations = allPresentations;
            let filteredSubFolders = allSubFolders;

            if (this.searchTerm && this.searchTerm.trim() !== '') {
              filteredPresentations = allPresentations.filter(presentation => 
                presentation.presentationName && 
                presentation.presentationName.toLowerCase().includes(this.searchTerm.toLowerCase())
              );
              filteredSubFolders = allSubFolders.filter(folder => 
                folder.folderName && 
                folder.folderName.toLowerCase().includes(this.searchTerm.toLowerCase())
              );
            }

            this.presentations = filteredPresentations;
            this.subFolders = filteredSubFolders;
            this.hasMorePresentations = false;
            
            this.isLoadingMore = false;
            resolve(filteredPresentations);
          },
          error: (error) => {
            this.isLoadingMore = false;
            reject(error);
          }
        });
      } else {
        this.GetAllPresentationFolders(this.pageNumber, this.pageSize, this.searchTerm, this.sortBy, this.sortOrder)
          .subscribe(
            (response) => {
              const newPresentations = response['presentations'] || [];
              if (newPresentations.length < this.pageSize) {
                this.hasMorePresentations = false;
              }
              
              const currentSelectedIds = new Set(this.selectedPresentations);
              
              this.presentations = [...this.presentations, ...newPresentations];
              
              this.selectedPresentations = currentSelectedIds;
              
              this.isLoadingMore = false;
              resolve(newPresentations);
            },
            (error) => {
              this.isLoadingMore = false;
              reject(error);
            }
          );
      }
    });
  }
  resetPagination() {
    this.pageNumber = 1;
    this.hasMorePresentations = true;
    this.isLoadingMore = false;
    if (!this.currentSortOption) {
      this.currentSortOption = 'recentlyUpdated';
    }
  }
  handleFolderDeletion(folderId: string): Observable<any> {
    return new Observable(observer => {
      this.deleteFolder(folderId).subscribe({
        next: (response: any) => {
          if (this.activeFolderId) {
            this.subFolders = this.subFolders.filter(f => f.id !== folderId);
          } else {
            this.mainFolders = this.mainFolders.filter(f => f.id !== folderId);
          }

          const message = getMessage(SuccessMessages.FolderSection9000, SuccessMessages.Folder9004);
          this._toastr.success(message, "", {
            timeOut: 5000,
          });

          observer.next(response);
          observer.complete();
        },
        error: (error: any) => {
          const message = getErrorMessage(ErrorMessages.FolderSection9000, ErrorMessages.Folder9004);
          this._toastr.error(message, "", {
            timeOut: 5000,
          });
          observer.error(error);
        }
      });
    });
  }
  handleFolderRename(folderId: string, newFolderName: string): Observable<any> {
    return new Observable(observer => {
      this.renameFolder(folderId, newFolderName).subscribe({
        next: (response: any) => {
          let updatedFolder = this.mainFolders.find(folder => folder.id === folderId);
          if (updatedFolder) {
            updatedFolder.folderName = newFolderName;
          }
          let updatedSubFolder = this.subFolders.find(folder => folder.id === folderId);
          if (updatedSubFolder) {
            updatedSubFolder.folderName = newFolderName;
          }

          const message = getMessage(SuccessMessages.FolderSection9000, SuccessMessages.Folder9002);
          this._toastr.success(message, "", {
            timeOut: 5000
          });

          observer.next(response);
          observer.complete();
        },
        error: (error: any) => {
          const message = getErrorMessage(ErrorMessages.FolderSection9000, ErrorMessages.Folder9002);
          this._toastr.error(message, "", {
            timeOut: 5000
          });
          observer.error(error);
        }
      });
    });
  }
  handlePresentationOpen(presentationData: {
    presentationMode: boolean,
    presentationId: string,
    activeSlideId: string,
    presentationName: string,
    presentedDateTime?: string,
    folderId?: string
  }): void {
    if (presentationData.presentationMode) {
      try {
        const currentUtc = new Date();
        currentUtc.setMinutes(currentUtc.getMinutes() - currentUtc.getTimezoneOffset());

        let presentedUtc: Date;
        if (presentationData.presentedDateTime) {
          presentedUtc = new Date(presentationData.presentedDateTime);
          presentedUtc.setMinutes(presentedUtc.getMinutes() - presentedUtc.getTimezoneOffset());
          if (isNaN(presentedUtc.getTime())) {
            presentedUtc = currentUtc;
          }
        } else {
          presentedUtc = currentUtc;
        }

        const timeDiffHours = (currentUtc.getTime() - presentedUtc.getTime()) / (1000 * 60 * 60);

        if (timeDiffHours < 6) {
          return;
        } else {
          this.openPresentation(presentationData);
        }
      } catch (error) {
        this.openPresentation(presentationData);
      }
    } else {
      this.openPresentation(presentationData);
    }
  }

  openPresentation(presentationData: {
    presentationId: string,
    activeSlideId: string,
    folderId?: string
  }): void {
    this._workSpaceService.activeSlideId = presentationData.activeSlideId;
    this._workSpaceService.presentationId = presentationData.presentationId;
    this._workSpaceService.setMyPresent(true);

    const queryParams: any = { id: presentationData.presentationId };
    if (presentationData.folderId) {
      queryParams.folder = presentationData.folderId;
    }

    this._router.navigate(['/WorkSpace/edit'], { queryParams });
  }
  handlePresentationRename(presentationId: string, newName: string, presentations: any[]): Observable<any> {
    return new Observable(observer => {
      this.renamePresentation(presentationId, newName).subscribe({
        next: (response) => {
          const updatedPresentation = presentations.find(p => p.id === presentationId);
          if (updatedPresentation) {
            updatedPresentation.presentationName = newName;
            const index = presentations.findIndex(p => p.id === presentationId);
            if (index > -1) {
              presentations.splice(index, 1);
              presentations.unshift(updatedPresentation);
            }
          }

          const message = getMessage(SuccessMessages.PresentationSection2000, SuccessMessages.Presentation2001);
          this._toastr.success(message, "", {
            timeOut: 5000
          });

          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          const message = getErrorMessage(ErrorMessages.PresentationSection2000, ErrorMessages.Presentation2001);
          this._toastr.error(message, "", {
            timeOut: 5000
          });
          observer.error(error);
        }
      });
    });
  }
  handlePresentationDeletion(presentationId: string, presentations: any[]): Observable<any> {
    return new Observable(observer => {
      this.deletePresentation(presentationId).subscribe({
        next: (response: any) => {
          const index = presentations.findIndex(p => p.id === presentationId);
          if (index !== -1) {
            presentations.splice(index, 1);
          }
          this.trashServiceService.setPresentationData(response);
          const message = getMessage(SuccessMessages.PresentationSection2000, SuccessMessages.Presentation2003);
          this._toastr.success(message, "", {
            timeOut: 5000
          });

          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          const message = getErrorMessage(ErrorMessages.PresentationSection2000, ErrorMessages.Presentation2003);
          this._toastr.error(message, "", {
            timeOut: 5000
          });
          observer.error(error);
        }
      });
    });
  }
  handleFolderCreation(folderData: any, currentFolderDepth: number): Observable<any> {
    return new Observable(observer => {
      if (currentFolderDepth >= 5) {
        const message = getErrorMessage(ErrorMessages.FolderSection9000, ErrorMessages.Folder9001);
        this._toastr.warning(message, "", { timeOut: 5000 });
        observer.error('Maximum folder depth reached');
        return;
      }

      this.createFolder(folderData).subscribe({
        next: (response: any) => {
          const parsedResponse = JSON.parse(response);
          const folderDetails = {
            folderName: parsedResponse.folderName,
            id: parsedResponse.id,
            createdBy: parsedResponse.CreatedBy,
            folderId: parsedResponse.FolderId,
            createdDateTime: parsedResponse.createdDateTime,
            updatedDateTime: parsedResponse.updatedDateTime,
            presentationid_count: 0
          };
          if (this.isInSubFolder) {
            this.subFolders.unshift(folderDetails);
          } else {
            this.mainFolders.unshift(folderDetails);
          }

          const message = getMessage(SuccessMessages.FolderSection9000, SuccessMessages.Folder9001);
          this._toastr.success(message, "", { timeOut: 5000 });

          observer.next(folderDetails);
          observer.complete();
        },
        error: (error) => {
          const message = getErrorMessage(ErrorMessages.FolderSection9000, ErrorMessages.Folder9001);
          this._toastr.error(message, "", { timeOut: 5000 });
          observer.error(error);
        }
      });
    });
  }
  handlePresentationCreation(presentationName: string, activeFolderId: string | null): Observable<any> {
    return new Observable(observer => {
      if (this.customerLimitationCount?.balancePresentationLimit <= 0) {
        observer.error('Presentation limit reached');
        return;
      }

      const payload = {
        presentationName: presentationName,
        FolderId: activeFolderId || null
      };

      this.createWorkSpacePresentation(payload).subscribe({
        next: (response: any) => {
          this._workSpaceService.presentationId = response?.presentationId;
          this._workSpaceService.activeSlideId = response?.activeSlideId;

          if (activeFolderId) {
            this._router.navigate(['/WorkSpace/edit'], {
              queryParams: {
                id: response?.presentationId,
                folder: activeFolderId
              }
            });
          } else {
            this._router.navigate(['/WorkSpace/edit'], {
              queryParams: { id: response?.presentationId }
            });
          }

          this.workSpaceSignalRService.netWorkValidation();
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          const message = getErrorMessage(ErrorMessages.PresentationSection2000, ErrorMessages.Presentation2005);
          this._toastr.error(message, "", { timeOut: 5000 });
          observer.error(error);
        }
      });
    });
  }
  handleFolderClick(folderId: string, folderName: string): Observable<any> {
    this.clearSelection();
    return new Observable(observer => {
      this.getFolderContents(folderId, this.sortBy, this.sortOrder).subscribe({
        next: (response: any) => {
          this.activeFolderId = folderId;
          this.currentFolderName = folderName;
          this.isInSubFolder = true;
          this.hasMorePresentations = false;
          this.hasInitialDataLoaded = true;
          if (!this.breadcrumbs || this.breadcrumbs.length === 0) {
            this.breadcrumbs = [{ id: '', name: 'My Presentations' }];
          }
          const existingIndex = this.breadcrumbs.findIndex(b => b.id === folderId);
          if (existingIndex !== -1) {
            this.breadcrumbs = this.breadcrumbs.slice(0, existingIndex + 1);
          } else {
            this.breadcrumbs.push({ id: folderId, name: folderName });
          }
          this.saveBreadcrumbs();
        this.presentations = (response.presentations || []).map((item: any) => {
          const props = item.properties || item;
          return {
            ...props,
            createdDateTime: props.CreatedDateTime ? new Date(props.CreatedDateTime) : (props.createdDateTime ? new Date(props.createdDateTime) : null),
            updatedDateTime: props.UpdatedDateTime ? new Date(props.UpdatedDateTime) : (props.updatedDateTime ? new Date(props.updatedDateTime) : null)
          };
        });
        this.subFolders = (response.folders || []).map((item: any) => {
          const props = item.properties || item;
          return {
            ...props,
            createdDateTime: props.CreatedDateTime ? new Date(props.CreatedDateTime) : (props.createdDateTime ? new Date(props.createdDateTime) : null),
            updatedDateTime: props.UpdatedDateTime ? new Date(props.UpdatedDateTime) : (props.updatedDateTime ? new Date(props.updatedDateTime) : null)
          };
        });
        if (this.searchTerm && this.searchTerm.trim() !== '') {
          this.filterExistingData(this.searchTerm);
        }
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          this.hasMorePresentations = false;
          this.hasInitialDataLoaded = true;
          observer.error(error);
        }
      });
    });
  }
  resetFolderData() {
    this.activeFolderId = null;
    this.isInSubFolder = false;
    this.currentFolderName = '';
    this.hasMorePresentations = true;
    this.hasInitialDataLoaded = false;
  }
  updateSearch(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.searchTerm$.next(searchTerm);
    this.resetPagination();
    this.isLoading = true;
    const hasAlphanumeric = /[a-zA-Z0-9]/.test(searchTerm);
    if (searchTerm && !hasAlphanumeric) {
      this.presentations = [];
      this.mainFolders = [];
      this.subFolders = [];
      this.isLoading = false;
      this.hasInitialDataLoaded = true;
      return;
    }

    if (!searchTerm || searchTerm.trim() === '') {
      this.isSearchTransitioning = true;
    }
    
    if (this.isInSubFolder && this.activeFolderId) {
      this.searchInSubFolder(searchTerm);
      this.hasMorePresentations = false;
    } else {
      this.getPresentationFolders(1, 20, searchTerm, this.sortBy, this.sortOrder);
    }
  }

  private searchInSubFolder(searchTerm: string) {
    if (!searchTerm || searchTerm.trim() === '') {
      this.getFolderContents(this.activeFolderId, this.sortBy, this.sortOrder).subscribe({
        next: (response: any) => {
          this.presentations = (response.presentations || []).map((item: any) => {
            const props = item.properties || item;
            return {
              ...props,
              createdDateTime: props.CreatedDateTime ? new Date(props.CreatedDateTime) : (props.createdDateTime ? new Date(props.createdDateTime) : null),
              updatedDateTime: props.UpdatedDateTime ? new Date(props.UpdatedDateTime) : (props.updatedDateTime ? new Date(props.updatedDateTime) : null)
            };
          });
          this.subFolders = (response.folders || []).map((item: any) => {
            const props = item.properties || item;
            return {
              ...props,
              createdDateTime: props.CreatedDateTime ? new Date(props.CreatedDateTime) : (props.createdDateTime ? new Date(props.createdDateTime) : null),
              updatedDateTime: props.UpdatedDateTime ? new Date(props.UpdatedDateTime) : (props.updatedDateTime ? new Date(props.updatedDateTime) : null)
            };
          });
          this.isLoading = false;
          this.isSearchTransitioning = false;
          this.hasMorePresentations = false;
          this.hasInitialDataLoaded = true;
        },
        error: (error) => {
          this.isLoading = false;
          this.isSearchTransitioning = false;
          this.hasInitialDataLoaded = true;
        }
      });
    } else {
      this.getFolderContents(this.activeFolderId, this.sortBy, this.sortOrder).subscribe({
        next: (response: any) => {
          const allPresentations = (response.presentations || []).map((item: any) => {
            const props = item.properties || item;
            return {
              ...props,
              createdDateTime: props.CreatedDateTime ? new Date(props.CreatedDateTime) : (props.createdDateTime ? new Date(props.createdDateTime) : null),
              updatedDateTime: props.UpdatedDateTime ? new Date(props.UpdatedDateTime) : (props.updatedDateTime ? new Date(props.updatedDateTime) : null)
            };
          });
          
          const allSubFolders = (response.folders || []).map((item: any) => {
            const props = item.properties || item;
            return {
              ...props,
              createdDateTime: props.CreatedDateTime ? new Date(props.CreatedDateTime) : (props.createdDateTime ? new Date(props.createdDateTime) : null),
              updatedDateTime: props.UpdatedDateTime ? new Date(props.UpdatedDateTime) : (props.updatedDateTime ? new Date(props.updatedDateTime) : null)
            };
          });

          this.presentations = allPresentations.filter(presentation => 
            presentation.presentationName && 
            presentation.presentationName.toLowerCase().includes(searchTerm.toLowerCase())
          );

          this.subFolders = allSubFolders.filter(folder => 
            folder.folderName && 
            folder.folderName.toLowerCase().includes(searchTerm.toLowerCase())
          );

          this.isLoading = false;
          this.isSearchTransitioning = false;
          this.hasMorePresentations = false;
          this.hasInitialDataLoaded = true;
        },
        error: (error) => {
          this.isLoading = false;
          this.isSearchTransitioning = false;
          this.hasInitialDataLoaded = true;
        }
      });
    }
  }
  showSearch() {
    this.searchVisible.next(true);
  }
  hideSearch() {
    this.searchVisible.next(false);
  }
  selectPresentation(id: string) {
    this.selectedPresentations.add(id);
  }

  deselectPresentation(id: string) {
    this.selectedPresentations.delete(id);
    this.originalSelectedPresentations.delete(id);
    this.selectAllActive = false;
  }

  togglePresentationSelection(id: string) {
    if (this.selectedPresentations.has(id)) {
      this.deselectPresentation(id);
    } else {
      this.selectPresentation(id);
    }
  }

  isPresentationSelected(id: string): boolean {
    return this.selectedPresentations.has(id);
  }

  getSelectedCount(): number {
    return this.selectedPresentations.size;
  }

  clearSelection() {
    if (this.isViewSwitching) {
      return;
    }
    this.selectedPresentations.clear();
    this.originalSelectedPresentations.clear();
    this.selectAllActive = false;
  }

  preserveSelectionState() {
    return {
      selectedPresentations: new Set(this.selectedPresentations),
      selectAllActive: this.selectAllActive,
      originalSelectedPresentations: new Set(this.originalSelectedPresentations)
    };
  }

  restoreSelectionState(state: any) {
    if (state) {
      this.selectedPresentations = state.selectedPresentations;
      this.selectAllActive = state.selectAllActive;
      this.originalSelectedPresentations = state.originalSelectedPresentations;
    }
    this.isViewSwitching = false;
  }

  clearSelectionOnPageLeave() {
    this.selectedPresentations.clear();
    this.originalSelectedPresentations.clear();
    this.selectAllActive = false;
    this.isViewSwitching = false;
  }

  resetViewSwitchingFlag() {
    this.isViewSwitching = false;
  }

  selectAllCurrentPage(presentations: any[]) {
    for (const p of presentations) {
      this.selectedPresentations.add(p.id);
    }
    this.originalSelectedPresentations = new Set(presentations.map(p => p.id));
    this.selectAllActive = true;
  }

  deselectAllCurrentPage(presentations: any[]) {
    for (const p of presentations) {
      this.selectedPresentations.delete(p.id);
    }
    this.originalSelectedPresentations.clear();
    this.selectAllActive = false;
  }

  isAllSelected(presentations: any[]): boolean {
    if (presentations.length === 0) return false;
    
    if (this.selectAllActive) {
      for (const p of presentations) {
        if (!this.originalSelectedPresentations.has(p.id) || !this.selectedPresentations.has(p.id)) {
          return false;
        }
      }
      return true;
    }
    
    for (const p of presentations) {
      if (!this.selectedPresentations.has(p.id)) {
        return false;
      }
    }
    return true;
  }

  updateSelectionOnPagination(presentations: any[]) {
    if (this.selectAllActive && this.originalSelectedPresentations.size > 0) {
      for (const p of presentations) {
        if (this.originalSelectedPresentations.has(p.id)) {
          this.selectedPresentations.add(p.id);
        }
      }
    }
  }
  getAllCategory(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getCategory()
        .subscribe(
          (response) => {
            if(response){
              this.categoryList = response;
              resolve(response);
            }
            else{
              resolve(response);
            }
          },
          (error) => {
            reject(error);
          }
        );
    });
  }
  FolderMoveToFolder(currentFolderId: string, sourceFolderId: string, destinationFolderId: string): Observable<any> {
    const data = {
      currentFolderId,
      selectedSourceFolder: sourceFolderId,
      selectedDestinationFolder: destinationFolderId
    };
    return this._http.put(environment.MyApi + `foldermovetofolder?currentFolderId=${currentFolderId}&selectedDestinationFolder=${destinationFolderId}&selectedSourceFolder=${sourceFolderId}`, data);
  }
  setLastViewPreference(isListView: boolean): void {
    localStorage.setItem('mypresentations_lastView', isListView ? 'list' : 'grid');
  }
  getLastViewPreference(): boolean {
    const lastView = localStorage.getItem('mypresentations_lastView');
    return lastView === 'list';
  }
  updateSorting(sortBy: string, sortOrder: string, sortOption?: string): void {
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    if (sortOption) {
      this.currentSortOption = sortOption;
    }
    this.resetPagination();
    
    if (this.isInSubFolder && this.activeFolderId) {
      this.getFolderContents(this.activeFolderId, this.sortBy, this.sortOrder).subscribe({
        next: (response: any) => {
          this.presentations = (response.presentations || []).map((item: any) => {
            const props = item.properties || item;
            return {
              ...props,
              createdDateTime: props.CreatedDateTime ? new Date(props.CreatedDateTime) : (props.createdDateTime ? new Date(props.createdDateTime) : null),
              updatedDateTime: props.UpdatedDateTime ? new Date(props.UpdatedDateTime) : (props.updatedDateTime ? new Date(props.updatedDateTime) : null)
            };
          });
          this.subFolders = (response.folders || []).map((item: any) => {
            const props = item.properties || item;
            return {
              ...props,
              createdDateTime: props.CreatedDateTime ? new Date(props.CreatedDateTime) : (props.createdDateTime ? new Date(props.createdDateTime) : null),
              updatedDateTime: props.UpdatedDateTime ? new Date(props.UpdatedDateTime) : (props.updatedDateTime ? new Date(props.updatedDateTime) : null)
            };
          });
        },
        error: (error) => {
        }
      });
    } else {
      this.getPresentationFolders(1, this.pageSize, this.searchTerm, this.sortBy, this.sortOrder)
        .then(() => {
        })
        .catch((error) => {
        });
    }
  }

  getSortParameters(sortOption: string): { sortBy: string, sortOrder: string } {
    switch (sortOption) {
      case 'alphabetical':
        return { sortBy: 'presentationName', sortOrder: 'asc' };
      case 'alphabeticalReversed':
        return { sortBy: 'presentationName', sortOrder: 'desc' };
      case 'recentlyUpdated':
        return { sortBy: 'updatedDateTime', sortOrder: 'desc' };
      case 'oldestFirst':
        return { sortBy: 'CreatedDateTime', sortOrder: 'asc' };
      case 'newestFirst':
        return { sortBy: 'CreatedDateTime', sortOrder: 'desc' };
      default:
        return { sortBy: 'updatedDateTime', sortOrder: 'desc' };
    }
  }

  getCurrentSortOption(): string {
    return this.currentSortOption;
  }

  getCurrentSortOptionLabel(): string {
    if (!this.currentSortOption) {
      this.currentSortOption = 'recentlyUpdated';
    }
    switch (this.currentSortOption) {
      case 'alphabetical':
        return 'Alphabetical';
      case 'alphabeticalReversed':
        return 'Alphabetical (reversed)';
      case 'recentlyUpdated':
        return 'Recently updated';
      case 'oldestFirst':
        return 'Recently created';
      default:
        return 'Recently updated';
    }
  }

  getCurrentListSortState(): { isNameAscending: boolean, isDateAscending: boolean } {
    switch (this.currentSortOption) {
      case 'alphabetical':
        return { isNameAscending: true, isDateAscending: true };
      case 'alphabeticalReversed':
        return { isNameAscending: false, isDateAscending: true };
      case 'recentlyUpdated':
        return { isNameAscending: false, isDateAscending: false };
      case 'oldestFirst':
        return { isNameAscending: false, isDateAscending: true };
      default:
        return { isNameAscending: false, isDateAscending: false };
    }
  }

  filterExistingData(searchTerm: string) {
    if (!searchTerm || searchTerm.trim() === '') {
      return;
    }

    const hasAlphanumeric = /[a-zA-Z0-9]/.test(searchTerm);
    if (!hasAlphanumeric) {
      this.presentations = [];
      this.mainFolders = [];
      this.subFolders = [];
      return;
    }

    if (this.isInSubFolder && this.activeFolderId) {
      this.presentations = this.presentations.filter(presentation => 
        presentation.presentationName && 
        presentation.presentationName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      this.subFolders = this.subFolders.filter(folder => 
        folder.folderName && 
        folder.folderName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      this.presentations = this.presentations.filter(presentation => 
        presentation.presentationName && 
        presentation.presentationName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      this.mainFolders = this.mainFolders.filter(folder => 
        folder.folderName && 
        folder.folderName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  }

  clearSearchTerm() {
    this.searchTerm = '';
    this.searchTerm$.next('');
  }

  handleBulkDelete(presentationIds: string[], presentations: any[]): Observable<any> {
    return new Observable(observer => {
      this.isLoading = true;
      this.deleteMultiplePresentations(presentationIds, this.activeFolderId).subscribe({
        next: (response: any) => {
          this.presentations = this.presentations.filter(p => !presentationIds.includes(p.id));
          
          for (const id of presentationIds) {
            this.selectedPresentations.delete(id);
            this.originalSelectedPresentations.delete(id);
          }
          
          if (this.selectedPresentations.size === 0) {
            this.selectAllActive = false;
          }
          
          if (this.isInSubFolder && this.activeFolderId) {
            const folder = this.subFolders.find(f => f.id === this.activeFolderId) ||
                          this.mainFolders.find(f => f.id === this.activeFolderId);
            if (folder && folder.presentationid_count) {
              folder.presentationid_count = Math.max(0, folder.presentationid_count - presentationIds.length);
            }
          }
          this.isLoading = false;
          const message = getMessage(SuccessMessages.PresentationSection2000, SuccessMessages.Presentation2004);
          this._toastr.success(message, "", { timeOut: 5000 });
          
          observer.next(response);
          observer.complete();
        },
        error: (error: any) => {
          this.isLoading = false;
          const message = getErrorMessage(ErrorMessages.PresentationSection2000, ErrorMessages.Presentation2004);
          this._toastr.error(message, "", { timeOut: 5000 });
          observer.error(error);
        }
      });
    });
  }
  cleanUpSelectionState() {
    if (this.selectAllActive && this.originalSelectedPresentations.size === 0) {
      this.selectAllActive = false;
    }
    
    const currentPresentationIds = new Set(this.presentations.map(p => p.id));
    const validSelectedIds = new Set<string>();
    
    for (const id of this.selectedPresentations) {
      if (currentPresentationIds.has(id)) {
        validSelectedIds.add(id);
      }
    }
    
    this.selectedPresentations = validSelectedIds;
    
    const validOriginalIds = new Set<string>();
    for (const id of this.originalSelectedPresentations) {
      if (currentPresentationIds.has(id)) {
        validOriginalIds.add(id);
      }
    }
    
    this.originalSelectedPresentations = validOriginalIds;
  }

  public saveBreadcrumbs(): void {
    try {
      const breadcrumbData = {
        breadcrumbs: this.breadcrumbs,
        timestamp: new Date().toISOString(),
        activeFolderId: this.activeFolderId,
        version: '1.0'
      };
      localStorage.setItem('mypresentations_breadcrumbs', JSON.stringify(breadcrumbData));
    } catch (error) {
      console.error('Error saving breadcrumbs:', error);
    }
  }

  private loadBreadcrumbs(): boolean {
    try {
      const savedData = localStorage.getItem('mypresentations_breadcrumbs');
      if (savedData) {
        const data = JSON.parse(savedData);
        if (Array.isArray(data)) {
          this.breadcrumbs = data;
          return true;
        }
        if (data.breadcrumbs && Array.isArray(data.breadcrumbs)) {
          this.breadcrumbs = data.breadcrumbs;
          this.activeFolderId = data.activeFolderId || null;
          return true;
        }
      }
    } catch (error) {
      console.error('Error loading breadcrumbs:', error);
    }
    return false;
  }

  public ensureBreadcrumbsIntegrity(): void {
    if (!this.loadBreadcrumbs()) {
      this.breadcrumbs = [{ id: '', name: 'My Presentations' }];
      this.saveBreadcrumbs();
    }
  }

  public preserveBreadcrumbsForNavigation(): void {
    if (this.IntegrationMediumOffice) {
      const currentHash = window.location.hash;
      if (currentHash.includes('/WorkSpace/edit') || 
             currentHash.includes('/app/mypresentations')) {
        return;
      }
    }
    if (window.location.pathname.includes('/WorkSpace/edit') || 
           window.location.pathname.includes('/app/mypresentations')) {
      return;
    }
  }
  public navigateBackToPresentations(folderId?: string): void {
    this.ensureBreadcrumbsIntegrity();
    if (!folderId && this.breadcrumbs.length > 1) {
      const lastBreadcrumb = this.breadcrumbs[this.breadcrumbs.length - 1];
      if (lastBreadcrumb && lastBreadcrumb.id) {
        folderId = lastBreadcrumb.id;
      }
    }
    
    if (folderId && this.breadcrumbs.length > 1) {
      const existingCrumb = this.breadcrumbs.find(b => b.id === folderId);
      if (!existingCrumb) {
        const folderName = this.getFolderNameById(folderId);
        this.breadcrumbs.push({ id: folderId, name: folderName || 'Folder' });
      }
    }
    this.saveBreadcrumbs();
  }
  public getFolderNameById(folderId: string): string {
    const subFolder = this.subFolders.find(f => f.id === folderId);
    if (subFolder) {
      return subFolder.folderName;
    }
    const mainFolder = this.mainFolders.find(f => f.id === folderId);
    if (mainFolder) {
      return mainFolder.folderName;
    }
    return null;
  }
}
