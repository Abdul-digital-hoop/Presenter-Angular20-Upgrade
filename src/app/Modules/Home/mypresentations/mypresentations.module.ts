import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MypresentationsRoutingModule } from './mypresentations-routing.module';
import { MypresentationsComponent } from './mypresentations/mypresentations.component';
import { MypresentationHeaderComponent } from './mypresentation-header/mypresentation-header.component';
import { MypresentationGridviewComponent } from './mypresentation-gridview/mypresentation-gridview.component';
import { MypresentationListviewComponent } from './mypresentation-listview/mypresentation-listview.component';
import { EmptyPresentationPageComponent } from './empty-presentation-page/empty-presentation-page.component';
import { TimeAgoPipe } from 'src/app/shared/Pipe/gettimeago.pipe';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
@NgModule({
  declarations: [
    MypresentationsComponent,
    MypresentationHeaderComponent,
    MypresentationGridviewComponent,
    MypresentationListviewComponent,
    EmptyPresentationPageComponent,
    TimeAgoPipe
  ],
  imports: [
    CommonModule,
    MypresentationsRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class MypresentationsModule { }
