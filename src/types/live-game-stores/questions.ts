export interface Answer {
  correct: boolean;
  text: string;
  _id: string;
}

export interface Question {
  answers: Answer[];
  game: string;
  image: string;
  isActive: boolean;
  position: number;
  source: string;
  text: string;
  type: string;
  __v: number;
  _id: string;
}

export default interface Questions {
  canAnswerQuestion: boolean;
  ceq: string;
  currentQuestionIndex: number;
  currentQuestionLoaded: boolean;
  eqt: string;
  lastQuestion: string;
  lastQuestionAnsweredTimestamp: number;
  lockedViewingCorrectAnswer: boolean;
  /** A list of the IDs of all the questions. */
  questionList: string[];
  questionsAnsweredCorrectly: number;
  questionsAnsweredIncorrectly: number;
  transitioningToNextQuestion: boolean;
  nextQuestion: () => void;
  questionAnswered: (lastQuestionCorrect: string, lastQuestion: string) => void;
  setCurrentQuestion: (index: number) => void;
  setQuestions: (questions: Question[]) => void;
}