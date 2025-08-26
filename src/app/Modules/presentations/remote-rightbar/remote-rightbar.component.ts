import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CustomerPlan } from 'src/app/core/Models/customer-plan.model';
import { CustomerPlanService } from 'src/app/core/Sevices/CustomerPlan/customer-plan.service';
import { PresenterToolbarService } from 'src/app/core/Sevices/Presentation/presenter-toolbar.service';
import { WorkSignalRServiceService } from 'src/app/core/Sevices/WorkSpace/work-signal-rservice.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { MasterSlideTypeName, QuestionTabString } from 'src/app/utility/constants';
declare var $: any;
@Component({
    selector: 'app-remote-rightbar',
    templateUrl: './remote-rightbar.component.html',
    styleUrls: ['./remote-rightbar.component.scss'],
    standalone: false
})
export class RemoteRightbarComponent implements OnInit {
  @Input('itHasQASlides') public itHasQASlides: boolean;
  @Output() deleteQuestion = new EventEmitter();
  @Output() allQuestionsAnswered = new EventEmitter();
  questionTab = QuestionTabString.TOP_QUESTION;
  questionTabString = QuestionTabString;
  isOpenQAflag: boolean = false;
  openQAText: string = "Open";
  filterQuestions: any[] = [];
  activeQuestionIndex: number = -1;
  isAllQuestionsAnswered: boolean = false;
  masterSlideTypeName = MasterSlideTypeName;
  customerPlan:CustomerPlan;
  constructor(
    public workspaceService: WorkspaceService,
    public presenterToolbarService: PresenterToolbarService,
    public workSpaceSignalRService: WorkSignalRServiceService,
    public customerPlanService:CustomerPlanService) { }

