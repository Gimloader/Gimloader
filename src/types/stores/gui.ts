interface Achievement {
    id: string;
    key: string;
    reset: () => void;
    update: () => void;
}

interface BottomInGamePrimaryContent {
    interactionWantsToBeVisible: boolean;
    prioritizeInteraction: boolean;
}

interface DamageIndicator {
    show: boolean;
    /** `h` for red, `s` for blue, and any other string for yellow. */
    type: string;
}

interface GuiSlot {
    id: string;
    position: string;
    text: string;
    trackedItemId: string | null;
    showTrackedItemMaximumAmount: boolean;
    type: string;
    priority: number;
    color: string;
}

interface KnockoutAlert {
    id: string;
    name: string;
}

interface Modals {
    closeAllModals: () => void;
    cosmosModalOpen: boolean;
    switchToRegisterScreenWhenCosmosModalOpens: boolean;
}

interface NoneGui {
    addMenu: { screen: string };
    duringGameScreenVisible: boolean;
    optionsMenu: { screen: string };
    screen: string;
}

interface Scorebar {
    teamColors: string[];
    teams: string[];
}

export default interface GUI {
    achievement: Achievement;
    bottomInGamePrimaryContent: BottomInGamePrimaryContent;
    damageIndicator: DamageIndicator;
    guiSlots: GuiSlot[];
    guiSlotsChangeCounter: number;
    knockoutAlerts: KnockoutAlert[];
    modals: Modals;
    none: NoneGui;
    openInputBlockingUI: string[];
    playersManagerUpdateCounter: number;
    scale: number;
    scorebar?: Scorebar;
    selectedPlayerId: string;
    showingGrid: boolean;
}
