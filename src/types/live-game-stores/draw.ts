import type { HexColor } from "./theme";

interface Round {
  amount: number;
  metadata: number;
  type: "correct" | "speed" | "firstGuess" | "goodDrawer";
}

interface Me {
  answeredCorrectly: boolean;
  lastRound: null | Round[];
  role: "Guesser" | 'Drawer';
}

interface Drawer {
  id: string;
  name: string;
}

interface TermOption {
  id: string;
  term: string;
}

interface Round {
  drawer: Drawer;
  drawingBase64: string;
  revealText: string;
  secondsLeft: number;
  term: string;
  termOptions: TermOption[];
}

interface FeedItem {
  action: string;
  actionColor: HexColor;
  important: boolean;
}

interface Line {
  color: string;
  width: number;
  xEnd: number;
  xStart: number;
  yEnd: number;
  yStart: number;
}

interface PersonCount {
  correct: number;
  total: number;
}

interface Drawing {
  image: string;
  index: number;
  name: string;
  term: string;
}

interface PointAddition {
  amount: number;
  id: string;
  name: string;
}

interface BaseDraw {
  latestFeedItem: FeedItem | null;
  latestLine: Line | null;
  round: Round;
  status: "pickDrawer" | "results" | "termSelection" | "drawing";
}

export interface HostDraw extends BaseDraw {
  drawingHistory: Drawing[];
  drawingsModalOpen: boolean;
  everybodyGotLastRoundCorrect: boolean;
  personCount: PersonCount | null;
  pointAdditions: PointAddition[];
  showingFeed: boolean;
}

export interface GuestDraw extends BaseDraw {
  me: Me;
  shouldClearCanvas: boolean;
}