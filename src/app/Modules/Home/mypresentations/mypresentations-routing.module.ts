import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MypresentationsComponent } from './mypresentations/mypresentations.component';
const routes: Routes = [{
  path: '',
  component: MypresentationsComponent,
  children: [],
  data: {
    defaultParams: {
      isListView: true
    }
  }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MypresentationsRoutingModule { }
