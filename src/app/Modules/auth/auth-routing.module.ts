import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForgetPasswordComponent } from './Pages/forget-password/forget-password.component';
import { SignupVerificationComponent } from './Pages/signup-verification/signup-verification.component';
import { SignupComponent } from './Pages/signup/signup.component';
import { SinginComponent } from './Pages/singin/singin.component';
import { ChangePasswordComponent } from './Pages/change-password/change-password.component';
import { ResendEmailVerificationComponent } from './Pages/resend-email-verification/resend-email-verification.component';
import { CommonPreviewComponent } from './Pages/common-preview/common-preview.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/signin',
    pathMatch: 'full'
  },
  {
    path: '',
    children: [
      {
        path: 'signin',
        component: SinginComponent
      },
      {
        path: 'signup',
        component: SignupComponent
      },
      {
        path: 'forgetpassword',
        component: ForgetPasswordComponent
      },
      {
        path: 'verification',
        component: SignupVerificationComponent
      },
      {
        path: 'resetpassword',
        component: ChangePasswordComponent
      },
      {
        path: 'resendemailverification',
        component: ResendEmailVerificationComponent
      },
      {
        path: 'template-preview',
        component: CommonPreviewComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
