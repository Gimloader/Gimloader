import type Scene from "../scene";
import type Character from "../character";
import type { Collider, ColliderDesc, RigidBody, RigidBodyDesc, Vector } from "@dimforge/rapier2d-compat";

interface Jump {
    /** Optional in top-down, required in platformer */
    actuallyJumped?: boolean;
    isJumping: boolean;
    jumpCounter: number;
    jumpTicks: number;
    jumpsLeft: number;
    xVelocityAtJumpStart: number;
}

interface MovementState {
    accelerationTicks: number;
    direction: string;
    xVelocity: number;
}

interface PhysicsState {
    forces: any[];
    gravity: number;
    grounded: boolean;
    groundedTicks: number;
    jump: Jump;
    lastGroundedAngle: number;
    movement: MovementState;
    velocity: Vector;
}

interface PhysicsInput {
    _jumpKeyPressed: boolean;
    activeClassDeviceId: string;
    angle: number;
    ignoredStaticBodies: Set<any>;
    ignoredTileBodies: Set<any>;
    jump: boolean;
    projectileHitForcesQueue: Set<any>;
}

interface Bodies {
    character: Character;
    collider: Collider;
    colliderDesc: ColliderDesc;
    rigidBody: RigidBody;
    rigidBodyDesc: RigidBodyDesc;
}

interface ServerPosition {
    packet: number;
    x: number;
    y: number;
    jsonState: string;
    teleport: boolean;
}

export interface TickInput {
    angle: number | null;
    jump: boolean;
    _jumpKeyPressed: boolean;
}

export default interface Physics {
    character: Character;
    currentPacketId: number;
    frameInputsHistory: Map<number, PhysicsInput>;
    justAppliedProjectileHitForces: Set<any>;
    lastClassDeviceActivationId: number;
    lastPacketSent: number[];
    lastSentClassDeviceActivationId: number;
    lastSentTerrainUpdateId: number;
    lastTerrainUpdateId: number;
    newlyAddedTileBodies: Set<any>;
    phase: boolean;
    physicsBodyId: string;
    prevState: PhysicsState;
    projectileHitForcesHistory: Map<any, any>;
    projectileHitForcesQueue: Set<any>;
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
