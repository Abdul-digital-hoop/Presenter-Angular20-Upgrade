import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, QueryList, Renderer2, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { filter, fromEvent, Subject, takeUntil } from 'rxjs';
import { CustomerLimitationsCount, CustomerPlan } from 'src/app/core/Models/customer-plan.model';
import { Profile } from 'src/app/core/Models/profile.model';
import { CustomerPlanService } from 'src/app/core/Sevices/CustomerPlan/customer-plan.service';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkSignalRServiceService } from 'src/app/core/Sevices/WorkSpace/work-signal-rservice.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { AccountService } from 'src/app/core/Sevices/account.service';
import { getErrorMessage, getMessage } from 'src/app/core/SuccessMessageHandler';
import { ErrorMessages, SuccessMessages } from 'src/app/core/SuccessResponse';
import { TrashServiceService } from 'src/app/trash-service.service';
import { MasterSlideTypeName } from 'src/app/utility/constants';
import { debounceTime } from 'rxjs';
import { trigger, state, style, animate, transition, query, stagger } from '@angular/animations';
declare let zoomSdk: any;
declare var $: any;
declare const _IntegrationMediumZoom: boolean;
@Component({
    selector: 'app-recently-view',
    templateUrl: './recently-view.component.html',
    styleUrls: ['./recently-view.component.scss'],
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
export class RecentlyViewComponent implements OnInit {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef
  previousScrollTop : number = 0;
  @ViewChildren('CenterPanel') CenterPanel!: QueryList<ElementRef>;
  @ViewChildren('InnerScreen') InnerScreen!: QueryList<ElementRef>;
  @ViewChildren('OuterScreen') OuterScreen!: QueryList<ElementRef>;
  masterSlideTypeName = MasterSlideTypeName;
  logoPositionType:string='';
  panelWidth: string = "890px";
  panelHeight: string = "500px";
  public userPreviewData : any = null;
  previewindex : any;
  @Output() public clearDynamicComponent: EventEmitter<any> = new EventEmitter<any>();
  public profile: Profile;
  svgUrl: {
    contentType: string, id: string, imageURL: string, isOption: boolean, name: string,
    orderId: Int32Array
  }[] = [];
  isSkeleton: boolean = true;
  showModal: boolean = false;
  userPresentation: any[]=[];
  IntegrationMediumZoom: boolean = _IntegrationMediumZoom;
  slideTypeId: any;
  contentType: any;
  userName: string;
  submitted = false;
  selectedPresentationId: null;
  submit: boolean;
  currentPresentationName: string = '';
  isLoading: boolean = false;
  isLoadingButton: boolean = false;
  isMenuOpen: boolean = false;
  renamePresentationForm: FormGroup;
  presentationId: string;
  id: string;
  presentationName: string;
  item: any;
  selectedItem: any;
  currentPresName: string;
  myForm: FormGroup;
  activefolder: any;
  currentPresId: string;
  successMessage: string | null = null;
  invalidmail: string | null = null;
  inviteForm: FormGroup;
  selectedOption: string = 'Editor';
  invitationDetails:any;
  inviteProfileLogo:any;
  errorMessage: any = '';
  @ViewChild('count') myElement: ElementRef;
  @ViewChildren('slideImage') slideImages: QueryList<ElementRef<HTMLImageElement>>;
  customerPlan: CustomerPlan;
  customerLimitationCount:CustomerLimitationsCount;
  activeSilideId: any;
  isInitialized: boolean = false;
  showPdf: boolean;
  slidePdfImage: any;
  isChartVisible: boolean=false;
  myPromptForm: FormGroup;
  private destroy$ = new Subject<void>();
  constructor(
    private _accountservice: AccountService, private _presentationservice: PresentationService,
    private _sanitizer: DomSanitizer, private elementRef: ElementRef,
    private _formBuilder: FormBuilder, private trashService: TrashServiceService,
    public workSpaceService:WorkspaceService,
    private renderer: Renderer2,
    private _toastr: ToastrService, private _router: Router, private fb: FormBuilder,private formBuilder: FormBuilder,private workSpaceSignalRService:WorkSignalRServiceService,private _customerPlanService: CustomerPlanService) {
    this.myForm = this.fb.group({
      presentationName: ['', [Validators.required, Validators.maxLength(100)]]
    });
    this.renamePresentationForm = this.fb.group({
      presentationId: ['', Validators.required],
      presentationName: ['', Validators.required, Validators.maxLength(100)],
    });
    this.customerLimitationCount = this._customerPlanService.getCustomerLimitationsCounts();
    this.myPromptForm = this.fb.group({
      presentationPrompt: ['', [Validators.required, Validators.maxLength(1000)]]
    })
  }

  ngOnInit(): void {
    this.isInitialized = false;
    this._accountservice.UserProfile
    .pipe(takeUntil(this.destroy$))
    .subscribe((userData) => {
      this.profile = userData;
      if (userData.ProfileSecondName) {
        this.userName = userData.ProfileFirstName.charAt(0).toLocaleUpperCase() +
                        userData.ProfileSecondName.charAt(0).toLocaleUpperCase();
      } else {
        this.userName = userData.ProfileFirstName.charAt(0).toLocaleUpperCase();
      }
    });

    this.inviteForm = this.formBuilder.group({
      presentationName: ['', [Validators.required, Validators.email]]
    });
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
    }
    this.myForm = this.fb.group({
      presentationName: ['', Validators.required]
    });
    this.myPromptForm = this.fb.group({
      presentationPrompt: ['', Validators.required]
    });
    this.renamePresentationForm = this.fb.group({
      presentationId: ['', Validators.required],
      presentationName: [this.currentPresName, [Validators.required, Validators.maxLength(100)]]
    });
    this.RecentPresentation();
    //this.getWorkSpacePresentation();
    $('[data-bs-toggle="tooltip"], [title]:not([data-bs-toggle="popover"])').tooltip('hide');
    $("body").tooltip({ selector: '[data-bs-toggle=tooltip]', trigger: 'hover' });
    $(document).on('click', '[data-bs-toggle="tooltip"], [title]:not([data-bs-toggle="popover"])', function () {
      $(this).tooltip('hide');
    });
    this.customerPlan = this._customerPlanService.getCustomerPlan();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    $('[data-bs-toggle="tooltip"]').tooltip('dispose');

    $(document).off('click', '[data-bs-toggle="tooltip"]');
  }
  get f(): { [key: string]: AbstractControl } {
    return this.myForm.controls;
  }
  ngAfterViewChecked(){
    if (Object.keys(this.customerPlan || {}).length === 0) {
      this.customerPlan = this._customerPlanService.getCustomerPlan();
    }
  }
  createNewPresentation(){
    if (this.customerLimitationCount?.balancePresentationLimit > 0) {
      $('#createNewPresentation').modal('show');
      this.myForm.reset();
    }else{return;}
  }
  createNewPresentationWithAI2(){
    if (this.customerLimitationCount?.balancePresentationLimit > 0) {
      this.showModal = true
    }else{return;}
  }
  closeNewPresentationWithAI2(){
    this.showModal = false
  }
  onSubmit() {
    if (this.customerLimitationCount?.balancePresentationLimit > 0) {
      this.submitted = true;
      // if (this.myForm.invalid) {
      //   return;
      // }
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
        this.workSpaceService.activeSlideId = '';
        this._presentationservice.createWorkSpacePresentation(payload).subscribe(
          (response: any) => {
           // localStorage.setItem("presentationId", response?.presentationId);
            //localStorage.removeItem('activeSlideId');
            this.workSpaceService.presentationId = response?.presentationId;
            this.workSpaceService.activeSlideId = response?.activeSlideId;
            this.isLoadingButton = false;
            this.myForm.reset();
            this.submitted = false;
            $('#createNewPresentation').modal('hide');
            this._router.navigate(['/WorkSpace/edit'], {
              queryParams: { id: response?.presentationId }
            });
            this.workSpaceSignalRService.netWorkValidation();
            //this._router.navigateByUrl('/workspace/' + response?.presentationId);
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
    else{
      return;
    }
    
  }
  onPromptFormSubmit() {
    if (this.customerLimitationCount?.balancePresentationLimit > 0) {
      this.submitted = true;
      this.myPromptForm.value.presentationPrompt = this.myPromptForm.value.presentationPrompt?.trim();
      if (this.myPromptForm.value.presentationPrompt == "") {
        this.myPromptForm.get('presentationPrompt').setErrors({ required: true });
        this.myPromptForm.get('presentationPrompt').markAsTouched();
        this.myPromptForm.get('presentationPrompt').invalid;
        return;
      }
      if (this.myPromptForm.get('presentationPrompt').invalid || this.myPromptForm.get('presentationPrompt').valid) {
        $('#createnewPresentationWithAI').modal('show');
        this.myPromptForm.get('presentationPrompt').markAsTouched();
      }
      if (this.myPromptForm.valid) {
        this.isLoadingButton = true;
        $('#createNewPresentationWithAI').modal('hide');
        $('#aiLoadingModal').modal('show');
        var payload = {
          prompt: this.myPromptForm.value.presentationPrompt
        }
        this.workSpaceService.activeSlideId = '';
        this._presentationservice.createWorkSpacePresentationWithAI(payload).subscribe(
          (response: any) => {
            if(response?.failed){
              $('#aiLoadingModal').modal('hide');
              $('#createNewPresentationWithAI').modal('show');
              this.myPromptForm.get('presentationPrompt')?.setErrors({ custom: response?.failedReason });
              this.myPromptForm.get('presentationPrompt')?.markAsTouched();
              this.myPromptForm.get('presentationPrompt').invalid;
              this.isLoadingButton = false;
            }
            else{
              this.workSpaceService.presentationId = response?.presentationId;
              this.workSpaceService.activeSlideId = response?.activeSlideId;
              this.isLoadingButton = false;
              this.myPromptForm.reset();
              this.submitted = false;
              $('#aiLoadingModal').modal('hide');
              this._router.navigate(['/WorkSpace/edit'], {
                queryParams: { id: response?.presentationId }
              });
              this.workSpaceSignalRService.netWorkValidation();
            }
          },
          (error: any) => {
            this.isLoadingButton = false;
            $('#aiLoadingModal').modal('hide');
            $('#createNewPresentationWithAI').modal('show');
            const message = getErrorMessage(ErrorMessages.PresentationSection2000, ErrorMessages.Presentation2005);
            this._toastr.error(message, "", {
              timeOut: 5000,
            });
          }
        )
      }
    }
    else{
      return;
    }
    
  }
  onInput() {
    this.errorMessage = '';
  }
  GetAllPresentation() {
    this._presentationservice.GetAllPresentationWithDate().subscribe(
      (response: any) => {
        //this.userPresentation = response.slice().reverse();
        this.isSkeleton = false;
      },
      (error: any) => {
        console.log(error);
      }
    )
  }
  RecentPresentation() {
    this.isLoading = true;
    this._presentationservice.RecentPresentation().subscribe(
      (response: any) => {
        if(response?.presentationsList ||response?.presentationsList?.length > 0){
          this.userPresentation = response?.presentationsList;
          this._presentationservice.setPresentation(this.userPresentation);
          this.userPresentation = this.userPresentation?.map(item => ({
            ...item,
            slides: item.slides?.sort((a, b) => a.index - b.index) 
          }));
          this.workSpaceService.isTemplate = false;
        } else {
          this.userPresentation = [];
        }
        this.isLoading = false; 
      },
      (error: any) => {
        console.log(error);
        this.userPresentation = [];
        this.isLoading = false;
      }
    )
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
    } else if (timeDifferenceInMilliseconds <= 172800000 && timeDifferenceInMilliseconds > 86400000) { // Between 24 and 48 hours
      return '1 day ago';
    } else if (timeDifferenceInMilliseconds <= 259200000 && timeDifferenceInMilliseconds > 172800000) { // Between 48 and 72 hours
      return '2 days ago';
    } else {
      const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
      return utcDate.toLocaleDateString('en-US', options);
    }
  }
  openPresenationMenuId: number | null = null;
  toggleDropdown(event: MouseEvent, item: any) {
    event.stopPropagation();
    
    if (item.isMenuOpen) {
        item.isMenuOpen = false; 
        this.openPresenationMenuId = null; 
    } else {
        this.closeMenu(); 
  
        this.openPresenationMenuId = item.Id; 
        item.isMenuOpen = true; 
    }
}
  
  closeMenu() {
    this.userPresentation?.forEach(item => {
      item.isMenuOpen = false; 
    });
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;
    if (!targetElement.classList.contains('menu-item')) {
      this.closeMenu();
    }
  }

  closeAllPopups() {
    this.closeMenu();
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

  ToPresent(id: string, slideid: string) {

  }
  cancelPresentationFolder() {
    this.myForm.reset();
    this.submitted = false;
    this.renamePresentationForm.reset();
    $('#RenameFolder').modal('hide');
    this.selectedPresentationId = null;
  }
  close() {
    document.getElementById('menu-list').style.display = 'none';
  }
  renamePresentation(item: any) {
    this.currentPresId = item.presentationId;
    this.currentPresName = item.presentationName;

    if (this.renamePresentationForm.get('presentationName').invalid || this.renamePresentationForm.get('presentationName').valid) {
      $('#RenamePresentation').modal('show');

      setTimeout(() => {
        this.renamePresentationForm.get('presentationName').setValue(this.currentPresName);
        this.item.isMenuOpen = false;
      }, 0);

      return;
    }
  }


  updatePresentation() {
    const id = this.currentPresId;
    let presentationName = this.renamePresentationForm.get('presentationName').value.trim();
    const originalPresentationName = this.currentPresName;

    if (!presentationName || presentationName === originalPresentationName ) {
      this.renamePresentationForm.get('presentationName').markAsTouched();
      if(presentationName == ""){
        return;
      }
      $('#RenamePresentation').modal('hide');
      return;
    }

    if (!id) {
      console.error('Invalid id');
      return;
    }

    this._presentationservice.renamePresentation(id, presentationName)
      .subscribe(
        (response) => {
          $('#RenamePresentation').modal('hide');
          this.closeAllPopups();
          this.renamePresentationForm.reset();
          this.RecentPresentation();
          const message = getMessage(ErrorMessages.PresentationSection2000,ErrorMessages.Presentation2001); 
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

    this.selectedPresentationId = null;


    this.renamePresentationForm.reset();


  }
  CancelPresentation() {
    $('#createNewPresentation').modal('hide');

    this.myForm.reset();
  }
  CancelAIPresentation() {
    $('#createNewPresentationWithAI').modal('hide');

    this.myPromptForm.reset();
  }
  duplicatePresentation(id: string) {
    if(this.customerLimitationCount?.balancePresentationLimit > 0){
      const data = {presentationId:id,
        folderId:null};
      this._presentationservice.duplicatePresentation(data)
        .subscribe(
          (response) => {
            this.customerLimitationCount.balancePresentationLimit = this.customerLimitationCount.balancePresentationLimit - 1;
            this.closeAllPopups();
            const link = `<a href="/app/dashboard"><u>MyPresentations</u></a>`;
            const message = getMessage(SuccessMessages.PresentationSection2000,SuccessMessages.Presentation2002); 
            this._toastr.success(`${message}`, "", {
              enableHtml: true,
              timeOut: 5000
            });
            this.RecentPresentation();
          },
          (error) => {
            const message = getErrorMessage(ErrorMessages.PresentationSection2000,ErrorMessages.Presentation2002); 
            this._toastr.error(message, "", {
            timeOut: 5000,
            }); 
          }
        );
    }
  }
  deletepresentation(): void {
    this.selectedItem
    this._presentationservice.PresentationDelete(this.selectedItem).subscribe(
      (response: any) => {
        this.RecentPresentation();
        $('#presentationDelete').modal('hide');
        const trashLink = `<a href="/app/trash"><u>Go to trash</u></a>`;
        const message = getMessage(SuccessMessages.PresentationSection2000,SuccessMessages.Presentation2003);
        this._toastr.success(`${message}`, "", {
          enableHtml: true,
          timeOut: 5000,
        });
      },
      (error: any) => {
        this.isLoading = false;
        const message = getErrorMessage(ErrorMessages.PresentationSection2000,ErrorMessages.Presentation2003); 
        this._toastr.error(message, "", {
          timeOut: 5000,
        });
      }
    );
  }
  openDeletePresentation(id: string, presentationName: string) {
    this.selectedItem = id;
    this.currentPresentationName = this.userPresentation.find(item => item.id === id)?.presentationName;
    $('#presentationDelete').modal('show');
    this.currentPresentationName = presentationName;
  }
  openShare() {
    $('#share').modal('show');
  }
  selectedContent: number = 1;

  loadContent(contentNumber: number): void {
    this.selectedContent = contentNumber;
  }
  invitetoedit(item:any) {
    this.currentPresId = item.Id;
    this.getInviteMails();
    $('#presentations-mobile').modal('hide');
    $('#presentation-mobile').modal('hide');
  }
  getInviteMails(){
    this._presentationservice.getInvitationsDetails(this.currentPresId).subscribe(
      (response:any) =>{
        this.invitationDetails = response.inviteAccess;
        $('#invitetoedit').modal('show');
      },
      (error:any) => {
        this.invitationDetails = [];
        $('#invitetoedit').modal('show');
        console.log(error);
      }
    );    
  }
  extractNameAndDomainFromEmail(email:string){
    const pattern = /^([^@]+)@(.*)$/;
    const match = pattern.exec(email);
    var name = match ? match[1] : ''; 
    var domain = match ? match[2] : ''; 
    return name;
  }
  sendEmail() {
    this.inviteForm.get('presentationName').setValue(this.tags);
    const emailArray = this.inviteForm.get('presentationName').value;
    // if (Array.isArray(emailArray) && emailArray.length > 0) {
      // this.successMessage = 'email address validated';
    // } 
    const isValid = emailArray.every((email: string) => Validators.email({ value: email } as any) === null);
    if (Array.isArray(emailArray) && emailArray.length > 0 && isValid) { //this.inviteForm.valid
        const formData = {
            customerId: this.profile.ProfileId,
            presentationId: this.currentPresId,         
            email: emailArray,
            accessRole: this.selectedOption 
        };
        this._presentationservice.sendInvitations(formData).subscribe(
            (response:any) => {
                this.successMessage = 'Invites Sent Successfully';
                this.invalidmail = '';
                this.inviteForm.get('presentationName').setValue("");
                this.getInviteMails();
            },
            (error:any) => {
                console.error('Error sending data:', error);
                this.invalidmail = 'Failed to Send Invitation';
                this.successMessage = '';
                this.inviteForm.get('presentationName').setValue("");
            }
        );
    } else {
        this.invalidmail = 'Failed to Send Invitation';
        if(!isValid){
          this.invalidmail ='Please enter a valid email address' ;
        }
        this.successMessage = '';
        this.inviteForm.get('presentationName').setValue("");
        // const emailFormControl = this.inviteForm.get('presentationName');
        // if (emailFormControl.errors && emailFormControl.errors.email) {
        //     this.successMessage = 'Please enter a valid email address';
        // }
    }
}
  changeRole(access:any,role) {
    const Updaterole = {
      customerId: this.profile.ProfileId,
      presentationId: this.currentPresId,         
      email: access.email,
      accessRole: role 
  };
  this._presentationservice.updateinvitedetails(Updaterole).subscribe(
    (response:any) => {
      // document.getElementById("selectedRole").textContent = role;
      const invitationlist = response.inviteAccess;     
      invitationlist.forEach((list: any) => {
        if (access.email == list.email ) {
          access.accessRole = list.accessRole;
          this.successMessage = 'Access Changed Successfully';
          setTimeout(() => 
            this.successMessage = '' ,
           2000);
        }
      });
    },(error:any) => {
      console.log(error);
    });
  }
  removeEmail(access:any){
    const Removeinvite={
      customerId: this.profile.ProfileId,
      presentationId: this.currentPresId,         
      email: access.email,
    };
    this._presentationservice.removeinvitedetails(Removeinvite).subscribe(
      (response:any) => {
        this.invitationDetails = response.inviteAccess;
        this.successMessage = 'Remove  successfully';
        setTimeout(() => 
          this.successMessage= '' ,
         2000);

      },
      (error:any) => {
        console.log(error);
      });
    
  }
  tags: string[] = [];
  onKeyDown(event: KeyboardEvent) {
    const inputValue = (event.target as HTMLInputElement).value.trim();
    if ((event.key === 'Enter' || event.key === ','|| event.key ===' ') && inputValue !== '') {
      this.addTag(inputValue);
     
      (event.target as HTMLInputElement).value = '';
    }
  }
  onclickout(event:any){
    const inputValue = (event.target as HTMLInputElement).value.trim();
    if (inputValue !== '') {
      this.addTag(inputValue);     
      (event.target as HTMLInputElement).value = '';
    }
  }

  addTag(tagValue: string) {
    if (!this.tags.includes(tagValue)) {
      this.tags.push(tagValue);
    }
  }
  removeTag(tag: string) {
    this.tags = this.tags.filter(t => t !== tag);
  }
  selectOption(option: string) {
    this.selectedOption = option;
  }

  // New Work Space
  getWorkSpacePresentation(){
    this._presentationservice.getWorkSpacePresentation().subscribe(
    (reponse:any)=>{
      this.workSpaceService.presentationList = reponse;
    },
    (error:any)=>{
      
    }
    )
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
          this.workSpaceService.activeSlideId = activeSlideId;
        this.viewWorkSpace(presentationId, activeSlideId, presentationName);
        }
      } catch (error) {
        this.workSpaceService.activeSlideId = activeSlideId;
        this.viewWorkSpace(presentationId, activeSlideId, presentationName);
      }
    } else {
      this.workSpaceService.activeSlideId = activeSlideId;
      this.viewWorkSpace(presentationId, activeSlideId, presentationName);
    }
  }
  viewWorkSpace(presentationId: any, activeSlideId: any, presentationName: any): void {
    $('#presentationMode-To-Open').modal('hide');
    this.clearDynamicComponent.emit();
   // localStorage.setItem('presentationId', presentationId);
   // localStorage.setItem('activeSlideId', activeSlideId);
   this.workSpaceService.activeSlideId = activeSlideId;
   this.workSpaceService.presentationId = presentationId;
    this.workSpaceService.setMyPresent(false);
    this._router.navigate(['/WorkSpace/edit'], {
      queryParams: { id: presentationId }
    });
    
  }
  
  openPresentation(id:string,activeSlideId:any,presentationName:string) {
    //localStorage.setItem('presentationId',id);
    //localStorage.setItem('activeSlideId',activeSlideId);
    this.workSpaceService.activeSlideId = activeSlideId;
    this.workSpaceService.presentationId = id;
    this.workSpaceService.setMyPresent(false);
    this._router.navigate(['/WorkSpace/edit'], {
      queryParams: { id: id }
    });
    //link.click();
  }
  openSlideOneRemote(id:any,activeSlideId:any) {
    if( this.customerPlan.remote){
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
  ngAfterViewInit(){
    this._accountservice.isbalancePresentationLimit$.subscribe((value: boolean) => {
      this.isInitialized = value;
    });

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
    if (changes['templateList']) {
      const currentValue = changes['templateList'].currentValue;
      if (currentValue && currentValue.length > 0) {
        setTimeout(() => {
          this.waitForViewChildren();
        });
      }
    }
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

}
