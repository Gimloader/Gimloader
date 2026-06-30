// Rollup is really stupid and it can't figure out where these are without us holding its hand
import type { Collider, ColliderDesc } from "rapier/geometry/index";
import type { KinematicCharacterController } from "rapier/control/index";
import type { RigidBody, RigidBodyDesc } from "rapier/dynamics/index";
import type { World } from "rapier/pipeline/index";
import type { Vector } from "rapier/math";
import type { Untyped } from "$types/util";
import type { GameObjects, Input, Scene as BaseScene, Tweens, Types } from "phaser";

export namespace Stores {
    export interface SoundEffect {
        path: string;
        volume: number;
    }

    export interface BaseAsset {
        frameHeight: number;
        frameRate: number;
        frameWidth: number;
        imageUrl: string;
        scale: number;
    }

    export interface ImpactAsset extends BaseAsset {
        frames: number[];
        hideIfNoHit?: boolean;
    }

    export interface WeaponAsset extends BaseAsset {
        fireFrames: number[];
        fromCharacterCenterRadius: number;
        hideFireSlash: boolean;
        idleFrames: number;
        originX: number;
        originY: number;
    }

    export interface ProjectileAppearance {
        imageUrl: string;
        rotateToTarget: boolean;
        scale: number;
    }

    export interface CurrentAppearance {
        id: string;
        explosionSfx: SoundEffect[];
        fireSfx: SoundEffect[];
        impact: ImpactAsset;
        projectile: ProjectileAppearance;
        reloadSfx: SoundEffect;
        weapon: WeaponAsset;
    }

    export interface AimingAndLookingAround {
        angleTween?: Tweens.Tween;
        character: Character;
        currentAngle?: number;
        currentAppearance?: CurrentAppearance;
        currentWeaponId?: string;
        isAiming: boolean;
        lastUsedAngle: number;
        sprite: GameObjects.Sprite;
        targetAngle?: number;
        characterShouldFlipX(): boolean;
        destroy(): void;
        isCurrentlyAiming(): boolean;
        onInventoryStateChange(): void;
        playFireAnimation(): void;
        setImage(appearance: CurrentAppearance): void;
        setSpriteParams(skipRecalculateAlpha: boolean): void;
        setTargetAngle(angle: number, instant?: boolean): void;
        update(): void;
        updateAnotherCharacter(): void;
        updateMainCharacterMouse(): void;
        updateMainCharacterTouch(): void;
    }

    export interface NonMainCharacterState {
        grounded: boolean;
    }

    export interface CharacterAnimation {
        availableAnimations: string[];
        blinkTimer: number;
        bodyAnimationLocked: boolean;
        bodyAnimationStartedAt: number;
        character: Character;
        currentBodyAnimation: string;
        currentEyeAnimation: string;
        lastGroundedAnimationAt: number;
        nonMainCharacterState: NonMainCharacterState;
        prevNonMainCharacterState: NonMainCharacterState;
        skinChanged: boolean;
        destroy(): void;
        onAnimationComplete(options: Untyped): void;
        onSkinChanged(): void;
        playAnimationOrClearTrack(animations: string[], track: number): void;
        playBodyAnimation(animation: string): void;
        playBodySupplementalAnimation(animation: string): void;
        playEyeAnimation(animation: string): void;
        playJumpSupplementalAnimation(animation: string): void;
        playMovementSupplementalAnimation(animation: string): void;
        setupAnimations(): void;
        startBlinkAnimation(): void;
        stopBlinkAnimation(): void;
        update(dt: number): void;
    }

    export interface Point {
        endTime: number;
        endX: number;
        endY: number;
        startTime: number;
        startX: number;
        startY: number;
        teleported: boolean;
        usedTeleported: boolean;
    }

    export interface EndInfo {
        end: number;
        start: number;
        x: number;
        y: number;
    }

    export interface Movement {
        character: Character;
        currentPoint: Point;
        currentTime: number;
        nonMainCharacterGrounded: boolean;
        pointMap: Point[];
        targetIsDirty: boolean;
        targetNonMainCharacterGrounded: boolean;
        targetX: number;
        targetY: number;
        teleportCount: number;
        teleported: boolean;
        getCurrentEndInfo(): EndInfo;
        moveToTargetPosition(): void;
        onMainCharacterTeleport(): void;
        postPhysicsUpdate(dt: number): void;
        setNonMainCharacterTargetGrounded(grounded: boolean): void;
        setTargetX(x: number): void;
        setTargetY(y: number): void;
        setTeleportCount(teleportCount: number): void;
        update(dt: number): void;
    }

    export interface Jump {
        /** Optional in top-down, required in platformer */
        actuallyJumped?: boolean;
        isJumping: boolean;
        jumpCounter: number;
        jumpTicks: number;
        jumpsLeft: number;
        xVelocityAtJumpStart: number;
    }

    export interface MovementState {
        accelerationTicks: number;
        direction: string;
        xVelocity: number;
    }

    export interface PhysicsState {
        forces: Untyped[];
        gravity: number;
        grounded: boolean;
        groundedTicks: number;
        jump: Jump;
        lastGroundedAngle: number;
        movement: MovementState;
        velocity: Vector;
    }

    export interface PhysicsInput extends TickInput {
        activeClassDeviceId: string;
        ignoredStaticBodies: Set<Untyped>;
        ignoredTileBodies: Set<Untyped>;
        projectileHitForcesQueue: Set<Untyped>;
    }

    export interface CharacterBody {
        id: string;
        ignoredStaticBodies: Set<Untyped>;
        ignoredTileBodies: Set<Untyped>;
        controller: KinematicCharacterController;
        aroundSensor: Collider;
        feetSensor: Collider;
    }

    export interface Bodies {
        character: CharacterBody;
        collider: Collider;
        colliderDesc: ColliderDesc;
        rigidBody: RigidBody;
        rigidBodyDesc: RigidBodyDesc;
    }

    export interface ServerPosition {
        packet: number;
        x: number;
        y: number;
        jsonState: string;
        teleport: boolean;
    }

    export type AngleInput = number | null;

    export interface TickInput {
        angle: AngleInput;
        jump: boolean;
        _jumpKeyPressed: boolean;
    }

    export interface Physics {
        character: Character;
        currentPacketId: number;
        frameInputsHistory: Map<number, PhysicsInput>;
        justAppliedProjectileHitForces: Set<Untyped>;
        lastClassDeviceActivationId: number;
        lastPacketSent: number[];
        lastSentClassDeviceActivationId: number;
        lastSentTerrainUpdateId: number;
        lastTerrainUpdateId: number;
        newlyAddedTileBodies: Set<Untyped>;
        phase: boolean;
        physicsBodyId: string;
        prevState: PhysicsState;
        projectileHitForcesHistory: Map<string, Untyped>;
        projectileHitForcesQueue: Set<Untyped>;
        scene: Scene;
        state: PhysicsState;
        tickInput: TickInput;
        destroy(): void;
        getBody(): Bodies;
        postUpdate(dt: number): void;
        preUpdate(): void;
        sendToServer(): void;
        setServerPosition(serverPosition: ServerPosition): void;
        setupBody(x: number, y: number): void;
        updateDebugGraphics(): void;
    }

    export interface AppearanceVariation {
        device: Device;
        resetAppearance(): void;
        setPreviewAppearance(): void;
        setRemovalAppearance(): void;
    }

    export interface BoundingBox {
        cachedBoundingBox: Rect;
        device: Device;
        hardcodedBoundingBox?: Rect;
        clearCached(): void;
        clearHardcoded(): void;
        getBoundingBox(): Rect;
        isHardcoded(): boolean;
        isInsideBoundingBox(x: number, y: number): boolean;
        setHardcoded(rect: Rect): void;
    }

