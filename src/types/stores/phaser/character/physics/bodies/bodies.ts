import type { Coords } from '$types/stores/common';
import type { Shape } from '../common';
import type {
    ColliderPrototype,
    ControllerPrototype,
    ParamsPrototype,
    ParamsRawPrototype,
    ParentPrototype,
    QueryPrototype,
    QueryRawPrototype,
    SensorPrototype
} from './prototypes';

interface Parent extends ParentPrototype {
    // complex type
    colliderSet: any;
    handle: number;
    rawSet: RawPtr;
    userData: { id: string };
}

interface Sensor extends SensorPrototype {
    // Complex type
    _parent: Parent;
    _shape: Shape;
    colliderSet: any;
    handle: number;
}

interface RawPtr {
    ptr: number;
}

interface Params extends ParamsPrototype {
    raw: RawPtr & ParamsRawPrototype;
}

interface Queries extends QueryPrototype {
    raw: RawPtr & QueryRawPrototype;
}

interface Controller extends ControllerPrototype {
    _applyImpulsesToDynamicBodies: boolean;
    _characterMass: number;
    bodies: any;
    colliders: any;
    params: Params;
    queries: Queries;
    rawCharacterCollision: RawPtr;
}

interface BodyCharacter {
    aroundSensor: Sensor;
    controller: Controller;
    feetSensor: Sensor;
    id: string;
    ignoredStaticBodies: Set<any>;
    ignoredTileBodies: Set<any>;
}

interface RigidBody {
    colliderSet: any;
    handle: number;
    rawSet: RawPtr;
    userData: { id: string; };
}

interface ColliderShape extends Shape {
    halfHeight: number;
}

interface ColliderDescription extends ColliderPrototype {
    activeCollisionTypes: number;
    activeEvents: number;
    activeHooks: number;
    centerOfMass: Coords;
    collisionGroups: number;
    contactForceEventThreshold: number;
    density: number;
    enabled: boolean;
    friction: number;
    frictionCombineRule: number;
    isSensor: boolean;
    mass: number;
    massPropsMode: number;
    principalAngularInertia: number;
    restitution: number;
    restitutionCombineRule: number;
    rotation: number;
    rotationsEnabled: boolean;
    shape: ColliderShape;
    solverGroups: number;
    translation: Coords;
}

export default interface Bodies {
    character: BodyCharacter;
    //Low level raw data, not gonna doc
    collider: any;
    colliderDesc: ColliderDescription;
    rigidBody: RigidBody;
}