  ngOnInit(): void {
    this.openQA();
    this.openQAWithIndex();
    this.markAsAnsweredPinQuestion();
    this.getQuestion();
    this.enableDisableQuestions();
    this.customerPlan = this.customerPlanService.getCustomerPlan();
  }
  ngAfterViewInit() {
    this.topQuestion();
  }
  pinnedQuestions() {
    this.questionTab = this.questionTabString.PINNED_QUESTION;;
    this.filterQuestions = [];
    this.filterQuestions = this.workspaceService.presentationQuestions.filter(x => x.isPinned == true);
  }
  answeredQuestions() {
    this.questionTab = this.questionTabString.ANSWERD_QUESTION;
    this.filterQuestions = [];
    this.filterQuestions = this.workspaceService.presentationQuestions.filter(x => x.isAnswered == true);
  }
  topQuestion() {
    this.questionTab = this.questionTabString.TOP_QUESTION;
    this.filterQuestions = [];
    this.filterQuestions = this.workspaceService.presentationQuestions;
    this.isAllQuestionsAnswered = this.workspaceService.presentationQuestions.every(x => x.isAnswered == true);
    this.allQuestionsAnswered.emit(this.isAllQuestionsAnswered);
  }
  enableQAOnAllSlides() {
    if(this.customerPlan?.qa == true)
    {
      this.workspaceService.slideShowQuestions = true;
      this.workspaceService.OnlyQA = false;
      this.presenterToolbarService.onlyQAEnableQuestion(false);
    }
    else
    {
      return;
    }
  }
  openQAModal() {
    if (this.customerPlan?.qa == true) {
      this.isOpenQAflag = !this.isOpenQAflag;
      if (this.isOpenQAflag) {
        this.openQAText = "Close";
      }
      else {
        this.openQAText = "Open";
      }
      var obj = {
        presentationId: this.workspaceService.presentationId,
        isOpenQA: this.isOpenQAflag,
      }
      this.workSpaceSignalRService.OpenQAModal(obj);
    }
    else {
      return;
    }

  }
  markAsPin(questionId: any, isPinned: boolean) {
    let index = this.filterQuestions.findIndex(x => x.questionId == questionId);
    this.filterQuestions.filter(x => x.questionId == questionId)[0].isPinned = isPinned ? false : true;
    this.activeQuestionIndex = index;
    this.isOpenQAflag = !this.isOpenQAflag;
    if (this.isOpenQAflag == false) {
      this.isOpenQAflag = true;
      if (!this.workspaceService.slideShowQuestions) {
        this.openQAText = "Open";
      }
      else {
        this.openQAText = "Close";
      }
    }
    else {
      this.isOpenQAflag = true;
      if (!this.workspaceService.slideShowQuestions) {
        this.openQAText = "Open";
      }
      else {
        this.openQAText = "Close";
      }
    }
    this.presenterToolbarService.markAsPinned(questionId, isPinned).then((response:any) => {
      this.workspaceService.presentationQuestions = response?.presentationQuestions;
      this.workspaceService.presentationQuestionsLegnth = response?.presentationQuestions == null ? 0 : response?.presentationQuestions?.length;
    });
  }
  showQAModalQuestionIndex(index: any) {
    this.isOpenQAflag = !this.isOpenQAflag;
    this.activeQuestionIndex = index;
    if (this.isOpenQAflag == false) {
      this.isOpenQAflag = true;
      if (!this.workspaceService.slideShowQuestions) {
        this.openQAText = "Open";
      }
      else {
        this.openQAText = "Close";
      }
    }
    else {
      this.isOpenQAflag = true;
      if (!this.workspaceService.slideShowQuestions) {
        this.openQAText = "Open";
      }
      else {
        this.openQAText = "Close";
      }
    }
    var obj = {
      presentationId: this.workspaceService.presentationId,
      isOpenQA: this.isOpenQAflag,
      questionIndex: index
    }
    this.workSpaceSignalRService.OpenQAModalQuestionIndex(obj);
  }
  markAsAnswered(questionId: any, isAnswered: boolean) {
    let index = this.filterQuestions.findIndex(x => x.questionId == questionId);
    this.filterQuestions.filter(x => x.questionId == questionId)[0].isAnswered = true;
    this.activeQuestionIndex = index;
    this.presenterToolbarService.markAsAnswered(questionId, isAnswered).then((response: any) => {
      this.workspaceService.presentationQuestions = response?.presentationQuestions;
      this.isAllQuestionsAnswered = this.workspaceService.presentationQuestions.every(x => x.isAnswered == true);
      this.allQuestionsAnswered.emit(this.isAllQuestionsAnswered);
      if (this.workspaceService.activeSlideTypeName == this.masterSlideTypeName.QUESTIONS_AND_ANSWER_SLIDE_TYPE) {
        this.workspaceService.dynamicComponent_Clone.instance.updateChart(this.workspaceService.presentationQuestions);
      }
    });
    
  }
  markAsUnAnswered(questionId: any, isAnswered: boolean) {
    let index = this.workspaceService.presentationQuestions.findIndex(x => x.questionId == questionId);
    this.workspaceService.presentationQuestions.filter(x => x.questionId == questionId)[0].isAnswered = false;
    this.activeQuestionIndex = this.isOpenQAflag ? index : -1;
    this.presenterToolbarService.markAsAnswered(questionId, isAnswered).then((response: any) => {
      this.workspaceService.presentationQuestions = response?.presentationQuestions;
      this.isAllQuestionsAnswered = this.workspaceService.presentationQuestions.every(x => x.isAnswered == true);
      this.allQuestionsAnswered.emit(this.isAllQuestionsAnswered);
      if (this.workspaceService.activeSlideTypeName == this.masterSlideTypeName.QUESTIONS_AND_ANSWER_SLIDE_TYPE) {
        this.workspaceService.dynamicComponent_Clone.instance.updateChart(this.workspaceService.presentationQuestions);
      }
    });
    
  }
  openQAModalQuestionIndex(index: any) {
    if (this.customerPlan?.qa == true) {
      this.isOpenQAflag = !this.isOpenQAflag;
      this.activeQuestionIndex = index;
      if (this.isOpenQAflag) {
        this.openQAText = "Close";
      }
      else {
        this.openQAText = "Open";
        this.activeQuestionIndex = -1;
      }
      var obj = {
        presentationId: this.workspaceService.presentationId,
        isOpenQA: this.isOpenQAflag,
        questionIndex: index
      }
      this.workSpaceSignalRService.OpenQAModalQuestionIndex(obj);
    }
    else{
      return;
    }
  }
  deleteQuestionPopup(questionId: any) {
    var index = this.workspaceService.presentationQuestions.findIndex(x => x.questionId == questionId);
    let newActiveSlideId = "";
    if (this.workspaceService.presentationQuestions.length === 1) {
      newActiveSlideId = null;
    } else if (index === this.workspaceService.presentationQuestions.length - 1) {
      newActiveSlideId = this.workspaceService.presentationQuestions[index - 1]?.questionId ?? null;
    } else if (index === 0) {
      newActiveSlideId = this.workspaceService.presentationQuestions[index + 1]?.questionId ?? null;
    } else {
      newActiveSlideId = this.workspaceService.presentationQuestions[index - 1]?.questionId ?? null;
    }
    var deleteQuestionDTO = {
      questionId: questionId,
      newActiveSlideId: newActiveSlideId,
      isOpenQAflag: this.isOpenQAflag
    }
    this.deleteQuestion.emit(deleteQuestionDTO);
  }
  // * ======= Behaviour Subject Calls ============

