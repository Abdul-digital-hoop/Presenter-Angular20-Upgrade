import { ChangeDetectorRef, Component, NgZone, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { thresholdFreedmanDiaconis } from 'd3';
import { data } from 'jquery';
import { ToastrService } from 'ngx-toastr';
import { Profile } from 'src/app/core/Models/profile.model';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { AccountService } from 'src/app/core/Sevices/account.service';
import { UsersettingsService } from 'src/app/core/Sevices/usersettings.service';
import { getErrorMessage, getMessage } from 'src/app/core/SuccessMessageHandler';
import { ErrorMessages, SuccessMessages } from 'src/app/core/SuccessResponse';
import { TrashServiceService } from 'src/app/trash-service.service';


declare var $: any;

@Component({
    selector: 'app-trash',
    templateUrl: './trash.component.html',
    styleUrls: ['./trash.component.scss'],
    standalone: false
})
export class TrashComponent implements OnInit {
  presentationData: any[] = [];
  searchPresentationsData: any[] = [];
  id: string;
  deleted: boolean;
  deletedTime: any;
  daysLeft: any;
  experience: any;
  showRestoreButtons: boolean[] = [];
  hoveredItemId: number | null = null;
  noPresentationDeleted: boolean = false; 
  userPresentation: any;
  presentationId:string;
  noPresentationDeletedRef:boolean=false;
  sortOrder: 'asc' | 'desc' = 'asc';
  sortColumn: string = 'presentationName';
  isHovered: boolean[] = [];
  expiredate:any;
  deletedate:any;
  presentationName:any;
  presentationIds: string;
  Firstname:any;
  Lastname:any;
  selectAll: boolean = false;
  public profile: Profile;
  anyCheckboxSelected: boolean = false;
  searchTerm:any='';
  Username: string;
  isNameAscending: boolean = true;
  isLoading: boolean = true;
  isTablehide:boolean = false;
  activeSlideId: any;
  isSearch:boolean = false;
  constructor(  private _presentationservice: PresentationService,
    private _usersettingservice: UsersettingsService,
    private _accountservice: AccountService,
    private _activateRouter: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private _trashservice: TrashServiceService,private renderer: Renderer2,private _toastr: ToastrService,  private _workSpaceService:WorkspaceService,
    private _router: Router,private workSpaceService:WorkspaceService) { 
    
    }

    ngOnInit(): void {
      this._trashservice.presentationData$.subscribe((data) => {
        if (data) {
          this.presentationData = Array.isArray(data) ? data : [data];
        }
      });
  
      this.getRestorePresentation();
      this._accountservice.UserProfile.subscribe((userData) => {
        this.profile = userData;
        if (userData.ProfileSecondName) {
          this.Username = userData.ProfileFirstName.charAt(0).toLocaleUpperCase() + userData.ProfileSecondName.charAt(0).toLocaleUpperCase();
        } else {
          this.Username = userData.ProfileFirstName.charAt(0).toLocaleUpperCase()
        }
      });
    }

    getRestorePresentation() {
      this._presentationservice.RestorePresentationlist().subscribe(
        (response: any) => {
          this.isLoading=false;
          if (response && response.length > 0) {
            this.isTablehide = true;
            this.presentationData = response.flatMap(item => item?.properties || []);
            this.deletedate = response.flatMap(item => item?.properties.DeleteDateTime);
            this.expiredate = response.flatMap(item => item?.properties.ExpiredDate);
    
            this.presentationData.forEach(presentation => {
              if (presentation.slides && Array.isArray(presentation.slides)) {
                presentation.slideCount = presentation.slides.length;
              } else {
                presentation.slideCount = 0;
              }
            });
          } else {
            document.getElementById('empty-trash').style.display = "block";
            document.getElementById('trash').style.display = "none";
            this.isLoading=false;

          }
        },
        (error: any) => {
          console.log(error);
        }
      );
    }
    
    
    calculateDaysDifference(dateString: string): string {
      const currentDate = new Date();
      const itemDate = new Date(dateString);
    
      const timeDifference = currentDate.getTime() - itemDate.getTime();
      const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));
    
      return daysDifference >= 0 ? `-${daysDifference} days` : `${Math.abs(daysDifference)} days`;
    }
    
 // In your component class


