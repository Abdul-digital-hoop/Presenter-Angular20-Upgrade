import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { CommanService } from 'src/app/core/Sevices/comman.service';
import { ProfanityFilterWords } from 'src/app/utility/ProfanityFilter';
import { settingVariables } from 'src/app/utility/SettingVariables';

@Component({
  selector: 'app-question-answers',
  templateUrl: './question-answers.component.html',
  styleUrls: ['./question-answers.component.scss']
})
export class QuestionAnswersComponent implements OnInit {
  @Input() slideTheme:any;
  @Input() slideDetails:any;
  @Input() template:any;
  @Input() presentationLevelTheme:any;
  @Input('isPreviewMode') public isPreviewMode: boolean;
  @Input('selectedQuestionIndex') public selectedQuestionIndex: any = 0;
  @Output()  markAnswered = new EventEmitter();
  questionAnswerDisplay=true;
  answeredQuestion: any;
  unAnsweredQuestion: any;
  questionsToDisplay: any;
  isLoading: boolean;
  questionModels: any;
  contrastColor:any;
  settingVariable = settingVariables;
  presentationMode: boolean = true;
  enableKeyDown = true; 
  private enableKeyDownSubscription: Subscription;
  questionId: any;
  isAnswered: boolean;
  filteredQuestions: any[] = [];
  filter: string = 'all';
  ContrastColor: any;
  questions: any;
  profanityLanguageWords = ProfanityFilterWords;
  presentationTheme: { ThemeName: string; ThemeLogo: any; ThemeBackgroundColor: string; ThemeBackgroundImage: any;  ThemeTextColor: string; ThemeFontFamily: string; ThemeLineColor: string; ThemeVisualizationColor: any[]; slideTextBold: boolean; slideTextItalic: boolean; slideTextUnderLine: boolean; slideTextStrikeThrough: boolean; slidetextSize: number,backgroundColorOpacity:any};
  slidesTheme: { ThemeName: string; ThemeLogo: any; ThemeBackgroundColor: string; ThemeBackgroundImage: string; ThemeTextColor: string; ThemeFontFamily: string; ThemeLineColor: string; ThemeVisualizationColor: any[]; slideTextBold: boolean; slideTextItalic: boolean; slideTextUnderLine: boolean; slideTextStrikeThrough: boolean; slidetextSize: number };
  presentationsLevelQuestions: any[]=[];
  chartUpdateInterval: any;
  previousIndex: number = -1;
  isFirstUpdate: boolean = true;
  currentIndex: number = -1;
  originalQuestions: any[] = [];
  isAnimation: boolean = false;
  constructor(private _commanService:CommanService,
    private _activateRouter: ActivatedRoute,
    public workspaceservice: WorkspaceService,
    public presentationService: PresentationService,
    public commonService: CommanService ) {
        this.enableKeyDownSubscription = this.workspaceservice.isKeyDownEnabled().subscribe(enabled => {
          this.enableKeyDown = enabled;
        });
        
    }
  
