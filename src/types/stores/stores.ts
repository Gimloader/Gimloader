import type Me from './me';
import type Session from './session';
import type GUI from './gui';
import type World from './world';
import type Characters from './characters';
import type MemorySystem from './memorySystem';
import type Phaser from './phaser/phaser';
import type WorldOptions from './worldOptions';

// Single-interface stores properties are in this file, everything else is in its own file

interface ActivityFeed {
    feedItems: {
        id: string;
        message: string;
    }[];
}

interface Assignment {
    hasSavedProgress: boolean;
    objective: string;
    percentageComplete: number;
}

interface Editing {
    accessPoints: Map<any, any>;
    gridSnap: number;
    showMemoryBarAtAllTimes: boolean;
}

interface Hooks {
    hookJSON: string;
}

interface Loading {
    completedInitialLoad: boolean;
    loadedInitialDevices: boolean;
    loadedInitialTerrain: boolean;
    percentageAssetsLoaded: number;
}

interface Matchmaker {
    gameCode: string;
}

interface Network {
    attemptingToConnect: boolean;
    attemptingToReconnect: boolean;
    authId: string;
    client: any;
    clientConnectionString: string;
    error: any;
    errorFindingServerForGame: boolean;
    errorJoiningRoom: boolean;
    failedToReconnect: boolean;
    findingServerForGame: boolean;
    hasJoinedRoom: boolean;
    isOffline: boolean;
    isUpToDateWithPingPong: boolean;
    joinedRoom: boolean;
    phaseBeforeReconnect: any;
    ping: number;
    room: any;
    roomIntentErrorMessage: string;
    syncingAfterReconnection: boolean;
}

interface Scene {
    currentScene: string;
    gpuTier: number;
    isCursorOverCanvas: boolean;
}

interface Teams {
    teams: any;
    updateCounter: number;
}

export interface StoresType {
    activityFeed: ActivityFeed;
    assignment: Assignment;
    characters: Characters;
    editing: Editing;
    gui: GUI;
    hooks: Hooks;
    loading: Loading;
    matchmaker: Matchmaker;
    me: Me;
    memorySystem: MemorySystem;
    network: Network;
    phaser: Phaser;
    scene: Scene;
    session: Session;
    teams: Teams;
    world: World;
    worldOptions: WorldOptions;
}

type Suggestion<T> = { [K in keyof T]: T[K] extends object ? Suggestion<T[K]> : T[K] } & { [key: string | number | symbol]: any };

/** The stores type is very incomplete and is not guaranteed to be accurate */
export type Stores = Suggestion<StoresType>;