import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageNotFoundComponent } from './Component/page-not-found/page-not-found.component';
import { UnderconstructionComponent } from './Component/underconstruction/underconstruction.component';
import { ForbiddenComponent } from './Component/forbidden/forbidden.component';
import { FooterComponent } from './Component/footer/footer.component';
import { SpinnerComponent } from './Component/spinner/spinner.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './Component/home/home.component';
import { RouterModule } from '@angular/router';
import { CountUpDirective } from './directive/count-up.directive';
import { DragDirective } from './directive/dragDrop.directive';
import { SpaceBetweenNumbersPipe } from './Pipe/space-between-numbers.pipe';
import { NewLinePipe } from './Pipe/new-line.pipe';
import { CommaPipe } from './Pipe/comma.pipe';
import { LengthCalculatorDirective } from './directive/length-calculator.directive';
import { NewLineRemovePipe } from './Pipe/new-line-remove.pipe';
import { PossibleAnswersPipe } from './Pipe/possible-answers.pipe';
import { ImageUploadComponent } from './Component/image-upload/image-upload.component';
import { ImageCropComponent } from './Component/image-crop/image-crop.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { OrderbyPipe } from './Pipe/orderby.pipe';
import { QuestionsInputComponent } from './Component/questions-input/questions-input.component';
import { OptionsInputComponent } from './Component/options-input/options-input.component';
import { ImageModalComponent } from './Component/image-modal/image-modal.component';
import { ThemesDirective } from './directive/themes.directive';
import { ReactionsComponent } from './Component/reactions/reactions.component';
import { SlideThemesPipe } from './Pipe/Themes/slide-themes.pipe';
import { ChangeThemesComponent } from './Component/change-themes/change-themes.component';
import { NumberListPipe } from './Pipe/Themes/number-list.pipe';
import { QuestionVisibilityPipe } from './Pipe/question-visibility.pipe';
import { RightPanelTextComponent } from './Component/right-panel-text/right-panel-text.component';
import { TimeDifferencePipePipe } from './Pipe/time-difference-pipe.pipe';
import { PreventClickDirective } from './directive/prevent-click.directive';
import { ReusableImageModalComponent } from './Component/reusable-image-modal/reusable-image-modal.component';
import { ReusableImageUploadComponent } from './Component/reusable-image-upload/reusable-image-upload.component';
import { ReusableImageCropComponent } from './Component/reusable-image-crop/reusable-image-crop.component';
import { ModalComponent } from './Component/modal/modal.component';
import { ThemeNameComponentComponent } from './Component/theme-name-component/theme-name-component.component';
import { WorkSpaceModule } from '../Modules/presentations/work-space.module';
import { PresentationsModule } from '../Modules/presentations/presentations.module';
import { MultipleChoiceComponent } from './SlideTypes/PopularSlideType/multiple-choice/multiple-choice.component';
import { EmptySlideComponent } from './SlideTypes/empty-slide/empty-slide.component';
import { GuessTheNumberComponent } from './SlideTypes/PopularSlideType/guess-the-number/guess-the-number.component';
import { MultipleBarComponent } from './SlideTypes/PopularSlideType/multiple-bar/multiple-bar.component';
import { MultipleDonutComponent } from './SlideTypes/PopularSlideType/multiple-donut/multiple-donut.component';
import { MultipleDotComponent } from './SlideTypes/PopularSlideType/multiple-dot/multiple-dot.component';
import { MultiplePieComponent } from './SlideTypes/PopularSlideType/multiple-pie/multiple-pie.component';
import { OpenEndedFlowingComponent } from './SlideTypes/PopularSlideType/open-ended-flowing/open-ended-flowing.component';
import { OpenEndedComponent } from './SlideTypes/PopularSlideType/open-ended/open-ended.component';
import { QuestionAnswersComponent } from './SlideTypes/PopularSlideType/question-answers/question-answers.component';
import { RankingComponent } from './SlideTypes/PopularSlideType/ranking/ranking.component';
import { ScalesSliderComponent } from './SlideTypes/PopularSlideType/scales-slider/scales-slider.component';
import { ScalesComponent } from './SlideTypes/PopularSlideType/scales/scales.component';
import { ThisOrThatComponent } from './SlideTypes/PopularSlideType/this-or-that/this-or-that.component';
import { TrafficLightsComponent } from './SlideTypes/PopularSlideType/traffic-lights/traffic-lights.component';
import { TruthOrLieComponent } from './SlideTypes/PopularSlideType/truth-or-lie/truth-or-lie.component';
import { WordCloudComponent } from './SlideTypes/PopularSlideType/word-cloud/word-cloud.component';
import { InstructionComponent } from './SlideTypes/ContentSlides/instruction/instruction.component';
import { ImportGoogleSlideComponent } from './SlideTypes/ImportSlides/import-google-slide/import-google-slide.component';
import { ImportPptComponent } from './SlideTypes/ImportSlides/import-google-slides/import-ppt/import-ppt.component';
import { ImportPowerpointComponent } from './SlideTypes/ImportSlides/import-powerpoint/import-powerpoint.component';
import { GuessTheNumberQuizComponent } from './SlideTypes/QuizSlides/guess-the-number-quiz/guess-the-number-quiz.component';
import { LeaderBoardComponent } from './SlideTypes/QuizSlides/leader-board/leader-board.component';
import { SelectAnswersComponent } from './SlideTypes/QuizSlides/select-answers/select-answers.component';
import { TypeAnswersComponent } from './SlideTypes/QuizSlides/type-answers/type-answers.component';
import { LineupComponent } from './SlideTypes/QuizSlides/lineup/lineup.component';
import { MultimediaComponent } from './SlideTypes/PopularSlideType/multimedia/multimedia.component';
import { LeaderBoardLeadingComponent } from './SlideTypes/QuizSlides/leader-board-leading/leader-board-leading.component';
import { LeaderboardChampionComponent } from './SlideTypes/QuizSlides/leaderboard-champion/leaderboard-champion.component';
import { DynamicSlideTypeComponent } from './Component/dynamic-slide-type/dynamic-slide-type.component';
import { DynamicSlideTypeDirective } from './directive/dynamic-slide-type.directive';
import { SlidesPreviewComponent } from './Slide-Preview/slides-preview/slides-preview.component';
import { TemplatesPreviewComponent } from './Component/templates-preview/templates-preview.component';
import { ConvertTemplateComponent } from './Component/convert-template/convert-template.component';
import { AnnotationToolbarComponent } from './Component/annotation-toolbar/annotation-toolbar.component';
import { RemoteAccessNotificationComponent } from './Component/remote-access-notification/remote-access-notification.component';

