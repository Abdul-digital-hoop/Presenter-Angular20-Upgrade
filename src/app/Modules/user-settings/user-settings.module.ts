import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserSettingsRoutingModule } from './user-settings-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserHomeComponent } from './user-home/user-home.component';
import { ImageCropperModule } from 'ngx-image-cropper';



@NgModule({
  declarations: [
    UserHomeComponent,
  ],
  imports: [
    CommonModule,
    UserSettingsRoutingModule,
    ReactiveFormsModule,
    ImageCropperModule,
    FormsModule
  ]
})
export class UserSettingsModule { }
