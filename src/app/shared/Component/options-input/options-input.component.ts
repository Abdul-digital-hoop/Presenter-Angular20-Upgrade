import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { MasterSlideTypeName } from 'src/app/utility/constants';
import { inputControlTextLengthColor } from 'src/app/utility/InputControlType';
import { QuizTheme } from 'src/app/utility/MasterConstants';

@Component({
    selector: 'app-options-input',
    templateUrl: './options-input.component.html',
    styleUrls: ['./options-input.component.scss'],
    standalone: false
})
export class OptionsInputComponent implements OnInit {
  // * Input Parames For This Component.
  @Input() label: string;
  @Input() placeholder: string;
  @Input() inputType: string;
  @Input() inputTextLength: number;
  @Input() defaultInputValue: string;
  @Input() options: any[] = [];
  @Input() isAddOptionDisable: boolean=false;
  @Input() isAddOption: boolean=true;
  @Input() isTrueorFalseStatement: boolean=false;
  @Input() isRemoveOption: boolean=true;
  @Input() isCorrectAnswer: boolean=false;
  @Input() isFirstOptionRemove: boolean=false;
  @Input() addButtonContent: string;
  masterSlideTypeName = MasterSlideTypeName;
  // * Output Parames
  @Output() public optionEmiterToParent: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() public ItemsRankingEmiter: EventEmitter<any[]> = new EventEmitter<any[]>();
  // * Local Variables
  inputTextLengthColors = inputControlTextLengthColor;
  optionDatas: any[] = [];
  apiCallInterval!: ReturnType<typeof setInterval>;
  quizTheme = QuizTheme;
  slideTheme:any;
  constructor(public workSpaceService: WorkspaceService, private presentationService: PresentationService) {
    this.slideTheme = this.workSpaceService.presentationTheme;
   }


  //#region LifeCycle Hooks
  ngOnChanges() {
    if(this.workSpaceService.isAllowedChangesforOptions)
    {
      this.optionDatas = [];
      this.optionDatas = this.options.map(item => ({ ...item }));
    }
  }

