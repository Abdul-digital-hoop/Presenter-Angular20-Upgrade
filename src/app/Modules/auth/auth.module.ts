import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { SignupComponent } from './Pages/signup/signup.component';
import { SinginComponent } from './Pages/singin/singin.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ForgetPasswordComponent } from './Pages/forget-password/forget-password.component';
import { ToastrModule } from 'ngx-toastr';
import { SignupVerificationComponent } from './Pages/signup-verification/signup-verification.component';
import { ChangePasswordComponent } from './Pages/change-password/change-password.component';
import { ResendEmailVerificationComponent } from './Pages/resend-email-verification/resend-email-verification.component';
import { CommonPreviewComponent } from './Pages/common-preview/common-preview.component';
import { RemoteAccessComponent } from './Pages/remote-access/remote-access.component';

@NgModule({
  declarations: [
    SignupComponent,
    SinginComponent,
    ForgetPasswordComponent,
    SignupVerificationComponent,
    ChangePasswordComponent,
    ResendEmailVerificationComponent,
    CommonPreviewComponent,
    RemoteAccessComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    SharedModule,
    ToastrModule.forRoot({
      timeOut: 5000, // 5 seconds
      closeButton: true,
      progressBar: true,
    }),
  ]
})
export class AuthModule { }
