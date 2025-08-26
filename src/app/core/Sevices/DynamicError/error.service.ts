import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor() { }

  scalesSameDimensionErrorMessage(startValue: any, endValue: any): string {
    let errorMessage = 'High value (' + startValue + ') must be greater than low value (' + endValue + ')';
    return errorMessage;
  }
  quizAnswersSecondsValidations(startValue: any, endValue: any): string {
    let errorMessage = 'Must be between (' + startValue + ') and (' + endValue + ')';
    return errorMessage;
  }
  scalesHighValueLessThanOneError(){
    return 'High value must be greater than 0.';
  }
}