  openQA() {
    this.workspaceService.openQABehavioursSubject.subscribe((data: any) => {
      if (data != null) {
        this.isOpenQAflag = data?.isOpenQA;
        if (this.isOpenQAflag) {
          this.openQAText = "Close";
        }
        else {
          this.openQAText = "Open";
          this.activeQuestionIndex = -1;
        }
      }
    });
  }
  openQAWithIndex() {
    this.workspaceService.openQAWithIndexBehavioursSubject.subscribe((data: any) => {
      if (data != null) {
        this.isOpenQAflag = data?.isOpenQA;
        this.activeQuestionIndex = data?.questionIndex;
        if (this.isOpenQAflag) {
          if (!this.workspaceService.slideShowQuestions) {
            this.openQAText = "Open";
          }
          else {
            this.openQAText = "Close";
          }
        }
        else {
          if (!this.workspaceService.slideShowQuestions) {
            this.openQAText = "Close";
          }
          else {
            this.openQAText = "Open";
          }
          this.activeQuestionIndex = -1;
        }
      }
    });
  }
  markAsAnsweredPinQuestion() {
    this.workspaceService.markAsAnswerPinQuestionBehavioursSubject.subscribe((data: any) => {
      if (data != null) {
        this.isOpenQAflag = data?.isOpenQA;
        if (data?.isOpenQA) {
          this.activeQuestionIndex = data?.questionIndex;
          if (this.questionTab == QuestionTabString.ANSWERD_QUESTION) {
            this.answeredQuestions();
          }
          if (this.questionTab == QuestionTabString.PINNED_QUESTION) {
            this.pinnedQuestions();
          }
          if (this.questionTab == QuestionTabString.TOP_QUESTION) {
            this.topQuestion();
          }
        }
        else {
          if (this.questionTab == QuestionTabString.ANSWERD_QUESTION) {
            this.answeredQuestions();
          }
          if (this.questionTab == QuestionTabString.PINNED_QUESTION) {
            this.pinnedQuestions();
          }
          if (this.questionTab == QuestionTabString.TOP_QUESTION) {
            this.topQuestion();
          }
        }
        if (this.workspaceService.activeSlideTypeName == this.masterSlideTypeName.QUESTIONS_AND_ANSWER_SLIDE_TYPE) {
          this.workspaceService.dynamicComponent_Clone.instance.updateChart(this.workspaceService.presentationQuestions);
        }

      }
    });
  }
  getQuestion() {
    this.workspaceService.getQuestionBehavioursSubject.subscribe((data: any) => {
      if (data != null) {
        if (this.questionTab == QuestionTabString.ANSWERD_QUESTION) {
          this.answeredQuestions();
        }
        if (this.questionTab == QuestionTabString.PINNED_QUESTION) {
          this.pinnedQuestions();
        }
        if (this.questionTab == QuestionTabString.TOP_QUESTION) {
          this.topQuestion();
        }
      }
    });
  }
  enableDisableQuestions() {
    this.workspaceService.enableDisableQuestionsBehavioursSubject.subscribe((data: any) => {
      if (data != null) {
        // this.workspaceService.slideShowQuestions = data?.enableDisableValues;
        if (this.workspaceService.slideShowQuestions) {
          // this.isOpenQAflag = true;
          this.openQAText = "Open";
        }
        else {
          this.isOpenQAflag = false;
          this.openQAText = "Close";
        }
      }
    });
  }
}