    export type DeviceCollider = RectShort | CircleShort | Ellipse;

    export type ColliderOptions = {
        device: Device;
        scene: Scene;
        angle: number;
        x: number;
        y: number;
    } & Partial<RectShort & CircleShort & Ellipse>;

    export interface ColliderEntry {
        bodyId: string;
        options: ColliderOptions;
        device: Device;
        scene: Scene;
    }

    export interface Colliders {
        add: {
            box(collider: RectShort): void;
            circle(collider: CircleShort): void;
            ellipse(collider: Ellipse): void;
        };
        device: Device;
        list: ColliderEntry[];
        createOptions(collider: DeviceCollider): ColliderOptions;
        destroy(): void;
        forEach(callback: (collider: DeviceCollider) => void): void;
        hideDebug(): void;
        showDebug(): void;
    }

    export interface UpdateCullOptions {
        mainCharacter: Character;
        isPhase: boolean;
        insideView: boolean;
    }

    export interface Cull {
        device: Device;
        ignoresCull: boolean;
        isInsideView: boolean;
        margin: number;
        wasInsideView: boolean;
        getMargin(): number;
        ignoreCulling(): void;
        setMargin(margin: number): void;
        setOnEnterViewCallback(callback: () => void): void;
        setOnLeaveViewCallback(callback: () => void): void;
        onEnterViewCallback?(): void;
        onLeaveViewCallback?(): void;
        updateCull(options: UpdateCullOptions): void;
    }

    export interface DeviceUI {
        device: Device;
        close(): void;
        open(options: Record<string, Untyped>): void;
        update(options: Record<string, Untyped>): void;
    }

    export interface DeviceInput {
        device: Device;
        enabled: boolean;
        hasKeyListeners: boolean;
        isCurrentlyUnderMouse: boolean;
        addDeviceToCursorUnderList(): void;
        createKeyListeners(): void;
        cutCopyHandler(action: string): void;
        disable(): void;
        dispose(): void;
        disposeKeyListeners(): void;
        enable(): void;
        partIsNoLongerUnderMouse(): void;
        partIsUnderMouse(): void;
        removeDeviceFromCursorUnderList(): void;
    }

    export interface InteractiveZones {
        add: {
            circle(zone: CircleShort): void;
            rect(zone: Rect): void;
        };
        canInteractThroughColliders: boolean;
        device: Device;
        forceDisabled: boolean;
        zones: (CircleShort | Rect)[];
        contains(x: number, y: number): boolean;
        destroy(): void;
        getCanInteractThroughColliders(): boolean;
        getInfo(): Untyped;
        getMaxDistance(x: number, y: number): number;
        isInteractive(): boolean;
        onPlayerCanInteract(): void;
        onPlayerCantInteractAnyMore(): void;
        setCanInteractThroughColliders(canInteract: boolean): void;
        setForceDisabled(forceDisabled: boolean): void;
        setInfo(info: Untyped): void;
        remove(zone: CircleShort | Rect): void;
        onInteraction?(): void;
    }

    export interface VisualEditingBox {
        width: number;
        height: number;
        angle: number;
        minWidth: number;
        maxWidth: number;
        minHeight: number;
        maxHeight: number;
        keepRatio: boolean;
        rotable: boolean;
        onChange(value: RotatedRect): void;
    }

    export interface VisualEditingCircle {
        angle: number;
        rotable: boolean;
        radius: number;
        minRadius: number;
        maxRadius: number;
        onChange(value: RotatedCircle): void;
    }

    export interface DeviceVisualEditing {
        add: {
            box(options: VisualEditingBox): void;
            circle(options: VisualEditingCircle): void;
        };
        device: Device;
        isActive: boolean;
        shapes: (VisualEditingBox | VisualEditingCircle)[];
        clear(): void;
    }

    export interface ShadowOptions {
        x: number;
        y: number;
        r1: number;
        r2: number;
        alphaMultip: number;
        depth: number;
    }

    export interface Shadows {
        device: Device;
        list: ShadowOptions[];
        add(options: ShadowOptions): void;
        destroy(): void;
        forEach(callback: (shadow: ShadowOptions) => void): void;
        hide(): void;
        show(): void;
    }

    export interface Layers {
        depth: number;
        device: Device;
        layer: string;
        options: Untyped;
    }

    export interface WirePoints {
        device: Device;
        end: Vector;
        start: Vector;
        onPointChange(): void;
        setBoth(x: number, y: number): void;
    }

    export interface DeviceTweens {
        list: Tweens.Tween[];
        device: Device;
        add(config: Types.Tweens.TweenBuilderConfig): Tweens.Tween;
        destroy(): void;
    }

    export interface DeviceProjectiles {
        device: Device;
        addToDynamicDevices(): void;
        collidesWithProjectile(object: Circle): boolean;
        onClientPredictedHit(position: Vector): void;
        removeFromDynamicDevices(): void;
        setDynamic(dynamic: boolean): void;
    }

    export interface BaseDevice {
        isPreview: boolean;
        placedByClient: boolean;
        isDestroyed: boolean;
        x: number;
        y: number;
        forceUseMyState: boolean;
        options: Record<string, any>;
        state: Record<string, any>;
        prevState: Record<string, any>;
        name: string;
        id: string;
        scene: Scene;
        deviceOption: DeviceOption;
        visualEditing: DeviceVisualEditing;
        shadows: Shadows;
        input: DeviceInput;
        parts: Untyped;
        cull: Cull;
        boundingBox: BoundingBox;
        appearanceVariation: AppearanceVariation;
        colliders: Colliders;
        interactiveZones: InteractiveZones;
        deviceUI: DeviceUI;
        layers: Layers;
        wirePoints: WirePoints;
        tweens: DeviceTweens;
        projectiles: DeviceProjectiles;
        sensors: Untyped;
        onHide: (() => void) | null;
        onShow: (() => void) | null;
        onUpdate: (() => void) | null;
        initialStateProcessing(state: Record<string, any>): Record<string, any>;
        getMaxDepth(): number;
        onStateUpdateFromServer(key: string, value: any): void;
        getRealKey(key: string): string;
        onPostUpdate(): void;
        onInit(): void;
        onMessage(message: { key: string; data: any }): void;
        onStateChange(key: string): void;
        onDestroy(options: { isBeingReplaced: boolean }): void;
        sendToServerDevice(key: string, data: any): void;
        openDeviceUI(): void;
        checkIfCollidersEnabled(): boolean;
        destroy(options: { isBeingReplaced: boolean }): void;
    }

    export type Device = BaseDevice & { [key: string]: any };

    export interface AimCursor {
        aimCursor: GameObjects.Sprite;
        aimCursorWorldPos: Vector;
        centerShiftX: number;
        centerShiftY: number;
        scene: Scene;
        x: number;
        y: number;
        update(): void;
    }

    export interface Cursor {
        scene: Scene;
        createStateListeners(): void;
        updateCursor(): void;
    }

    export interface PressedKeys {
        up: boolean;
        down: boolean;
        left: boolean;
        right: boolean;
    }

    export interface KeyboardState {
        isHoldingDown: boolean;
        isHoldingLeft: boolean;
        isHoldingRight: boolean;
        isHoldingUp: boolean;
        isHoldingSpace: boolean;
    }

    export interface Keyboard {
        heldKeys: Set<number>;
        scene: Scene;
        state: KeyboardState;
        createListeners(): void;
        isKeyDown(key: number): boolean;
    }

