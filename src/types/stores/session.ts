interface CallToActionCategory {
    id: string;
    name: string;
    plural: string;
}

interface CallToActionItem {
    id: string;
    category: string;
    name: string;
    url: string;
}

interface BaseWidget {
    id: string;
    y: number;
    placement: string;
}

interface StatisticWidget extends BaseWidget {
    type: "Statistic";
    gameTimeName: string;
    gameTimeValue: string;
}

interface GameTimeWidget extends BaseWidget {
    type: "Game Time";
    statName: string;
    statValue: number;
}

type Widget = StatisticWidget | GameTimeWidget;

export type GameSessionPhase = "countdown" | "game" | "results";

interface GameSession {
    callToAction: { categories: CallToActionCategory[]; items: CallToActionItem[] };
    countdownEnd: number;

    /**
     * `countdown` either before the game has started or while the game is starting
     *
     * `game` while the game is started
     *
     * `results` after the game ends until the game has been started again
     */
    phase: GameSessionPhase;
    resultsEnd: number;
    widgets: { widgets: Widget[] };
}

export type SessionMapStyle = "platformer" | "topDown";
export type SessionModeType = "liveGame" | "assignment";
export type SessionPhase = "preGame" | "game";
export type SessionVersion = "published" | "saved";
type OwnerRole = "player" | "spectator";

export default interface Session {
    allowGoogleTranslate: boolean;
    amIGameOwner: boolean;
    canAddGameTime: boolean;
    cosmosBlocked: boolean;
    customTeams: { characterToTeamMap: Map<string, string> };
    duringTransition: boolean;
    gameClockDuration: string;
    gameOwnerId: string;
    gameSession: GameSession;
    gameTime: number;
    gameTimeLastUpdateAt: number;
    globalPermissions: Permissions;
    loadingPhase: boolean;
    mapCreatorRoleLevel: number;
    mapStyle: SessionMapStyle;
    modeType: SessionModeType;
    ownerRole: OwnerRole;
    phase: SessionPhase;
    phaseChangedAt: number;
    version: SessionVersion;
}
