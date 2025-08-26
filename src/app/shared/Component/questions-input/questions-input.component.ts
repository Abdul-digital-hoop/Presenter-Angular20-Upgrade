import { Component, Input, OnInit } from '@angular/core';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { inputControlTextLengthColor } from 'src/app/utility/InputControlType';
import { MasterSlideTypeName } from 'src/app/utility/constants';

@Component({
  selector: 'app-questions-input',
  templateUrl: './questions-input.component.html',
  styleUrls: ['./questions-input.component.scss']
})
export class QuestionsInputComponent implements OnInit {
  // * Input Parames For This Component.
  @Input() label: string;
  @Input() placeholder: string;
  @Input() inputType: string;
  @Input() inputTextLength: number;
  @Input() defaultInputValue: string;
  @Input() questionData: string;
  masterSlideTypeName = MasterSlideTypeName;
  // * Local Variables
  inputTextLengthColors = inputControlTextLengthColor;
  questionValue: string="";

  constructor(public workSpaceService: WorkspaceService, private presentationService: PresentationService) { }


  //#region LifeCycle Hooks
  ngOnChanges() {
    //console.log("AppComponent: OnChanges");
    this.questionValue = this.questionData;
  }

  ngOnInit(): void {
  }

  ngDoCheck() {
    // console.log("AppComponent: DoCheck");
  }

  ngAfterContentInit() {
    // console.log("AppComponent: AfterContentInit");
  }

  ngAfterContentChecked() {
    // console.log("AppComponent:AfterContentChecked");
  }

  ngAfterViewInit() {
    // console.log("AppComponent:AfterViewInit");
  }

  ngAfterViewChecked() {
    // console.log("AppComponent:AfterViewChecked");
  }

  ngOnDestroy() {
    //  console.log("AppComponent:OnDestroy");
  }
  //#endregion LifeCycle Hooks


  //#region Component Level functions
  //#region Without API Call
  /**
   * ? Assing empty for input value if deafultInputvalue isequals to slideQuestions when focus the input field
   */
  checkDefaultInputValue() {
    if (this.defaultInputValue === this.questionValue) {
      this.questionValue = "";
    }
  }
  /**
   * 
   * @param control Sent form control and mask is untouchble becoze validation purpose
   * @returns empty
   */
  assignInputValue(control: any) {
    control.markAsUntouched();
    if (!this.questionValue) {
      if (this.defaultInputValue === this.workSpaceService.questions) {
        this.questionValue = this.defaultInputValue;
        this.addorUpdateQuestion();
        return;
      }
      else {
        this.questionValue = "";
        this.workSpaceService.questions = "";
        this.addorUpdateQuestion();
        return;
      }

    }
    else {
      this.workSpaceService.questions = this.questionValue;
      this.addorUpdateQuestion();
      return;
    }

  }
  setValueToServiceVariable(){
    this.workSpaceService.questions = this.questionValue;
  }
  //#endregion Without API Call

  //#region API Call
  
  addorUpdateQuestion() {
    let addorUpdateQuestionDTO = {
      presentationId: this.workSpaceService.presentationId,
      slideId: this.workSpaceService.activeSlideId,
      slideQuestion: this.workSpaceService.questions,
      isTemplate: this.workSpaceService.isTemplate
    }
    this.presentationService.addOrUpdateQuestionDTO(addorUpdateQuestionDTO).subscribe(
      (response: any) => {
        if (response) {
          let slide = this.workSpaceService.slideListArray.find(s => s.slideId === addorUpdateQuestionDTO.slideId);
          if (slide?.slideContentData?.[0]?.value?.[0]) {
            slide.slideContentData[0].value[0].value = addorUpdateQuestionDTO.slideQuestion;
          } else {
            console.warn("Slide not found or missing required properties in slideListArray.");
          }
        }               
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }
  //#endregion API Call
  //#endregion Component Level functions

  //#region Common Functions

  //#endregion Common Functions

}