    export interface MovementPointer {
        id: string;
        x: number;
        y: number;
        downX: number;
        downY: number;
    }

    export interface Mouse {
        clickListeners: Map<string, (pointer: Input.Pointer) => void>;
        downX: number;
        downY: number;
        isHoldingDown: boolean;
        movementPointer?: MovementPointer;
        scene: Scene;
        stopRunningClickHandlers: boolean;
        worldX: number;
        worldY: number;
        x: number;
        y: number;
        addClickListener(options: { callback: (pointer: Input.Pointer) => void }): () => void;
        pointerUpdate(pointer: Input.Pointer): void;
        removeClickListener(id: string): void;
        shouldBecomeMovementPointer(pointer: Input.Pointer): boolean;
    }

    export interface InputManager {
        aimCursor: AimCursor;
        angleSinceLastPhysicsFetch: AngleInput;
        currentInput: TickInput;
        cursor: Cursor;
        isListeningForInput: boolean;
        jumpedSinceLastPhysicsFetch: boolean;
        keyboard: Keyboard;
        mouse: Mouse;
        physicsInputHandledBetweenUpdates: boolean;
        scene: Scene;
        getAimingDirection(): Vector;
        getInputAngle(): number | null;
        getKeys(): PressedKeys;
        getMouseWorldXY(): Vector;
        getPhysicsInput(): TickInput;
        refreshInput(): void;
        update(): void;
    }

    export interface BackgroundLayersManager {
        layerManager: LayerManager;
        scene: Scene;
        createLayer(options: { layerId: string; depth: number }): void;
        fill(terrain: TerrainOption): void;
        fillForPlatformer(): void;
        fillForTopDown(terrain: TerrainOption): void;
        removeLayer(options: { layerId: string }): void;
    }

    export interface LayerManager {
        backgroundLayersManager: BackgroundLayersManager;
        colliders: Map<string, Map<string, string>>;
        layers: Map<string, Untyped>;
        scene: Scene;
        createInitialLayers(): void;
        createLayer(id: string): void;
        fillBottomLayer(terrain: TerrainOption): void;
        getActualLayerDepth(id: string): number;
        moveLayersAboveCharacters(): void;
        onWorldSizeChange(): void;
    }

    export interface TileKey {
        depth: number;
        x: number;
        y: number;
    }

    export interface TileManager {
        cumulTime: number;
        scene: Scene;
        layerManager: LayerManager;
        damageTileAtXY(x: number, y: number, depth: number, damage: number, healthPercent: number): void;
        destroyTileByTileKey(tileKey: TileKey): void;
        onMapStyleSet(): void;
        regenerateTileAtXY(x: number, y: number, depth: number, healthPercent: number): void;
        update(dt: number): void;
        updateTeamColorTileAtXY(x: number, y: number, depth: number, team?: string, playerId?: string): void;
    }

    export interface Cameras {
        allCameras: Device[];
        allCamerasNeedsUpdate: boolean;
        camerasPlayerIsInside: Untyped[];
        scene: Scene;
        wasInPrePhase: boolean;
        findNewCameras(allCameras: Device[], x: number, y: number): Untyped;
        setCurrentCameraSizeDevice(device: Device): void;
        switchToDefaultCameraSize(reset: boolean): void;
        update(devices: Device[]): void;
    }

    export interface DevicesAction {
        inputManager: InputManager;
        scene: Scene;
        onClick(arg: Untyped): void;
        update(): void;
    }

    export interface DevicesPreview {
        devicePreviewOverlay: Overlay;
        previousDevices: Device[];
        scene: Scene;
        removePreviousDevices(isBeingReplaced: boolean): void;
        update(): void;
    }

    export interface WorldInteractives {
        scene: Scene;
        currentDevice?: Device;
        clearCurrentDevice(): void;
        setCurrentDevice(device: Device): void;
        update(devices: Device[]): void;
        canBeReachedByPlayer(device: Device): boolean;
        findClosestInteractiveDevice(devices: Device[], x: number, y: number): Device | undefined;
    }

    export interface Devices {
        allDevices: Device[];
        cameras: Cameras;
        devicesAction: DevicesAction;
        devicesInView: Device[];
        devicesPreview: DevicesPreview;
        devicesToPostUpdate: Set<Device>;
        devicesToUpdate: Set<Device>;
        interactives: WorldInteractives;
        scene: Scene;
        visualEditingManager: Untyped;
        addDevice(device: Device): void;
        cullDevices(): void;
        findDeviceUnderMouse(): Device | undefined;
        getDeviceById(id: string): Device | undefined;
        hasDevice(id: string): boolean;
        removeDeviceById(id: string, options: { isBeingReplaced: boolean }): void;
        update(dt: number): void;
    }

    export interface CreateTileOptions {
        x: number;
        y: number;
        tileIndex: number;
        terrainOption: TerrainOption;
    }

    export interface InGameTerrainBuilder {
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

    export interface ActiveBodies {
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

    export interface BodyBounds {
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
    }

    export interface BodyStatic {
        bounds: BodyBounds;
        cells: Set<string>;
    }

    export interface GimkitBody {
        collider?: Collider;
        colliderDesc: ColliderDesc;
        rigidBody?: RigidBody;
        rigidBodyDesc: RigidBodyDesc;
        static: BodyStatic;
        device?: { id: string };
        terrain?: { key: string };
    }

    export interface BodyManager {
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

    export interface WorldBoundsCollider {
        body: RigidBody;
        collider: Collider;
    }

    export interface PhysicsManager {
        bodies: BodyManager;
        cumulTime: number;
        lastTime: number;
        physicsStep(dt: number): void;
        runPhysicsLoop(dt: number): void;
        world: World;
        worldBoundsColliders: Set<WorldBoundsCollider>;
    }

    export interface Projectile {
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

    export interface TerrainTimeToWait {
        initial: number;
        subsequent: number;
    }

    export interface BasicDamage {
        markerId: string;
        damage: number;
        x: number;
        y: number;
        timeToWait: TerrainTimeToWait;
    }

    export interface CharacterDamage {
        characterId: string;
        damage: number;
        type: string;
    }

    export interface DamageMarker {
        totalDamage: number;
        yChange: number;
        scale: number;
        alpha: number;
        timeoutTime: number;
        isDisposing: boolean;
        addDamage(damage: BasicDamage): void;
        startDispose(): void;
        update(): void;
        scene: Scene;
        onReadyToDispose(): void;
        onDispose(): void;
        x: number;
        y: number;
        timeToWait: TerrainTimeToWait;
        text: Phaser.GameObjects.Text;
        yChangeTween: Phaser.Tweens.Tween;
        scaleTween: Phaser.Tweens.Tween;
        alphaTween: Phaser.Tweens.Tween;
        readonly depth: number;
    }

    export type BasicDamageMarkerKey = `${string}_${number}_${number}`;

    export interface BasicDamageMarkers {
        markers: Map<BasicDamageMarkerKey, DamageMarker>;
        markersDisposing: Map<BasicDamageMarkerKey, DamageMarker>;
        applyDamage(damage: BasicDamage): void;
        update(): void;
        scene: Scene;
    }

    export interface CharactersDamageMarkers {
        markers: Map<string, DamageMarker>;
        markersDisposing: Map<string, DamageMarker>;
        applyDamage(damage: CharacterDamage): void;
        update(): void;
        scene: Scene;
    }

    export interface DamageMarkers {
        update(): void;
        characters: CharactersDamageMarkers;
        basic: BasicDamageMarkers;
    }

    export interface Explosion {
        hit: boolean;
        characterId?: string;
        position?: Vector;
    }

