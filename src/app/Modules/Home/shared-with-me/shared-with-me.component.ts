import { Component, HostListener, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Profile } from 'src/app/core/Models/profile.model';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { TeamService } from 'src/app/core/Sevices/Team/team.service';
import { AccountService } from 'src/app/core/Sevices/account.service';
import { getErrorMessage, getMessage } from 'src/app/core/SuccessMessageHandler';
import { ErrorMessages, SuccessMessages } from 'src/app/core/SuccessResponse';
import { TrashServiceService } from 'src/app/trash-service.service';
declare var $: any;
@Component({
    selector: 'app-shared-with-me',
    templateUrl: './shared-with-me.component.html',
    styleUrls: ['./shared-with-me.component.scss'],
    standalone: false
})
export class SharedWithMeComponent implements OnInit {
  presentationData: any[] = [];
  presentationDatas: any[] = [];
  Hovered: boolean[] = [];
  IsHovered: boolean[] = [];
  userName: string;
  public profile: Profile;
  isFullScreen: boolean = false;
  selectedItem: any;
  currentPresentationName: string | undefined;
  userPresentation: any;
  openPresenationMenuId: number | null = null;
  showMenu: boolean = false;
  presentationresponsive: any;
  currentPresId: string;
  currentPresName: string;
  myForm: FormGroup;
  renamePresentationForm:FormGroup;
  isSkeleton: boolean = true;
  submitted = false;
  isLoading: boolean = false;
  constructor(private teamservice:TeamService,
    private renderer: Renderer2,
    private _accountservice: AccountService,
    private _sanitizer: DomSanitizer,
    private _presentationservice: PresentationService,
    private router: Router,
    private fb: FormBuilder,
    private _toastr: ToastrService,
    private trashService: TrashServiceService,
   ) { 
    this.myForm = this.fb.group({
      presentationName: ['', [Validators.required, Validators.maxLength(100)]]
    });
    this.renamePresentationForm = this.fb.group({
      presentationId: ['', Validators.required],
      newPresentationName: ['', [Validators.required, Validators.maxLength(100)]]
    });
   }

