import type Scene from '../scene/scene';
import type AimingAndLookingAround from './aimingAndLookingAround';
import type Animation from './animation';
import type { TeamState, Updates } from './common';
import type { Coords } from '$types/stores/common';
import type Movement from './movement';
import type Physics from './physics/physics';

interface Alpha {
    character: Character;
    cinematicModeAlpha: number;
    currentAlpha: number;
    getCurrentAlpha: any;
    immunity: number;
    phaseAlpha: number;
    playerAppearanceModifierDeviceAlpha: number;
    scene: Scene;
    setAlpha: any;
    tweenAlpha: any;
    update: () => void;
}

interface CharacterTrail {
    character: Character;
    currentAppearance: any;
    currentAppearanceId: string;
    destroy: () => void;
    followCharacter: () => void;
    isReady: boolean;
    lastSetAlpha: number;
    setNewAppearance: any;
    update: () => void;
    updateAppearance: any;
}

interface Culling {
    character: Character;
    forceUpdate: () => void;
    hideObject: any;
    isInCamera: boolean;
    needsCullUpdate: boolean;
    onInCamera: any;
    onOutCamera: any;
    scene: Scene;
    shouldForceUpdate: boolean;
    showObject: any;
    updateNeedsUpdate: any;
}

interface Depth {
    character: Character;
    currentDepth: number;
    lastY: number;
    update: () => void;
    updateDepth: any;
}

interface Dimentions {
    character: Character;
    currentDimensionsId: string;
    onPotentialDimensionsChange: any;
}

interface Flip {
    character: Character;
    flipXLastX: number;
    isFlipped: boolean;
    lastX: number;
    lastY: number;
    update: () => void;
    updateFlipForMainCharacter: () => void;
    updateFlipForOthers: () => void;
}

interface Healthbar extends Updates {
    character: Character;
    depth: number;
    destroy: () => void;
    isVisible: boolean;
    makeIndicator: any;
    scene: Scene;
    updateValue: any;
}

interface Immunity {
    activate: () => void;
    activateClassImmunity: () => void;
    activateSpawnImmunity: () => void;
    character: Character;
    classImmunityActive: boolean;
    deactivate: () => void;
    deactivateClassImmunity: () => void;
    deactivateSpawnImmunity: () => void;
    isActive: () => boolean;
    spawnImmunityActive: boolean;
}

interface ImpactAnimation {
    _play: any;
    animations: Map<any, any>;
    character: Character;
    destroy: () => void;
    load: any;
    loadedAnimations: Set<string>;
    play: any;
    scene: Scene;
}

interface Indicator extends Updates {
    character: Character;
    characterHeight: number;
    depth: number;
    destroy: () => void;
    //Complex phaser interface
    image: any;
    isMain: boolean;
    isSpectated: boolean;
    lastCharacterAlpha: number;
    makeIndicator: any;
    scene: Scene;
    teamState: TeamState;
}

interface Input {
    character: Character;
    isListeningForInput: boolean;
    scene: Scene;
    setupInput: any;
}

interface Nametag {
    alpha: number;
    character: Character;
    createFragilityTag: any;
    createTag: any;
    creatingTag: boolean;
    depth: number;
    destroy: () => void;
    destroyed: boolean;
    followScale: boolean;
    fragilityTag: any;
    healthMode: string;
    makeVisibleChanges: any;
    name: string;
    playHideAnimation: () => void;
    playShowUpAnimation: () => void;
    scale: number;
    scene: Scene;
    setName: (name: string) => void;
    //Complex phaser interface
    tag: any;
    teamState: TeamState;
    update: any;
    updateFontColor: any;
    updateFragility: any;
    updateTagAlpha: any;
    updateTagDepth: any;
    updateTagPosition: any;
    updateTagScale: any;
}

interface Network {
    lastAngle: number;
    lastAngleUpdate: number;
    updateAimAngle: (angle: number) => void;
}

interface Position {
    character: Character;
    update: () => void;
}

interface Scale {
    activeScale: number;
    baseScale: number;
    character: Character;
    getCurrentScale: any;
    onSkinChange: any;
    respawningScale: number;
    scaleX: number;
    scaleY: number;
    scene: Scene;
    setScale: any;
    spectatorScale: number;
    tweenScale: any;
    update: any;
    dependencyScale: number;
    isVisible: boolean;
}

interface Shadow {
    character: Character;
    createShadow: any;
    destroy: any;
    update: any;
}

interface Skin {
    applyEditStyles: any;
    character: Character;
    editStyles: any;
    latestSkinId: string;
    scene: Scene;
    setupSkin: any;
    skinId: string;
    updateSkin: any;
}

interface Tint {
    character: Character;
    getTintParams: any;
    scene: Scene;
    setTintParams: any;
    startAnimateTint: any;
    stopAnimateTint: any;
    update: any;
}

interface VFX {
    character: Character;
    damageBoostActive: boolean;
    phaseActive: boolean;
    setTintModifier: any;
    setTransparencyModifier: any;
    startDamageBoostAnim: any;
    startPhaseAnim: any;
    stopDamageBoostAnim: any;
    stopPhaseAnim: any;
    tintModifierId: string;
    transparencyModifierId: string;
}

export default interface Character {
    aimingAndLookingAround: AimingAndLookingAround;
    alpha: Alpha;
    animation: Animation;
    body: Coords;
    characterTrail: CharacterTrail;
    culling: Culling;
    depth: Depth;
    destroy: () => void;
    dimentions: Dimentions;
    flip: Flip;
    healthbar: Healthbar;
    id: string;
    immunity: Immunity;
    impactAnimation: ImpactAnimation;
    indicator: Indicator;
    input: Input;
    isActive: boolean;
    isDestroyed: boolean;
    isMain: boolean;
    movement: Movement;
    nametag: Nametag;
    network: Network;
    physics: Physics;
    position: Position;
    prevBody: Coords;
    scale: Scale;
    scene: Scene;
    setIsMain: any;
    shadow: Shadow;
    skin: Skin;
    spine: any;
    teamId: string;
    tint: Tint;
    type: string;
    update: any;
    vfx: VFX;
}