import type { Coords } from './common';
import type { Editing } from "./editing";

interface ExistingDevice {
    action: string;
    id: string;
    shiftX: number;
    shiftY: number;
    use: boolean;
}

interface AddingDevices {
    currentlySelectedProp: string;
    existingDevice: ExistingDevice;
    selectedDeviceType: string;
}

interface AddingTerrain {
    brushSize: number;
    buildTerrainAsWall: boolean;
    currentlySelectedTerrain: string;
    currentlySelectedTerrainDepth: number;
}

interface AddingWires {
    hoveringOverSupportedDevice: boolean;
    pointUnderMouseDeviceId: any;
    startDeviceSelected: boolean;
}

interface Adding {
    devices: AddingDevices;
    terrain: AddingTerrain;
    wires: AddingWires;
    mode: string;
}

interface CinematicMode {
    charactersVisible: boolean;
    enabled: boolean;
    followingMainCharacter: boolean;
    hidingGUI: boolean;
    mainCharacterVisible: boolean;
    nameTagsVisible: boolean;
}

interface ClassDesigner {
    activeClassDeviceId: string;
    lastActivatedClassDeviceId: string;
    lastClassDeviceActivationId: number;
}

interface Context {
    cursorIsOverCharacterId: string;
    __devicesUnderCursor: any[];
    __wiresUnderCursor: Set<any>;
}

interface CustomAssets {
    currentData: any;
    currentIcon: any;
    currentId: any;
    currentName: any;
    currentOptionId: any;
    isUIOpen: boolean;
    openOptionId: any;
    pendingDeleteId: any;
    showDeleteConfirm: boolean;
}

interface DeviceUI {
    current: { deviceId: string; props: any };
    desiredOpenDeviceId: any;
    serverVersionOpenDeviceId: string;
}

interface Health {
    fragility: number;
    health: number;
    lives: number;
    maxHealth: number;
    maxShield: number;
    shield: number;
}

interface Interactives {
    deviceId: string;
    info: any;
}

interface InteractiveSlot {
    clipSize: number;
    count: number;
    currentClip: number;
    durability: number;
    itemId: string;
    waiting: boolean;
    waitingEndTime: number;
    waitingStartTime: number;
}

interface Inventory {
    activeInteractiveSlot: number;
    alertFeed: any;
    alertsFeed: any[];
    currentWaitingEndTime: number;
    infiniteAmmo: boolean;
    interactiveSlotErrorMessageTimeouts: Map<any, any>;
    interactiveSlotErrorMessages: Map<any, any>;
    interactiveSlots: Map<string, InteractiveSlot>;
    interactiveSlotsOrder: number[];
    isCurrentWaitingSoundForItem: boolean;
    lastShotsTimestamps: Map<any, any>;
    maxSlots: number;
    slots: Map<any, any>;
}

interface MobileControls {
    left: boolean;
    right: boolean;
    up: boolean;
}

interface Mood {
    activeDeviceId: string;
    vignetteActive: boolean;
    vignetteStrength: number;
}

interface NonDismissMessage {
    description: string;
    title: string;
}

interface Removing {
    deviceIdToRemove: any;
    removingMode:string;
    removingTilesEraserSize: number;
    removingTilesLayer: number;
    removingTilesMode: string;
    tilesToRemove: any[];
    wireIdToRemove: any;
}

interface Spectating {
    id: string;
    name: string;
    shuffle: boolean;
}

interface Xp {
    additionTimeouts: Map<any, any>;
    additions: any[];
    showingLevelUp: boolean;
}

interface ZoneDropOverrides {
    allowItemDrop: boolean;
    allowResourceDrop: boolean;
    allowWeaponDrop: boolean;
}

export default interface Me {
    adding: Adding;
    cinematicMode: CinematicMode;
    classDesigner: ClassDesigner;
    completedInitialPlacement: boolean;
    context: Context;
    currentAction: string;
    customAssets: CustomAssets;
    deviceUI: DeviceUI;
    editing: Editing;
    gotKicked: boolean;
    health: Health;
    interactives: Interactives;
    inventory: Inventory;
    isRespawning: boolean;
    mobileControls: MobileControls;
    mood: Mood;
    movementSpeed: number;
    myTeam: string;
    nonDismissMessage: NonDismissMessage;
    phase: boolean;
    preferences: { startGameWithMode: string };
    properties: Map<string, any>;
    removing: Removing;
    roleLevel: number;
    spawnPosition: Coords;
    spectating: Spectating;
    teleportCount: number;
    unredeemeedXP: number;
    xp: Xp;
    zoneDropOverrides: ZoneDropOverrides;
}