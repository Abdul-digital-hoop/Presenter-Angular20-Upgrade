import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllTemplatesModuleRoutingModule } from './all-templates-module-routing.module';
import { TemplatesComponent } from './templates/templates.component';
import { TemplatesHeaderComponent } from './templates-header/templates-header.component';
import { TemplatesFilterComponent } from './templates-filter/templates-filter.component';
import { TemplatesListComponent } from './templates-list/templates-list.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { SkeletonLoaderComponent } from './skeleton-loader/skeleton-loader.component';
import { TemplatesPublishComponent } from './templates-publish/templates-publish.component';
import { TemplatesEditComponent } from './templates-edit/templates-edit.component';

@NgModule({
  declarations: [
    TemplatesComponent,
    TemplatesHeaderComponent,
    TemplatesFilterComponent,
    TemplatesListComponent,
    SkeletonLoaderComponent,
    TemplatesPublishComponent,
    TemplatesEditComponent
  ],
  imports: [
    CommonModule,
    AllTemplatesModuleRoutingModule,
    FormsModule,
    SharedModule
  ]
})
export class AllTemplatesModuleModule { }
