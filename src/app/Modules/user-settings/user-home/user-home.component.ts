import { Component, ElementRef, Inject, OnInit, Renderer2, RendererFactory2, ViewChild } from '@angular/core';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { AccountService } from 'src/app/core/Sevices/account.service';
import { Profile } from 'src/app/core/Models/profile.model';
import { UsersettingsService } from 'src/app/core/Sevices/usersettings.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ToastrService } from 'ngx-toastr';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DOCUMENT, ViewportScroller } from '@angular/common';
import { Router } from '@angular/router';
import { getErrorMessage, getMessage } from 'src/app/core/SuccessMessageHandler';
import { ErrorMessages, SuccessMessages } from 'src/app/core/SuccessResponse';
import { FileHandle } from 'src/app/shared/directive/dragDrop.directive';
declare var $: any;
@Component({
    selector: 'app-user-home',
    templateUrl: './user-home.component.html',
    styleUrls: ['./user-home.component.scss'],
    animations: [
        trigger('rotateAnimation', [
            state('open', style({ transform: 'rotate(180deg)' })),
            state('closed', style({ transform: 'rotate(0deg)' })),
            transition('open <=> closed', animate('300ms ease-in-out')),
        ]),
        trigger('fadeInOut', [
            state('visible', style({ opacity: 1, height: '*' })),
            state('hidden', style({ opacity: 0, height: '0' })),
            transition('visible <=> hidden', animate('300ms ease-in-out')),
        ]),
    ],
    standalone: false
})
export class UserHomeComponent implements OnInit {

  public Profile: Profile; 
  userName: string;
  usersubmitted = false;
  emailsubmitted = false;
  passwordsubmitted= false
  savenamecheck=false;
  saveemailcheck=false;
  savepasswordcheck=false;
  logoutcheck=false;
  userctrls:any;
  emailctrls:any;
  passwordctrls:any;
    incorrectpassword = false;
    invalidemail = false;
    invalidimgsize = false;
    invalidimgtype = false;
    invalidimgexetension:any;
    showTooltip = false;
    showremovetip = false;
    currentAccountDetails:any;
    updatedDetails:any;
    allowedFileTypes: string[] = [
        'jpg',
        'png',
        'gif',
        'jpeg'
      ];
    allowedSizeType: number = 15360;
    imageChangedEventimg:any;
    imageChangedEvent: any = '';
    croppedPositionForGrid: { x1: number; y1: number; x2: number; y2: number; };
    croppedImageForGrid: string;
    aspectRatio: number;
    maintainAspectRatio: boolean;
    usersettingsform : FormGroup;
    useremailsettingsform : FormGroup;
    userpasswordsettingsform : FormGroup;
    Deleteaccountform:FormGroup;
    invaliddelete:boolean = false;
    password : string = "";
    profileImage: any;
    profile: any;
    isText: boolean = true;
    isText1: boolean = true;
    isText2: boolean = true;
    isText3: boolean = true;
    isText4: boolean = true;
    passwordType: string="password";
    passwordType1: string="password";
    passwordType2: string="password";
    passwordType3: string="password";
    passwordType4: string="password";
    signUpMedium:any;
    files: FileHandle[] = [];
    profile_name: string;
    isFileOpen : boolean = false;
    showCropper: boolean = true;
    cropperRatio: boolean = false;
    selectedImageFormat: any;
    isBase64Image: boolean | null = null;
    userProfileImageDisabled: boolean = false;
    isLoadingButton: boolean = false;
    token: string;
    private renderer: Renderer2;
    dropdownStates: { [key: string]: { rotate: 'open' | 'closed'; visibility: 'visible' | 'hidden' } } = {};
    nativevalue : any;
    @ViewChild('dropdown1') dropdown1: ElementRef;
    @ViewChild('dropdown2') dropdown2: ElementRef;
    @ViewChild('dropdown3') dropdown3: ElementRef;
    @ViewChild('dropdown4') dropdown4: ElementRef;
    @ViewChild('dropdown5') dropdown5: ElementRef;
    @ViewChild('dropdown6') dropdown6: ElementRef;
    @ViewChild('confirmationModal') confirmationModal: ElementRef;
    @ViewChild('confirmationModal1') confirmationModal1: ElementRef;
    @ViewChild('confirmationModal2') confirmationModal2: ElementRef;
    @ViewChild('imageModal') imageModal: ElementRef;
    @ViewChild('imageDisplayModal') imageDisplayModal: ElementRef;
    @ViewChild('imageDisplayModal1') imageDisplayModal1: ElementRef;
    @ViewChild('imageFormatUnsupportedModal')imageFormatUnsupportedModal:ElementRef;
    
