import type { Coords } from '$types/stores/common';

interface Jump {
    actuallyJumped: boolean;
    isJumping: boolean;
    jumpCounter: number;
    jumpTicks: number;
    jumpsLeft: number;
    xVelocityAtJumpStart: number;
}

interface Movement {
    accelerationTicks: number;
    direction: string;
    xVelocity: number;
}

export default interface State {
    forces: any[];
    gravity: number;
    grounded: boolean;
    groundedTicks: number;
    jump: Jump;
    lastGroundedAngle: number;
    movement: Movement;
    velocity: Coords;
}