import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ContentComponent } from './content/content.component';
import { MypresentationComponent } from './mypresentation/mypresentation.component';
import { SharedComponent } from './shared/shared.component';
import { SharedWithMeComponent } from './shared-with-me/shared-with-me.component';
import { IntegrationsComponent } from './integrations/integrations.component';
import { TrashComponent } from './trash/trash.component';
import { ExploreComponent } from './explore/explore.component';
import { ZoomComponent } from './zoom/zoom.component';
import { PowerpointComponent } from './powerpoint/powerpoint.component';
import { GoogleslidesComponent } from './googleslides/googleslides.component';
import { MyplanComponent } from './myplan/myplan.component';
import { PaymentSuccessComponent } from './payment-success/payment-success.component';
import { PaymentFailureComponent } from './payment-failure/payment-failure.component';
import { TeamComponent } from './team/team.component';
import { SaveMoreComponent } from './save-more/save-more.component';



const routes: Routes = [
  {
    path: '', component: HomeComponent, children: [
      {
        path: 'home', component: ContentComponent
      },
      {
        path: 'templates', loadChildren: () => import('./all-templates-module/all-templates-module-routing.module').then(m => m.AllTemplatesModuleRoutingModule)
      },
      {
        path: 'mypresentations', loadChildren: () => import('./mypresentations/mypresentations-routing.module').then(m => m.MypresentationsRoutingModule)
      },
      {
        path: 'dashboard', component: MypresentationComponent ,children:[
          {
            path: ':folderId', component: MypresentationComponent
          },
          {
            path: '',
            pathMatch: 'full'
          }
        ]
      },
      {
        path: 'shared', component: SharedComponent
      },
      {
        path: 'shared-with-me', component: SharedWithMeComponent
      },
      {
        path: 'integration', component: IntegrationsComponent,children:[
          {
            path: 'explore', component: ExploreComponent
          },
          {
            path: 'zoom', component: ZoomComponent
          },
          {
            path: 'powerpoint', component: PowerpointComponent
          },
          {
            path: 'google-slides', component: GoogleslidesComponent
          },
          {
            path: '',
            redirectTo: 'explore',
            pathMatch: 'full'
          }
        ]
      },
      {
        path: 'myplan', component: MyplanComponent
      },
      {
        path: 'trash', component: TrashComponent
      },
      {
        path: 'team-members', component: TeamComponent
      },
      {
        path: 'save-more', component: SaveMoreComponent
      },
    ]
  },
  {
    path: 'payment-success', component: PaymentSuccessComponent
  },
  {
    path: 'payment-failure', component: PaymentFailureComponent
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