    export interface CharacterOnScreen {
        id: string;
        teamId: string;
        type: CharacterType;
        x: number;
        y: number;
        scale: number;
    }

    export interface PhaserProjectileUpdateData {
        charactersOnScreen: CharacterOnScreen[];
    }

    export interface FireSlash {
        angle: number;
        loadAndReplaceSprite(): void;
        dispose(): void;
        update(): void;
        scene: Scene;
        characterId: string;
        onDispose(): void;
        sprite: Phaser.GameObjects.Sprite;
        readonly position: Vector;
        readonly depth: number;
    }

    export interface FireSlashOptions {
        characterId: string;
        angle: number;
    }

    export interface FireSlashes {
        slashes: Map<`${number}`, FireSlash>;
        currentId: number;
        addFireSlash(options: FireSlashOptions): void;
        nextId: `${number}`;
        update(): void;
        scene: Scene;
    }

    export interface PhaserProjectile {
        id: string;
        simulationTimeShift: number;
        ownerId: string;
        ownerTeamId: string;
        start: Vector;
        end: Vector;
        startTime: number;
        endTime: number;
        hitTime: number;
        serverHitTime: number;
        exploded: boolean;
        hitDistanceRecord: number;
        radius: number;
        hitPos: Vector;
        hasShownFireSlash: boolean;
        hasPlayedFireSound: boolean;
        isDisposed: boolean;
        explode(explosion: Explosion): void;
        dispose(): void;
        update(data: PhaserProjectileUpdateData): void;
        scene: Scene;
        appearence: CurrentAppearance;
        sprite: Phaser.GameObjects.Image;
    }

    export interface Projectiles {
        damageMarkers: DamageMarkers;
        dynamicDevices: Set<Device>;
        fireSlashes: FireSlashes;
        projectiles: Map<string, PhaserProjectile>;
        projectileJSON: Map<string, Projectile>;
        runClientSidePrediction: boolean;
        scene: Scene;
        addProjectile(projectile: Projectile): void;
        fire(pointer: Input.Pointer, snap: boolean): void;
        update(): void;
    }

    export interface TerrainAddition {
        update(): void;
        inputManager: InputManager;
    }

    export interface PreviewTileOptions {
        x: number;
        y: number;
        depth: number;
        tileIndex: number;
    }

    export interface TerrainAdditionOverlay {
        showing: boolean;
        add(position: Vector): void;
        show(rect: Rect): void;
        hide(): void;
        scene: Scene;
    }

    export interface TerrainAdditionPreview {
        previewingTiles: Vector[];
        createPreviewTile(options: PreviewTileOptions): void;
        clearPreviewLayer(): void;
        update(): void;
        scene: Scene;
        overlay: TerrainAdditionOverlay;
    }

    export interface TerrainLayerAppearance {
        createLayerDepthListeners(): void;
        updateLayerAppearance(): void;
    }

    export interface Terrain {
        update(): void;
        scene: Scene;
        terrainAddition: TerrainAddition;
        terrainAdditionPreview: TerrainAdditionPreview;
        terrainLayerAppearance: TerrainLayerAppearance;
    }

    export interface Wire {
        beamFollowers: Phaser.GameObjects.PathFollower[];
        mouseIsOver: boolean;
        isShowing: boolean;
        isDestroyed: boolean;
        isPreview: boolean;
        boundingBox: Rect;
        createBeam(): void;
        destroyBeam(): void;
        show(): void;
        hide(): void;
        onCullIsShowing(): void;
        onCullIsNotShowing(): void;
        onDeviceChange(): void;
        addEndDevice(): void;
        removeEndDevice(): void;
        updateMousePosition(): void;
        updateBoundingBox(): void;
        updateInteractivity(): void;
        setDirty(): void;
        onMouseOver(pointer: Phaser.Input.Pointer): void;
        onMouseOut(pointer: Phaser.Input.Pointer): void;
        isSetup(): boolean;
        destroy(): void;
        id: string;
        scene: Scene;
        wireManager: WireManager;
        startDeviceId: string;
        endDeviceId: string;
        startConnection?: string;
        endConnection?: string;
        start: Vector;
        end: Vector;
    }

    export type WireKey = `${string}-${string}`;

    export type PointKey = `${number}-${number}`;

    export interface WireOptions {
        startDeviceId: string;
        endDeviceId: string;
    }

    export interface WireOverlay {
        isShowing: boolean;
        show(device: Device): void;
        hide(): void;
        scene: Scene;
    }

    export interface SnapPointManager {
        points: Map<PointKey, Phaser.GameObjects.Arc>;
        tweens: Map<PointKey, Phaser.Tweens.Tween>;
        destroyAllPoints(): void;
        createPoint(x: number, y: number, deviceId: string): void;
        destroyPoint(point: PointKey): void;
        update(): void;
        scene: Scene;
        additionManager: AdditionManager;
    }

    export interface AdditionManager {
        addingWire: boolean;
        update(): void;
        handleClick(): void;
        onAddSessionEnd(): void;
        scene: Scene;
        wireManager: WireManager;
        snapPointManager: SnapPointManager;
    }

    export interface VisibleDependencies {
        isAttemptingToCutDevice: boolean;
        isVisualEditing: boolean;
        inGameVisible: boolean;
        isSavedVersion: boolean;
    }

    export interface VisibilityManager {
        isVisible: boolean;
        visibleDependencies: VisibleDependencies;
        updateDependency(name: keyof VisibleDependencies, value: boolean): void;
        onDependencyChange(): void;
        hideAllWires(): void;
        showAllWires(): void;
        wireManager: WireManager;
    }

    export interface CullingManager {
        update(): void;
        scene: Scene;
        wireManager: WireManager;
    }

    export interface WireActionManager {
        createListeners(): void;
        createListener(): void;
        disposeListener(): void;
        updateClickListener(): void;
        scene: Scene;
    }

    export interface WireManager {
        wires: Map<WireKey, Wire>;
        addWire(options: WireOptions): void;
        deleteWire(key: WireKey): void;
        onDeviceChange(connectedDeviceId: string): void;
        update(): void;
        scene: Scene;
        additionManager: AdditionManager;
        visibilityManager: VisibilityManager;
        cullingManager: CullingManager;
        actionManager: WireActionManager;
    }

    export interface WorldManager {
        devices: Devices;
        inGameTerrainBuilder: InGameTerrainBuilder;
        physics: PhysicsManager;
        projectiles: Projectiles;
        scene: Scene;
        terrain: Terrain;
        wires: WireManager;
        update(dt: number): void;
    }

    export interface Updates {
        update(update: { delta: number }): void;
        updateAlpha(): void;
        updateDepth(): void;
        updatePosition(dt: number): void;
        updateScale(): void;
    }

    export interface TeamState {
        status: string;
        teamId: string;
    }

    export interface TweenAlphaOptions {
        alpha: number;
        type: string;
        duration: number;
        ease?: string;
    }

    export interface Alpha {
        character: Character;
        cinematicModeAlpha: number;
        currentAlpha: number;
        immunity: number;
        phaseAlpha: number;
        playerAppearanceModifierDeviceAlpha: number;
        scene: Scene;
        getCurrentAlpha(): number;
        setAlpha(type: string, alpha: number): void;
        tweenAlpha(options: TweenAlphaOptions): void;
        update(): void;
    }

    export interface TrailEmitter {
        frequency: number;
        quantity: number;
        blendMode: number;
        speed: number;
        speedVariation: number;
        lifetime: number;
        lifetimeVariation: number;
        scale: number;
        scaleVariation: number;
        scaleThreshold: number;
        rotationRandomAtStart: boolean;
        rotationChange: number;
        rotationChangeVariation: number;
        rotationAllowNegativeChange: boolean;
        alphaThresholdStart: number;
        alphaThresholdEnd: number;
        gravityY: number;
        yOriginChange: number;
        emitterZone: Partial<Vector>;
    }

