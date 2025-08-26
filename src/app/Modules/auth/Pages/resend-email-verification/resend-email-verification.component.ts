import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { getErrorMessage, getMessage } from 'src/app/core/SuccessMessageHandler';
import { Profile } from 'src/app/core/Models/profile.model';
import { AccountService } from 'src/app/core/Sevices/account.service';
import {  ErrorMessages, SuccessMessages } from 'src/app/core/SuccessResponse';
import { MetaService } from 'src/app/core/Sevices/meta.service';

declare var google: any; 
@Component({
    selector: 'app-resend-email-verification',
    templateUrl: './resend-email-verification.component.html',
    styleUrls: ['./resend-email-verification.component.scss'],
    standalone: false
})
export class ResendEmailVerificationComponent implements OnInit {
  resendEmailForm: FormGroup;
  submitted = false;
  GoogleInitialzed:any;

  isLoading: boolean = false;
  isVerify: boolean = false;
  constructor(
    private _formBuilder: FormBuilder,
    private _accountservice: AccountService,
    private _toastr: ToastrService,
    private _router: Router,
    private _metaService: MetaService
  ) { }

  ngOnInit(): void {
    const metaConfig = this._metaService.getAuthPageMeta('resendemail');
    this._metaService.updateMetaTags(metaConfig.title, metaConfig.description, metaConfig.ogtitle, metaConfig.ogImage, metaConfig.ogdescription);

    this.resendEmailForm = this._formBuilder.group(
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
    return this.resendEmailForm.controls;
  }
  onSubmit() {
    this.submitted = true;
    if (this.resendEmailForm.invalid) {
      return;
    }
    if (this.resendEmailForm.valid) {
      this.isLoading = true;
      var payload = this.resendEmailForm.value;
      }
      this._accountservice.resendEmail(payload['Email']).subscribe(
        (response: any) => {
          this._router.navigateByUrl('/auth/verification');
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
              this._toastr.success(errorMessage, "", {
                timeOut: 5000,
              }); 
            }else{
            this.isLoading = false;
            this._toastr.error(error, "", {
              timeOut: 5000,
            });
          } 
});
}
}

