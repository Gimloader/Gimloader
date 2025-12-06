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

interface Widget {
    type: string;
    id: string;
    y: number;
    placement: string;
    statName: string;
    statValue: number;
}

interface GameSession {
    callToAction: { categories: CallToActionCategory[]; items: CallToActionItem[] };
    countdownEnd: number;
    phase: string;
    resultsEnd: number;
    widgets: { widgets: Widget[] };
}

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
    mapStyle: string;
    modeType: string;
    ownerRole: string;
    phase: string;
    phaseChangedAt: number;
    version: string;
}
