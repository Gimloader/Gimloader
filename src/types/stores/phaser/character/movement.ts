import type Character from './character';

interface Point {
    endTime: number;
    endX: number;
    endY: number;
    startTime: number;
    startX: number;
    startY: number;
    teleported: boolean;
    usedTeleported: boolean;
}

interface EndInfo {
    end: number;
    start: number;
    x: number;
    y: number;
}

export default interface Movement {
    character: Character;
    currentPoint: Point;
    currentTime: number;
    getCurrentEndInfo: () => EndInfo;
    moveToTargetPosition: () => void;
    nonMainCharacterGrounded: boolean;
    onMainCharacterTeleport: any;
    pointMap: Point[];
    postPhysicsUpdate: any;
    setNonMainCharacterTargetGrounded: any;
    setTargetX: any;
    setTargetY: any;
    setTeleportCount: any;
    targetIsDirty: boolean;
    targetNonMainCharacterGrounded: boolean;
    targetX: number;
    targetY: number;
    teleported: boolean;
    update: () => void;
}