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

  // @Input('presentationQuestions') public presentationQuestions: any[];
  // @Input('screenOptions') public screenOptions: string;
  // @Input('aboutTheSlides') public aboutTheSlideValue: any;
  // @Input('questions') public questionsValue: any;
  // @Input('slidDetails') public slideData: any;
  @Input() slideTheme:any;
  // @Input('profanityWord') public profanityWord: any;
  @Input('selectedQuestionIndex') public selectedQuestionIndex: any = 0;
  // @Input('slidomoteSlideId') public slidomoteSlideId: any= undefined;
  // @Input('longDescription') public longDescriptionValue: any;
  @Output()  markAnswered = new EventEmitter();
  // public selectedQuestionIndex = 0;
  questionAnswerDisplay=true;
  answeredQuestion: any;
  unAnsweredQuestion: any;
  questionsToDisplay: any;
  isLoading: boolean;
  questionModels: any;
  presentationId: any;
  contrastColor:any;
  settingVariable = settingVariables;
  presentationQuestionsData: any[];
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
 constructor(private _commanService:CommanService,
  private _activateRouter: ActivatedRoute,
  public workspaceservice: WorkspaceService,
  public presentationService: PresentationService,
  public commonService: CommanService ) {
  this.presentationId =
      this._activateRouter.snapshot.paramMap.get('presentationid');
      this.enableKeyDownSubscription = this.workspaceservice.isKeyDownEnabled().subscribe(enabled => {
        this.enableKeyDown = enabled;
      });
      this.questionId = this.workspaceservice.presentationQuestions[0]?.questionId;
      this.isAnswered =this.workspaceservice.presentationQuestions[0]?.isAnswered;
      this.slideTheme = this.workspaceservice.presentationTheme;
  }

  ngOnInit(): void {
    this.presentationMode = this.workspaceservice.presentationMode;
    this.questionId = this.workspaceservice.presentationQuestions[0]?.questionId;
    this.isAnswered = this.workspaceservice.presentationQuestions[0]?.isAnswered;
    this.setFilterQuestion('all');
    this.ContrastColor = this.commonService.getContrastColor(this.workspaceservice?.slideDesign?.slideBackgroundColor);
    this.questions = this.workspaceservice.presentationQuestions;
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
    // this.profanityFilterCheck(this.profanityWord);
    // this.contrastColor=this._commanService.getContrastColor(this.slideData?.slideThemes?.themesBackgroundColor);
    this.ContrastColor = this.commonService.getContrastColor(this.workspaceservice?.slideDesign?.slideBackgroundColor);
  }
  // profanityFilterCheck(profanityWord: any) {
  //   if(this.selectedQuestionIndex == -1)
  //     this.selectedQuestionIndex = 0
  //   this.presentationQuestionsData=[];
  //   this.presentationQuestions.forEach((element: any) => {
  //     if(profanityWord?.length > 0){
  //       var isProfanityWord = profanityWord.some(badWord => element?.question.toLowerCase().trim().includes(badWord));
  //       if (!isProfanityWord) {
  //         this.presentationQuestionsData.push(element);
  //       }
  //     }else{
  //       this.presentationQuestionsData=this.presentationQuestions
  //     }
  //   })
  // }
  ngAfterViewChecked() {
    this.ContrastColor = this.commonService.getContrastColor(this.workspaceservice?.slideDesign?.slideBackgroundColor);
  }
  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent) {
    const currentQuestion = this.workspaceservice.presentationQuestions[this.selectedQuestionIndex];
    if (currentQuestion) {
      this.markAsAnswered(currentQuestion.questionId, true);
    }
  }


  markAsAnswered(questionId: any, isAnswered: boolean) {
    this.filteredQuestions.find(x=>x.questionId == questionId).isAnswered = !isAnswered;
    let questionDTO = {
      presentationId: this.workspaceservice.presentationId,
      questionId: questionId,
      isValue: !isAnswered,
      isTemplate: this.workspaceservice.isTemplate
    };
    this.presentationService.updateAnsweredQuestion(questionDTO).subscribe(
      (response: any) => {
        this.filterQuestion();
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }
  NextQuestion(questionId:any,isAnswered:boolean) {
    this.questionId = questionId;
    this.isAnswered = isAnswered;
    if (this.workspaceservice.presentationQuestions.length > this.selectedQuestionIndex + 1) {
      this.selectedQuestionIndex++;
    }
    else {

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
  }
  updateTheme(data: any) {
    this.slideTheme = data;
  }
  setFilterQuestion(filter: string) {
    this.filter = filter;
    this.filterQuestion();
  }

  filterQuestion() {
    var presentationsQuestions = this.workspaceservice.profanityWordsChecks();
    if (this.filter === 'all') {
      this.filteredQuestions = presentationsQuestions;
    } else if (this.filter === 'pinned') {
      this.filteredQuestions = presentationsQuestions.filter(q => q.isPinned);
    } else if (this.filter === 'answered') {
      this.filteredQuestions = presentationsQuestions.filter(q => q.isAnswered);
    }
  }
  markAsPinned(questionId: any, isPinned: boolean) {
    this.filteredQuestions.find(x=>x.questionId == questionId).isPinned = !isPinned;
    let questionDTO = {
      presentationId: this.workspaceservice.presentationId,
      questionId: questionId,
      isValue: !isPinned,
      isTemplate: this.workspaceservice.isTemplate
    }
    this.presentationService.updatePinnedQuestion(questionDTO).subscribe(
      (response: any) => {
         this.filterQuestion();
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }
  updateChart(){
    this.filteredQuestions =this.workspaceservice.presentationQuestions;
    this.filterQuestion();
  }
}
