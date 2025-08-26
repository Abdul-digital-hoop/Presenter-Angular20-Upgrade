import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForbiddenComponent } from './shared/Component/forbidden/forbidden.component';
import { HomeComponent } from './shared/Component/home/home.component';
import { PageNotFoundComponent } from './shared/Component/page-not-found/page-not-found.component';
import { UnderconstructionComponent } from './shared/Component/underconstruction/underconstruction.component';
import { AuthGuard } from './core/guard/auth.guard';
import { MetaGuard } from './core/guard/meta.guard';
import { config } from 'rxjs';
import { ZoomComponent } from './Modules/Add-ons/zoom/zoom.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/signin',
    pathMatch: 'full'
  },
  {
    path:'auth',
    loadChildren: () => import('./Modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path:'presentation',
    loadChildren: () => import('./Modules/presentations/presentations.module').then(m => m.PresentationsModule),canActivate:[AuthGuard, MetaGuard]
  },
  { path: 'app', 
    loadChildren: () => import('./Modules/Home/home.module').then(m => m.HomeModule),canActivate:[AuthGuard, MetaGuard] },
  {
    path:'users',
    loadChildren: () => import('./Modules/users/users.module').then(m => m.UsersModule),canActivate:[AuthGuard, MetaGuard]
  },
  {
    path:'app',
    loadChildren: () => import('./Modules/user-settings/user-settings.module').then(m => m.UserSettingsModule),canActivate:[AuthGuard, MetaGuard]
  },
  {
    path:'forbidden',
    component:ForbiddenComponent,
    canActivate:[MetaGuard]
  },
  {
    path:'404',
    component:PageNotFoundComponent,
    canActivate:[MetaGuard]
  },
  {
    path:'under-construction',
    component:UnderconstructionComponent,
    canActivate:[MetaGuard]
  },
  {
    path:'index',
    component:HomeComponent,
    canActivate:[MetaGuard]
  },
  {
    path:'zoom',
    component:ZoomComponent,
    canActivate:[MetaGuard]
  },
  { 
    path: 'WorkSpace', 
    loadChildren: () => import('./Modules/presentations/work-space.module').then(m => m.WorkSpaceModule),
    canActivate:[MetaGuard]
  },
  {
    path:'**',
    redirectTo:'/404',
    pathMatch:'full'
  },
];

declare const _IntegrationMediumOffice:boolean;
var USEHASH = _IntegrationMediumOffice ? true:false;

@NgModule({
  imports: [RouterModule.forRoot(routes,{
    onSameUrlNavigation: 'reload',
    useHash: USEHASH
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
