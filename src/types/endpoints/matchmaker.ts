interface HiddenScenario {
    name: string;
    conditions: {
        id: string;
        type: string;
        options: {
            compare: string;
            mode: string;
        }
    }[];
}

interface HookTypes {
    "selectBox": {
        options: string[];
        defaultOption: string;
    };
    "number": {
        min: number;
        max: number;
        defaultValue: number;
        step: number;
    };
}

type NormalHook = {
    [K in keyof HookTypes]: {
        key: K;
        options: HookTypes[K];
        displayName: string;
        displayDescription: string;
        hiddenScenarios: HiddenScenario[];
    }
}[keyof HookTypes];

interface KitHook {
    key: string;
    type: "kit";
    options: {};
}

export type Hook = NormalHook | KitHook;

export interface MatchmakerOptions {
    group: string;
    joinInLate?: boolean;
    useRandomNamePicker?: boolean;
}

export interface MapCreationOptions {
    allowGoogleTranslate: boolean;
    cosmosBlocked: boolean;
    hookOptions: Record<string, number | string>;
}

export interface PublicGame {
    _id: string;
    title: string;
    gif: string;
    questionCount: number;
    playCount: number;
    creator: string;
    dateCreated: string;
}

export interface CodeInfoSuccess {
    roomId: string;
    useRandomNamePicker: boolean;
}

export interface CodeInfoFailure {
    message: {
        text: string;
    };
    code: number;
}

export interface LiveGameOptions {
    allowGoogleTranslate: boolean;
    clapping: boolean;
    cleanPowerupsOnly: boolean;
    currency: string;
    language: string;
    music: boolean;
    startingCash: number;
    modeOptions: Record<string, any>;
    gameGoal: {
        goal: string;
        value: number;
    };
}

interface BaseGamemode {
    _id: string;
    name: string;
    tagline: string;
    imageUrl: string;
    pageId: string;
    isPremiumExperience: boolean;
    tag: string;
    labels: {
        c: string;
        d: string;
        s: string;
    }
}

interface MapGamemode extends BaseGamemode {
    source: "map";
    mapId: string;
}

interface OriginalGamemode extends BaseGamemode {
    source: "original";
    originalId: string;
}

type Gamemode = MapGamemode | OriginalGamemode;

export interface Experience {
    _id: string;
    name: string;
    items: Gamemode[];
}