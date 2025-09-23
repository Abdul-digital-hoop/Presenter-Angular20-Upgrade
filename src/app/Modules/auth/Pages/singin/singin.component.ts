import { Component, HostListener, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Profile } from 'src/app/core/Models/profile.model';
import { AccountService } from 'src/app/core/Sevices/account.service';
import { Injectable, NgZone } from '@angular/core';
import {  ErrorMessages, SuccessMessages } from 'src/app/core/SuccessResponse';
import { getErrorMessage, getMessage } from 'src/app/core/SuccessMessageHandler';
import { CustomerPlanService } from 'src/app/core/Sevices/CustomerPlan/customer-plan.service';
import { Userdata } from 'src/app/core/Models/userdata';
import { environment } from 'src/environments/environment';
import { UtmService } from 'src/app/core/Sevices/utm.service';
import { MetaService } from 'src/app/core/Sevices/meta.service';
import { utm } from 'src/app/utility/constants';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
declare var google: any;
declare const _IntegrationMediumOffice: boolean;
@Component({
    selector: 'app-singin',
    templateUrl: './singin.component.html',
    styleUrls: ['./singin.component.scss'],
    standalone: false
})
export class SinginComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  isText: boolean = true;
  isLoading: boolean = false;
  passwordType: string = "password";
  ZoomContextValue:string=localStorage.getItem('contextValue');
  GoogleInitialzed:any;
  isVerify: boolean = false;
  utmSource: any;
  id: any;
  utmSourceValue = utm;
  constructor(
    private _formBuilder: FormBuilder,
    public _accountservice: AccountService,
    private _router: Router,
    private _toastr: ToastrService,
    private ngZone: NgZone,
    private route: ActivatedRoute,
    private _customerPlanService:CustomerPlanService,
    private _utmService: UtmService,
    private _metaService: MetaService,
    private _workSpaceService: WorkspaceService
  ) {
     this.initializeUtmTracking();
     this.route.queryParams.subscribe(params => {
      this._utmService.saveUtmParams(params);
    });
  }

  ngOnInit(): void {
    const metaConfig = this._metaService.getAuthPageMeta('signin');
    this._metaService.updateMetaTags(metaConfig.title, metaConfig.description, metaConfig.ogtitle, metaConfig.ogImage, metaConfig.ogdescription);

    this.loginForm = this._formBuilder.group(
      {
        Email: ['', [Validators.required, Validators.email]],
        Password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
          ],
        ],

      });
      const scriptElement = document.createElement('script');
      scriptElement.setAttribute('preload', '');
      scriptElement.src = 'https://accounts.google.com/gsi/client';
      scriptElement.type = 'text/javascript';
      document.head.appendChild(scriptElement);
      scriptElement.onload = () => {
        this.GoogleInitialzed = true;
      };
      this.route.queryParams.subscribe(params => {
        const emailStatus = params['alreadyEmailVerify'];
        if (emailStatus == "false") {
          const message = getErrorMessage(ErrorMessages.UserSection1000,ErrorMessages.User1006);
          this._toastr.success(message,"", {
            timeOut: 5000,
          });
        } else {
          console.log("Not anything appeared in url");
        }
      });
  }
  get f(): { [key: string]: AbstractControl } {
    return this.loginForm.controls;
  }
  ngAfterViewInit(): void{    
    const intervalId = setInterval(() => {
    if (this.GoogleInitialzed) {
      this.setupGoogleSignIn();
      clearInterval(intervalId);
    }
  }, 100);
  }
  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    if (this.loginForm.valid) {
      this.isLoading = true;
      const utmData = this._utmService.getUtmParams();
      const cleanedUtm = utmData
      ? Object.fromEntries(
          Object.entries(utmData).filter(([_, v]) => v != null && v !== "")
        )
      : null;
      var payload = {
        ...this.loginForm.value,
        ...(cleanedUtm && Object.keys(cleanedUtm).length > 0
        ? { utmData: cleanedUtm }
        : {}),
      };
      
      this._accountservice.login(payload).subscribe(
        (response: any) => {
          this._utmService.clearUtmParams(); // Clear UTM data after successful login
          this.isLoading = false;
          this._accountservice.storeToken(response.token);
          this._accountservice.checkAndSetCookie(`${environment.Name.toLowerCase()}token`, response.token, 30);
          const userData = new Userdata;
          userData.ProfileFirstName = response?.firstName;
          userData.ProfileSecondName = response?.lastName;
          userData.ProfileImgUrl = response?.imageURL;
          this._accountservice.customerDetail(response.token);
          this._accountservice.StoreUserValue(userData);
          this._customerPlanService.setCustomerPlan(response?.customerPlan);
          if(localStorage.getItem('integration_medium') == 'zoom'){
            this._router.navigateByUrl('/app/mypresentations?isListView=false');
          }else{
            if(_IntegrationMediumOffice){
              this._router.navigateByUrl('/app/mypresentations?isListView=true');
            }else{
              localStorage.removeItem('integration_medium');
              this._router.navigateByUrl('/app/home');
            }
          }
          if(response?.teamId!=null){
          localStorage.setItem('teamId', response?.teamId.toString());
          }
          const message = getMessage(SuccessMessages.UserSection1000,SuccessMessages.User1001);
          this._toastr.success(message,"", {
            timeOut: 5000,
          });
        },
        (error: any) => {
          if(error.status == "409")
          {
            this.isLoading = false;
            if(error.error.data === true){
              this.isVerify = true;
            }
            const prefix = 'Internal Server Error : ';
            const errorMessage = error.error.message.replace(prefix, '').trim();
            this._toastr.error(errorMessage, "", {
              timeOut: 5000,
            }); 
          }else{
          this.isLoading = false;
          this._toastr.error(error, "", {
            timeOut: 5000,
          });
        } 
        }
      )
    }
  }
  hideshowpass() {
    this.isText = !this.isText;
    this.isText ? this.passwordType = "password" : this.passwordType = "text";
  }

  handleCredentialResponse(response: any): void {
    if (this.isLoading == false) {
      this.isLoading = true;
      var token = response.credential;
      const utmData = this._utmService.getUtmParams();
      const cleanedUtm = utmData
      ? Object.fromEntries(
          Object.entries(utmData).filter(([_, v]) => v != null && v !== "")
        )
      : null;
  
    // Pass utmData only if it has valid keys
    const finalUtm = cleanedUtm && Object.keys(cleanedUtm).length > 0 ? cleanedUtm : undefined;
      this._accountservice.googlelogin(token, finalUtm).subscribe(
        (response: any) => {
          this._utmService.clearUtmParams(); // Clear UTM data after successful login
          this.isLoading = false;
          this._accountservice.storeToken(response.token);
          this._accountservice.checkAndSetCookie(`${environment.Name.toLowerCase()}token`, response.token, 30);
          this._accountservice.storeRefreshToken(response.refreshToken);
          const userData = new Userdata;
          userData.ProfileFirstName = response?.firstName;
          userData.ProfileSecondName = response?.lastName;
          userData.ProfileImgUrl = response?.imageURL;
          this._accountservice.customerDetail(response.token);
          this._accountservice.StoreUserValue(userData);
          this.ngZone.run(() => {
            if(localStorage.getItem('integration_medium') == 'zoom'){
              this._router.navigateByUrl('/app/mypresentations?isListView=false');
            }else{
              if(_IntegrationMediumOffice){
                this._router.navigateByUrl('/app/mypresentations?isListView=true');
              }else{
                this._router.navigateByUrl('/app/home');
              }
            }
          });
          const message = getMessage(SuccessMessages.UserSection1000, SuccessMessages.User1001);
          if (response?.teamId != null) {
            localStorage.setItem('teamId', response?.teamId.toString());
          }
          this._toastr.success(message, "", {
            timeOut: 5000,
          });
        },
        (error: any) => {
          this.isLoading = false;
          if(error.status == "409")
          {
            this.isLoading = false;
            if(error.error.data === true){
              this.isVerify = true;
            }
            const prefix = 'Internal Server Error : ';
            const errorMessage = error.error.message.replace(prefix, '').trim();
            this._toastr.error(errorMessage, "", {
              timeOut: 5000,
            }); 
          }else if (error === 'This account is not active. Please contact the support team') {
            this._toastr.error(error, "", {
              timeOut: 5000,
            });
          }else{
          this.isLoading = false;
          this._toastr.error(error, "", {
            timeOut: 5000,
          });
        } 
        }
      )
    }
    else
    {
      return;
    }
  }

  setupGoogleSignIn(): void {
    google.accounts.id.initialize({
      client_id: "624978174597-hhkgj8mjuob8if2k03gu3g7v29o9it01.apps.googleusercontent.com", 
      callback: this.handleCredentialResponse.bind(this) 
    });

    google.accounts.id.renderButton(
      document.getElementById("googleSigninBtn"),
      { theme: "outline", size: "large" } 
    );

    google.accounts.id.prompt(); 
  }
  resendEmail(){
    if (this.loginForm.valid) {
      var payload = this.loginForm.value;
      this._accountservice.resendEmail(payload).subscribe(
        (response: any) => {
          this._router.navigateByUrl('/auth/verification');
        });
      }
  }
  cookieLoginFunc(response: any, utmSource: any,isCustomerCookie:boolean = false) {
    this.isLoading = false;
    this._accountservice.storeToken(response.token);
    this._accountservice.checkAndSetCookie(`${environment.Name.toLowerCase()}token`, response.token, 30);
    const userData = new Userdata;
    userData.ProfileFirstName = response?.firstName;
    userData.ProfileSecondName = response?.lastName;
    userData.ProfileImgUrl = response?.imageURL;
    this._accountservice.customerDetail(response.token);
    this._accountservice.StoreUserValue(userData);
    this._customerPlanService.setCustomerPlan(response?.customerPlan);
    if (utmSource == this.utmSourceValue.WEBSITE_TEMPLATE && isCustomerCookie == false) {
      this.callGuestUseTemplate();
    }
    else if(utmSource == this.utmSourceValue.WEBSITE_TEMPLATE && isCustomerCookie == true){
      this.callUseTemplate();
    }
    else {
      if (localStorage.getItem('integration_medium') == 'zoom') {
        this._router.navigateByUrl('/app/mypresentations?isListView=false');
      } else if (localStorage.getItem('integration_medium') == 'powerpoint') {
        this._router.navigateByUrl('/app/mypresentations?isListView=true');
      } else {
        localStorage.removeItem('integration_medium');
        this._router.navigateByUrl('/app/home');
      }
      if (response?.teamId != null) {
        localStorage.setItem('teamId', response?.teamId.toString());
      }
      const message = getMessage(SuccessMessages.UserSection1000, SuccessMessages.User1001);
      this._toastr.success(message, "", {
        timeOut: 5000,
      });
    }
  }
  // Guest Details
  initializeUtmTracking(){
    this.route.queryParams.subscribe(params => {
      this._utmService.saveUtmParams(params);
      this.utmSource = params['utm_source'] || null;
      this.id = params['id'] || null;
      if (this.utmSource == this.utmSourceValue.WEBSITE_TEMPLATE && this.id != null) {
        this._accountservice.cookieLoading= true;
        var customerCookie = this._accountservice.getCookie(`${environment.Name.toLowerCase()}token`);
        if(customerCookie){
          this.customerCookieLogin(this.utmSource,true);
        }else{
          const customerCookieValue = this._accountservice.getCookie(`${environment.Name.toLowerCase()}token`);
          if (!customerCookieValue) {
            var cookieValue = this._accountservice.getGuestToken();
            if (cookieValue) {
              this.guestCookieLogin(cookieValue);
            } else {
              this.guestSignup();
            }
          } else {
            this.customerCookieLogin(this.utmSource,false);
          }
        }
      }
      else {
        this.customerCookieLogin(this.utmSource,false);
      }
    });
  }
  customerCookieLogin(utmSource:any,isCustomerCookie:boolean = false){
    var cookieValue = this._accountservice.getCookie(`${environment.Name.toLowerCase()}token`);
    if (cookieValue) {
      this.isLoading = true;
      const cookieData = { Token: cookieValue }
      this._accountservice.cookieLogin(cookieData).subscribe(
        (response: any) => {
          this._accountservice.cookieLoading= true;
          this.cookieLoginFunc(response,utmSource,isCustomerCookie);
        },
        (error: any) => {
          this._accountservice.cookieLoading= false;
          this.isLoading = false;
        });
   }
  }
  guestCookieLogin(token:any){
    var existingActualToken = {
      token: token
    }
    this._accountservice.guestCookieLogin(existingActualToken).subscribe(
      (response: any) => {
        this.storeGuestDetails(response);
      },
      (error:any)=>{
        this._accountservice.cookieLoading= false;
        console.log(error);
      }
    );  
  }
  guestSignup(){
    var guestSignupDTO = {
      Medium: this.utmSource
    }
    this._accountservice.guestSignup(guestSignupDTO).subscribe(
      (response: any) => {
        this.storeGuestDetails(response);
      },
      (error:any)=>{
        this._accountservice.cookieLoading= false;  
        console.log(error);
      }
    );
  }
  storeGuestDetails(response: any) {
    const PROFILE = new Profile;
    PROFILE.ProfileId = "1";
    PROFILE.ProfileEMail = "guest@gmail.com";
    PROFILE.ProfileFirstName = "Guest";
    PROFILE.ProfileSecondName = "User";
    PROFILE.ProfileRole = "Guest";
    PROFILE.TeamId = "";
    PROFILE.ProfileImgUrl = "";
    PROFILE.PlanName = "";
    PROFILE.PlanId = 0;
    PROFILE.ParticipationLimit = 0;
    PROFILE.RewardId = "";
    this._accountservice.profileValue = response;
    this._accountservice.UserProfile.next(PROFILE);
    this._accountservice.storeGuestToken(response.token);
    
    // Call guestUseTemplate API after successful guest login
    if (this.id) {
      this.callGuestUseTemplate();
    }
  }
  callGuestUseTemplate() {
    this._accountservice.guestUseTemplate(this.id).subscribe(
      (response: any) => {
        this._accountservice.cookieLoading= false;
        // API call successful, route to the next URL
        this.routeAfterGuestUseTemplate(response);
      },
      (error: any) => {
        this._accountservice.cookieLoading= false;
        console.error('Error calling guestUseTemplate:', error);
      }
    );
  }
  callUseTemplate(){
    this._accountservice.customerUseTemplate(this.id).subscribe(
      (response: any) => {
        this._accountservice.cookieLoading= false;
        // API call successful, route to the next URL
        this.routeAfterGuestUseTemplate(response);
      },
      (error: any) => {
        this._accountservice.cookieLoading= false;
        console.error('Error calling guestUseTemplate:', error);
      }
    );
  }
  routeAfterGuestUseTemplate(response: any) {
    // Route to the appropriate URL after guestUseTemplate API completes
    // You can customize this routing logic based on your requirements
    if (response) {
      this._workSpaceService.activeSlideId = response.activeSlideId;
        this._workSpaceService.presentationId = response.presentationId;
        localStorage.setItem('slideVisualizationId',response.visualizationId);
        this._router.navigate(['/WorkSpace/edit'], {
          queryParams: { id: response.presentationId }
        });
    } else {
      console.log("Error in routeAfterGuestUseTemplate");
    }
  }
}
