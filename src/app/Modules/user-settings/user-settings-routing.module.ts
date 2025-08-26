import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes ,RouterModule} from '@angular/router';
import { UserHomeComponent } from './user-home/user-home.component';



const routes: Routes = [
  {
    path: '', component: UserHomeComponent, children: [
      {
        path: 'user-profile', component: UserHomeComponent
      },
    ]
  }
  ]
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class UserSettingsRoutingModule { }
