import type { Shape } from '../common';

export interface SensorPrototype {
    activeCollisionTypes: any;
    activeEvents: any;
    activeHooks: any;
    castCollider: any;
    castRay: any;
    castRayAndGetNormal: any;
    castShape: any;
    collisionGroups: any;
    contactCollider: any;
    contactForceEventThreshold: any;
    contactShape: any;
    containsPoint: any;
    density: any;
    ensureShapeIsCached: any;
    finalizeDeserialization: any;
    friction: any;
    frictionCombineRule: any;
    halfExtents: any;
    halfHeight: any;
    heightfieldHeights: any;
    heightfieldScale: any;
    indices: any;
    intersectsRay: any;
    intersectsShape: any;
    isEnabled: () => boolean;
    isSensor: () => boolean;
    isValid: () => boolean;
    mass: any;
    parent: any;
    projectPoint: any;
    radius: any;
    restitution: any;
    restitutionCombineRule: any;
    rotation: any;
    roundRadius: any;
    setActiveCollisionTypes: any;
    setActiveEvents: any;
    setActiveHooks: any;
    setCollisionGroups: any;
    setContactForceEventThreshold: any;
    setDensity: any;
    setEnabled: any;
    setFriction: any;
    setFrictionCombineRule: any;
    setHalfExtents: any;
    setHalfHeight: any;
    setMass: any;
    setMassProperties: any;
    setRadius: any;
    setRestitution: any;
    setRestitutionCombineRule: any;
    setRotation: any;
    setRotationWrtParent: any;
    setRoundRadius: any;
    setSensor: any;
    setShape: any;
    setSolverGroups: any;
    setTranslation: any;
    setTranslationWrtParent: any;
    shape: Shape;
    shapeType: any;
    solverGroups: any;
    translation: any;
    vertices: any;
    volume: any;
}

export interface ParentPrototype {
    addForce: any;
    addForceAtPoint: any;
    addTorque: any;
    angularDamping: any;
    angvel: any;
    applyImpulse: any;
    applyImpulseAtPoint: any;
    applyTorqueImpulse: any;
    bodyType: any;
    collider: any;
    dominanceGroup: any;
    effectiveAngularInertia: any;
    effectiveInvMass: any;
    effectiveWorldInvInertiaSqrt: any;
    enableCcd: any;
    finalizeDeserialization: any;
    gravityScale: any;
    invMass: any;
    invPrincipalInertiaSqrt: any;
    isCcdEnabled: any;
    isDynamic: any;
    isEnabled: any;
    isFixed: any;
    isKinematic: any;
    isMoving: any;
    isSleeping: any;
    isValid: any;
    linearDamping: any;
    linvel: any;
    localCom: any;
    lockRotations: any;
    lockTranslations: any;
    mass: any;
    nextRotation: any;
    nextTranslation: any;
    numColliders: any;
    principalInertia: any;
    recomputeMassPropertiesFromColliders: any;
    resetForces: any;
    resetTorques: any;
    restrictTranslations: any;
    rotation: any;
    setAdditionalMass: any;
    setAdditionalMassProperties: any;
    setAngularDamping: any;
    setAngvel: any;
    setBodyType: any;
    setDominanceGroup: any;
    setEnabled: any;
    setEnabledTranslations: any;
    setGravityScale: any;
    setLinearDamping: any;
    setLinvel: any;
    setNextKinematicRotation: any;
    setNextKinematicTranslation: any;
    setRotation: any;
    setTranslation: any;
    sleep: any;
    translation: any;
    wakeUp: any;
    worldCom: any;
}

export interface ParamsPrototype {
    allowedLinearError: number;
    dt: number;
    erp: number;
    free: any;
    maxCcdSubsteps: number;
    maxStabilizationIterations: number;
    maxVelocityFrictionIterations: number;
    maxVelocityIterations: number;
    minIslandSize: number;
    predictionDistance: number;
}

export interface ParamsRawPrototype extends ParamsPrototype {
    __destroy_into_raw: any;
}

export interface QueryPrototype {
    castRay: any;
    castRayAndGetNormal: any;
    castShape: any;
    collidersWithAabbIntersectingAabb: any;
    free: any;
    intersectionWithShape: any;
    intersectionsWithPoint: any;
    intersectionsWithRay: any;
    intersectionsWithShape: any;
    projectPoint: any;
    projectPointAndGetFeature: any;
    update: any;
}

export interface QueryRawPrototype extends QueryPrototype {
    __destroy_into_raw: any;
}

export interface ColliderPrototype {
    setActiveCollisionTypes: any;
    setActiveHooks: any;
    setCollisionGroups: any;
    setContactForceEventThreshold: any;
    setDensity: any;
    setEnabled: any;
    setFriction: any;
    setFrictionCombineRule: any;
    setMass: any;
    setMassProperties: any;
    setRestitution: any;
    setRestitutionCombineRule: any;
    setRotation: any;
    setSensor: any;
    setSolverGroups: any;
    setTranslation: any;
}

export interface ControllerPrototype {
    applyImpulsesToDynamicBodies: any;
    autostepEnabled: any;
    autostepIncludesDynamicBodies: any;
    autostepMaxHeight: any;
    autostepMinWidth: any;
    characterMass: any;
    computeColliderMovement: any;
    computedCollision: any;
    computedGrounded: any;
    computedMovement: any;
    disableAutostep: any;
    disableSnapToGround: any;
    enableAutostep: any;
    enableSnapToGround: any;
    free: any;
    maxSlopeClimbAngle: any;
    minSlopeSlideAngle: any;
    numComputedCollisions: any;
    offset: any;
    setApplyImpulsesToDynamicBodies: any;
    setCharacterMass: any;
    setMaxSlopeClimbAngle: any;
    setMinSlopeSlideAngle: any;
    setOffset: any;
    setSlideEnabled: any;
    setUp: any;
    slideEnabled: any;
    snapToGroundDistance: any;
    snapToGroundEnabled: any;
    up: any;
}