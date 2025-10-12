import type Character from './character';

interface CharacterState {
    grounded: boolean;
}

export default interface Animation {
    availableAnimations: string[];
    blinkTimer: number;
    bodyAnimationLocked: boolean;
    bodyAnimationStartedAt: number;
    character: Character;
    currentBodyAnimation: string;
    currentEyeAnimation: string;
    destroy: () => void;
    lastGroundedAnimationAt: number;
    nonMainCharacterState: CharacterState;
    onAnimationComplete: (callback: () => void) => void;
    onSkinChanged: any;
    playAnimationOrClearTrack: any;
    playBodyAnimation: any;
    playBodySupplementalAnimation: any;
    playEyeAnimation: any;
    playJumpSupplementalAnimation: any;
    playMovementSupplementalAnimation: any;
    prevNonMainCharacterState: any;
    setupAnimations: () => void;
    skinChanged: boolean;
    startBlinkAnimation: () => void;
    stopBlinkAnimation: () => void;
    update: any;
}