    export interface TrailParticles {
        frameHeight: number;
        frameWidth: number;
        imageUrl: string;
        numberOfFrames: number;
    }

    export interface TrailAppearance {
        id: string;
        emitter: TrailEmitter;
        particles: TrailParticles;
    }

    export interface CharacterTrail {
        character: Character;
        currentAppearance: TrailAppearance;
        currentAppearanceId: string;
        isReady: boolean;
        lastSetAlpha: number;
        destroy(): void;
        followCharacter(): void;
        setNewAppearance(appearance: TrailAppearance): void;
        update(): void;
        updateAppearance(id: string): void;
    }

    export interface Culling {
        character: Character;
        isInCamera: boolean;
        needsCullUpdate: boolean;
        scene: Scene;
        shouldForceUpdate: boolean;
        forceUpdate(): void;
        hideObject(object: Untyped): void;
        onInCamera(): void;
        onOutCamera(): void;
        showObject(object: Untyped): void;
        updateNeedsUpdate(): void;
    }

    export interface Depth {
        character: Character;
        currentDepth: number;
        lastY: number;
        update(): void;
        updateDepth(): void;
    }

    export interface Dimensions {
        character: Character;
        currentDimensionsId: string;
        bottomY: number;
        centerX: number;
        topY: number;
        x: number;
        onPotentialDimensionsChange(): void;
    }

    export interface Flip {
        character: Character;
        flipXLastX: number;
        isFlipped: boolean;
        lastX: number;
        lastY: number;
        update(): void;
        updateFlipForMainCharacter(): void;
        updateFlipForOthers(): void;
    }

    export interface Healthbar extends Updates {
        character: Character;
        depth: number;
        isVisible: boolean;
        scene: Scene;
        destroy(): void;
        makeIndicator(): void;
        updateValue(): void;
    }

    export interface Immunity {
        character: Character;
        classImmunityActive: boolean;
        spawnImmunityActive: boolean;
        activate(): void;
        activateClassImmunity(): void;
        activateSpawnImmunity(): void;
        deactivate(): void;
        deactivateClassImmunity(): void;
        deactivateSpawnImmunity(): void;
        isActive(): boolean;
    }

    export interface ImpactAnimation {
        animations: Map<string, GameObjects.Sprite>;
        character: Character;
        loadedAnimations: Set<string>;
        scene: Scene;
        _play(animation: string): void;
        destroy(): void;
        load(animation: string): void;
        play(animation: string): void;
    }

    export interface Indicator extends Updates {
        character: Character;
        characterHeight: number;
        depth: number;
        image: GameObjects.Image;
        isMain: boolean;
        isSpectated: boolean;
        lastCharacterAlpha: number;
        scene: Scene;
        teamState: TeamState;
        destroy(): void;
        makeIndicator(): void;
    }

    export interface CharacterInput {
        character: Character;
        isListeningForInput: boolean;
        scene: Scene;
        setupInput(): void;
    }

    export interface Nametag {
        alpha: number;
        character: Character;
        creatingTag: boolean;
        depth: number;
        destroyed: boolean;
        followScale: boolean;
        fragilityTag?: GameObjects.Text;
        healthMode: string;
        name: string;
        scale: number;
        scene: Scene;
        tag: GameObjects.Text;
        teamState: TeamState;
        fontColor: string;
        tags: GameObjects.Text[];
        createFragilityTag(): void;
        createTag(): void;
        destroy(): void;
        makeVisibleChanges(force?: boolean): void;
        playHideAnimation(): void;
        playShowUpAnimation(): void;
        setName(name: string): void;
        update(update: { teamState: TeamState }): void;
        updateFontColor(): void;
        updateFragility(fragility: number): void;
        updateTagAlpha(force?: boolean): void;
        updateTagDepth(force?: boolean): void;
        updateTagPosition(force?: boolean): void;
        updateTagScale(force?: boolean): void;
    }

    export interface Network {
        lastAngle?: number;
        lastAngleUpdate: number;
        updateAimAngle(angle: number): void;
    }

    export interface CharacterPosition {
        character: Character;
        update(dt: number): void;
    }

    export interface TweenScaleOptions {
        type: string;
        scale: number;
        duration: number;
    }

    export interface Scale {
        activeScale: number;
        baseScale: number;
        character: Character;
        respawningScale: number;
        scaleX: number;
        scaleY: number;
        scene: Scene;
        spectatorScale: number;
        dependencyScale: number;
        isVisible: boolean;
        getCurrentScale(type: number): void;
        onSkinChange(): void;
        setScale(type: number, scale: number): void;
        tweenScale(options: TweenScaleOptions): void;
        update(): void;
    }

    export interface Shadow {
        character: Character;
        image?: GameObjects.Image;
        createShadow(): void;
        destroy(): void;
        update(): void;
    }

    export interface SkinOptions {
        id: string;
        editStyles?: Record<string, string>;
    }

    export interface SkinSetupOptions extends SkinOptions {
        x?: number;
        y?: number;
    }

    export interface Skin {
        character: Character;
        editStyles?: Record<string, string>;
        latestSkinId: string;
        scene: Scene;
        skinId: string;
        applyEditStyles(options: SkinOptions): void;
        setupSkin(position: SkinSetupOptions): void;
        updateSkin(options: SkinOptions): void;
    }

    export interface TintParams {
        type: string;
        fromColor: string;
        toColor: string;
        duration: number;
        tween?: Tweens.Tween;
        ease(t: number): number;
    }

    export interface Tint {
        character: Character;
        scene: Scene;
        phase?: TintParams;
        playerAppearanceModifierDevice?: TintParams;
        immunity?: TintParams;
        damageBoost?: TintParams;
        getTintParams(type: string): TintParams | undefined;
        setTintParams(type: string, tint?: TintParams): void;
        startAnimateTint(params: TintParams): void;
        stopAnimateTint(type: string): void;
        update(): void;
    }

    export interface VFX {
        character: Character;
        damageBoostActive: boolean;
        phaseActive: boolean;
        tintModifierId: string;
        transparencyModifierId: string;
        setTintModifier(id: string): void;
        setTransparencyModifier(id: string): void;
        startDamageBoostAnim(): void;
        startPhaseAnim(): void;
        stopDamageBoostAnim(): void;
        stopPhaseAnim(): void;
    }

    export interface Character {
        aimingAndLookingAround: AimingAndLookingAround;
        alpha: Alpha;
        animation: CharacterAnimation;
        body: Vector;
        characterTrail: CharacterTrail;
        culling: Culling;
        depth: Depth;
        dimensions: Dimensions;
        flip: Flip;
        healthbar: Healthbar;
        id: string;
        immunity: Immunity;
        impactAnimation: ImpactAnimation;
        indicator: Indicator;
        input: CharacterInput;
        isActive: boolean;
        isDestroyed: boolean;
        isMain: boolean;
        movement: Movement;
        nametag: Nametag;
        network: Network;
        physics: Physics;
        position: CharacterPosition;
        prevBody: Vector;
        scale: Scale;
        scene: Scene;
        shadow: Shadow;
        skin: Skin;
        spine: Untyped; // SpineGameObject from @esotericsoftware/spine-phaser-v3
        teamId: string;
        tint: Tint;
        type: CharacterType;
        vfx: VFX;
        destroy(): void;
        setIsMain(isMain: boolean): void;
        update(dt: number): void;
    }

