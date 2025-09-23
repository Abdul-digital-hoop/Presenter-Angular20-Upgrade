import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkSpaceRoutingModule } from './work-space-routing.module';
import { WorkSpaceComponent } from './work-space.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { RightSideBarComponent } from './right-side-bar/right-side-bar.component';
import { LeftSideBarComponent } from './left-side-bar/left-side-bar.component';
import { CenterPanelComponent } from './center-panel/center-panel.component';
import { PresentationComponent } from './presentation/presentation.component';
import { PresentationNameComponent } from './nav-bar/presentation-name/presentation-name.component';
import { SharePresenatationComponent } from './nav-bar/share-presenatation/share-presenatation.component';
import { PresentationSettingComponent } from './nav-bar/presentation-setting/presentation-setting.component';
import { PreviewPresentationComponent } from './nav-bar/preview-presentation/preview-presentation.component';
import { PresentationPresentComponent } from './nav-bar/presentation-present/presentation-present.component';
import { PresentationResultComponent } from './nav-bar/presentation-result/presentation-result.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DynamicComponentDirective } from './Common/dynamic-component.directive';

import { SharedModule } from "../../shared/shared.module";
import { PresentationThemesComponent } from './presentation-themes/presentation-themes.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PresenterToolbarComponent } from './presenter-toolbar/presenter-toolbar.component';
import { PresentationPreviewComponent } from './presentation-preview/presentation-preview.component';
import { DynamicChartComponent } from './dynamic-chart/dynamic-chart.component';
import { AccessCodeComponent } from './access-code/access-code.component';
import { RemoteCenterPanelComponent } from './remote-center-panel/remote-center-panel.component';
import { RemoteLeftbarComponent } from './remote-leftbar/remote-leftbar.component';
import { RemoteNavbarComponent } from './remote-navbar/remote-navbar.component';
import { RemoteRightbarComponent } from './remote-rightbar/remote-rightbar.component';
import { CreateThemeComponent } from './create-theme/create-theme.component';
import { ThemeCenterPanelComponent } from './create-theme/theme-center-panel/theme-center-panel.component';
import { ThemeRightSideBarComponent } from './create-theme/theme-right-side-bar/theme-right-side-bar.component';
import { RemoteComponent } from './remote/remote.component';
import { RemoteAccessRequestComponent } from './remote-access-request/remote-access-request.component';
import { RemoteAccessManagementComponent } from './remote-access-management/remote-access-management.component';
import { RemoteUrlPopupComponent } from './remote-url-popup/remote-url-popup.component';
import { CenterPanelSkeletonComponent } from './center-panel-skeleton/center-panel-skeleton.component';


@NgModule({
    declarations: [
        WorkSpaceComponent,
        NavBarComponent,
        RightSideBarComponent,
        LeftSideBarComponent,
        CenterPanelComponent,
        PresentationComponent,
        PresentationNameComponent,
        SharePresenatationComponent,
        PresentationSettingComponent,
        PreviewPresentationComponent,
        PresentationPresentComponent,
        PresentationResultComponent,
        DynamicComponentDirective,
        PresentationThemesComponent,
        PresenterToolbarComponent,
        RemoteComponent,
        RemoteAccessRequestComponent,
        RemoteAccessManagementComponent,
        RemoteUrlPopupComponent,
        PresentationPreviewComponent,
        DynamicChartComponent,
        AccessCodeComponent,
        RemoteCenterPanelComponent,
        RemoteLeftbarComponent,
        RemoteNavbarComponent,
        RemoteRightbarComponent,
        CreateThemeComponent,
        ThemeCenterPanelComponent,
        ThemeRightSideBarComponent,
        CenterPanelSkeletonComponent    
    ],
    imports: [
        CommonModule,
        WorkSpaceRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        DragDropModule,
    ]
})
export class WorkSpaceModule { }