    ngOnInit(): void {
      this.presentationTheme = this.assignThemeProperties(this.presentationLevelTheme);
      this.slidesTheme = this.assignThemeProperties(this.presentationLevelTheme, this.slideDetails?.design,true);
      this.slideTheme = this.slideDetails?.design?.slideResetTheme ? this.slidesTheme: this.presentationTheme;
      this.presentationMode = this.template?.presentationMode;
      this.questions = this.template.presentationQuestions;
      this.questionId = this.questions[0]?.questionId;
      this.isAnswered = this.questions[0]?.isAnswered;
      this.ContrastColor = this.commonService.getContrastColor(this.slideTheme?.ThemeBackgroundColor);
      this.originalQuestions = [...this.questions];
      this.setFilterQuestion('all');
    }
    @HostListener('window:keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent): void {
      const key = event.key.toLowerCase();
      if (event.ctrlKey || this.enableKeyDown) {
        return;
      }
      switch (key) {
        case 'arrowup':
            this.PreviousQuestion(this.questionId,this.isAnswered);
            break;
        case 'arrowdown':
            this.NextQuestion(this.questionId,this.isAnswered);
            break;
      }
    }
    ngOnChanges(){
      this.ContrastColor = this.commonService.getContrastColor(this.slideTheme?.ThemeBackgroundColor);
    }
    private assignThemeProperties(presentationLevelTheme: any, slideDetails?: any, isSlideTheme: boolean=false): any {
      const themeProperties = {
        ThemeName: presentationLevelTheme?.themeName,
        ThemeLogo: presentationLevelTheme?.themesLogo,
        ThemeTextColor: isSlideTheme ? slideDetails?.slideTextColor : presentationLevelTheme?.themesFontColor,
        backgroundColorOpacity: presentationLevelTheme?.backgroundColorOpacity,
        ThemeFontFamily: isSlideTheme ? slideDetails?.slideTextFontFamily : presentationLevelTheme?.themesFonts,
        ThemeBackgroundImage: presentationLevelTheme?.themesBackgroundImage,
        ThemeLineColor: isSlideTheme ? slideDetails?.slideLineColor : presentationLevelTheme?.lineClour,
        ThemeBackgroundColor: isSlideTheme ? slideDetails?.slideBackgroundColor : presentationLevelTheme?.themesBackgroundColor,
        ThemeVisualizationColor: presentationLevelTheme?.themesChartColor,
        slideTextBold: isSlideTheme ? slideDetails?.slideTextBold : presentationLevelTheme?.textBold,
        slideTextItalic: isSlideTheme ? slideDetails?.slideTextItalic : presentationLevelTheme?.textItalic,
        slideTextUnderLine: isSlideTheme ? slideDetails?.slideTextUnderLine : presentationLevelTheme?.textUnderline,
        slideTextStrikeThrough: isSlideTheme ? slideDetails?.slideTextStrikeThrough : presentationLevelTheme?.textStrikeout,
        slidetextSize: isSlideTheme ? slideDetails?.slideTextFontSize : presentationLevelTheme?.fontSize
      };
      return themeProperties;
    }
    ngAfterViewChecked() {
      this.ContrastColor = this.commonService.getContrastColor(this.slideTheme?.ThemeBackgroundColor);
    }
    @HostListener('document:keydown.enter', ['$event'])
    handleEnterKey(event: KeyboardEvent) {
      const currentQuestion = this.questions[this.selectedQuestionIndex];
      if (currentQuestion) {
        this.markAsAnswered(currentQuestion.questionId, true);
      }
    }
  
  
    markAsAnswered(questionId: any, isAnswered: boolean) {
      this.filteredQuestions.find(x=>x.questionId == questionId).isAnswered = !isAnswered;
      this.presentationsLevelQuestions.find(x=>x.questionId == questionId).isAnswered = !isAnswered;
      let questionDTO = {
        presentationId: this.template?.presentationId,
        questionId: questionId,
        isValue: !isAnswered,
        isTemplate: this.workspaceservice.isTemplate
      };
      this.presentationService.updateAnsweredQuestion(questionDTO).subscribe(
        (response: any) => {
          this.filterQuestion(this.presentationsLevelQuestions);
          this.workspaceservice.presentationQuestionsLegnth = this.workspaceservice.presentationQuestions.filter(q => !q.isAnswered).length;
        },
        (error: any) => {
          console.log(error?.error);
        }
      );
    }
    NextQuestion(questionId:any,isAnswered:boolean) {
      this.questionId = questionId;
      this.isAnswered = isAnswered;
      if (this.questions.length > this.selectedQuestionIndex + 1) {
        this.selectedQuestionIndex++;
      }
    }
    PreviousQuestion(questionId:any,isAnswered:boolean) {
      this.questionId = questionId;
      this.isAnswered = isAnswered
      if (!(this.selectedQuestionIndex == 0)) {
        this.selectedQuestionIndex--;
      }
      else {
  
      }
    }
    ngOnDestroy(): void {
      this.enableKeyDownSubscription.unsubscribe();
      this.stopRandomDataUpdates();
    }
    updateTheme(data: any) {
      this.slideTheme = data;
      // this.ContrastColor = this.commonService.getContrastColor(this.slideTheme?.ThemeBackgroundColor);
    }
    updatePresentationTheme(data: any) {
      this.slideTheme = data;
      // this.ContrastColor = this.commonService.getContrastColor(this.presentationTheme?.ThemeBackgroundColor);
    }
    setFilterQuestion(filter: string) {
      this.filter = filter;
      this.presentationsLevelQuestions = this.workspaceservice.TemplateProfanityWordsChecks(this.questions);
      this.filterQuestion(this.presentationsLevelQuestions);
    }
  
