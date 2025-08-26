import { Pipe, PipeTransform } from '@angular/core';
import { MasterSlideTypeName, QuizPresenterScreenManageConstant } from 'src/app/utility/constants';

@Pipe({
  name: 'questionVisibility'
})
export class QuestionVisibilityPipe implements PipeTransform {
  transform(slideType: any, screenState: any): boolean {
    return !((slideType === MasterSlideTypeName.SELECT_ANSWER_SLIDE_TYPE || slideType === MasterSlideTypeName.TYPE_ANSWER_SLIDE_TYPE ||
      slideType === MasterSlideTypeName.LINEUP_SLIDE_TYPE || slideType === MasterSlideTypeName.GUESS_THE_NUMBER_QUIZ) &&
      (screenState === QuizPresenterScreenManageConstant.WAITING_FOR_QUIZ_PLAYERS ||
        screenState === QuizPresenterScreenManageConstant.FAST_ANSWERS_SCREEN));
  }
}