    selectedImage: any;
    cropper = {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
      };
    emptyCropperPosition = { x1: 0, y1: 0, x2: 0, y2: 0 };
    isLoading = false;
    constructor(private rendererFactory: RendererFactory2, 
        private _accountservice: AccountService,
        private _usersettingservice: UsersettingsService,
        private _toastr: ToastrService,
        private _formBuilder: FormBuilder,
        private _http: HttpClient,
        private router: Router,
        @Inject(DOCUMENT) private document: Document,
        private el: ElementRef,
        private viewportScroller: ViewportScroller
        ) {
        this.renderer = this.rendererFactory.createRenderer(null, null);
        this.initializeDropdownState('dropdown1');
        this.initializeDropdownState('dropdown2');
        this.initializeDropdownState('dropdown3');
        this.initializeDropdownState('dropdown4');
        this.initializeDropdownState('dropdown5');
        this.initializeDropdownState('dropdown6');
        this.token = this._accountservice.getToken();
        this.GetUserSettingsID(this.token);
    }
    ngOnInit(): void {
        this._accountservice.UserProfile.subscribe((userData) => {
            this.Profile = userData;
            if (userData.ProfileSecondName) {
              this.userName = userData.ProfileFirstName.charAt(0).toLocaleUpperCase() + userData.ProfileSecondName.charAt(0).toLocaleUpperCase();
            } else {
              this.userName = userData.ProfileFirstName.charAt(0).toLocaleUpperCase();
            }
          });
          this.updateAccountSettings();   
          document.addEventListener('dragover', this.preventDefaultDragAndDrop);
          document.addEventListener('drop', this.preventDefaultDragAndDrop);   
    }
    ngAfterViewInit() {
        $("body").tooltip({ selector: '[data-bs-toggle=tooltip]', trigger: 'hover'});
        this.showCropper = !this.showCropper;
     }
     ngOnDestroy() {
       $("body").tooltip('dispose');
       document.removeEventListener('dragover', this.preventDefaultDragAndDrop);
       document.removeEventListener('drop', this.preventDefaultDragAndDrop);
     }
    