@NgModule({
  declarations: [
    PageNotFoundComponent,
    UnderconstructionComponent,
    ForbiddenComponent,
    FooterComponent,
    SpinnerComponent,
    HomeComponent,
    CountUpDirective,
    DragDirective,
    SpaceBetweenNumbersPipe,
    NewLinePipe,
    CommaPipe,
    LengthCalculatorDirective,
    NewLineRemovePipe,
    PossibleAnswersPipe,
    ImageUploadComponent,
    ImageCropComponent,
    OrderbyPipe,
    QuestionsInputComponent,
    OptionsInputComponent,
    ImageModalComponent,
    ThemesDirective,
    ReactionsComponent,
    SlideThemesPipe,
    ChangeThemesComponent,
    NumberListPipe,
    QuestionVisibilityPipe,
    RightPanelTextComponent,
    TimeDifferencePipePipe,
    PreventClickDirective,
    ReusableImageModalComponent,
    ReusableImageUploadComponent,
    ReusableImageCropComponent,
    ModalComponent,
    ThemeNameComponentComponent,
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
    DynamicSlideTypeComponent,
    DynamicSlideTypeDirective,
    SlidesPreviewComponent,
    TemplatesPreviewComponent,
    ConvertTemplateComponent,
    AnnotationToolbarComponent,
    RemoteAccessNotificationComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ImageCropperModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SpinnerComponent,
    FooterComponent,
    CountUpDirective,
    DragDirective,
    SpaceBetweenNumbersPipe,
    NewLinePipe,
    CommaPipe,
    LengthCalculatorDirective,
    NewLineRemovePipe,
    PossibleAnswersPipe,
    ImageUploadComponent,
    ImageCropComponent,
    OrderbyPipe,
    QuestionsInputComponent,
    OptionsInputComponent,
    ImageModalComponent,
    ThemesDirective,
    ReactionsComponent,
    SlideThemesPipe,
    ChangeThemesComponent,
    NumberListPipe,
    QuestionVisibilityPipe,
    RightPanelTextComponent,
    TimeDifferencePipePipe,
    PreventClickDirective,
    ReusableImageModalComponent,
    ReusableImageUploadComponent,
    ReusableImageCropComponent,
    ModalComponent,
    ThemeNameComponentComponent,
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
    DynamicSlideTypeComponent,
    SlidesPreviewComponent,
    TemplatesPreviewComponent,
    ConvertTemplateComponent,
    AnnotationToolbarComponent,
    RemoteAccessNotificationComponent
  ]
})
export class SharedModule { }
