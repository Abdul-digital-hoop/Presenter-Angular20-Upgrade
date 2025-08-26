import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'possibleAnswers',
    standalone: false
})
export class PossibleAnswersPipe implements PipeTransform {

  transform(value: any,start:any,end:any): any {
    var resultSequence = [];
    var result;
    var resultsAnswersCount =(end-start) / value;
    for (let i = start; i <= end; i += value) {
      resultSequence.push(i);
    }
    if(value == end){
      if( resultSequence.length == 1 ){
        result = resultSequence[0];
      }else{
        result = resultSequence[0]+','+resultSequence[1];
      }
    }else if(resultsAnswersCount > 100){
      result = resultSequence[0]+','+resultSequence[1]+','+resultSequence[2]+"..."+resultSequence[resultSequence?.length-2]+','+[resultSequence[resultSequence?.length-1]];
    }
    else{
      if( resultSequence.length == 1 ){
        result = resultSequence[0];
      }else if(resultSequence.length == 2){
        result = resultSequence[0]+','+resultSequence[1];
      }else{
        result = resultSequence[0]+','+resultSequence[1]+','+resultSequence[2]+"...";
      }
    }
    return result;
  }
}