    filterQuestion(presentationsQuestions:any) {

      if(presentationsQuestions){
        if (this.filter === 'all') {
          this.filteredQuestions = presentationsQuestions;
          this.questions = presentationsQuestions;
        } else if (this.filter === 'pinned') {
          this.filteredQuestions = presentationsQuestions.filter(q => q.isPinned);
        } else if (this.filter === 'answered') {
          this.filteredQuestions = presentationsQuestions.filter(q => q.isAnswered);
        }
      }
      else{
        // this.filteredQuestions = [];
      }
    }
    markAsPinned(questionId: any, isPinned: boolean) {
      this.filteredQuestions.find(x=>x.questionId == questionId).isPinned = !isPinned;
      this.presentationsLevelQuestions.find(x=>x.questionId == questionId).isPinned = !isPinned;
      let questionDTO = {
        presentationId: this.template?.presentationId,
        questionId: questionId,
        isValue: !isPinned,
        isTemplate: this.workspaceservice.isTemplate
      }
      this.presentationService.updatePinnedQuestion(questionDTO).subscribe(
        (response: any) => {
           this.filterQuestion(this.presentationsLevelQuestions);
        },
        (error: any) => {
          console.log(error?.error);
        }
      );
    }
    updateChart(questions:any){
      this.presentationsLevelQuestions = this.workspaceservice.TemplateProfanityWordsChecks(questions);
      this.filteredQuestions =this.presentationsLevelQuestions;
      this.filterQuestion(this.presentationsLevelQuestions);
    }
    updateChartWithRandomData(): void {
      try {
        if (this.isFirstUpdate) {
          // Initialize with an empty array
          this.questions = [];
          this.isFirstUpdate = false;
        } else {
          // Get questions that haven't been added yet
          const remainingQuestions = this.originalQuestions.filter(original => 
            !this.questions.some(q => q.questionId === original.questionId)
          );

          if (remainingQuestions.length > 0) {
            // Randomly select one question to add
            const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
            const selectedQuestion = remainingQuestions[randomIndex];
            
            // Add the selected question to the array
            this.questions.push({
              ...selectedQuestion,
              isAnswered: false
            });
          } else {
            // If all questions have been added, reset
            this.isFirstUpdate = true;
          }
        }
        this.updateChart(this.questions);
      } catch (error) {
        console.error('Error updating questions data:', error);
        this.stopRandomDataUpdates();
      }
    }
  
    resetChart(): void {
      this.isFirstUpdate = true;
      this.previousIndex = -1;
    }
  
    startRandomDataUpdates(): void {
      // Check if animation is already running
      if (!this.isAnimation) {
        this.isAnimation = true;
        this.resetChart();
        
        if (this.chartUpdateInterval) {
          clearInterval(this.chartUpdateInterval);
        }
    
        // First update after 1000ms
        this.chartUpdateInterval = setInterval(() => {
          this.updateChartWithRandomData();
          if (!this.isFirstUpdate) {
            clearInterval(this.chartUpdateInterval);
            this.chartUpdateInterval = setInterval(() => {
              this.updateChartWithRandomData();
            }, 2000);
          }
        }, 1000);
      }
    }
  
    stopRandomDataUpdates(): void {
      if (this.chartUpdateInterval) {
        clearInterval(this.chartUpdateInterval);
        this.chartUpdateInterval = null;
      }
      this.questions = [...this.originalQuestions];
        this.isAnimation = false;
        this.updateChart(this.questions);
    }
}