    export interface ShowOverlayOptions {
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

    export interface DepthSort {
        overlay: Overlay;
        scene: Scene;
        update(): void;
    }

    export interface SelectedDevicesOverlay {
        graphics: GameObjects.Graphics;
        scene: Scene;
        showing: boolean;
        hide(): void;
        show(rects: Rect[]): void;
    }

    export interface MultiSelect {
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

    export interface PlatformerEditing {
        setTopDownControlsActive(active: boolean): void;
    }

    export interface Removal {
        overlay: Overlay;
        prevMouseWasDown: boolean;
        scene: Scene;
        checkForItem(): void;
        createStateListeners(): void;
        removeSelectedItems(): void;
        update(): void;
    }

    export interface ActionManager {
        depthSort: DepthSort;
        multiSelect: MultiSelect;
        platformerEditing: PlatformerEditing;
        removal: Removal;
        update(): void;
    }

    export interface Spectating {
        findNewCharacter(): void;
        onBeginSpectating(): void;
        onEndSpectating(): void;
        setShuffle(shuffle: boolean, save?: boolean): void;
    }

    export interface CharacterOptions {
        id: string;
        x: number;
        y: number;
        scale: number;
        type: CharacterType;
    }

    export interface CharacterManager {
        characterContainer: GameObjects.Container;
        characters: Map<string, Character>;
        scene: Scene;
        spectating: Spectating;
        addCharacter(options: CharacterOptions): Character;
        cullCharacters(): void;
        removeCharacter(id: string): void;
        update(dt: number): void;
    }

    export interface Scene extends BaseScene {
        actionManager: ActionManager;
        cameraHelper: Untyped;
        characterManager: CharacterManager;
        dt: number;
        inputManager: InputManager;
        resizeManager: Untyped;
        shadowsManager: Untyped;
        spine: Untyped;
        tileManager: TileManager;
        uiManager: Untyped;
        worldManager: WorldManager;
        create(): void;
    }

    export interface CharacterPermissions {
        adding: boolean;
        editing: boolean;
        manageCodeGrids: boolean;
        removing: boolean;
    }

    export type CharacterType = "character" | "sentry";

    export interface CharacterInfo {
        allowWeaponFire: boolean;
        existsBeforeReconnect: boolean;
        fragility: number;
        health: number;
        id: string;
        isActive: boolean;
        lastPlayersTeamId: string;
        name: string;
        permissions: CharacterPermissions;
        score: number;
        teamId: string;
        type: CharacterType;
    }

    export interface Characters {
        characters: Map<string, CharacterInfo>;
    }

    export interface Achievement {
        id: string;
        key: string;
        reset(): void;
        update(): void;
    }

    export interface BottomInGamePrimaryContent {
        interactionWantsToBeVisible: boolean;
        prioritizeInteraction: boolean;
    }

    export interface DamageIndicator {
        show: boolean;
        /** `h` for red, `s` for blue, and any other string for yellow. */
        type: string;
    }

    export interface GuiSlot {
        id: string;
        position: string;
        text: string;
        trackedItemId: string | null;
        showTrackedItemMaximumAmount: boolean;
        type: string;
        priority: number;
        color: string;
    }

    export interface KnockoutAlert {
        id: string;
        name: string;
    }

    export interface Modals {
        closeAllModals(): void;
        cosmosModalOpen: boolean;
        switchToRegisterScreenWhenCosmosModalOpens: boolean;
    }

    export interface NoneGui {
        addMenu: { screen: string };
        duringGameScreenVisible: boolean;
        optionsMenu: { screen: string };
        screen: string;
    }

    export interface Scorebar {
        teamColors: string[];
        teams: string[];
    }

    export interface GUI {
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

    export interface ExistingDevice {
        action: string;
        id: string;
        shiftX: number;
        shiftY: number;
        use: boolean;
    }

    export interface AddingDevices {
        currentlySelectedProp: string;
        existingDevice: ExistingDevice;
        selectedDeviceType: string;
    }

    export interface AddingTerrain {
        brushSize: number;
        buildTerrainAsWall: boolean;
        currentlySelectedTerrain: string;
        currentlySelectedTerrainDepth: number;
    }

    export interface AddingWires {
        hoveringOverSupportedDevice: boolean;
        pointUnderMouseDeviceId?: string;
        startDeviceSelected: boolean;
    }

    export interface Adding {
        devices: AddingDevices;
        terrain: AddingTerrain;
        wires: AddingWires;
        mode: string;
    }

    export interface CinematicMode {
        charactersVisible: boolean;
        enabled: boolean;
        followingMainCharacter: boolean;
        hidingGUI: boolean;
        mainCharacterVisible: boolean;
        nameTagsVisible: boolean;
    }

    export interface ClassDesigner {
        activeClassDeviceId: string;
        lastActivatedClassDeviceId: string;
        lastClassDeviceActivationId: number;
    }

    export interface Context {
        cursorIsOverCharacterId: string;
        __devicesUnderCursor: string[];
        __wiresUnderCursor: Set<string>;
        cursorIsOverDevice: boolean;
        cursorIsOverWire: boolean;
    }

    export interface MeCustomAssets {
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

    export interface MeDeviceUI {
        current: { deviceId: string; props: Record<string, any> };
        desiredOpenDeviceId?: string;
        serverVersionOpenDeviceId: string;
    }

    export interface CurrentlyEditedDevice {
        deviceOptionId: string;
        id: string;
    }

    export interface SortingState {
        depth: number;
        deviceId: string;
        deviceName: string;
        globalDepth: number;
        layer: string;
        y: number;
    }

    export interface VisualEditing {
        active: boolean;
        cursor: string;
        id: string;
        instruction: string;
        keyboardHelpers: { trigger: string; action: string }[];
    }

    export interface EditingDevice {
        currentlyEditedDevice: CurrentlyEditedDevice;
        currentlyEditedGridId: string;
        currentlySortedDeviceId: string;
        screen: string;
        sortingState: SortingState[];
        usingMultiselect: boolean;
        visualEditing: VisualEditing;
    }

    export interface EditingPreferences {
        cameraZoom: number;
        movementSpeed: number | null;
        phase: boolean | null;
        showGrid: boolean | null;
        topDownControlsActive: boolean;
    }

    export interface Editing {
        device: EditingDevice;
        preferences: EditingPreferences;
        wire: { currentlyEditedWireId: string };
    }

    export interface Health {
        fragility: number;
        health: number;
        lives: number;
        maxHealth: number;
        maxShield: number;
        shield: number;
    }

    export interface InteractiveInfo {
        action: string;
        allowedToInteract: boolean;
        message: string;
        topHeader?: string;
        topHeaderColor: string;
    }

    export interface Interactives {
        deviceId: string;
        info: InteractiveInfo;
    }

    export interface InteractiveSlot {
        clipSize: number;
        count: number;
        currentClip: number;
        durability: number;
        itemId: string;
        waiting: boolean;
        waitingEndTime: number;
        waitingStartTime: number;
    }

    export interface AlertFeed {
        amount: number;
        itemId: string;
    }

    export interface InventorySlot {
        amount: number;
        existsBeforeReconnect: boolean;
    }

    export interface Inventory {
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

    export interface MobileControls {
        left: boolean;
        right: boolean;
        up: boolean;
    }

    export interface Mood {
        activeDeviceId: string;
        vignetteActive: boolean;
        vignetteStrength: number;
    }

    export interface NonDismissMessage {
        description: string;
        title: string;
    }

    export interface TileToRemove {
        depth: number;
        id: string;
        x: number;
        y: number;
    }

