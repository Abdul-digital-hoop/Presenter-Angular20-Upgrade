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
import { MultipleDonutComponent } from './SlideTypes/PopularSlideType/multiple-donut/multiple-donut.component';
import { MultiplePieComponent } from './SlideTypes/PopularSlideType/multiple-pie/multiple-pie.component';
import { MultipleDotComponent } from './SlideTypes/PopularSlideType/multiple-dot/multiple-dot.component';
import { MultipleBarComponent } from './SlideTypes/PopularSlideType/multiple-bar/multiple-bar.component';
import { WordCloudComponent } from './SlideTypes/PopularSlideType/word-cloud/word-cloud.component';
import { OpenEndedComponent } from './SlideTypes/PopularSlideType/open-ended/open-ended.component';
import { OpenEndedFlowingComponent } from './SlideTypes/PopularSlideType/open-ended-flowing/open-ended-flowing.component';
import { GuessTheNumberComponent } from './SlideTypes/PopularSlideType/guess-the-number/guess-the-number.component';
import { RankingComponent } from './SlideTypes/PopularSlideType/ranking/ranking.component';
import { ScalesComponent } from './SlideTypes/PopularSlideType/scales/scales.component';
import { ScalesSliderComponent } from './SlideTypes/PopularSlideType/scales-slider/scales-slider.component';
import { QuestionAnswersComponent } from './SlideTypes/PopularSlideType/question-answers/question-answers.component';
import { ThisOrThatComponent } from './SlideTypes/PopularSlideType/this-or-that/this-or-that.component';
import { TruthOrLieComponent } from './SlideTypes/PopularSlideType/truth-or-lie/truth-or-lie.component';
import { TrafficLightsComponent } from './SlideTypes/PopularSlideType/traffic-lights/traffic-lights.component';
import { SelectAnswersComponent } from './SlideTypes/QuizSlides/select-answers/select-answers.component';
import { TypeAnswersComponent } from './SlideTypes/QuizSlides/type-answers/type-answers.component';
import { GuessTheNumberQuizComponent } from './SlideTypes/QuizSlides/guess-the-number-quiz/guess-the-number-quiz.component';
import { LeaderBoardComponent } from './SlideTypes/QuizSlides/leader-board/leader-board.component';
import { LeaderboardChampionComponent } from './SlideTypes/QuizSlides/leaderboard-champion/leaderboard-champion.component';
import { LeaderBoardLeadingComponent } from './SlideTypes/QuizSlides/leader-board-leading/leader-board-leading.component';
import { ImportPptComponent } from './SlideTypes/ImportSlides/import-google-slides/import-ppt/import-ppt.component';
import { ImportPowerpointComponent } from './SlideTypes/ImportSlides/import-powerpoint/import-powerpoint.component';
import { ImportGoogleSlideComponent } from './SlideTypes/ImportSlides/import-google-slide/import-google-slide.component';
import { InstructionComponent } from './SlideTypes/ContentSlides/instruction/instruction.component';
import { LineupComponent } from './SlideTypes/QuizSlides/lineup/lineup.component';
import { MultimediaComponent } from './SlideTypes/PopularSlideType/multimedia/multimedia.component';
import { EmptySlideComponent } from './SlideTypes/empty-slide/empty-slide.component';
import { MultipleChoiceComponent } from './SlideTypes/PopularSlideType/multiple-choice/multiple-choice.component';
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
        MultipleChoiceComponent,
        EmptySlideComponent,
        WordCloudComponent,
        OpenEndedComponent,
        ScalesComponent,
        RankingComponent,
        QuestionAnswersComponent,
        GuessTheNumberComponent,
        ThisOrThatComponent,
        TruthOrLieComponent,
        TrafficLightsComponent,
        MultipleDonutComponent,
        MultipleDotComponent,
        MultiplePieComponent,
        MultipleBarComponent,
        ScalesSliderComponent,
        OpenEndedFlowingComponent,
        SelectAnswersComponent,
        LeaderBoardComponent,
        SelectAnswersComponent,
        ImportPptComponent,
        ImportGoogleSlideComponent,
        ImportPowerpointComponent,
        InstructionComponent,
        TypeAnswersComponent,
        GuessTheNumberQuizComponent,
        LineupComponent,
        MultimediaComponent,
        LeaderboardChampionComponent,
        LeaderBoardLeadingComponent,
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