sortByName() {
  this.isNameAscending = !this.isNameAscending;

  this.presentationData.sort((a, b) => {
    const nameA = a.presentationName.toLowerCase();
    const nameB = b.presentationName.toLowerCase();

    if (this.isNameAscending) {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });

}



  restorePresentation(item: any): void {
    $('#restoreSuccessModal').modal('show');
    const presentationId = item.Id;
    this.presentationIds=presentationId;
    this.activeSlideId = item.slides && item.slides.length > 0 ? item.slides[0].slideId : "";
    this._presentationservice.RestorePresentation(presentationId).subscribe(
      (restoredPresentation: any) => {
        this.getRestorePresentation();
        const index = this.presentationData.findIndex(entry => entry.id === presentationId);
        if (index !== -1) {
          this.presentationData.splice(index, 1);
     
        }
        const message = getMessage(SuccessMessages.TrashSection3000,SuccessMessages.Trash3001); 
        this._toastr.success(message, "", {
          timeOut: 5000,
          });  
      },
      (error: any) => {
        const message = getErrorMessage(ErrorMessages.TrashSection3000,ErrorMessages.Trash3003); 
        this._toastr.error(message, "", {
        timeOut: 5000,
        });  
      }
    );
  }
  toggleHoverClass(index: number, isHovered: boolean): void {
    this.isHovered[index] = isHovered;

    // Get the row element by class name
    const rowElement = document.querySelector('.table-row-' + index) as HTMLElement;

    // Add or remove the class based on hover state
    if (isHovered) {
      this.renderer.addClass(rowElement, 'hovered');
      rowElement.style.boxShadow = '6px 6px 6px 0px #4848FF26';
    } else {
      this.renderer.removeClass(rowElement, 'hovered');
      rowElement.style.boxShadow = 'none';
    }
  }

    toggleselectall() {
      this.presentationData.forEach((c) => (c.selected = this.selectAll));
      this.anyCheckboxSelected = this.IsAnyCheckboxSelected();
    }
  
    checkoxchange() {
      this.anyCheckboxSelected = this.IsAnyCheckboxSelected();
      // Add any other logic you need here
    }
  
    IsAnyCheckboxSelected() {
      return this.presentationData.some((c) => c.selected);
    }
    submit(){
   const box=this.checkselectedbox;
    }
    get checkselectedbox(){
      return this.presentationData.filter((c)=>c.selected);
    }
    searchAndSortPresentations() {
      if (this.searchTerm) {
        this.presentationData = this.presentationData.filter(item =>
          item.presentationName.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
        this.isSearch = true;
      } else {
        this.getRestorePresentation();
        this.presentationData = this.presentationData.slice().reverse();
        this.isSearch = false;
      }
    }
    truncateText(text: string, limit: number): string {
      if (text.length <= limit) {
        return text;
      } else {
        return text.substring(0, limit) + '...';
      }
    }
    getTimeAgo(DeleteDateTime: any): string {
      if (!DeleteDateTime) {
        return ''; 
      }
      const utcDate = new Date(DeleteDateTime);
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
          return ` ${minutes} min${minutes !== 1 ? 's' : ''} ago`;
        } else {
          return ` ${seconds} sec${seconds !== 1 ? 's' : ''} ago`;
        }
      } else if (timeDifferenceInMilliseconds <= 172800000 && timeDifferenceInMilliseconds > 86400000) { // Between 24 and 48 hours
        return ' 1 day ago';
      } else if (timeDifferenceInMilliseconds <= 259200000 && timeDifferenceInMilliseconds > 172800000) { // Between 48 and 72 hours
        return ' 2 days ago';
      } else {
        const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
        return utcDate.toLocaleDateString('en-US', options);
      }
    }
    getSelectedPresentationIds(): string[] {
      return this.presentationData.filter(presentation => presentation.selected).map(presentation => presentation.Id);
    }
    
    restoreAllpresentation(presentationId:any){
      if (!presentationId || !presentationId[0]) {
        console.error("Invalid presentationId:", presentationId);
        return; 
      }
      const actualPresentationId = presentationId[0]; 
      $('#restoreSuccessModal').modal('show');
      this.presentationIds = actualPresentationId;
      const filteredPresentations = this.presentationData.filter(presentation => presentation.Id === actualPresentationId);
      const selectedPresentations = filteredPresentations.filter(presentation => presentation.selected);
      if (selectedPresentations.length > 0 && selectedPresentations[0].slides?.length > 0) {
        this.activeSlideId = selectedPresentations[0]?.slides[0]?.slideId || "";
      } else {
        this.activeSlideId = "";
      }      
      this._trashservice.restoreAllPresentations(presentationId).subscribe(
        (restoredPresentation: any) => {
          this.getRestorePresentation();
          this.anyCheckboxSelected=false;
          const message = getMessage(SuccessMessages.TrashSection3000,SuccessMessages.Trash3001); 
          this._toastr.success(message, "", {
            timeOut: 5000,
            }); 
        },
        (error: any) => {
          const message = getErrorMessage(ErrorMessages.TrashSection3000,ErrorMessages.Trash3001); 
          this._toastr.error(message, "", {
          timeOut: 5000,
          });  
        }
      );
    }
    removePresentation(item:any){
      const presentationId = item.Id;
      this._trashservice.removePresentation(presentationId).subscribe(
        (restoredPresentation: any) => {
          this.getRestorePresentation();
          this.anyCheckboxSelected=false;
          const message = getMessage(SuccessMessages.TrashSection3000,SuccessMessages.Trash3003); 
          this._toastr.success(message, "", {
            timeOut: 5000,
            });  
        },
        (error: any) => {
          const message = getErrorMessage(ErrorMessages.TrashSection3000,ErrorMessages.Trash3003); 
          this._toastr.error(message, "", {
          timeOut: 5000,
          });  
        }
      );
    }
    removeAllpresentation(presentationId:any){
      this._trashservice.removeAllPresentations(presentationId).subscribe(
        (restoredPresentation: any) => {
          this.getRestorePresentation();
          this.anyCheckboxSelected=false;
          const message = getMessage(SuccessMessages.TrashSection3000,SuccessMessages.Trash3003); 
          this._toastr.success(message, "", {
            timeOut: 5000,
            });  
        },
        (error: any) => {
          const message = getErrorMessage(ErrorMessages.TrashSection3000,ErrorMessages.Trash3003); 
          this._toastr.error(message, "", {
          timeOut: 5000,
          });  
        }
      );
    }
    openPresentation(id:string,activeSlideId:string) {
     // localStorage.setItem('presentationId',id);
      //localStorage.setItem('activeSlideId',activeSlideId);
      this.workSpaceService.activeSlideId = activeSlideId;
      this.workSpaceService.presentationId = id;
      this._workSpaceService.setMyPresent(true);
      this._router.navigate(['/WorkSpace/edit'], {
        queryParams: { id: id }
      });
      //link.click();
    }
    onKeyUp(event: KeyboardEvent) {
      const key = event.key;
      if (key === 'Backspace' && this.searchTerm.trim() !== '') {
        this.searchAndSortPresentations();
      }
    }
}