    export interface Removing {
        deviceIdToRemove?: string;
        removingMode: string;
        removingTilesEraserSize: number;
        removingTilesLayer: number;
        removingTilesMode: string;
        tilesToRemove: TileToRemove[];
        wireIdToRemove?: string;
    }

    export interface MeSpectating {
        id: string;
        name: string;
        shuffle: boolean;
    }

    export interface XPAddition {
        amount: number;
        reason: string;
        xp: number;
    }

    export interface XP {
        additionTimeouts: Map<string, ReturnType<typeof setTimeout>>;
        additions: XPAddition[];
        showingLevelUp: boolean;
    }

    export interface ZoneDropOverrides {
        allowItemDrop: boolean;
        allowResourceDrop: boolean;
        allowWeaponDrop: boolean;
    }

    export interface Me {
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
        properties: Map<string, any>;
        removing: Removing;
        roleLevel: number;
        spawnPosition: Vector;
        spectating: MeSpectating;
        teleportCount: number;
        unredeemeedXP: number;
        xp: XP;
        zoneDropOverrides: ZoneDropOverrides;
    }

    export interface Costs {
        codeGrid: number;
        collidingTile: number;
        customAssetDefault: number;
        deviceInitialDefault: number;
        deviceSubsequentDefault: number;
        nonCollidingTile: number;
        wire: number;
    }

    export interface Counters {
        codeGrids: number;
        collidingTiles: number;
        customAssets: Map<string, number>;
        devices: Map<string, number>;
        nonCollidingTiles: number;
        wires: number;
    }

    export interface Limits {
        blocksPerCodeGrid: number;
        codeGrids: number;
        codeGridsPerDevice: number;
        collidingTiles: number;
        customAssetOnMapDefault: number;
        deviceMaxOnMapDefault: number;
        nonCollidingTiles: number;
        wires: number;
    }

    export interface MemorySystem {
        costs: Costs;
        counters: Counters;
        limits: Limits;
        maxUsedMemory: number;
        usedMemoryCost: number;
    }

    export interface CallToActionCategory {
        id: string;
        name: string;
        plural: string;
    }

    export interface CallToActionItem {
        id: string;
        category: string;
        name: string;
        url: string;
    }

    export interface BaseWidget {
        id: string;
        y: number;
        placement: string;
    }

    export interface StatisticWidget extends BaseWidget {
        type: "Statistic";
        gameTimeName: string;
        gameTimeValue: string;
    }

    export interface GameTimeWidget extends BaseWidget {
        type: "Game Time";
        statName: string;
        statValue: number;
    }

    export type Widget = StatisticWidget | GameTimeWidget;

    export type GameSessionPhase = "countdown" | "game" | "results";

    export interface GameSession {
        callToAction: { categories: CallToActionCategory[]; items: CallToActionItem[] };
        countdownEnd: number;

        /**
         * `countdown` either before the game has started or while the game is starting
         *
         * `game` while the game is started
         *
         * `results` after the game ends until the game has been started again
         */
        phase: GameSessionPhase;
        resultsEnd: number;
        widgets: { widgets: Widget[] };
    }

    export type SessionMapStyle = "platformer" | "topDown";
    export type SessionModeType = "liveGame" | "assignment";
    export type SessionPhase = "preGame" | "game";
    export type SessionVersion = "published" | "saved";
    export type OwnerRole = "player" | "spectator";

    export interface Session {
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
        mapStyle: SessionMapStyle;
        modeType: SessionModeType;
        ownerRole: OwnerRole;
        phase: SessionPhase;
        phaseChangedAt: number;
        version: SessionVersion;
    }

    export interface Rect {
        x: number;
        y: number;
        width: number;
        height: number;
    }

    export interface RotatedRect extends Rect {
        angle: number;
    }

    export interface Circle {
        x: number;
        y: number;
        radius: number;
    }

    export interface RotatedCircle extends Circle {
        angle: number;
    }

    export interface Ellipse {
        x: number;
        y: number;
        r1: number;
        r2: number;
    }

    export interface RotatedEllipse extends Ellipse {
        angle: number;
    }

    export interface RectShort {
        x: number;
        y: number;
        w: number;
        h: number;
    }

    export interface RotatedRectShort extends RectShort {
        angle: number;
    }

    export interface CircleShort {
        x: number;
        y: number;
        r: number;
    }

    export interface Shapes {
        circles: number[][];
        lines: number[][];
        paths: number[][];
        rects: number[][];
    }

    export interface CustomAsset {
        data: { shapes: Shapes };
        icon: string;
        id: string;
        name: string;
        optionId: string;
    }

    export interface WorldCustomAssets {
        customAssets: Map<string, CustomAsset>;
        isUIOpen: boolean;
        updateCounter: number;
    }

    export interface CodeGridSchema {
        allowChannelGrids: boolean;
        customBlocks: Untyped[];
        triggers: Untyped[];
    }

    export interface WireConnection {
        id: string;
        name: string;
    }

    export interface DeviceOption {
        codeGridSchema: CodeGridSchema;
        defaultState: Record<string, any>;
        description?: string;
        id: string;
        initialMemoryCost?: number;
        maxOnMap?: number;
        maximumRoleLevel?: number;
        minimumRoleLevel?: number;
        name?: string;
        optionSchema: { options: Untyped[] };
        seasonTicketRequired?: boolean;
        subsequentMemoryCost?: number;
        supportedMapStyles?: string[];
        wireConfig?: {
            in?: { connections: WireConnection[] };
            out?: { connections: WireConnection[] };
        };
    }

    export interface DeviceData {
        depth: number;
        deviceOption: DeviceOption;
        existsBeforeReconnect: boolean;
        hooks: Untyped;
        id: string;
        isPreview: boolean;
        layerId: string;
        name: Untyped;
        options: Record<string, any>;
        props: Record<string, any>;
        x: number;
        y: number;
    }

    export interface CodeGridItem {
        createdAt: number;
        existsBeforeReconnect: boolean;
        json: string;
        triggerType: string;
        owner?: string;
        triggerValue?: string;
        visitors: string[];
    }

    export interface CodeGrid {
        existsBeforeReconnect: boolean;
        items: Map<string, CodeGridItem>;
    }

    export interface DeviceState {
        deviceId: string;
        properties: Map<string, any>;
    }

    export interface WorldDevices {
        codeGrids: Map<string, CodeGrid>;
        devices: Map<string, DeviceData>;
        states: Map<string, DeviceState>;
    }

    export interface Tile {
        collides: boolean;
        depth: number;
        terrain: string;
        x: number;
        y: number;
    }

    export interface QueuedTile {
        timestamp: number;
        removedBodyIds: string[];
    }

    export interface Terrain {
        currentTerrainUpdateId: number;
        modifiedHealth: Map<string, number>;
        queuedTiles: Map<number, QueuedTile>;
        teamColorTiles: Map<string, string>;
        tiles: Map<string, Tile>;
    }

    export interface GimkitWorld {
        customAssets: WorldCustomAssets;
        devices: WorldDevices;
        height: number;
        width: number;
        mapOptionsJSON: string;
        terrain: Terrain;
        wires: { wires: Map<string, Untyped> };
    }

    export interface Shapes {
        circles: number[][];
        lines: number[][];
        paths: number[][];
        rects: number[][];
    }

    export interface CustomAsset {
        data: { shapes: Shapes };
        icon: string;
        id: string;
        name: string;
        optionId: string;
    }

    export interface WorldCustomAssets {
        customAssets: Map<string, CustomAsset>;
        isUIOpen: boolean;
        updateCounter: number;
    }

