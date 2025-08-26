import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guard/auth.guard';
import { ViewResultComponent } from './view-result/view-result.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/presentation/home',
    pathMatch: 'full',
    
  },
  {
    path: '',
    children: [
      // {
      //   path: 'present/:presentationid/:slideId',
      //   component: PresentComponent
      // },
      {
        path: ':id/view-results',
        component: ViewResultComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PresentationsRoutingModule { }
