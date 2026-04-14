interface Goal {
    type: string;
    value: number;
}

type Currency = "$" | "€" | "¥" | "£" | "X̶" | "₩";

// Gimkit uses google translate language codes

interface GameOptions {
    allowGoogleTranslate: boolean;
    clapping: boolean;
    cleanPowerupsOnly: boolean;
    currency: Currency;
    enablePowerupRNGAnimation: boolean;
    goal: Goal;
    group: string;
    handicap: number;
    language: string;
    modeOptions: any;
    music: boolean;
    powerups: boolean;
    specialGameType: string[];
    startingCash: number;
    themes: boolean;
    type: string;
}

interface BaseGameOptionsStore extends GameOptions {
    formattedGameOptions: GameOptions;
}

export interface HostGameOptions extends BaseGameOptionsStore {
    setGameOptionsFromStorage: (gameOptions: GameOptions, defaultValues: boolean) => void;
}

export interface GuestGameOptions extends BaseGameOptionsStore {
    setGameOptions: (gameOptions: GameOptions) => void;
}
