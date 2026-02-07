import type Scene from "./scene";
import type AimingAndLookingAround from "./character/aimingAndLookingAround";
import type CharacterAnimation from "./character/animation";
import type Movement from "./character/movement";
import type Physics from "./character/physics";
import type { Vector } from "@dimforge/rapier2d-compat";
import type { GameObjects, Tweens } from "phaser";

interface Updates {
    update(update: { delta: number }): void;
    updateAlpha(): void;
    updateDepth(): void;
    updatePosition(dt: number): void;
    updateScale(): void;
}

interface TeamState {
    status: string;
    teamId: string;
}

interface TweenAlphaOptions {
    alpha: number;
    type: string;
    duration: number;
    ease?: string;
}

interface Alpha {
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

interface TrailEmitter {
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

interface TrailParticles {
    frameHeight: number;
    frameWidth: number;
    imageUrl: string;
    numberOfFrames: number;
}

interface TrailAppearance {
    id: string;
    emitter: TrailEmitter;
    particles: TrailParticles;
}

interface CharacterTrail {
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

interface Culling {
    character: Character;
    isInCamera: boolean;
    needsCullUpdate: boolean;
    scene: Scene;
    shouldForceUpdate: boolean;
    forceUpdate(): void;
    hideObject(object: any): void;
    onInCamera(): void;
    onOutCamera(): void;
    showObject(object: any): void;
    updateNeedsUpdate(): void;
}

interface Depth {
    character: Character;
    currentDepth: number;
    lastY: number;
    update(): void;
    updateDepth(): void;
}

interface Dimensions {
    character: Character;
    currentDimensionsId: string;
    bottomY: number;
    centerX: number;
    topY: number;
    x: number;
    onPotentialDimensionsChange(): void;
}

interface Flip {
    character: Character;
    flipXLastX: number;
    isFlipped: boolean;
    lastX: number;
    lastY: number;
    update(): void;
    updateFlipForMainCharacter(): void;
    updateFlipForOthers(): void;
}

interface Healthbar extends Updates {
    character: Character;
    depth: number;
    isVisible: boolean;
    scene: Scene;
    destroy(): void;
    makeIndicator(): void;
    updateValue(): void;
}

interface Immunity {
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

interface ImpactAnimation {
    animations: Map<string, GameObjects.Sprite>;
    character: Character;
    loadedAnimations: Set<string>;
    scene: Scene;
    _play(animation: string): void;
    destroy(): void;
    load(animation: string): void;
    play(animation: string): void;
}

interface Indicator extends Updates {
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

interface CharacterInput {
    character: Character;
    isListeningForInput: boolean;
    scene: Scene;
    setupInput(): void;
}

interface Nametag {
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

interface Network {
    lastAngle?: number;
    lastAngleUpdate: number;
    updateAimAngle(angle: number): void;
}

interface CharacterPosition {
    character: Character;
    update(dt: number): void;
}

interface TweenScaleOptions {
    type: string;
    scale: number;
    duration: number;
}

interface Scale {
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

interface Shadow {
    character: Character;
    image?: GameObjects.Image;
    createShadow(): void;
    destroy(): void;
    update(): void;
}

interface SkinOptions {
    id: string;
    editStyles?: Record<string, string>;
}

interface SkinSetupOptions extends SkinOptions {
    x?: number;
    y?: number;
}

interface Skin {
    character: Character;
    editStyles?: Record<string, string>;
    latestSkinId: string;
    scene: Scene;
    skinId: string;
    applyEditStyles(options: SkinOptions): void;
    setupSkin(position: SkinSetupOptions): void;
    updateSkin(options: SkinOptions): void;
}

interface TintParams {
    type: string;
    fromColor: string;
    toColor: string;
    duration: number;
    tween?: Tweens.Tween;
    ease(t: number): number;
}

interface Tint {
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

interface VFX {
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

export default interface Character {
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
    spine: any; // SpineGameObject from @esotericsoftware/spine-phaser-v3
    teamId: string;
    tint: Tint;
    type: string;
    vfx: VFX;
    destroy(): void;
    setIsMain(isMain: boolean): void;
    update(dt: number): void;
}
