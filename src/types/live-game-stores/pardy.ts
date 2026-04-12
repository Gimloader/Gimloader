import type { Question } from "./questions";
import type { HexColor } from "./theme";

interface Power {
  background: HexColor;
  description: string;
  id: string;
  image: string;
  name: string;
}

interface Item {
  amount: number;
  id: string;
  questionId: string;
}

interface Category {
  name: string;
  items: Item[];
}

interface Board {
  categories: Category[];
}

interface RoundValue {
  category: string;
  id: string;
}

interface NormalRound {
  type: "Normal";
  value: RoundValue;
}

interface FinaleRound {
  type: "Finale";
  value: undefined;
}

type Round = NormalRound | FinaleRound;

type QuestionScreen = "preview" | "finale" | 'question';
type QuestionStatus = "preview" | "ask" | "timesUp";
type Screen = "home" | "question" | "question" | "answer";

interface BasePardy {
  powers: Power[];
  questionScreen: QuestionScreen;
  questionStatus: QuestionStatus;
  screen: Screen;
}

export interface HostPardy extends BasePardy {
  betsPlaced: number;
  board: Board | null;
  currentRound: Round | null;
  disabledSections: string[];
  finaleQuestionId: string;
  nameOfFirstPlayerToAnswerCorrectly: string;
  playerCount: number;
  playersAnswered: number;
  playersAnsweredCorrectly: number;
}

export interface GuestPardy extends BasePardy {
  animatingBetScreenOut: boolean;
  animatingQuestionScreenOut: boolean;
  answerLockedInWittyMessages: string[];
  answerResponseItems: string[];
  answered: boolean;
  answeredCorrectly: boolean;
  correctWittyMessages: string[];
  currentBet: number;
  currentQuestion: Question | null;
  incorrectWittyMessages: string[];
  maxBet: number;
  power: string;
  powerOptions: string[];
  tips: string[];
}