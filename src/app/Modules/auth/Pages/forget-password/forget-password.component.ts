import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { getErrorMessage, getMessage } from 'src/app/core/SuccessMessageHandler';
import { Profile } from 'src/app/core/Models/profile.model';
import { AccountService } from 'src/app/core/Sevices/account.service';
import {  ErrorMessages, SuccessMessages } from 'src/app/core/SuccessResponse';
import { Userdata } from 'src/app/core/Models/userdata';
import { environment } from 'src/environments/environment';
import { MetaService } from 'src/app/core/Sevices/meta.service';

declare var google: any; 
@Component({
    selector: 'app-forget-password',
    templateUrl: './forget-password.component.html',
    styleUrls: ['./forget-password.component.scss'],
    standalone: false
})
export class ForgetPasswordComponent implements OnInit {
  forgetPasswordForm: FormGroup;
  submitted = false;
  GoogleInitialzed:any;

  isLoading: boolean = false;
  constructor(
    private _formBuilder: FormBuilder,
    private _accountservice: AccountService,
    private _toastr: ToastrService,
    private _router: Router,
    private _metaService: MetaService
  ) { }

  ngOnInit(): void {
    const metaConfig = this._metaService.getAuthPageMeta('forgetpassword');
    this._metaService.updateMetaTags(metaConfig.title, metaConfig.description, metaConfig.ogtitle, metaConfig.ogImage, metaConfig.ogdescription);

    this.forgetPasswordForm = this._formBuilder.group(
      {
        Email: ['', [Validators.required, Validators.email]],
      });
      const scriptElement = document.createElement('script');
      scriptElement.setAttribute('preload', '');
      scriptElement.src = 'https://accounts.google.com/gsi/client';
      scriptElement.type = 'text/javascript';
      document.head.appendChild(scriptElement);
      scriptElement.onload = () => {
        this.GoogleInitialzed = true;
      };
  }
  get f(): { [key: string]: AbstractControl } {
    return this.forgetPasswordForm.controls;
  }
  onSubmit() {
    this.submitted = true;
    if (this.forgetPasswordForm.invalid) {
      return;
    }
    if (this.forgetPasswordForm.valid) {
      this.isLoading = true;
      var payload = this.forgetPasswordForm.value;
      this._accountservice.ForgetPassword(payload['Email']).subscribe(
        (response: any) => {
          if (response == true) {
            this.isLoading = false;
            this.forgetPasswordForm.reset();
            this.submitted = false;
            const message = getMessage(SuccessMessages.UserSection1000,SuccessMessages.User1002);
            this._toastr.success(message, "", {
              timeOut: 5000,
            });
          }
        },
        (error: any) => {
          this.isLoading = false;
          this._toastr.error(error, "", {
            timeOut: 5000,
          }); 
        }
      )
    }

 }
handleCredentialResponse(response: any): void {
    this.isLoading = true;
    var token = response.credential;
    this._accountservice.googlelogin(token).subscribe(
      (response: any) => {
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
        this._router.navigateByUrl('/app/home');
        const message = getMessage(SuccessMessages.UserSection1000,SuccessMessages.User1001);
        this._toastr.success(message, "", {
          timeOut: 5000,
        });
      },
      (error: any) => {
        this.isLoading = false;
        const message = getErrorMessage(ErrorMessages.UserSection1000,ErrorMessages.User1001); 
        this._toastr.error(message, "", {
        timeOut: 5000,
        });  
      }
    )
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
}

