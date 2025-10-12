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

    /**
     * `h` for red, `s` for blue, and any other string for yellow.
     */
    type: string;
}

interface Modals {
    closeAllModals: () => void;
    cosmosModalOpen: boolean;
    switchToRegisterScreenWhenCosmosModalOpens: boolean;
}

export default interface GUI {
    achievement: Achievement;
    bottomInGamePrimaryContent: BottomInGamePrimaryContent;
    damageIndicator: DamageIndicator;
    guiSlots: any[];
    guiSlotsChangeCounter: number;
    knockoutAlerts: any[];
    modals: Modals;
    none: {
        addMenu: {
            screen: string;
        };
        duringGameScreenVisible: boolean;
        optionsMenu: {
            screen: string;
        };
        screen: string;
        
    };
    openInputBlockingUI: any[];
    playersManagerUpdateCounter: number;
    scale: number;
    scorebar: any;
    selectedPlayerId: string;
    showingGrid: boolean;
}