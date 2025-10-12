import type Character from './character';

interface SoundEffect {
    path: string;
    volume: number;
}

interface BaseAsset {
    frameHeight: number;
    frameRate: number;
    frameWidth: number;
    imageUrl: string;
    scale: number;
}

interface ImpactAsset extends BaseAsset {
    frames: number[];
    hideIfNoHit: boolean;
}

interface WeaponAsset extends BaseAsset {
    fireFrames: number[];
    fromCharacterCenterRadius: number;
    hideFireSlash: boolean;
    idleFrames: number;
    originX: number;
    originY: number;
}

interface CurrentAppearance {
    explosionSfx: SoundEffect[];
    fireSfx: SoundEffect[];
    id: string;
    //TODO: get these for other gamemodes
    impact: ImpactAsset;
    weapon: WeaponAsset;
}

export default interface AimingAndLookingAround {
    angleTween: any;
    character: Character;
    characterShouldFlipX: () => boolean;
    currentAngle: number;
    currentAppearance: CurrentAppearance;
    currentWeaponId?: any;
    destroy: () => void;
    isAiming: boolean;
    isCurrentlyAiming: () => boolean;
    lastUsedAngle: number;
    onInventoryStateChange: () => void;
    playFireAnimation: () => void;
    setImage: any;
    setSpriteParams: any;
    setTargetAngle: any;
    //Complex phaser interface
    sprite: any;
    targetAngle: number;
    update: () => void;
    updateAnotherCharacter: any;
    updateMainCharacterMouse: any;
    updateMainCharacterTouch: any;
}