import type { Vector } from "@dimforge/rapier2d-compat";
import type { Shapes } from "./world";

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
    pointUnderMouseDeviceId?: string;
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
    __devicesUnderCursor: string[];
    __wiresUnderCursor: Set<string>;
    cursorIsOverDevice: boolean;
    cursorIsOverWire: boolean;
}

interface MeCustomAssets {
    currentData?: { shapes: Shapes };
    currentIcon: string;
    currentId: string;
    currentName: string;
    currentOptionId: string;
    isUIOpen: boolean;
    openOptionId: string | null;
    pendingDeleteId: string | null;
    showDeleteConfirm: boolean;
}

interface DeviceUIProps {
    actions: { action: string; text: string }[];
    character: string;
    darkenBackground: boolean;
    font: string;
    message: string;
    send(key?: string, data?: unknown): void;
    typewriter: boolean;
}

interface MeDeviceUI {
    current: { deviceId: string; props: DeviceUIProps };
    desiredOpenDeviceId?: string;
    serverVersionOpenDeviceId: string;
}

interface CurrentlyEditedDevice {
    deviceOptionId: string;
    id: string;
}

interface SortingState {
    depth: number;
    deviceId: string;
    deviceName: string;
    globalDepth: number;
    layer: string;
    y: number;
}

interface VisualEditing {
    active: boolean;
    cursor: string;
    id: string;
    instruction: string;
    keyboardHelpers: { trigger: string; action: string }[];
}

interface EditingDevice {
    currentlyEditedDevice: CurrentlyEditedDevice;
    currentlyEditedGridId: string;
    currentlySortedDeviceId: string;
    screen: string;
    sortingState: SortingState[];
    usingMultiselect: boolean;
    visualEditing: VisualEditing;
}

interface EditingPreferences {
    cameraZoom: number;
    movementSpeed: number | null;
    phase: boolean | null;
    showGrid: boolean | null;
    topDownControlsActive: boolean;
}

interface Editing {
    device: EditingDevice;
    preferences: EditingPreferences;
    wire: { currentlyEditedWireId: string };
}

interface Health {
    fragility: number;
    health: number;
    lives: number;
    maxHealth: number;
    maxShield: number;
    shield: number;
}

interface InteractiveInfo {
    action: string;
    allowedToInteract: boolean;
    message: string;
    topHeader?: string;
    topHeaderColor: string;
}

interface Interactives {
    deviceId: string;
    info: InteractiveInfo;
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

interface AlertFeed {
    amount: number;
    itemId: string;
}

interface InventorySlot {
    amount: number;
    existsBeforeReconnect: boolean;
}

interface Inventory {
    activeInteractiveSlot: number;
    alertFeed?: AlertFeed;
    alertsFeed: AlertFeed[];
    currentWaitingEndTime: number;
    infiniteAmmo: boolean;
    interactiveSlotErrorMessageTimeouts: Map<string, ReturnType<typeof setTimeout>>;
    interactiveSlotErrorMessages: Map<string, string>;
    interactiveSlots: Map<string, InteractiveSlot>;
    interactiveSlotsOrder: number[];
    isCurrentWaitingSoundForItem: boolean;
    lastShotsTimestamps: Map<string, number>;
    maxSlots: number;
    slots: Map<string, InventorySlot>;
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

interface TileToRemove {
    depth: number;
    id: string;
    x: number;
    y: number;
}

interface Removing {
    deviceIdToRemove?: string;
    removingMode: string;
    removingTilesEraserSize: number;
    removingTilesLayer: number;
    removingTilesMode: string;
    tilesToRemove: TileToRemove[];
    wireIdToRemove?: string;
}

interface MeSpectating {
    id: string;
    name: string;
    shuffle: boolean;
}

interface XPAddition {
    amount: number;
    reason: string;
    xp: number;
}

interface XP {
    additionTimeouts: Map<string, ReturnType<typeof setTimeout>>;
    additions: XPAddition[];
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
    customAssets: MeCustomAssets;
    deviceUI: MeDeviceUI;
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
    properties: Map<string, number | boolean | string>;
    removing: Removing;
    roleLevel: number;
    spawnPosition: Vector;
    spectating: MeSpectating;
    teleportCount: number;
    unredeemeedXP: number;
    xp: XP;
    zoneDropOverrides: ZoneDropOverrides;
}
