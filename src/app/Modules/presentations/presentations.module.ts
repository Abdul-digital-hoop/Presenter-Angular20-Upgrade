import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { PresentationsRoutingModule } from './presentations-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { AngularD3CloudModule } from 'angular-d3-cloud';
import { ImageCropperModule } from 'ngx-image-cropper';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ViewResultComponent } from './view-result/view-result.component';
import { ViewResultResponseComponent } from './view-result-response/view-result-response.component';
@NgModule({
  declarations: [
    ViewResultComponent,
    ViewResultResponseComponent
  ],
  imports: [
    CommonModule,
    PresentationsRoutingModule,
    SharedModule,
    AngularD3CloudModule,
    ImageCropperModule,
    DragDropModule
  ],

})
export class PresentationsModule { }
