import type Scene from '../../scene/scene';
import type Character from '../character';
import type Bodies from './bodies/bodies';
import type State from './state';

interface Input {
    _jumpKeyPressed: boolean;
    activeClassDeviceId: string;
    angle: null | number;
    ignoredStaticBodies: Set<any>;
    ignoredTileBodies: Set<any>;
    jump: boolean;
    projectileHitForcesQueue: Set<any>;
}

export default interface Physics {
    character: Character;
    currentPacketId: number;
    destroy: () => void;
    frameInputsHistory: Map<number, Input>;
    getBody: () => Bodies;
    justAppliedProjectileHitForces: Set<any>;
    lastClassDeviceActivationId: number;
    lastPacketSent: number[];
    lastSentClassDeviceActivationId: number;
    lastSentTerrainUpdateId: number;
    lastTerrainUpdateId: number;
    newlyAddedTileBodies: Set<any>;
    phase: boolean;
    physicsBodyId: string;
    postUpdate: any;
    preUpdate: any;
    prevState: State;
    projectileHitForcesHistory: Map<any, any>;
    projectileHitForcesQueue: Set<any>;
    scene: Scene;
    sendToServer: any;
    setServerPosition: any;
    setupBody: any;
    state: State;
    tickInput: Input;
    updateDebugGraphics: any;
}