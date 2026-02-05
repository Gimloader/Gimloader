import type Character from "../character";

interface NonMainCharacterState {
    grounded: boolean;
}

export default interface CharacterAnimation {
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
    onAnimationComplete(options: any): void;
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