  ngOnInit(): void {
    this.optionDatas = [];
    this.optionDatas = this.options.map(item => ({ ...item }));
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
    if(this.workSpaceService.activeSlideTypeName != this.masterSlideTypeName.LINEUP_SLIDE_TYPE){
    if(this.workSpaceService.visualizationColor){
      this.optionDatas.forEach((data, index) => {
        if (this.options[index] && this.options[index].visualizationColor !== data.visualizationColor) {
          data.visualizationColor = this.options[index].visualizationColor;
        }
      });
      this.workSpaceService.visualizationColor = false;
    }}
  else{
    this.workSpaceService.visualizationColor = false;
  
 } // console.log("AppComponent:AfterViewChecked");
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
  checkDefaultInputValue(option: any, idx: any) {

    let defaultOption = this.defaultInputValue + (idx + 1);
    if (defaultOption === option?.OptionTitle) {
      this.optionDatas[idx].OptionTitle = "";
    }
  }
  assignInputValue(option: any, idx: any,control:any) {
    control.markAsUntouched();
    let defaultOption = this.defaultInputValue + (idx + 1);
    if (!option?.OptionTitle) {

      if (defaultOption == this.workSpaceService.options[idx]?.OptionTitle) {
        option.OptionTitle = defaultOption;
        var optionTitle = option?.OptionTitle.trimStart();
        this.addOrUpdateOptions(option.OptionId, optionTitle,option?.visualizationColor);
        return;
      }
      else {
        option.OptionTitle = "";
        this.workSpaceService.options[idx].OptionTitle = "";
        var optionTitle = option?.OptionTitle.trimStart();
        this.addOrUpdateOptions(option.OptionId, optionTitle,option?.visualizationColor);
        return;
      }
    }
    else {
      this.workSpaceService.options[idx].OptionTitle = option.OptionTitle;
      var optionTitle = option?.OptionTitle.trimStart();
      this.addOrUpdateOptions(option.OptionId, optionTitle,option?.visualizationColor);
      return;
    }


  }
  designSlideChangevisualizationColor(option: any,backGroundColor:any){
    this.workSpaceService.slideListArray.find(x=>x.slideId == this.workSpaceService?.activeSlideId).design.slideResetTheme = true;
    this.workSpaceService.resetThemes = true;
    this.addOrUpdateVisualizationColorOptions(option.OptionId, option?.OptionTitle,backGroundColor)
  }
  //#endregion Without API Call
  //#region API Call
  addOrUpdateOptions(OptionId: any, OptionTitle: string,visualizationColor:any) {
    // this.workSpaceService.isAllowMakeAPIRightPanel = true;
    let updateOptionDTO = {
      presentationId: this.workSpaceService.presentationId,
      slideId: this.workSpaceService.activeSlideId,
      optionId: OptionId,
      optionTitle: OptionTitle,
      visualizationColor : visualizationColor,
      isTemplate: this.workSpaceService.isTemplate
    }
    this.presentationService.updateOptions(updateOptionDTO).subscribe(
      (response: any) => {

        this.workSpaceService.isAllowedChangesforOptions = false;
        this.workSpaceService.isAllowMakeAPIRightPanel = false;
        this.updateOptionTitle(OptionId, OptionTitle);
        // this.workSpaceService.changeDataFormat(response.slideContentData);
        let option = this.workSpaceService.options.find(opt => opt.OptionId === OptionId);
        if (option) {
          option.visualizationColor = visualizationColor;
          option.OptionTitle = OptionTitle;
        }
        // Update optionDatas without recreating the entire array
        let optionData = this.optionDatas.find(opt => opt.OptionId === OptionId);
        if (optionData) {
          optionData.visualizationColor = visualizationColor;
          optionData.OptionTitle = OptionTitle;
        }
        this.workSpaceService.visualizationColor = true;
        // this.RankingEmiter.emit(this.workSpaceService.options);
        // this.TrafficlightEmiter.emit(this.workSpaceService.options);
        this.optionEmiterToParent.emit();
        this.ItemsRankingEmiter.emit();
      },
      (error: any) => {
        this.workSpaceService.isAllowMakeAPIRightPanel = false;
        console.log(error?.error);
      }
    );
  }
  addNewOptions() {
    let addOptionDTO = {
      presentationId: this.workSpaceService.presentationId,
      slideId: this.workSpaceService.activeSlideId,
      isTemplate: this.workSpaceService.isTemplate
    }
    if(this.workSpaceService.isAllowMakeAPIRightPanel){
      return;
    }
    this.addOptionAPI(addOptionDTO);
  }
  addOptionAPI(addOptionDTO:any){
    this.workSpaceService.isAllowMakeAPIRightPanel = true;
    this.presentationService.addOptions(addOptionDTO).subscribe(
      (response: any) => {
        this.workSpaceService.isAllowMakeAPIRightPanel = false;
        this.workSpaceService.selectPerParticipantsOptions = this.workSpaceService.options?.length + 1;
        this.workSpaceService.isAllowedChangesforOptions = true;
        this.workSpaceService.currentActiveSlide.slideContentData = response.slideContentData;
        this.workSpaceService.changeDataFormat(response.slideContentData);
        this.optionEmiterToParent.emit();
        this.ItemsRankingEmiter.emit();
        clearInterval(this.apiCallInterval);
      },
      (error: any) => {
        clearInterval(this.apiCallInterval);
        this.workSpaceService.isAllowMakeAPIRightPanel = false;
        console.log(error?.error);
      }
    );
  }
  removeOptions(optionId: any,visualizationcolor:any) {
    if ((this.hasOptionsWithValueGreaterThanZero() || this.optionDatas.length<=2)&&(this.workSpaceService.activeSlideTypeName == this.masterSlideTypeName.LINEUP_SLIDE_TYPE || this.workSpaceService.activeSlideTypeName == this.masterSlideTypeName.SELECT_ANSWER_SLIDE_TYPE || this.workSpaceService.slideContentType != this.workSpaceService.masterSlideTypeName.QUIZ)) {
      return;
    }
    let deleteOptionDTO = {
      presentationId: this.workSpaceService?.presentationId,
      slideId: this.workSpaceService.activeSlideId,
      optionId: optionId,
      visualizationColor : visualizationcolor,
      isTemplate: this.workSpaceService.isTemplate
    }
    this.removeOptionAPI(deleteOptionDTO);
  }
  removeOptionAPI(deleteOptionDTO:any){
    this.presentationService.deleteOptions(deleteOptionDTO).subscribe(
      (response: any) => {
        this.workSpaceService.selectPerParticipantsOptions = this.workSpaceService.options?.length - 1;
        this.workSpaceService.isAllowedChangesforOptions = true;
        this.workSpaceService.isAllowMakeAPIRightPanel = false;
        this.removeOption(deleteOptionDTO.optionId);
        // this.workSpaceService.changeDataFormat(response.slideContentData);
        this.workSpaceService.options = this.workSpaceService.options.filter(option => option.OptionId !== deleteOptionDTO.optionId);
        if(this.workSpaceService.activeSlideTypeName === this.masterSlideTypeName.SCALES_SLIDE_TYPE){
          this.workSpaceService.scalesResult = this.workSpaceService.scalesResult.filter(option => option.OptionId !== deleteOptionDTO.optionId);
        }
        this.optionDatas = this.optionDatas.filter(option => option.OptionId !== deleteOptionDTO.optionId);
        this.workSpaceService.options = this.optionDatas;
        this.workSpaceService.correctOptionValidations();
        this.optionEmiterToParent.emit();
        this.ItemsRankingEmiter.emit();
        clearInterval(this.apiCallInterval);
      },
      (error: any) => {
        this.workSpaceService.isAllowMakeAPIRightPanel = false;
        clearInterval(this.apiCallInterval);
        console.log(error?.error);
      }
    );
  }
  removeOption(optionIdToRemove: string) {
    // Find the contentData array in slideContentData
    const contentData = this.workSpaceService.currentActiveSlide.slideContentData.find(
      item => item.name === 'contentData'
    );
  
    if (contentData) {
      // Find the Options object in the value array
      const options = contentData.value.find(
        item => item.name === 'Options'
      );
  
      if (options && options.value) {
        // Filter out the option with the matching OptionId
        options.value = options.value.filter(option => 
          option[0].name === 'OptionId' && option[0].value !== optionIdToRemove
        );
      }
    }
  }
  makeCorrectOptions(optionId: any, isCorrect: boolean) {
    this.optionDatas.forEach(option => {
      if (option.OptionId === optionId) {
        option.isCorrect = isCorrect;
      }
    });
    this.workSpaceService.options.forEach(option => {
      if (option.OptionId === optionId) {
        option.isCorrect = isCorrect;
      }
    });
    this.workSpaceService.correctOptionValidations();
    let updateOptionDTO = {
      presentationId: this.workSpaceService.presentationId,
      slideId: this.workSpaceService.activeSlideId,
      optionId: optionId,
      optionTitle: "",
      isCorrect: isCorrect,
      isTemplate: this.workSpaceService.isTemplate
    };
    this.makeCorrectAnswerAPI(updateOptionDTO);
  }
  transformOptionsData(response: any): any[] {
    return response.map((optionArray: any[], index: number) => {
      let formattedOption: any = {};
      optionArray.forEach((item: any) => {
        switch (item.name) {
          case 'OptionId':
            formattedOption.OptionId = item.value;
            break;
          case 'OptionTitle':
            formattedOption.OptionTitle = item.value;
            break;
          case 'value':
            formattedOption.value = item.value;
            break;
          case 'isCorrect':
            formattedOption.isCorrect = item.value;
            break;
            case 'color':
              formattedOption.visualizationColor = item.value;
              break;
        }
      });  
      return formattedOption;
    });
  }
  makeCorrectAnswerAPI(updateOptionDTO:any){
    this.presentationService.updateOptionsMarkAnswers(updateOptionDTO).subscribe(
      (response: any) => {

        //this.workSpaceService.options = this.transformOptionsData(response);
        this.workSpaceService.isAllowMakeAPIRightPanel = false;
        this.workSpaceService.changeDataFormat(response);
        this.workSpaceService.dynamicComponent_Clone.instance.updateChart(this.workSpaceService.dynamicChartData(this.workSpaceService.options));
        this.updateOptionCorrectStatus(updateOptionDTO.optionId, updateOptionDTO.isCorrect);
        // this.workSpaceService.storeActiveSlideDetails();
        this.optionDatas = [];
        this.optionDatas = this.workSpaceService.options.map(item => ({ ...item }));
        clearInterval(this.apiCallInterval);
      },
      (error: any) => {
        this.workSpaceService.isAllowMakeAPIRightPanel = false;
        console.log(error?.error);
        clearInterval(this.apiCallInterval);
      }
    );
  }
  //#endregion API Call
  //#endregion Component Level functions
  hasOptionsWithValueGreaterThanZero(): boolean {
    return  this.workSpaceService.isTemplate ? false : this.workSpaceService.slideVotersCount > 0 || this.workSpaceService.quizState === 'Result';
  }
  truthorLieCorrectOptions(optionId: any, isCorrect: boolean, option: any) {
    if (isCorrect) {
      option.isCorrect = true;
    } else {
      option.isCorrect = false;
    }
    let updateOptionDTO = {
      presentationId: this.workSpaceService.presentationId,
      slideId: this.workSpaceService.activeSlideId,
      optionId: optionId,
      optionTitle: "",
      isTemplate: this.workSpaceService.isTemplate
    }
    this.truthOrLieCorrectOptionAPI(updateOptionDTO);
  }
  truthOrLieCorrectOptionAPI(updateOptionDTO:any){
    this.presentationService.UpdateTruthorLieMarkAnswers(updateOptionDTO).subscribe(
      (response: any) => {
        this.workSpaceService.isAllowMakeAPIRightPanel = false;
        this.workSpaceService.changeDataFormat(response.slideContentData);
        this.options = this.workSpaceService.options;
        this.workSpaceService.dynamicComponent_Clone.instance.updateChart(this.workSpaceService.options);
        // this.optionEmiterToParent.emit();
        clearInterval(this.apiCallInterval);
      },
      (error: any) => {
        this.workSpaceService.isAllowMakeAPIRightPanel = false;
        console.log(error?.error);
        clearInterval(this.apiCallInterval);
      }
    );
  }
  addOrUpdateVisualizationColorOptions(OptionId: any, OptionTitle: string,visualizationColor:any){
    let updateOptionDTO = {
      presentationId: this.workSpaceService.presentationId,
      slideId: this.workSpaceService.activeSlideId,
      optionId: OptionId,
      optionTitle: OptionTitle,
      visualizationColor : visualizationColor,
      isTemplate: this.workSpaceService.isTemplate
    }
    this.presentationService.updateVisualizationColorOptions(updateOptionDTO).subscribe(
      (response: any) => {

        this.workSpaceService.isAllowedChangesforOptions = false;
        this.workSpaceService.isAllowMakeAPIRightPanel = false;
        this.workSpaceService.changeDataFormat(response.slideContentData);
        this.updateOptionColor(OptionId, visualizationColor);
        let option = this.workSpaceService.options.find(opt => opt.OptionId === OptionId);
        if (option) {
          option.visualizationColor = visualizationColor;
          option.OptionTitle = OptionTitle;
        }
        // Update optionDatas without recreating the entire array
        let optionData = this.optionDatas.find(opt => opt.OptionId === OptionId);
        if (optionData) {
          optionData.visualizationColor = visualizationColor;
          optionData.OptionTitle = OptionTitle;
        }
        this.workSpaceService.visualizationColor = true;
        
        // this.RankingEmiter.emit(this.workSpaceService.options);
        // this.TrafficlightEmiter.emit(this.workSpaceService.options);
        this.optionEmiterToParent.emit();
        this.ItemsRankingEmiter.emit();
      },
      (error: any) => {
        this.workSpaceService.isAllowMakeAPIRightPanel = false;
        console.log(error?.error);
      }
    );
  }
  updateOptionColor(optionIdToUpdate: string, newColor: string) {
    // Find the contentData array in slideContentData
    const contentData = this.workSpaceService.currentActiveSlide.slideContentData.find(
      item => item.name === 'contentData'
    );
  
    if (contentData) {
      // Find the Options object in the value array
      const options = contentData.value.find(
        item => item.name === 'Options'
      );
  
      if (options && options.value) {
        // Find and update the color for the specific option
        options.value.forEach(option => {
          const optionId = option.find(item => item.name === 'OptionId')?.value;
          if (optionId === optionIdToUpdate) {
            const visualizationColor = option.find(item => item.name === 'visualizationColor');
            if (visualizationColor) {
              visualizationColor.value = newColor;
            }
          }
        });
      }
    }
  }
  updateOptionCorrectStatus(optionIdToUpdate: string, isCorrect: boolean) {
    // Find the contentData array in slideContentData
    const contentData = this.workSpaceService.currentActiveSlide.slideContentData.find(
      item => item.name === 'contentData'
    );
  
    if (contentData) {
      // Find the Options object in the value array
      const options = contentData.value.find(
        item => item.name === 'Options'
      );
  
      if (options && options.value) {
        // Find and update the isCorrect status for the specific option
        options.value.forEach(option => {
          const optionId = option.find(item => item.name === 'OptionId')?.value;
          if (optionId === optionIdToUpdate) {
            const correctStatus = option.find(item => item.name === 'isCorrect');
            if (correctStatus) {
              correctStatus.value = isCorrect;
            }
          }
        });
      }
    }
  }
  updateOptionTitle(optionIdToUpdate: string, newTitle: string) {
    // Find the contentData array in slideContentData
    const contentData = this.workSpaceService.currentActiveSlide.slideContentData.find(
      item => item.name === 'contentData'
    );
  
    if (contentData) {
      // Find the Options object in the value array
      const options = contentData.value.find(
        item => item.name === 'Options'
      );
  
      if (options && options.value) {
        // Find and update the OptionTitle for the specific option
        options.value.forEach(option => {
          const optionId = option.find(item => item.name === 'OptionId')?.value;
          if (optionId === optionIdToUpdate) {
            const optionTitle = option.find(item => item.name === 'OptionTitle');
            if (optionTitle) {
              optionTitle.value = newTitle;
            }
          }
        });
      }
    }
  }
}
