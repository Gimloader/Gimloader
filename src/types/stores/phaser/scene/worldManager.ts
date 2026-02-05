import type { TerrainOption } from "$types/stores/worldOptions";
import type { Collider, ColliderDesc, RigidBody, RigidBodyDesc, Vector, World } from "@dimforge/rapier2d-compat";
import type { Overlay } from "../scene";
import type Scene from "../scene";
import type { Device } from "./device";
import type InputManager from "./inputManager";
import type { Rect } from "../../shapes";
import type { Input } from "phaser";

interface Cameras {
    allCameras: Device[];
    allCamerasNeedsUpdate: boolean;
    camerasPlayerIsInside: any[];
    scene: Scene;
    wasInPrePhase: boolean;
    findNewCameras(allCameras: Device[], x: number, y: number): any;
    setCurrentCameraSizeDevice(device: Device): void;
    switchToDefaultCameraSize(reset: boolean): void;
    update(devices: Device[]): void;
}

interface DevicesAction {
    inputManager: InputManager;
    scene: Scene;
    onClick(arg: any): void;
    update(): void;
}

interface DevicesPreview {
    devicePreviewOverlay: Overlay;
    previousDevices: Device[];
    scene: Scene;
    removePreviousDevices(isBeingReplaced: boolean): void;
    update(): void;
}

interface WorldInteractives {
    scene: Scene;
    currentDevice?: Device;
    clearCurrentDevice(): void;
    setCurrentDevice(device: Device): void;
    update(devices: Device[]): void;
    canBeReachedByPlayer(device: Device): boolean;
    findClosestInteractiveDevice(devices: Device[], x: number, y: number): Device | undefined;
}

interface Devices {
    allDevices: Device[];
    cameras: Cameras;
    devicesAction: DevicesAction;
    devicesInView: Device[];
    devicesPreview: DevicesPreview;
    devicesToPostUpdate: Set<Device>;
    devicesToUpdate: Set<Device>;
    interactives: WorldInteractives;
    scene: Scene;
    visualEditingManager: any;
    addDevice(device: Device): void;
    cullDevices(): void;
    findDeviceUnderMouse(): Device | undefined;
    getDeviceById(id: string): Device | undefined;
    hasDevice(id: string): boolean;
    removeDeviceById(id: string, options: { isBeingReplaced: boolean }): void;
    update(dt: number): void;
}

interface CreateTileOptions {
    x: number;
    y: number;
    tileIndex: number;
    terrainOption: TerrainOption;
}

interface InGameTerrainBuilder {
    afterFailureWithTouch: boolean;
    overlay: Overlay;
    previewingTile?: Vector;
    scene: Scene;
    wasDown: boolean;
    clearConsumeErrorMessage(): void;
    clearPreviewLayer(): void;
    createPreviewTile(options: CreateTileOptions): void;
    update(): void;
}

interface ActiveBodies {
    activeBodies: Set<string>;
    bodyManager: BodyManager;
    currentCoordinateKeys: Set<string>;
    world: World;
    disableBody(id: string): void;
    enable(keys: Set<string>, setAll: boolean): void;
    enableBodiesAlongLine(options: { start: Vector; end: Vector }): void;
    enableBodiesWithinAreas(options: { areas: Rect[]; disableActiveBodiesOutsideArea: boolean }): void;
    enableBody(id: string): void;
    setDirty(): void;
}

interface BodyBounds {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

interface BodyStatic {
    bounds: BodyBounds;
    cells: Set<string>;
}

interface GimkitBody {
    collider?: Collider;
    colliderDesc: ColliderDesc;
    rigidBody?: RigidBody;
    rigidBodyDesc: RigidBodyDesc;
    static: BodyStatic;
    device?: { id: string };
    terrain?: { key: string };
}

interface BodyManager {
    activeBodies: ActiveBodies;
    bodies: Map<string, GimkitBody>;
    cells: Map<string, Set<string>>;
    dynamicBodies: Set<string>;
    gridSize: number;
    staticBodies: Set<string>;
    staticSensorBodies: Set<string>;
    _idCount: number;
    find(id: string): GimkitBody | undefined;
    findPotentialStaticBodiesWithinArea(area: Rect): Set<string>;
    generateId(): void;
    insert(body: GimkitBody): string;
    remove(id: string): void;
}

interface WorldBoundsCollider {
    body: RigidBody;
    collider: Collider;
}

interface PhysicsManager {
    bodies: BodyManager;
    cumulTime: number;
    lastTime: number;
    physicsStep(dt: number): void;
    runPhysicsLoop(dt: number): void;
    world: World;
    worldBoundsColliders: Set<WorldBoundsCollider>;
}

interface Projectile {
    id: string;
    startTime: number;
    endTime: number;
    start: Vector;
    end: Vector;
    radius: number;
    appearance: string;
    ownerId: string;
    ownerTeamId: string;
    damage: number;
    hitPos?: Vector;
    hitTime?: number;
}

interface Projectiles {
    damageMarkers: any;
    dynamicDevices: Set<Device>;
    fireSlashes: any;
    projectileJSON: Map<string, Projectile>;
    runClientSidePrediction: boolean;
    scene: Scene;
    addProjectile(projectile: Projectile): void;
    fire(pointer: Input.Pointer, snap: boolean): void;
    update(): void;
}

export default interface WorldManager {
    devices: Devices;
    inGameTerrainBuilder: InGameTerrainBuilder;
    physics: PhysicsManager;
    projectiles: Projectiles;
    scene: Scene;
    terrain: any;
    wires: any;
    update(dt: number): void;
}