  ngOnInit(): void {
    this.GetRestorePresentation();
    this.teamservice.presentationData$.subscribe((data) => {
      if (data) {
        this.presentationData = Array.isArray(data) ? data : [data];
      }
    });
    this._accountservice.UserProfile.subscribe((userData) => {
      this.profile = userData;
      if (userData.ProfileSecondName) {
        this.userName = userData.ProfileFirstName.charAt(0).toLocaleUpperCase() + userData.ProfileSecondName.charAt(0).toLocaleUpperCase();
      } else {
        this.userName = userData.ProfileFirstName.charAt(0).toLocaleUpperCase()
      }
    });

    this.GetAllPresentationWithDate();
  }
  GetRestorePresentation() {
    const teamId = localStorage.getItem('teamId');
    this.teamservice.GetsharedPresentations(teamId).subscribe(
      (response: any) => {
        if (response && response.presentations !== null) {
          this.presentationDatas = response.presentations.map((item: any) => item.properties);
          this.presentationDatas.forEach(presentation => {
            if (presentation.slide && Array.isArray(presentation.slide)) {
              presentation.slideCount = presentation.slide.length;
            } else {
              presentation.slideCount = 0;
            }
          });
        } else {
          document.getElementById('empty-share').style.display = "block";
          document.getElementById('share').style.display = "none";
        }
      },
      (error: any) => {
        document.getElementById('empty-share').style.display = "block";
        document.getElementById('share').style.display = "none";
        console.log(error);
      }
    );
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

    // Get the row element by class name
    const rowElement = document.querySelector('.userpresentation-' + index) as HTMLElement;


    // Add or remove the class based on hover state
    if (Hovered) {
      this.renderer.addClass(rowElement, 'hovered');
     
    } else {
      this.renderer.removeClass(rowElement, 'hovered');
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
      return `Edited ${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `Edited ${minutes} min${minutes !== 1 ? 's' : ''} ago`;
    } else {
      return `Edited ${seconds} sec${seconds !== 1 ? 's' : ''} ago`;
    }
  } else if (timeDifferenceInMilliseconds <= 172800000 && timeDifferenceInMilliseconds > 86400000) { // Between 24 and 48 hours
    return 'Edited 1 day ago';
  } else if (timeDifferenceInMilliseconds <= 259200000 && timeDifferenceInMilliseconds > 172800000) { // Between 48 and 72 hours
    return 'Edited 2 days ago';
  } else {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    return utcDate.toLocaleDateString('en-US', options);
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
        console.log(error);
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

openDeletePresentation(id:string,presentationName: string){
  this.selectedItem =id;
  this.currentPresentationName = presentationName;
  this.currentPresentationName = this.userPresentation.find(item => item.id === id)?.presentationName;
  $('#presentations-mobile').modal('hide');
  $('#presentation-mobile').modal('hide');
  $('#presentationDelete').modal('show');
}

view(event: MouseEvent, item) {
  event.stopPropagation();
  this.closeviewMenu();
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
   

}
}
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
for (let i = 0; i < viewMenus.length; i++) {
  const viewMenu = viewMenus[i];
  viewMenu.style.display = 'none';
}
}

@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {
  const clickedElement = event.target as HTMLElement;
const modalElement = document.getElementById('renamePresentation'); 

if (modalElement && modalElement.contains(clickedElement)) {
  return;
}
  this.closeContextMenu();
  this.closeviewMenu();
  
}
@HostListener('window:click', ['$event'])
onWindowClick(event: MouseEvent) {
  this.closevienWindow()
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
openpresentationresponsive(items:any){
  this.presentationresponsive=items;
  $('#presentation-mobile').modal('show');
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
duplicatePresentation(id:string){
  $('#presentation-mobile').modal('hide');
  this._presentationservice.duplicatePresentation(id)
  .subscribe(
    (response) => {
      const message = getMessage(SuccessMessages.PresentationSection2000,SuccessMessages.Presentation2002); 
     // this._toastr.success(`"${response.presentationName}" ${message}`, "", {
      //   enableHtml: true,
      //   timeOut: 5000 
      // });
     this.GetAllPresentationWithDate();
    },
    (error) => {
      const message = getErrorMessage(ErrorMessages.PresentationSection2000,ErrorMessages.Presentation2002); 
      this._toastr.error(message, "", {
      timeOut: 5000,
      }); 
    }
  );
}
GetAllPresentationWithDate(){
  const pageNumber =1;
  this._presentationservice.GetAllPresentationWithDate().subscribe(
    (response: any) => {
      if(response && response.length > 0){
        this.userPresentation = response.map((item: any) => item.properties).reverse();
        this.isSkeleton = false;
      }
     else{
      // document.getElementById('empty-share').style.display = "block";
      // document.getElementById('share').style.display = "none";
     }
    },
    (error: any) => {
      console.log(error);
    }
  )
}
cancelpresentaion(){
  $('#presentations-mobile').modal('hide');
  $('#presentation-mobile').modal('hide');
}
cancelRenameFolder() {
  this.submitted = false;
  $('#RenameFolder').modal('hide');
}
updatePresentation() {
  const id = this.currentPresId;
  const presentationName = this.renamePresentationForm.get('newPresentationName').value.trim();
  const originalPresentationName = this.currentPresName;

  if (!presentationName || presentationName === originalPresentationName) {
    this.renamePresentationForm.get('newPresentationName').markAsTouched();

    return;
  }

  if (!id || !presentationName) {
    console.error('Invalid id or presentationName');
    return;
  }

  this._presentationservice.renamePresentation(id, presentationName)
    .subscribe(
      (response) => {
        $('#renamePresentation').modal('hide');
       
        this.renamePresentationForm.reset();
        this.GetAllPresentationWithDate();
        const message = getMessage(SuccessMessages.PresentationSection2000,SuccessMessages.Presentation2001); 
        this._toastr.success(`${message}`, "", {
          timeOut: 5000,
        });
      },
      (error) => {
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
deletepresentation(): void {
  this.selectedItem
  this._presentationservice.PresentationDelete(this.selectedItem).subscribe(
    (response:any) => {
      this.GetAllPresentationWithDate();
    $('#presentationDelete').modal('hide');
    this.trashService.setPresentationData(response);
    const message = getMessage(SuccessMessages.FolderSection9000,SuccessMessages.Folder9004);
    this._toastr.success(`${message}`,
    "", {
      timeOut: 5000,
    });
  },
    (error: any) => {
      const message = getMessage(SuccessMessages.FolderSection9000,SuccessMessages.Folder9004); 
      this._toastr.error(message, "", {
        timeOut: 5000,
      });
    }
  );
}
}