    updateAccountSettings(){
        this.usersettingsform = this._formBuilder.group({
          profilename:['',[Validators.required,Validators.maxLength(60)]],
          profileimage:'',
        }),
        this.useremailsettingsform = this._formBuilder.group({
            email:['',[Validators.required,Validators.email]],
            password:['',[Validators.required]],
            newemail:['',[Validators.required,Validators.email]],
        }),
        this.userpasswordsettingsform = this._formBuilder.group({
            currentpassword:['',[Validators.required,Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/)]],
            newpassword:['',[Validators.required,Validators.minLength(8),
                Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/)]],
            confirmpassword:['',[Validators.required,Validators.minLength(8),
                Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/)]],
        })
        this.Deleteaccountform= this._formBuilder.group({
            deleteemail:['',[Validators.required,Validators.email]],
        })
       
    }
    hideshowpass() {
        this.isText = !this.isText;
        this.passwordType = this.isText ? "password" : "text";
      }
      
      hideshowpass1() {
        this.isText1 = !this.isText1;
        this.passwordType1 = this.isText1 ? "password" : "text";
      }
      
      hideshowpass2() {
        this.isText2 = !this.isText2;
        this.passwordType2 = this.isText2 ? "password" : "text";
      }
      hideshowpass3() {
        this.isText3 = !this.isText3;
        this.passwordType3 = this.isText3 ? "password" : "text";
      }
      hideshowpass4() {
        this.isText4 = !this.isText4;
        this.passwordType4 = this.isText4 ? "password" : "text";
      }
   customSetAccountSettingsForm(){
    if(this.currentAccountDetails?.lastName != ''){
        this.profile_name= `${this.currentAccountDetails?.firstName} ${this.currentAccountDetails?.lastName}`;
    }
    else{
        this.profile_name= `${this.currentAccountDetails?.firstName}`;
    }
    this.usersettingsform
        .get("profilename")
        .setValue(this.profile_name);
        this.useremailsettingsform
            .get("email")
            .setValue(this.currentAccountDetails?.email);
        this.useremailsettingsform
            .get("password")
            .setValue(this.password);
        this.userpasswordsettingsform
            .get("currentpassword")
            .setValue("");
        this.userpasswordsettingsform
            .get("newpassword")
            .setValue("");
        this.userpasswordsettingsform
            .get("confirmpassword")
            .setValue("");    
      }
    GetUserSettingsID(token:any) {
        this._usersettingservice.GetUserDetails(token).subscribe(
            (response: any) => {
                this.currentAccountDetails = response;
                this.currentAccountDetails.profileImage = response.imageUrl;
                this.currentAccountDetails.profileCropImage = response.imageCropUrl;
                this.currentAccountDetails.cropperPosition = JSON.parse(this.currentAccountDetails.cropperPosition);
                this.signUpMedium = response.signUpMedium;
                if(this.currentAccountDetails?.lastName != ''){
                    this.usersettingsform
                    .get("profilename")
                    .setValue(`${this.currentAccountDetails?.firstName} ${this.currentAccountDetails?.lastName}`);
                }
                else{
                    this.usersettingsform
                    .get("profilename")
                    .setValue(`${this.currentAccountDetails?.firstName}`);
                }
               
                this.useremailsettingsform
                    .get("email")
                    .setValue(this.currentAccountDetails?.email);
                this.useremailsettingsform
                    .get("password")
                    .setValue(this.password);
                this.userpasswordsettingsform
                    .get("currentpassword")
                    .setValue("");
                this.userpasswordsettingsform
                    .get("newpassword")
                    .setValue("");
                this.userpasswordsettingsform
                    .get("confirmpassword")
                    .setValue("");    
            },
            (error: any) => {
               console.log(error);
            }
        );
    }
    
    onSubmit(form:any) {
        if (this.usersettingsform.invalid && form === this.usersettingsform){
            this.usersubmitted = true;
            this.usersettingsform.markAllAsTouched();           
        }else if( this.useremailsettingsform.invalid && form === this.useremailsettingsform){
            this.emailsubmitted = true;
            this.useremailsettingsform.markAllAsTouched();
        }else if(this.userpasswordsettingsform.invalid && form === this.userpasswordsettingsform) {
            this.passwordsubmitted= true; 
            this.getDropdownElement('dropdown3');
            this.showDropdown(this.nativevalue,'dropdown3');
            this.userpasswordsettingsform.markAllAsTouched();  
        }  
        if (this.usersettingsform.valid && form === this.usersettingsform) {
            this.updateName();
            this.usersubmitted= false;
            this.emailsubmitted = false;
            this.passwordsubmitted= false; 
            this.useremailsettingsform.markAsUntouched();this.useremailsettingsform.clearValidators();
            this.userpasswordsettingsform.markAsUntouched();this.userpasswordsettingsform.clearValidators(); 
        } else if (this.useremailsettingsform.valid && form === this.useremailsettingsform){
            this.updateemail();
            this.usersubmitted = false;
            this.emailsubmitted = false;
            this.passwordsubmitted= false; 
            this.usersettingsform.markAsUntouched();this.usersettingsform.clearValidators();           
            this.userpasswordsettingsform.markAsUntouched();this.userpasswordsettingsform.clearValidators(); 
        } else if(this.userpasswordsettingsform.valid && form === this.userpasswordsettingsform){
            this.updatepassword();
            this.usersubmitted = false;
            this.emailsubmitted = false;
            this.passwordsubmitted= false; 
            this.usersettingsform.markAsUntouched();this.usersettingsform.clearValidators();
            this.useremailsettingsform.markAsUntouched();this.useremailsettingsform.clearValidators();
        } 
        else {
           return;            
        }
        
    }
    updateName(){
        var payload = this.usersettingsform.value;
        const fullName = payload['profilename'];
        var last_Name = "";
        const match = fullName.match(/^(.*?)\s+(.*)$/);
        if (match != null){
            var first_name = match[1];
            last_Name = match[2];
        } else {
            var first_name = payload['profilename'];
        }
        const values = {
            firstName: first_name,
            lastName:last_Name,
            Email:this.currentAccountDetails?.email,
        };    
        this._usersettingservice.UpdateUserDetails(values).subscribe(
            (response: any) => {
                this.usersettingsform.markAsUntouched();
                this.savenamecheck = true;
                setTimeout(() => {
                        this.savenamecheck = false;
                      }, 1000);
                if(response.lastName != ''){
                    this.usersettingsform
                    .get("profilename")
                    .setValue(`${response.firstName} ${response.lastName}`);
                }
                this.usersettingsform
                .get("profilename")
                .setValue(`${response.firstName}`);
                this.currentAccountDetails.firstName = response.firstName;
                this.currentAccountDetails.lastName = response.lastName;
                const uservalues={
                    ProfileFirstName: response.firstName ,
                    ProfileSecondName:response.lastName,
                    ProfileImgUrl:response.imageCropUrl,
                }
                this.customSetAccountSettingsForm();
                this._accountservice.StoreUserValue(uservalues);
                const message = getMessage(SuccessMessages.UserProfileSection10000,SuccessMessages.UserProfile10003); 
                this._toastr.success(message, "", {
                    timeOut: 5000,
                });  
            },
             (error: any) => {
                const message = getErrorMessage(ErrorMessages.UserProfileSection10000,ErrorMessages.UserProfile10003); 
                this._toastr.error(message, "", {
                    timeOut: 5000,
                  });
            }
        );
    }
    updateemail(){
        var payload= this.useremailsettingsform.value;
        if(payload['newemail'])
        {
            const emailvalues={
                customerId:this.currentAccountDetails?.customerId,
                Email:payload['newemail'],
                Password:payload['password']                    
            };
        this._usersettingservice.UpdateUserEmailDetails(emailvalues).subscribe(
             (response:any) => {
                this.useremailsettingsform.controls.password.clearValidators();
                if(response){
                    this.saveemailcheck = true;
                    this.incorrectpassword = false;
                    this.currentAccountDetails.email = response.email;
                    const uservalues={
                        ProfileFirstName: response.firstName ,
                        ProfileSecondName:response.lastName,
                        ProfileImgUrl:response.imageCropUrl,
                    }
                    this._accountservice.StoreUserValue(uservalues);
                    setTimeout(() => {
                        this.saveemailcheck = false;
                      }, 1000);
                      const message = getMessage(SuccessMessages.UserProfileSection10000,SuccessMessages.UserProfile10004); 
                      this._toastr.success(message, "", {
                          timeOut: 5000,
                      });   
                }
               
             },(error:any) => {
                if (error) {
                    const message = getErrorMessage(ErrorMessages.UserProfileSection10000,ErrorMessages.UserProfile10004); 
                    this._toastr.error(message, "", {
                    timeOut: 5000,
                    });
                } else {
                    const message = getErrorMessage(ErrorMessages.UserProfileSection10000,ErrorMessages.UserProfile10004); 
                    this._toastr.error(message, "", {
                    timeOut: 5000,
                    }); 
                }

            });
    }else {
        this.invalidemail = true;
        this.incorrectpassword = true;
    }
}

    updatepassword(){
        // document.getElementById('change-password').style.marginBottom="75px";
     var payload = this.userpasswordsettingsform.value;
        if(this.userpasswordsettingsform.valid && (payload.newpassword == payload.confirmpassword)){
            const passwordvalues = {
                currentPassword: this.userpasswordsettingsform.get('currentpassword').value,
                password: this.userpasswordsettingsform.get('confirmpassword').value,
                newPassword:payload['newpassword']
            };
             this._usersettingservice.UpdateUserPasswordDetails(passwordvalues).subscribe(
                (response: any) => {
                     if (response == true) {
                         this.savepasswordcheck = true;
                         setTimeout(() => {
                             this.savepasswordcheck = false;
                         }, 1000);
                        this.userpasswordsettingsform.reset();
                        this.userpasswordsettingsform.clearValidators();
                        this.userpasswordsettingsform.markAsUntouched(); 
                        const message = getMessage(SuccessMessages.UserProfileSection10000,SuccessMessages.UserProfile10005);                                             
                        this._toastr.success(message, "", {
                          timeOut: 3000,
                        });   
                    }  
                },
                (error: any) => {
                   this.userpasswordsettingsform.reset();
                   this.userpasswordsettingsform.clearValidators();
                   this.userpasswordsettingsform.updateValueAndValidity();
                   this.incorrectpassword = true;
                   const message = getErrorMessage(ErrorMessages.UserSection1000,ErrorMessages.User1004); 
                   this._toastr.error(message, "", {
                   timeOut: 5000,
                   });  
               }
             );
        } 
         else {
            const message = getErrorMessage(ErrorMessages.UserSection1000,ErrorMessages.User1004); 
            this._toastr.error(message, "", {
            timeOut: 5000,
            });  
         } 
    }
    DeleteAccount(){
     if(this.Deleteaccountform.valid && (this.Deleteaccountform.controls.deleteemail.value == this.currentAccountDetails?.email)){
        this.invaliddelete = false;
        var DeleteUserId = this.currentAccountDetails?.customerId;                   
        this._usersettingservice.DeleteUserDetails(DeleteUserId).subscribe(           
            (response: any) => {
                if (response == true) { 
                    const message = getMessage(SuccessMessages.UserProfileSection10000,SuccessMessages.UserProfile10006); 
                    this._toastr.success(message, "", {
                        timeOut: 5000,
                      });   
                   const url='https://slidea.com/comback-soon/';
                   this.document.location.href = url;     
                   this._accountservice.logout();               
                } 
                this.Deleteaccountform.markAsUntouched();this.Deleteaccountform.clearValidators(); 
            },
            (error: any) => { 
                console.log(error);              
                const message = getErrorMessage(ErrorMessages.UserProfileSection10000,ErrorMessages.UserProfile10006); 
                this._toastr.error(message, "", {
                timeOut: 5000,
                }); 
           }
         );
     } else {
        this.invaliddelete = true;
        this.Deleteaccountform.markAsUntouched();this.Deleteaccountform.clearValidators(); 
         return;
     }
    }
    Signout() {
        this._accountservice.logout();
        $('#logoutModal').modal('hide');
      }
    confirmLogout(){
        $('#logoutModal').modal('show');
    }
    closeLogout(){
        $('#logoutModal').modal('hide');
    }
    logout() {
    var loggerdata={
        UserId : this.currentAccountDetails?.customerId, 
        RefreshToken : localStorage.getItem('refreshToken'),
    } 
    this._toastr.show("All other devices are now logged out!","",{
                timeOut: 3000,
              });                  
    window.localStorage.setItem('logout-event', Math.random().toString());  
    // this._usersettingservice.Logoutotherdevices(loggerdata).subscribe(           
    //     (response: any) => {
    //         this.logoutcheck = true;
    //             setTimeout(() => {
    //                     this.logoutcheck = false;
    //                   }, 1000);
    //         this._toastr.show("All other devices are now logged out!","",{
    //         timeOut: 3000,
    //       });                      
    //     },
    //     (error: any) => {            
    //        this._toastr.error(error, "", {
    //         timeOut: 15000,
    //       });
    //    }
    //  );
    }
    
    private initializeDropdownState(dropdownId: string): void {
        this.dropdownStates[dropdownId] = { rotate: 'closed', visibility: 'hidden' };
    }
    toggleLoginDropdown(dropdownId: string) {
        const dropdownElement = this.getDropdownElement(dropdownId);

        for (var i = 2; i <= 6; i++) {
            let currentDropdownId = 'dropdown' + i;
            if (currentDropdownId !== dropdownId) {
                this.dropdownStates[currentDropdownId] = { rotate: 'closed', visibility: 'hidden'};
                const dropdownElement1 = this.getDropdownElement(currentDropdownId);
                this.renderer.setStyle(dropdownElement1.nativeElement, 'height', '0');
                this.renderer.removeClass(dropdownElement1.nativeElement, 'visible');
             }
        }  
        const isDropdownVisible = this.isDropdownVisible(dropdownElement);

        if (isDropdownVisible) {
            this.hideDropdown(dropdownElement, dropdownId);
        } else {
            this.showDropdown(dropdownElement, dropdownId);
        }
    }

     getDropdownElement(dropdownId: string): ElementRef {
        this.nativevalue = this[dropdownId];
        return this[dropdownId];
    }

    private isDropdownVisible(dropdownElement: ElementRef): boolean {
        return dropdownElement.nativeElement.classList.contains('visible');
    }

      showDropdown(dropdownElement: ElementRef, dropdownId: string): void {
       if(dropdownElement && dropdownId ){         
        this.dropdownStates[dropdownId].rotate = 'open';
        this.dropdownStates[dropdownId].visibility = 'visible';

        const height = dropdownElement.nativeElement.scrollHeight;
        this.renderer.setStyle(dropdownElement.nativeElement, 'height', `auto`);
        this.renderer.addClass(dropdownElement.nativeElement, 'visible');
       }
    }

    private hideDropdown(dropdownElement: ElementRef, dropdownId: string): void {
        this.dropdownStates[dropdownId].rotate = 'closed';
        this.dropdownStates[dropdownId].visibility = 'hidden';

        this.renderer.setStyle(dropdownElement.nativeElement, 'height', '0');
        this.renderer.removeClass(dropdownElement.nativeElement, 'visible');
    }


    emailStatus = false;
    emailStatusText = "";

    updateEmailStatusText() {
        this.emailStatus = !this.emailStatus;
        this.emailStatusText = this.emailStatus
        ? "You are receiving emails with the results after each presentation."
        : "You are not receiving emails with the results after each presentation.";
        this._toastr.show("Successfully updated notification settings","",{
            timeOut: 3000,
          });
    }
    openImageModal() {
        this.isLoading = false;
        const modal = this.imageModal.nativeElement;
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
    closeimg(){
        this.isLoading = false;
        const modal = this.imageModal.nativeElement;
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
    backtoupload(){
        this.imageChangedEvent="";
        this.currentAccountDetails.imageCropUrl = "";
        this.currentAccountDetails.cropperPosition = this.emptyCropperPosition;
        this.currentAccountDetails.imageUrl = "";
        this.closeImageDisplayModal();
        this.closeImageDisplayModal1();
        this.openImageModal();
    }
    openConfirmationModal() {
        const modal = this.confirmationModal.nativeElement;
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
    
    confirmDelete() {
        const modal = this.confirmationModal.nativeElement;
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
    openConfirmationModal1() {
        this.closeAllModals();
        const modal = this.confirmationModal1.nativeElement;
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
    
    confirmDelete1() {
        const modal = this.confirmationModal1.nativeElement;
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
    openConfirmationModal2() {
        this.closeAllModals();
        const modal = this.confirmationModal2.nativeElement;
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
    
    confirmDelete2() {
        const modal = this.confirmationModal2.nativeElement;
        modal.classList.remove('show');
        modal.style.display = 'none';
         this.Deleteaccountform.markAsUntouched();this.Deleteaccountform.clearValidators(); 
    }
    closeAllModals() {
        const modals = [this.confirmationModal, this.confirmationModal1, this.confirmationModal2];
        modals.forEach(modal => {
            const modalElement = modal.nativeElement;
            modalElement.classList.remove('show');
            modalElement.style.display = 'none';
        });
    }


    openImageDisplayModal() {
        const modal = this.imageDisplayModal.nativeElement;
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
    
    closeImageDisplayModal() {
        const modal = this.imageDisplayModal.nativeElement;
        modal.classList.remove('show');
        modal.style.display = 'none';
        this.selectedImage = null;
        this.isFileOpen = false;
    }
    openImageDisplayModal1() {
        this.isLoading = true;
        const modal = this.imageDisplayModal1.nativeElement;
        modal.classList.add('show');
        modal.style.display = 'flex';
        const event = this.imageChangedEventimg;
        const format = this.currentAccountDetails?.profileImage.split('.').pop();
        if(format =='gif'){
            this.invalidimgexetension = format;
        }
        if(this.currentAccountDetails?.croppedPosition == null){
            this.currentAccountDetails.croppedPosition = this.emptyCropperPosition;
        }
        if(this.isFileOpen != true){
        this._usersettingservice.getUserImageBase64().subscribe(
            (response: any) => { 
                // if(event == null){
                        this.isLoading = false;
                        var imageData = response['item'];
                        
                       // if (format === 'gif') {
                            this.selectedImage = `data:image/${format};base64,${imageData?.base64Images}`;
                            this.convertImageUrlToBase64ForGrid(this.selectedImage);
                        // }else{
                        //     this.selectedImage = imageData?.base64Images;
                        //     this.convertImageUrlToBase64ForGrid(this.selectedImage);
                        // }
                        
                // }
                // else{
                //     this.convertImageUrlToBase64ForGrid(this.selectedImage);
                // }
            });
        }else{
            this.isLoading = false;
        }
    }
    
    closeImageDisplayModal1() {
        const modal = this.imageDisplayModal1.nativeElement;
        modal.classList.remove('show');
        modal.style.display = 'none';
        this.selectedImage = null;
        this.isFileOpen = false;
        this.currentAccountDetails.profileImage;
        const base64ImagePattern = /^data:image\/(png|jpeg|jpg|gif|svg\+xml);base64,/;
        this.isBase64Image = base64ImagePattern.test(this.currentAccountDetails.profileImage);
        if(this.isBase64Image != false){
            this.currentAccountDetails.profileImage = null;
        }
    }
    
    onDrop(event: DragEvent): void {
        event.preventDefault();
      //  this.onDragLeave(event);
        if (event.dataTransfer?.files) {
          this.addFiles(event);
        }
      }
onFileSelected(event: any) {
    const fileInput = event.target;
    const file = fileInput.files[0];
    this.imageChangedEventimg = event;
    this.isLoading = false;
    if (file) {
        const fileExtension: string = file.name.split('.').pop().toLowerCase();
        this.invalidimgexetension = fileExtension;

        // Check if the file extension is not in the allowed list
        if (this.allowedFileTypes.indexOf(fileExtension) === -1) {            
            this.closeimg();
            this.invalidimgsize = false;  
            this.invalidimgtype = true;                     
            fileInput.value = ''; // Reset the input value
            return;
        }

        // Check if the file size exceeds the allowed size
        if (Math.floor(file.size / 1024) > this.allowedSizeType) {
            this.closeimg();
            this.invalidimgsize = true;
            this.invalidimgtype = false;
            fileInput.value = ''; // Reset the input value
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            this.selectedImage = reader.result;
            this.currentAccountDetails.profileImage = this.selectedImage;
            this.closeimg();
            this.isFileOpen = true;
            this.openImageDisplayModal1();
            this.invalidimgsize = false;
            this.invalidimgtype = false;
            //this.imageCroppedForGrid(this.imageChangedEventimg);
            this.usersettingsform.get("profileimage").setValue(this.selectedImage);
            fileInput.value = ''; // Reset the input value
        };
        reader.onerror = (event: any) => {
            fileInput.value = ''; // Reset the input value
            return event.target.error.code;
        };
        reader.readAsDataURL(file);
    }
}
addFiles(event: any) {
    debugger;
    const fileInput = event.dataTransfer;
    const file = fileInput.files[0];
    this.imageChangedEventimg = event;
    this.isLoading = false;
    if (file) {
        const fileExtension: string = file.name.split('.').pop().toLowerCase();
        this.invalidimgexetension = fileExtension;

        // Check if the file extension is not in the allowed list
        if (this.allowedFileTypes.indexOf(fileExtension) === -1) {            
            this.closeimg();
            this.invalidimgsize = false;  
            this.invalidimgtype = true;                     
            fileInput.value = ''; // Reset the input value
            return;
        }

        // Check if the file size exceeds the allowed size
        if (Math.floor(file.size / 1024) > this.allowedSizeType) {
            this.closeimg();
            this.invalidimgsize = true;
            this.invalidimgtype = false;
            fileInput.value = ''; // Reset the input value
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            this.selectedImage = reader.result;
            this.currentAccountDetails.profileImage = this.selectedImage;
            this.closeimg();
            this.isFileOpen = true;
            this.openImageDisplayModal1();
            this.invalidimgsize = false;
            this.invalidimgtype = false;
           // this.imageCroppedForGrid(this.imageChangedEventimg);
            this.usersettingsform.get("profileimage").setValue(this.selectedImage);
            fileInput.value = ''; // Reset the input value
        };
        reader.onerror = (event: any) => {
            fileInput.value = ''; // Reset the input value
            return event.target.error.code;
        };
        reader.readAsDataURL(file);
    }
}
filesDropped(files: FileHandle[]): void {
    const file = files[0].file;
    //const file = fileInput.;
    this.imageChangedEventimg = event;
    this.isLoading = false;
    if (file) {
        const fileExtension: string = file.name.split('.').pop().toLowerCase();
        this.invalidimgexetension = fileExtension;
        if(fileExtension === 'gif'){
            this.showCropper = !this.showCropper;
        }
        // Check if the file extension is not in the allowed list
        if (this.allowedFileTypes.indexOf(fileExtension) === -1) {            
            this.closeimg();
            this.invalidimgsize = false;  
            this.invalidimgtype = true;                     
            //fileInput.value = ''; // Reset the input value
            return;
        }

        // Check if the file size exceeds the allowed size
        if (Math.floor(file.size / 1024) > this.allowedSizeType) {
            this.closeimg();
            this.invalidimgsize = true;
            this.invalidimgtype = false;
            //fileInput.value = ''; // Reset the input value
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            this.selectedImage = reader.result;
            this.closeimg();
            this.isFileOpen = true;
            this.openImageDisplayModal1();
            this.invalidimgsize = false;
            this.invalidimgtype = false;
           // this.imageCroppedForGrid(this.imageChangedEventimg);
            this.usersettingsform.get("profileimage").setValue(this.selectedImage);
           // fileInput.value = ''; // Reset the input value
        };
        reader.onerror = (event: any) => {
            //fileInput.value = ''; // Reset the input value
            return event.target.error.code;
        };
        reader.readAsDataURL(file);
    }
  }
        openImgformat(){
            const modal = this.imageFormatUnsupportedModal.nativeElement;
            modal.classList.add('show');
            modal.style.display = 'flex';
        }
        closeimgformat(){
            const modal = this.imageFormatUnsupportedModal.nativeElement;
            modal.classList.remove('show');
            modal.style.display = 'none';    
        }
    imageCroppedForGrid(event: ImageCroppedEvent) {
        if (event.cropperPosition) {
            const X1 = event.cropperPosition.x1;
            const X2 = event.cropperPosition.x2;
            const Y1 = event.cropperPosition.y1;
            const Y2 = event.cropperPosition.y2;
        
            this.croppedPositionForGrid = { x1: X1, y1: Y1, x2: X2, y2: Y2 };
          }
          if (this.currentAccountDetails.cropperPosition == null) {
            this.convertImageUrlToBase64ForGrid(event.objectUrl!);
          } else {
            this.convertImageUrlToBase64ForGrid(event.objectUrl!);
          }
    //     if(this.currentAccountDetails.cropperPosition == this.emptyCropperPosition){
       
    //     const X1 = event?.cropperPosition?.x1;
    //     const X2 = event?.cropperPosition?.x2;
    //     const Y1 = event?.cropperPosition?.y1;
    //     const Y2 = event?.cropperPosition?.y2;
    //     var obj = {
    //       x1: X1,
    //       y1: Y1,
    //       x2: X2,
    //       y2: Y2,
    //     }
    //     this.convertImageUrlToBase64ForGrid(event.objectUrl!);
    //     this.croppedPositionForGrid = obj;
    //     //this.cropper = this.croppedPositionForGrid;
    // }
    //     else{
    //         const X1 = event?.cropperPosition?.x1;
    //         const X2 = event?.cropperPosition?.x2;
    //         const Y1 = event?.cropperPosition?.y1;
    //         const Y2 = event?.cropperPosition?.y2;
    //         var obj = {
    //           x1: X1,
    //           y1: Y1,
    //           x2: X2,
    //           y2: Y2,
    //         }
    //         this.croppedPositionForGrid = obj;
    //         this.convertImageUrlToBase64ForGrid(event.objectUrl!)
    //     }
       // this.cropper = this.croppedPositionForGrid;
      }
      convertImageUrlToBase64ForGrid(imageUrl: string): void {
        this._http.get(imageUrl, { responseType: 'blob' }).subscribe((blob: Blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result as string;
            this.croppedImageForGrid = base64data;
            if(this.croppedImageForGrid){
                this.usersettingsform.get("profileimage").setValue(this.currentAccountDetails.profileImage);
                // this.currentAccountDetails.profileImage = this.selectedImage;
            } else if(!this.selectedImage && this.currentAccountDetails?.profileImage !='' ) {
                this.usersettingsform.get("profileimage").setValue(this.currentAccountDetails?.profileImage);
                // this.selectedImage = this.currentAccountDetails?.profileImage;
            }
           
          };
          reader.readAsDataURL(blob);
        });
      }
      imageLoadedForGrid() {
        this.showCropper = !this.showCropper;
        if(this.currentAccountDetails?.cropperPosition != this.emptyCropperPosition){
            setTimeout(() => {
                if(this.currentAccountDetails?.cropperPosition == null){
                    //this.cropper = this.emptyCropperPosition;
                }else{
                    this.cropper = this.currentAccountDetails?.cropperPosition;  
                }
            }, 200);
          }else{
            this.cropper = this.emptyCropperPosition;
          }
      }
    uploadImage(){
        if(this.userProfileImageDisabled){
            return;
        }
        this.userProfileImageDisabled = true;
        this.isLoadingButton = true;
        var payload = this.usersettingsform.value;
        var imageExtension = '';
        if (payload['profileimage'] && payload['profileimage'].startsWith('data:image/')) {
            var format = payload['profileimage'].split(';')[0].split('/')[1];
            imageExtension = format;
        } else if (payload['profileimage']) {
            imageExtension = payload['profileimage'].split('.').pop();
        }
        if (payload['profileimage'] != '') {
            var data = {
                imageURL: this.currentAccountDetails?.profileImage,
                imageCropUrl: this.croppedImageForGrid,
                cropperPosition: this.croppedPositionForGrid ? JSON.stringify(this.croppedPositionForGrid) : JSON.stringify(this.emptyCropperPosition)
            }
            if (imageExtension === 'gif') {
                data.imageCropUrl = this.currentAccountDetails?.profileImage;
            }
        } else {
            var data = {
                imageURL: this.currentAccountDetails?.profileImage,
                imageCropUrl: this.croppedImageForGrid,
                cropperPosition: this.croppedPositionForGrid ? JSON.stringify(this.croppedPositionForGrid) : JSON.stringify(this.emptyCropperPosition)
            }
            if (imageExtension === 'gif') {
                data.imageCropUrl = this.currentAccountDetails?.profileImage;
            }
        }
      
        this._usersettingservice.UploadProfileimage(data).subscribe(
            (response: any) => {                
                this.currentAccountDetails.profileImage = response.imageCropUrl;
                //this.selectedImage = this.currentAccountDetails?.profileImage;
                this.currentAccountDetails.profileCropImage = response.imageCropUrl;
                this.usersettingsform.get("profileimage").setValue(this.croppedImageForGrid);
                this.closeimg();
                this.closeImageDisplayModal();
                this.closeImageDisplayModal1();
                this.GetUserSettingsID(this.token);
                const uservalues={
                    ProfileFirstName: response.firstName ,
                    ProfileSecondName:response.lastName,
                    ProfileImgUrl:response.imageCropUrl,
                }
                this._accountservice.StoreUserValue(uservalues);
                const message = getMessage(SuccessMessages.UserProfileSection10000,SuccessMessages.UserProfile10001); 
                this._toastr.success(message, "", {
                    timeOut: 5000,
                  }); 
                  this.userProfileImageDisabled = false;
                  this.isLoadingButton = false;
            },
            (error: any) => {              
                const message = getErrorMessage(ErrorMessages.UserProfileSection10000,ErrorMessages.UserProfile10001); 
                this._toastr.error(message, "", {
                timeOut: 5000,
                });
                this.userProfileImageDisabled = false;
                this.isLoadingButton = false;
           }
        );
    this.isFileOpen = false;
    }
    RemoveImage(){
        this.invalidimgsize= false;
        this.invalidimgtype=false;
        this.imageChangedEvent="";
        this.selectedImage = null;
        this.currentAccountDetails.imageCropUrl = "";
        this.currentAccountDetails.cropperPosition = this.emptyCropperPosition;
        this.currentAccountDetails.imageUrl = "";
        //var Profileid = this.currentAccountDetails.id;
        var payload = this.usersettingsform.value;
        // var profileimage = payload['profileimage'];
        var data={
            imageURL:this.currentAccountDetails?.profileImage,
            imageCropUrl:this.currentAccountDetails?.imageCropUrl,
            cropperPosition:JSON.stringify(this.currentAccountDetails?.cropperPosition) 
        }
        this._usersettingservice.RemoveUserprofileImage(data).subscribe(
            (response: any) => {    
                this.closeImageDisplayModal1();
                this.showremovetip = false            
                this.currentAccountDetails.profileImage = ""; 
                this.currentAccountDetails.profileCropImage = "";
                this.usersettingsform.get("profileimage").setValue(this.currentAccountDetails.profileImage);           
                this.GetUserSettingsID(this.token);
                const uservalues={
                    ProfileFirstName: response.firstName ,
                    ProfileSecondName:response.lastName,
                    ProfileImgUrl:response.imageCropUrl,
                }
                this._accountservice.StoreUserValue(uservalues);
                const message = getMessage(SuccessMessages.UserProfileSection10000,SuccessMessages.UserProfile10002); 
                this._toastr.success(message, "", {
                    timeOut: 5000,
                }); 
            },
            (error: any) => {           
                const message = getErrorMessage(ErrorMessages.UserProfileSection10000,ErrorMessages.UserProfile10002); 
                this._toastr.error(message, "", {
                timeOut: 5000,
                }); 
           }
        );
    }
    signout() {
      this._accountservice.logout();
    }

    // smoothScroll(hash: string): void {
    //     const target = document.querySelector(hash) as HTMLElement;
    //     if (target) {
    //       target.scrollIntoView({
    //         behavior: 'smooth'
    //       });
    //       const fullPath = `/app/user-profile${hash}`;
    //       this.router.navigateByUrl(fullPath);
    //     }
    //   }
    smoothScroll(hash: string, event: MouseEvent, dropdown: string): void {
        event.preventDefault();
      
        const target = document.querySelector(hash) as HTMLElement;
            const sidenav = document.getElementById('sidenav');
            if (sidenav) {
                const lis = sidenav.querySelectorAll('li a');
                let hasActive = false;
                lis.forEach(li => {
                    if (li.classList.contains('active')) {
                        hasActive = true; 
                        li.classList.remove('active');
                        document.getElementById('signin-detailes').style.display="block";
                        document.getElementById('edit-element').style.display="none";
                        const dataDrp = li.getAttribute('data-drp');
                        if (dataDrp !== 'dropdown1') {
                            this.toggleLoginDropdown(dataDrp);
                        }
                    }
                });
                
                const parentLi = (event.currentTarget as HTMLElement).closest('li');
                if (parentLi) {
                    parentLi.querySelector('a')?.classList.add('active');
                    if (dropdown !== 'dropdown1') {
                        this.toggleLoginDropdown(dropdown);
                    }
                } else {
                    if (dropdown !== 'dropdown1') {
                        this.toggleLoginDropdown(dropdown);
                    }
                }
                
                const offset = 100;
                const targetOffset = target.offsetTop - offset;
          
                // Using ViewportScroller to scroll to the position
                this.viewportScroller.scrollToPosition([0, targetOffset]);

         
                const fullPath = `/app/user-profile${hash}`;
                this.router.navigateByUrl(fullPath);
            }
            
        
    }
    

    responsivesmoothScroll(hash: string, event: MouseEvent, dropdown: string): void {
        event.preventDefault();
    
        const target = document.querySelector(hash) as HTMLElement;
        if (target) {
            const sidenav = document.getElementById('sidenavs');
            if (sidenav) {
                const lis = sidenav.querySelectorAll('li a');
                let hasActive = false;
                
                lis.forEach(li => {
                    if (li.classList.contains('active')) {
                        hasActive = true; 
                        li.classList.remove('active');
                    
                        const dataDrp = li.getAttribute('data-drp');
                        if (dataDrp !== 'dropdown1') {
                            this.toggleLoginDropdown(dataDrp);
                        }
                    }
                });
                
                const parentLi = (event.currentTarget as HTMLElement).closest('li');
                if (parentLi) {
                    parentLi.querySelector('a')?.classList.add('active');
                    if (dropdown !== 'dropdown1') {
                        this.toggleLoginDropdown(dropdown);
                    }
                } else {
                    if (dropdown !== 'dropdown1') {
                        this.toggleLoginDropdown(dropdown);
                    }
                }
                
                target.scrollIntoView({
                    behavior: 'smooth'
                });
        
                const fullPath = `/app/user-profile${hash}`;
                this.router.navigateByUrl(fullPath);
            }
        }

    }

      
    Edit() {
        document.getElementById('signin-detailes').style.display = "none";
        document.getElementById('edit-element').style.display = "block";
    }
    Exit() {
        this.dropdownStates['dropdown2'] = { rotate: 'closed', visibility: 'hidden' };
        const dropdownElement1 = this.getDropdownElement('dropdown2');
        this.renderer.setStyle(dropdownElement1.nativeElement, 'height', '0');
        this.renderer.removeClass(dropdownElement1.nativeElement, 'visible');
        document.getElementById('edit-element').style.display = "none";
        document.getElementById('signin-detailes').style.display = "block";
    }
    selectMenuItem(menu: any, event: MouseEvent,dataDrp: any) {
        var selectItem = document.getElementById(menu);

        if (selectItem) {
          const activeElements = document.querySelectorAll('.active');
          activeElements.forEach(element => {
            this.renderer.removeClass(element, 'active');
          });
          this.renderer.addClass(selectItem, 'active');
          this.toggleLoginDropdown(dataDrp);
          
        } else {
          console.error('Element with ID', menu, 'not found.');
        }
      }
      private preventDefaultDragAndDrop(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
      }
    //   get imageSource(): string | null {
    //     return this.selectedImage || this.currentAccountDetails?.profileImage || null;
    //   }
}
