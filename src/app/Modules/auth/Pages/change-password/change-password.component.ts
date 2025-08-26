import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { getErrorMessage, getMessage } from 'src/app/core/SuccessMessageHandler';
import { AccountService } from 'src/app/core/Sevices/account.service';
import { ErrorMessages, SuccessMessages } from 'src/app/core/SuccessResponse';
import { MetaService } from 'src/app/core/Sevices/meta.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  submitted = false;
  isLoading: boolean = false;
  isText: boolean = true;
  passwordType: string = "password";
  userId: any;
  activationCode: any;
  resetcodeExpired : boolean = false;
  constructor(
    private _formBuilder: FormBuilder,
    private _accountservice: AccountService,
    private _toastr: ToastrService,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _metaService: MetaService
  ) {
    this._activatedRoute.queryParams.subscribe((params) => {
      this.userId = params['userId'];
      this.activationCode = params['activationCode'];
      this.resetcodeExpired = params['resetcode'] === 'expired';
    });
  }
  ngOnInit(): void {
    const metaConfig = this._metaService.getAuthPageMeta('changepassword');
    this._metaService.updateMetaTags(
      metaConfig.title,
      metaConfig.description,
      metaConfig.ogtitle,
      metaConfig.ogImage,
      metaConfig.ogdescription
    );

    this.changePasswordForm = this._formBuilder.group(
      {
        CustomerId: [this.userId],
        PasswordResetCode: [this.activationCode],
        NewPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
            ),
          ],
        ],
        ConfirmPassword: [
          '', 
          [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(
          /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
        ),
          ],
      ],
      }
    );
  }

  get f(): { [key: string]: AbstractControl } {
    return this.changePasswordForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.changePasswordForm.invalid) {
      return;
    }

    if (this.changePasswordForm.value.NewPassword !== this.changePasswordForm.value.ConfirmPassword) {
      //const message = getMessage(SuccessMessages.UserSection1000,SuccessMessages.User1020);
      const message = getErrorMessage(ErrorMessages.UserSection1000,ErrorMessages.User1004); 
      this._toastr.error(message, "", {
      timeOut: 5000,
      });  
      return;
    }

    this.isLoading = true;
    var payload = {
      CustomerId: this.userId,
      PasswordResetCode: this.activationCode,
      NewPassword: this.changePasswordForm.value.NewPassword,
    };

    this._accountservice.PasswordChange(payload).subscribe(
      (response: any) => {
        if (response == true) {
          this.isLoading = false;
          const message = getMessage(SuccessMessages.UserSection1000,SuccessMessages.User1005);
          this._toastr.success(message, "", {
            timeOut: 5000,
          });
          this._router.navigateByUrl('/auth/signin');
        }
      },
      (error: any) => {
        this.isLoading = false;
        this._toastr.error(error, "", {
          timeOut: 5000,
        }); 
      }
    );
  }

  hideshowpass() {
    this.isText = !this.isText;
    this.isText ? this.passwordType = "password" : this.passwordType = "text";
  }
}