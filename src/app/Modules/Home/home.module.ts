import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenuComponent } from './menu/menu.component';
import { FeaturesComponent } from './features/features.component';
import { HomeComponent } from './home/home.component';
import { RecentlyViewComponent } from './recently-view/recently-view.component';
import { PopularTemplatesComponent } from './popular-templates/popular-templates.component';
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
import { HeaderComponent } from '../header/header.component';
import { PaymentFailureComponent } from './payment-failure/payment-failure.component';
import { PaymentSuccessComponent } from './payment-success/payment-success.component';
import { TeamComponent } from './team/team.component';
import { SaveMoreComponent } from './save-more/save-more.component';
import { AllTemplatesModuleModule } from './all-templates-module/all-templates-module.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { AiModalComponent } from './ai-modal/ai-modal.component';
import { GuideComponent } from './guide/guide.component';
import { MypresentationsModule } from './mypresentations/mypresentations.module';




@NgModule({
  declarations: [
    MenuComponent,
    FeaturesComponent,
    HomeComponent,
    RecentlyViewComponent,
    PopularTemplatesComponent,
    ContentComponent,
    MypresentationComponent,
    SharedComponent,
    SharedWithMeComponent,
    IntegrationsComponent,
    TrashComponent,
    ExploreComponent,
    ZoomComponent,
    PowerpointComponent,
    GoogleslidesComponent,
    MyplanComponent,
    HeaderComponent,
    PaymentFailureComponent,
    PaymentSuccessComponent,
    TeamComponent,
    SaveMoreComponent,
    AiModalComponent,
    GuideComponent

  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AllTemplatesModuleModule,
    SharedModule,
    MypresentationsModule
  ]
})
export class HomeModule { }

