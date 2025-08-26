import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkSpaceComponent } from './work-space.component';
import { PresentationComponent } from './presentation/presentation.component';
import { RemoteComponent } from './remote/remote.component';
import { PresentationPreviewComponent } from './presentation-preview/presentation-preview.component';
import { CreateThemeComponent } from './create-theme/create-theme.component';

const routes: Routes = [
  { 
    path: 'edit',
    component: WorkSpaceComponent 
  },
  { 
    path: 'presentation', 
    component: PresentationComponent 
  },
  { 
    path: 'remote', 
    component: RemoteComponent 
  },
  {
    path:'preview',
    component: PresentationPreviewComponent
  },
  {
    path:'create-theme/:id',
    component: CreateThemeComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkSpaceRoutingModule {

}
