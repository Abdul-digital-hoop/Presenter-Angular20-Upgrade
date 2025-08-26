export class Question {
    Id: any
    isBool: boolean
}

export class QuestionAnswered {
  presentationId: string;
  slideId: string;
  questionId: string;
  isAnswered: boolean;
}

export class ShowQuestionModel {
  presentationId: string;
  slideId: string;
  questionId: string;
  isBool: boolean;
}