    export interface CodeGridSchema {
        allowChannelGrids: boolean;
        customBlocks: Untyped[];
        triggers: Untyped[];
    }

    export interface WireConnection {
        id: string;
        name: string;
    }

    export interface DeviceOption {
        codeGridSchema: CodeGridSchema;
        defaultState: Record<string, any>;
        description?: string;
        id: string;
        initialMemoryCost?: number;
        maxOnMap?: number;
        maximumRoleLevel?: number;
        minimumRoleLevel?: number;
        name?: string;
        optionSchema: { options: Untyped[] };
        seasonTicketRequired?: boolean;
        subsequentMemoryCost?: number;
        supportedMapStyles?: string[];
        wireConfig?: {
            in?: { connections: WireConnection[] };
            out?: { connections: WireConnection[] };
        };
    }

    export interface DeviceData {
        depth: number;
        deviceOption: DeviceOption;
        existsBeforeReconnect: boolean;
        hooks: Untyped;
        id: string;
        isPreview: boolean;
        layerId: string;
        name: Untyped;
        options: Record<string, any>;
        props: Record<string, any>;
        x: number;
        y: number;
    }

    export interface CodeGridItem {
        createdAt: number;
        existsBeforeReconnect: boolean;
        json: string;
        triggerType: string;
        owner?: string;
        triggerValue?: string;
        visitors: string[];
    }

    export interface CodeGrid {
        existsBeforeReconnect: boolean;
        items: Map<string, CodeGridItem>;
    }

    export interface DeviceState {
        deviceId: string;
        properties: Map<string, any>;
    }

    export interface WorldDevices {
        codeGrids: Map<string, CodeGrid>;
        devices: Map<string, DeviceData>;
        states: Map<string, DeviceState>;
    }

    export interface Tile {
        collides: boolean;
        depth: number;
        terrain: string;
        x: number;
        y: number;
    }

    export interface QueuedTile {
        timestamp: number;
        removedBodyIds: string[];
    }

    export interface Terrain {
        currentTerrainUpdateId: number;
        modifiedHealth: Map<string, number>;
        queuedTiles: Map<number, QueuedTile>;
        teamColorTiles: Map<string, string>;
        tiles: Map<string, Tile>;
    }

    export interface GimkitWorld {
        customAssets: WorldCustomAssets;
        devices: WorldDevices;
        height: number;
        width: number;
        mapOptionsJSON: string;
        terrain: Terrain;
        wires: { wires: Map<string, Untyped> };
    }

    export interface CodeGrids {
        blockCategories: string;
        customBlocks: string;
        customBlocksParsed: Untyped[];
    }

    export interface OptionSchema {
        options: Untyped[];
        categories?: Untyped[];
    }

    export interface DeviceInfo {
        id: string;
        name: string;
        description?: string;
        optionSchema: OptionSchema;
        defaultState: any;
        codeGridSchema: CodeGridSchema;
        wireConfig?: Untyped;
        minimumRoleLevel?: number;
        maxOnMap?: number;
        initialMemoryCost?: number;
        subsequentMemoryCost?: number;
        supportedMapStyles?: string[];
        seasonTicketRequired?: boolean;
        maximumRoleLevel?: number;
    }

    export interface ItemOption {
        type: string;
        id: string;
        name: string;
        editorName: string;
        description: string;
        previewImage: string;
        rarity?: string;
        weapon?: Weapon;
        minimumRoleLevel?: number;
        useCommand?: string;
        consumeType?: string;
        terrainId?: string;
        maxStackSize?: number;
    }

    export interface Weapon {
        type: string;
        appearance: string;
        shared: WeaponShared;
        bullet?: { ammoItemId: string };
    }

    export interface WeaponShared {
        cooldownBetweenShots: number;
        allowAutoFire: boolean;
        startingProjectileDistanceFromCharacter: number;
    }

    export interface PropOption {
        id: string;
        name: string;
        scaleMultip: number;
        originX: number;
        originY: number;
        imageUrl: string;
        rectColliders: RotatedRectShort[];
        circleColliders: CircleShort[];
        ellipseColliders: RotatedEllipse[];
        shadows: Ellipse[];
        seasonTicketRequired?: boolean;
        minimumRoleLevel?: number;
        defaultLayer?: string;
    }

    export interface SkinOption {
        id: string;
        name: string;
        minimumRoleLevel?: number;
    }

    export interface TerrainOption {
        id: string;
        name: string;
        maskTilesUrl: string;
        borderTilesUrl: string;
        fillUrl: string;
        blockedMapStyles?: string[];
        seasonTicketRequired?: boolean;
        previewUrl: string;
        health?: number;
        minimumRoleLevel?: number;
    }

    export interface CustomAssetOption {
        id: string;
        maxOnMap: number;
        memoryCost: number;
        minimumRoleLevel?: number;
        validate: Untyped;
    }

    export interface WorldOptions {
        codeGrids: CodeGrids;
        customAssetsOptions: CustomAssetOption[];
        deviceOptions: DeviceInfo[];
        hasAllProps: boolean;
        itemOptions: ItemOption[];
        propsOptions: PropOption[];
        skinOptions: SkinOption[];
        terrainOptions: TerrainOption[];
    }

    export interface ActivityFeed {
        feedItems: {
            id: string;
            message: string;
        }[];
    }

    export interface Assignment {
        hasSavedProgress: boolean;
        objective: string;
        percentageComplete: number;
    }

    export interface EditingStore {
        accessPoints: Map<string, { name: string; position: Vector }>;
        gridSnap: number;
        showMemoryBarAtAllTimes: boolean;
    }

    export interface Hooks {
        hookJSON: string;
    }

    export interface Loading {
        completedInitialLoad: boolean;
        loadedInitialDevices: boolean;
        loadedInitialTerrain: boolean;
        percentageAssetsLoaded: number;
    }

    export interface Matchmaker {
        gameCode: string;
    }

    export interface NetworkStore {
        attemptingToConnect: boolean;
        attemptingToReconnect: boolean;
        authId: string;
        client: Untyped; // colyseus.js Client type
        clientConnectionString: string;
        error: Untyped;
        errorFindingServerForGame: boolean;
        errorJoiningRoom: boolean;
        failedToReconnect: boolean;
        findingServerForGame: boolean;
        hasJoinedRoom: boolean;
        isOffline: boolean;
        isUpToDateWithPingPong: boolean;
        joinedRoom: boolean;
        phaseBeforeReconnect: string | null;
        ping: number;
        room: Untyped; // colyseus.js Room type
        roomIntentErrorMessage: string;
        syncingAfterReconnection: boolean;
    }

    export interface PhaserStore {
        mainCharacter: Character;
        mainCharacterTeleported: boolean;
        scene: Scene;
    }

    export interface SceneStore {
        currentScene: string;
        gpuTier: number;
        isCursorOverCanvas: boolean;
    }

    export interface Team {
        characters: string[];
        id: string;
        name: string;
        score: number;
    }

    export interface Teams {
        teams: Map<string, Team>;
        updateCounter: number;
    }

    /** The stores type is incomplete and is not guaranteed to be accurate */
    export interface Stores {
        activityFeed: ActivityFeed;
        assignment: Assignment;
        characters: Characters;
        editing: EditingStore;
        gui: GUI;
        hooks: Hooks;
        loading: Loading;
        matchmaker: Matchmaker;
        me: Me;
        memorySystem: MemorySystem;
        network: NetworkStore;
        phaser: PhaserStore;
        scene: SceneStore;
        session: Session;
        teams: Teams;
        world: GimkitWorld;
        worldOptions: WorldOptions;
    }
}
