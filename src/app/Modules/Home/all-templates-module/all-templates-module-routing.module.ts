import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TemplatesComponent } from './templates/templates.component';

const routes: Routes = [
  {
    path: '',
    component: TemplatesComponent,
    children: [],
    data: {
      defaultParams: {
        isPublished: true,
        selectedCategory: 'All Templates'
      }
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AllTemplatesModuleRoutingModule { }
