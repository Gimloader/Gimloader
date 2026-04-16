import type { Player } from "./players";
import type { HexColor, ShopTheme, Theme } from "./theme";

interface NonDismissMessage {
    buttonText: string;
    link: string;
    message: string;
    title: string;
}

interface NewsItem {
    tag: string;
    header: string;
    image: string;
    description: string;
}

interface SimplePlayer {
    id: string;
    name: string;
}

interface ThanosValues {
    saved: SimplePlayer[];
    showAt: number;
    snapped: SimplePlayer[];
    winner: SimplePlayer;
}

interface ActivityItem {
    action: string;
    customTextColor: HexColor;
    key: string;
    name: string;
}

interface LinkedPlayer extends SimplePlayer {
    linked: string;
}

interface DefendingHomebaseResults {
    loser: LinkedPlayer;
    winner: LinkedPlayer;
    winnerPlayerNames: string[];
}

type GameStatus = "results" | "teams" | "gameplay";

interface BaseGameValues {
    gameCode: string | null;
    thanosValues: ThanosValues | null;
}

export interface HostGameValues extends BaseGameValues {
    activityItems: ActivityItem[];
    availableThemes: ShopTheme[];
    bossId: string | null;
    clapCount: number;
    currentRoute: string;
    defendingHomebaseResults: null | DefendingHomebaseResults;
    gameEndDate: number;
    reportId: string;
    roomIntentErrorMessage: string;
    showBossBattleModal: boolean;
}

export interface GuestGameValues extends BaseGameValues {
    connected: boolean;
    connectionError: boolean;
    gameStatus: GameStatus;
    news: NewsItem[];
    nonDismissMessage: NonDismissMessage;
    players: Player[];
    teams: Theme[];
}
