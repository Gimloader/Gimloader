import type { GameObjects, Scene as BaseScene } from "phaser";
import type Character from "./character";
import type { Device } from "./scene/device";
import type { Rect } from "../shapes";
import type { Vector } from "@dimforge/rapier2d-compat";
import type WorldManager from "./scene/worldManager";
import type InputManager from "./scene/inputManager";
import type TileManager from "./scene/tileManager";
import type { CharacterType } from "../characters";

interface ShowOverlayOptions {
    x: number;
    y: number;
    width: number;
    height: number;
    depth: number;
}

export interface Overlay {
    scene: Scene;
    showing: boolean;
    showingDimensions: { width: number; height: number } | null;
    showingPosition: { x: number; y: number } | null;
    hide(): void;
    show(options: ShowOverlayOptions): void;
}

interface DepthSort {
    overlay: Overlay;
    scene: Scene;
    update(): void;
}

interface SelectedDevicesOverlay {
    graphics: GameObjects.Graphics;
    scene: Scene;
    showing: boolean;
    hide(): void;
    show(rects: Rect[]): void;
}

interface MultiSelect {
    boundingBoxAroundEverything: Rect | null;
    currentlySelectedDevices: Device[];
    currentlySelectedDevicesIds: string[];
    hidingSelectionForDevices: boolean;
    isSelecting: boolean;
    modifierKeyDown: boolean;
    mouseShifts: Vector[];
    movedOrCopiedDevices: Device[];
    overlay: Overlay;
    scene: Scene;
    selectedDevices: Device[];
    selectedDevicesIds: string[];
    selectedDevicesOverlay: SelectedDevicesOverlay;
    selection: Rect | null;
    addDeviceToSelection(device: Device): void;
    endSelectionRect(): void;
    findSelectedDevices(): void;
    hasSomeSelection(): boolean;
    hideSelection(): void;
    multiselectDeleteKeyHandler(): void;
    multiselectKeyHandler(down: boolean): void;
    onDeviceAdded(device: Device): void;
    onDeviceRemoved(id: string): void;
    setShiftParams(): void;
    startSelectionRect(): void;
    unselectAll(): void;
    update(): void;
    updateSelectedDevicesOverlay(): void;
    updateSelectionRect(): void;
}

interface PlatformerEditing {
    setTopDownControlsActive(active: boolean): void;
}

interface Removal {
    overlay: Overlay;
    prevMouseWasDown: boolean;
    scene: Scene;
    checkForItem(): void;
    createStateListeners(): void;
    removeSelectedItems(): void;
    update(): void;
}

interface ActionManager {
    depthSort: DepthSort;
    multiSelect: MultiSelect;
    platformerEditing: PlatformerEditing;
    removal: Removal;
    update(): void;
}

interface Spectating {
    findNewCharacter(): void;
    onBeginSpectating(): void;
    onEndSpectating(): void;
    setShuffle(shuffle: boolean, save?: boolean): void;
}

interface CharacterOptions {
    id: string;
    x: number;
    y: number;
    scale: number;
    type: CharacterType;
}

interface CharacterManager {
    characterContainer: GameObjects.Container;
    characters: Map<string, Character>;
    scene: Scene;
    spectating: Spectating;
    addCharacter(options: CharacterOptions): Character;
    cullCharacters(): void;
    removeCharacter(id: string): void;
    update(dt: number): void;
}

export default interface Scene extends BaseScene {
    actionManager: ActionManager;
    cameraHelper: any;
    characterManager: CharacterManager;
    dt: number;
    inputManager: InputManager;
    resizeManager: any;
    shadowsManager: any;
    spine: any;
    tileManager: TileManager;
    uiManager: any;
    worldManager: WorldManager;
    create(): void;
}
