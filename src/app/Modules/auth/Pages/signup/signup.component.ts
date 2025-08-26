import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from 'src/app/core/Sevices/account.service';
import { Profile } from 'src/app/core/Models/profile.model';
import { Injectable, NgZone } from '@angular/core';
import { TeamService } from 'src/app/core/Sevices/Team/team.service';
import { ErrorMessages, SuccessMessages } from 'src/app/core/SuccessResponse';
import { getErrorMessage, getMessage } from 'src/app/core/SuccessMessageHandler';
import { environment } from 'src/environments/environment';
import { UtmService } from 'src/app/core/Sevices/utm.service';
import { MetaService } from 'src/app/core/Sevices/meta.service';

declare var google: any; 
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  registerForm: FormGroup;
  submitted = false;
  isText: boolean = true;
  isLoading: boolean = false;
  passwordType: string="password";
  GoogleInitialzed:any;
  invitecode:string;
  constructor(
    private _formBuilder: FormBuilder,
    private _accountservice: AccountService,
    private _router: Router,
    private _toastr:ToastrService,
    private _activatedRoute: ActivatedRoute,
    private ngZone: NgZone,
    private _teamService: TeamService,
    private _utmService: UtmService,
    private _metaService: MetaService
  ) {
    this._activatedRoute.queryParams.subscribe((params) => {
      this.invitecode = params['invitecode'];
      if (this.invitecode) {
        localStorage.setItem('invitecode', this.invitecode);
      }
      this._utmService.saveUtmParams(params);
    });
   }

  ngOnInit(): void {
    const metaConfig = this._metaService.getAuthPageMeta('signup');
    this._metaService.updateMetaTags(metaConfig.title, metaConfig.description, metaConfig.ogtitle, metaConfig.ogImage, metaConfig.ogdescription);

    this.registerForm = this._formBuilder.group(
      {
        FirstName: ['', [Validators.required, Validators.maxLength(30)]],
        LastName: ['', [Validators.required, Validators.maxLength(30)]],
        Email: ['', [Validators.required, Validators.email]],
        Password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
            ),
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
  }
  get f(): { [key: string]: AbstractControl } {
    return this.registerForm.controls;
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
    if (this.registerForm.invalid) {
      return;
    }
    if (this.registerForm.valid) {
      this.isLoading = true;
      const utmData = this._utmService.getUtmParams();
      var payload = {
        ...this.registerForm.value,
        utmData: utmData
      };
      
      this._accountservice.register(payload).subscribe(
        (response: any) => {
          this._utmService.clearUtmParams();
          if (response == true) {
            this.isLoading = false;
            const message = getMessage(SuccessMessages.UserSection1000,SuccessMessages.User1003);
            this._toastr.success(message,"",{
              timeOut: 5000,
            });
            this._router.navigateByUrl('/auth/verification');
            const invitecode = localStorage.getItem('invitecode');
            if (invitecode) {
              this._teamService.TeamInvite(invitecode).subscribe(
                (teamInviteResponse: any) => {
                  localStorage.removeItem('invitecode');
                },
                (teamInviteError: any) => {
                  console.error(teamInviteError);
                }
              );
            }
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
  hideshowpass() {
    this.isText = !this.isText;
    this.isText ? this.passwordType = "password" : this.passwordType = "text";
  }
  setupGoogleSignIn(): void {
    google.accounts.id.initialize({
      client_id: "624978174597-hhkgj8mjuob8if2k03gu3g7v29o9it01.apps.googleusercontent.com", 
      callback: this.handleCredentialResponse.bind(this) 
    });

    google.accounts.id.renderButton(
      document.getElementById("googleSignupBtn"),
      { theme: "outline", size: "large" ,text: "Sign Up with Google"} 
    );

    google.accounts.id.prompt(); 
  }
  handleCredentialResponse(response: any): void {
    if (this.isLoading == false) {
      this.isLoading = true;
      var token = response.credential;
      const utmData = this._utmService.getUtmParams();
      
      this._accountservice.googlelogin(token, utmData).subscribe(
        (response: any) => {
          this._utmService.clearUtmParams();
          this.isLoading = false;
          this._accountservice.storeToken(response.token);
          this._accountservice.checkAndSetCookie(`${environment.Name.toLowerCase()}token`, response.token, 30);
          this._accountservice.storeRefreshToken(response.refreshToken);
          const PROFILE = new Profile;
          PROFILE.ProfileId = response?.customerId;
          PROFILE.ProfileEMail = response?.email;
          PROFILE.ProfileFirstName = response?.firstName;
          PROFILE.ProfileSecondName = response?.lastName;
          PROFILE.ProfileRole = response?.customerRoleName;
          PROFILE.TeamId = response?.teamId;
          //this._accountservice.StoreUserValue(PROFILE);
          this.ngZone.run(() => {
            this._router.navigate(['/app/home']);
          });
          const message = getMessage(SuccessMessages.UserSection1000, SuccessMessages.User1006);
          if (PROFILE.TeamId != null) {
            localStorage.setItem('teamId', PROFILE.TeamId.toString());
          }
          this._toastr.success(message, "", {
            timeOut: 5000,
          });
          this._accountservice.customerDetail(response.token);
        },
        (error: any) => {
          this.isLoading = false;
          this._toastr.error(error, "", {
            timeOut: 5000,
          });  
        }
      )
    }
    else
    {
      return;
    }

  }
}

