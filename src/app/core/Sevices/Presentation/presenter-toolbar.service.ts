import { Injectable } from '@angular/core';
import { WorkspaceService } from '../WorkSpace/workspace.service';
import { WorkSignalRServiceService } from '../WorkSpace/work-signal-rservice.service';
import { PresentationService } from './presentation.service';
import { MasterSlideTypeName } from 'src/app/utility/constants';
import { CustomerPlanService } from '../CustomerPlan/customer-plan.service';

@Injectable({
  providedIn: 'root'
})
export class PresenterToolbarService {
  masterSlideTypeName = MasterSlideTypeName;
  newSeconds:number = 0;
  constructor(
  public workSpaceService:WorkspaceService,
  public workSpaceSignalRService:WorkSignalRServiceService,
  public presentationService:PresentationService,
  private _customerPlanService:CustomerPlanService) { }

  previousSlides(){
    return new Promise((resolve, reject) => {
      this.workSpaceService.slideReactionsCountList;
      this.workSpaceService.changeSlideFlag = true;
      this.workSpaceService.changeSlideData().subscribe(
        (response: any) => {
          let presentationData = response['data'];
          this.workSpaceService.updateSlideData(presentationData);
          resolve(response);
        },
        (error: any) => {
          this.workSpaceService.changeSlideFlag = false;
          console.log(error);
        }
      )
    });
  }
  nextSlide(){
    return new Promise((resolve, reject) => {
      this.workSpaceService.slideReactionsCountList;
      this.workSpaceService.changeSlideFlag = true;
      this.workSpaceService.changeSlideData().subscribe(
        (response: any) => {
          let presentationData = response['data'];
          this.workSpaceService.updateSlideData(presentationData);
          
          resolve(response);
        },
        (error: any) => {
          this.workSpaceService.changeSlideFlag = false;
          console.log(error);
        }
      )
    });
    
  }
  enableQuestion(){
    let presentationDTO = {
      presentationId: this.workSpaceService.presentationId,
      slideId: this.workSpaceService.activeSlideId,
      isTemplate: this.workSpaceService.isTemplate
    }
    this.presentationService.presenterEnableQuestion(presentationDTO).subscribe(
      (response: any) => {
        // const slideListArray = response.slides;
        // let activeSlide = slideListArray.find(slide => slide.slideId === this.workSpaceService.activeSlideId);
        // var enableQuestionFlag =activeSlide.showQuestions;
        // let payload ={
        //   presentationid : this.workSpaceService.presentationId,
        //   enableDisableValues : enableQuestionFlag
        // } 
        // this.workSpaceSignalRService.enableDisableAudienceQuestion(payload);
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }
  enableComment(){
    let presentationDTO = {
      presentationId: this.workSpaceService.presentationId,
      slideId: this.workSpaceService.activeSlideId,
      isTemplate: this.workSpaceService.isTemplate
    }
    this.presentationService.SlideEnableComment(presentationDTO).subscribe(
      (response: any) => {
        // const slideListArray = response.slides;
        // let activeSlide = slideListArray.find(slide => slide.slideId === this.workSpaceService.activeSlideId);
        // var enableCommantFlag =activeSlide.showComments;
        // let payload ={
        //   presentationid : this.workSpaceService.presentationId,
        //   enableDisableValues : enableCommantFlag
        // } 
        // this.workSpaceSignalRService.enableDisableAudienceComment(payload);
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }
  ShowResponse(){
    let presentationDTO = {
      presentationId: this.workSpaceService.presentationId,
      slideId: this.workSpaceService.activeSlideId,
      isTemplate: this.workSpaceService.isTemplate
    }
    this.presentationService.presenterShowResponse(presentationDTO).subscribe(
      (response: any) => {
        this.workSpaceService.currentActiveSlide.settings.showInResults = this.workSpaceService.slideShowInResults;
        this.workSpaceService.dynamicChartResponseLoad();
        const slideListArray = response.slides;
        let activeSlide = slideListArray.find(slide => slide.slideId === this.workSpaceService.activeSlideId);
        var enableResultsFlag = activeSlide.settings.showInResults;
        let payload ={
          presentationId : this.workSpaceService.presentationId,
          isResults : enableResultsFlag
        } 
      //  this.workSpaceSignalRService.hideandshowResults(payload);
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }
  lockVoting(isVoting:any){
    let presentationDTO = {
      presentationId: this.workSpaceService.presentationId,
      slideId: this.workSpaceService.activeSlideId,
      IsVoting:isVoting,
      isTemplate: this.workSpaceService.isTemplate
    }
    this.presentationService.presenterLockVoting(presentationDTO).subscribe(
      (response: any) => {
        // const slideListArray = response.slides;
        // let activeSlide = slideListArray.find(slide => slide.slideId === this.workSpaceService.activeSlideId);
        // var enablevotingFlag =activeSlide.settings.enableVoting;
        // let payload ={
        //   presentationId : this.workSpaceService.presentationId,
        //   enableDisableValues : enablevotingFlag
        // } 
      //  this.workSpaceSignalRService.openAndCloseResponse(payload);
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }
  showPercentage(){
    let responseAsPresentageDTO = {
      presentationId: this.workSpaceService.presentationId,
      slideId: this.workSpaceService.activeSlideId,
      isShowPresentage: this.workSpaceService.slideResponseAsPercentage,
      isTemplate: this.workSpaceService.isTemplate
    }
    this.presentationService.responseAsPercentage(responseAsPresentageDTO).subscribe(
      (response: any) => {
        this.workSpaceService.dynamicChartResponseLoad();
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }
  updateAccessCode(){
    let responseAsAccessDTO = {
      presentationId: this.workSpaceService.presentationId,
      slideId: this.workSpaceService.activeSlideId,
      isShowAccessBar: this.workSpaceService.presentationSettingJoiningInstructions,
      isTemplate: this.workSpaceService.isTemplate
    }
    this.presentationService.manageAccessCode(responseAsAccessDTO).subscribe(
      (response: any) => {
        // this.workSpaceService.dynamicChartResponseLoad();
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }
  designSlideSelectVisualization(visualizationId:any){
    let applyVisualizationDTO = {
      presentationId: this.workSpaceService.presentationId,
      slideId: this.workSpaceService.activeSlideId,
      visualizationId: visualizationId,
      isTemplate: this.workSpaceService.isTemplate
    }
    this.presentationService.applyVisualization(applyVisualizationDTO).subscribe(
      (response: any) => {
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }
  onlyQAEnableQuestion(isBool:boolean) {
    let presentationDTO = {
      presentationId: this.workSpaceService.presentationId,
      slideId: this.workSpaceService.activeSlideId,
      IsTrue: isBool,
      isTemplate: this.workSpaceService.isTemplate
    }
    this.presentationService.OnlyQAEnableQuestion(presentationDTO).subscribe(
      (response: any) => {

      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }
  markAsAnswered(questionId: any, isAnswered: boolean) {
    return new Promise((resolve, reject) => {
      let questionDTO = {
        presentationId: this.workSpaceService.presentationId,
        questionId: questionId,
        isValue: !isAnswered,
        isTemplate: this.workSpaceService.isTemplate
      };
      this.presentationService.updateAnsweredQuestion(questionDTO).subscribe(
        (response: any) => {
          this.workSpaceService.presentationQuestions.find(x=>x.questionId == questionId).isAnswered  = response.presentationQuestions.find(x=>x.questionId == questionId).isAnswered;
          this.workSpaceService.presentationQuestionsLegnth = this.workSpaceService.presentationQuestions.filter(q => !q.isAnswered).length;
          resolve(response);
        },
        (error: any) => {
          console.log(error?.error);
        }
      );
    })
  }
  markAsPinned(questionId: any, isPinned: boolean) {
    return new Promise((resolve, reject) => {
      let questionDTO = {
        presentationId: this.workSpaceService.presentationId,
        questionId: questionId,
        isValue: !isPinned,
        isTemplate: this.workSpaceService.isTemplate
      }
      this.presentationService.updatePinnedQuestion(questionDTO).subscribe(
        (response: any) => {
          this.workSpaceService.presentationQuestions.find(x=>x.questionId == questionId).isPinned = response.presentationQuestions.find(x=>x.questionId == questionId).isPinned;
          resolve(response);
        },
        (error: any) => {
          console.log(error?.error);
        }
      );
    });
    
  }
  resetPresentedTime(){
    return new Promise((resolve, reject) => {
      var obj = {
        presentationId: this.workSpaceService.presentationId,
        slideId: this.workSpaceService.activeSlideId,
        isTemplate: this.workSpaceService.isTemplate
      };
      this.presentationService.resetTimer(obj).subscribe(
        (response: any) => {
         this.workSpaceService.presentedDateTime = response.presentedDateTime;
        // this.calculatePresenterTime(this.presentedDateTime);
        resolve(response);
        },
        (error: any) => {
          console.log(error?.error);
        }
      );
    });
   
  }
  deleteQuestion(questionId:any,newActiveQuestionId:any,isQuestinModalOpen:any){
    return new Promise((resolve, reject) => {
      var obj = {
        questionId:questionId,
        presentationId: this.workSpaceService.presentationId,
        activeQuestionId:newActiveQuestionId,
        isShowQA:isQuestinModalOpen
      };
      this.presentationService.deleteQuestion(obj).subscribe(
        (response: any) => {
         // this.workSpaceService.presentationQuestions = response?.questions;
        //  this.workSpaceService.presentationQuestionsLegnth = response?.questions == null ? 0 : response?.questions?.length;
        resolve(response);
        },
        (error: any) => {
          console.log(error?.error);
        }
      );
    });
   
  }
  presenterStartTimer(seconds: number) {
    // if (this.workSpaceService.slideTimer == false) {
    //   this.startTimerAPICall();
    // }
    switch (seconds) {
      case 0: {
        this.newSeconds = 0;
        this.clearTimerIntervel();
        break;
      }
      case 10: {
        this.newSeconds = this.getTotalSecondswithRemaindingSeondsFromTimer(seconds);
        this.wrappingContdown(this.newSeconds);
        break;
      }
      case 30: {
        this.newSeconds = this.getTotalSecondswithRemaindingSeondsFromTimer(seconds);
        this.wrappingContdown(this.newSeconds);
        break;
      }
      case 60: {
        this.newSeconds = this.getTotalSecondswithRemaindingSeondsFromTimer(seconds);
        this.wrappingContdown(this.newSeconds);
        break;
      }
      case 120: {
        this.newSeconds = this.getTotalSecondswithRemaindingSeondsFromTimer(seconds);
        this.wrappingContdown(this.newSeconds);
        break;
      }
      case 180: {
        this.newSeconds = this.getTotalSecondswithRemaindingSeondsFromTimer(seconds);
        this.wrappingContdown(this.newSeconds);
        break;
      }
      case 240: {
        this.newSeconds = this.getTotalSecondswithRemaindingSeondsFromTimer(seconds);
        this.wrappingContdown(this.newSeconds);
        break;
      }
      case 300: {
        this.newSeconds = this.getTotalSecondswithRemaindingSeondsFromTimer(seconds);
        this.wrappingContdown(this.newSeconds);
        break;
      }
      default: {
        break;
      }
    }
    var countDownTimerSignalR = {
      presentationId:this.workSpaceService.presentationId,
      seconds:this.newSeconds
    }
    this.workSpaceSignalRService.presentationTimerCountdown(countDownTimerSignalR);
  }
  startTimerAPICall() {
    let presentationDTO = {
      presentationId: this.workSpaceService.presentationId,
      slideId: this.workSpaceService.activeSlideId,
      isTemplate: this.workSpaceService.isTemplate
    }
    this.presentationService.presenterStarTimer(presentationDTO).subscribe(
      (response: any) => {
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }
  wrappingContdown(seconds: number) {
    if(seconds == 0){
      this.newSeconds = 0;
      this.clearTimerIntervel();
    }
    else{
      if (this.workSpaceService.slideTimerInterval) {
        clearInterval(this.workSpaceService.slideTimerInterval);
      }
      this.workSpaceService.slideTimerCountShow = this.workSpaceService.slideEnableVoting == true ? true : false;
      let prefixSingleDigiteSecond: any = '0';
      let startingSecondsToDisplay: number = seconds % 60 || 60;
      let prefixSingleDigiteMinutes: any = seconds < 600 ? '0' : '';
      let initialWrappedTimer = prefixSingleDigiteMinutes + Math.floor(seconds / 60) + ':' + (startingSecondsToDisplay == 60 ? "00" : startingSecondsToDisplay);
      this.workSpaceService.slideTimerCountsToDisplay = initialWrappedTimer;
      this.workSpaceService.slideTimerInterval = setInterval(() => {
        seconds--;
        if (startingSecondsToDisplay != 0) {
          startingSecondsToDisplay--;
        } else {
          startingSecondsToDisplay = 59;
        }
        if (startingSecondsToDisplay < 10) {
          prefixSingleDigiteSecond = '0' + startingSecondsToDisplay;
        }
        else {
          prefixSingleDigiteSecond = 0;
          prefixSingleDigiteSecond = startingSecondsToDisplay;
        }
        let runtimeWrappedTimer = (prefixSingleDigiteMinutes + Math.floor(seconds / 60)) + ':' + prefixSingleDigiteSecond;
        this.workSpaceService.slideTimerCountsToDisplay = runtimeWrappedTimer;
        if (seconds == 0) {
          this.workSpaceService.slideTimerCountShow = false;
          clearInterval(this.workSpaceService.slideTimerInterval);
          if (this.workSpaceService.slideEnableVoting != false) {
            this.presenterLockVoting();
          }
        }
      }, 1000);
    }
    
  }
  clearTimerIntervel() {
    this.workSpaceService.slideTimerCountsToDisplay = "";
    this.workSpaceService.slideTimerCountShow = false;
    clearInterval(this.workSpaceService.slideTimerInterval);
  }
  presenterLockVoting() {
    if(this.workSpaceService.activeSlideTypeName === this.masterSlideTypeName.ImportDocument || this.workSpaceService.activeSlideTypeName === this.masterSlideTypeName.POWER_POINT || this.workSpaceService.activeSlideTypeName === this.masterSlideTypeName.GoogleSlides ||this.workSpaceService.activeSlideTypeName === this.workSpaceService.masterSlideTypeName.SELECT_ANSWER_SLIDE_TYPE || this.workSpaceService.activeSlideTypeName == this.workSpaceService.masterSlideTypeName.LEADER_BOARD_SLIDE_TYPE ||this.workSpaceService.activeSlideTypeName === this.workSpaceService.masterSlideTypeName.TYPE_ANSWER_SLIDE_TYPE){
      return;
    }
    this.clearTimerIntervel();
    if(this.workSpaceService.activeSlideTypeName != this.masterSlideTypeName.GoogleSlides && this.workSpaceService.activeSlideTypeName != this.masterSlideTypeName.POWER_POINT && this.workSpaceService.activeSlideTypeName != this.masterSlideTypeName.QUESTIONS_AND_ANSWER_SLIDE_TYPE){
      this.workSpaceService.slideEnableVoting = !this.workSpaceService.slideEnableVoting;
      this.lockVoting(false);
    }
   
  }
  getTotalSecondswithRemaindingSeondsFromTimer(newSeconds: number): number {
    let seconds = 0;
    if (this.workSpaceService.slideTimerCountsToDisplay != "") {
      // * Get RemainingSeconds Form Existing Timer
      // todo Then get remainingseconds add newseconds to remainingseconds then return newsconds.
      let [minute, second] = this.workSpaceService.slideTimerCountsToDisplay.split(':').map(Number);
      let remainingSeconds = minute * 60 + second;
      seconds = remainingSeconds + newSeconds;
      return seconds;
    }
    else {
      // * If Existingtimer is not started or this is first our timer so consider the exitingtimer is "0" and add the newSeconds and return.
      return seconds + newSeconds;
    }
  }
  showCorrectAnswerUpdate(showChooseCorrectAnswerDTO:any){
    return new Promise((resolve, reject) => {
      this.presentationService.showCorrectAnswers(showChooseCorrectAnswerDTO).subscribe(
        (response: any) => {
         resolve(response);
        },
        (error: any) => {
          console.log(error?.error);
        }
      );
    });
  }
  moderateResponse(moderateResponseDTO:any){
    return new Promise((resolve, reject) => {
      this.presentationService.moderateResponse(moderateResponseDTO).subscribe(
        (response: any) => {
          resolve(response);
        },
        (error: any) => {
          console.log(error?.error);
        }
      );
    });
  }
  resetModerateResponse(resetModerateResponseDTO:any){
    return new Promise((resolve, reject) => {
      this.presentationService.resetModerateResponse(resetModerateResponseDTO).subscribe(
        (response: any) => {
          resolve(response);
        },
        (error: any) => {
          console.log(error?.error);
        }
      );
    });
  }
  makeCorrectorWrongAnswer(presentationDTO:any){
    return new Promise((resolve, reject) => {
      this.presentationService.typeAnswersResultCorrectandWrongWorkSpace(presentationDTO).subscribe(
        (response: any) => {
          resolve(response);
        },
        (error: any) => {
          console.log(error);
        }
      )
    });
  }
  hideandShowAnswers(presentationDTO:any){
    return new Promise((resolve, reject) => {
      this.presentationService.typeAnswersResultHideandShowWorkSpace(presentationDTO).subscribe(
        (response: any) => {
          
          resolve(response);
        },
        (error: any) => {
          console.log(error);
        }
      )
    });
  }
  blankScreenUpdate(presentationDTO:any){
    return new Promise((resolve, reject) => {
      this.presentationService.blankScreenUpdate(presentationDTO).subscribe(
        (response: any) => {
          resolve(response);
        },
        (error: any) => {
          console.log(error);
        }
      )
    });
  }
  resetPresentationResults(data:any){
    return new Promise((resolve, reject) => {
      this.presentationService.resetPresentationResult(data).subscribe(
        (response: any) => {
          resolve(response);
        },
        (error: any) => {
          console.log(error);
        }
      )
    })
  }
  resetSlideResults(data:any){
    return new Promise((resolve, reject) => {
      this.presentationService.resetSlideResult(data).subscribe(
        (response: any) => {
          resolve(response);
        },
        (error: any) => {
          console.log(error);
        }
      )
    })
  }
  getBackgroundColorWithOpacity(colorCode: any, opacity: any): string {
    let rgb: number[];
    // Check if the input is a hex code
    if (colorCode?.startsWith('#')) {
      rgb = this.hexToRgb(colorCode);
    } else {
      // Assume it's an rgb string
      rgb = colorCode?.match(/\d+/g).map(Number);
    }
    // Calculate the contrast color
    const contrastRgb = rgb?.map((val) => (val > 128 ? 0 : 255));
    // Return the contrast color with opacity
    return `rgba(${contrastRgb?.join(', ')}, ${opacity})`;
  }
  private hexToRgb(hex: string): number[] {
    const hexValue = hex?.replace(/^#/, '');
    const rgb = [];
    for (let i = 0; i < 3; i++) {
      rgb?.push(parseInt(hexValue.substr(i * 2, 2), 16));
    }
    return rgb;
  }
}