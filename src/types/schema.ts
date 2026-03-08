import type { GameSessionPhase, SessionMapStyle, SessionModeType, SessionPhase, SessionVersion } from "./stores/session";

export namespace Schema {
    export interface ColyseusMethods {
        $callbacks: Record<string, any>;
        $changes: any;
        toJson(): any;
    }

    export type ObjectSchema<T extends object> = T & ColyseusMethods & {
        listen<K extends keyof T>(key: K, callback: (value: T[K], lastValue: T[K]) => void, immediate?: boolean): () => void;
        onChange(callback: () => void): () => void;
        onRemove(callback: () => void): () => void;
    };

    export type CollectionSchema<T, K> = ColyseusMethods & {
        onAdd(callback: (value: T, index: K) => void, immediate?: boolean): () => void;
        onRemove(callback: (value: T, index: K) => void): () => void;
        onChange(callback: (item: T, index: K) => void): () => void;
    };

    export type MapSchema<T> = { [key: string]: T } & Map<string, T> & CollectionSchema<T, string>;
    export type ArraySchema<T> = T[] & CollectionSchema<T, number>;

    export interface AppearanceState {
        skin: string;
        tintModifierId: string;
        trailId: string;
        transparencyModifierId: string;
    }

    export interface AssignmentState {
        hasSavedProgress: boolean;
        objective?: string;
        percentageComplete?: number;
    }

    export interface ClassDesignerState {
        lastActivatedClassDeviceId: string;
        lastClassDeviceActivationId: number;
    }

    export interface HealthState {
        classImmunityActive: boolean;
        fragility: number;
        health: number;
        lives: number;
        maxHealth: number;
        maxShield: number;
        shield: number;
        showHealthBar: boolean;
        spawnImmunityActive: boolean;
    }

    export interface InteractiveSlotState {
        clipSize: number;
        count: number;
        currentClip: number;
        durability: number;
        itemId: string;
        waiting: boolean;
        waitingEndTime: number;
        waitingStartTime: number;
    }

    export interface SlotState {
        amount: number;
    }

    export interface InventoryState {
        activeInteractiveSlot: number;
        infiniteAmmo: boolean;
        interactiveSlots: MapSchema<ObjectSchema<InteractiveSlotState>>;
        interactiveSlotsOrder: ArraySchema<number>;
        maxSlots: number;
        slots: MapSchema<ObjectSchema<SlotState>>;
    }

    export interface PermissionsState {
        adding: boolean;
        editing: boolean;
        manageCodeGrids: boolean;
        removing: boolean;
    }

    export interface PhysicsState {
        isGrounded: boolean;
    }

    export interface ProjectilesState {
        aimAngle: number;
        damageMultiplier: number;
    }

    export interface XPState {
        unredeemedXP: number;
    }

    export interface ZoneAbilitiesOverridesState {
        allowItemDrop: boolean;
        allowResourceDrop: boolean;
        allowWeaponDrop: boolean;
        allowWeaponFire: boolean;
    }

    export interface CharacterState {
        appearance: ObjectSchema<AppearanceState>;
        assignment: ObjectSchema<AssignmentState>;
        classDesigner: ObjectSchema<ClassDesignerState>;
        completedInitialPlacement: boolean;
        health: ObjectSchema<HealthState>;
        id: string;
        inventory: ObjectSchema<InventoryState>;
        isActive: boolean;
        isRespawning: boolean;
        lastPlayersTeamId: string;
        movementSpeed: number;
        name: string;
        openDeviceUI: string;
        openDeviceUIChangeCounter: number;
        permissions: ObjectSchema<PermissionsState>;
        phase: boolean;
        physics: ObjectSchema<PhysicsState>;
        projectiles: ObjectSchema<ProjectilesState>;
        roleLevel: number;
        scale: number;
        score: number;
        teamId: string;
        teleportCount: number;
        type: string;
        x: number;
        xp: ObjectSchema<XPState>;
        y: number;
        zoneAbilitiesOverrides: ObjectSchema<ZoneAbilitiesOverridesState>;
    }

    export interface ActionCategoryState {
        id: string;
        name: string;
        plural: string;
    }

    export interface ActionItemState {
        id: string;
        category: string;
        name: string;
        url: string;
    }

    export interface CallToActionState {
        categories: ArraySchema<ObjectSchema<ActionCategoryState>>;
        items: ArraySchema<ObjectSchema<ActionItemState>>;
    }

    export interface GameSessionState {
        callToAction: ObjectSchema<CallToActionState>;
        countdownEnd: number;
        /**
         * `countdown` either before the game has started or while the game is starting
         *
         * `game` while the game is started
         *
         * `results` after the game ends until the game has been started again
         */
        phase: GameSessionPhase;
        resultsEnd: number;
    }

    export interface SessionState {
        allowGoogleTranslate: boolean;
        cosmosBlocked: boolean;
        gameOwnerId: string;
        gameSession: ObjectSchema<GameSessionState>;
        gameTime: number;
        globalPermissions: ObjectSchema<PermissionsState>;
        loadingPhase: boolean;
        mapCreatorRoleLevel: number;
        mapStyle: SessionMapStyle;
        modeType: SessionModeType;
        phase: SessionPhase;
        version: SessionVersion;
    }

    export interface DevicesState {
        codeGrids: MapSchema<any>;
    }

    export interface WorldState {
        devices: ObjectSchema<DevicesState>;
        height: number;
        width: number;
    }

    export interface CustomAssetState {
        data: string;
        icon: string;
        id: string;
        name: string;
        optionId: string;
    }

    export interface HooksState {
        hookJSON: string;
    }

    export interface MatchmakerState {
        gameCode: string;
    }

    export interface TeamState {
        characters: ArraySchema<string>;
        id: string;
        name: string;
        score: number;
    }

    export interface GimkitState {
        characters: MapSchema<ObjectSchema<CharacterState>>;
        customAssets: MapSchema<ObjectSchema<CustomAssetState>>;
        hooks: ObjectSchema<HooksState>;
        mapSettings: string;
        matchmaker: ObjectSchema<MatchmakerState>;
        session: ObjectSchema<SessionState>;
        teams: ArraySchema<ObjectSchema<TeamState>>;
        world: ObjectSchema<WorldState>;
    }

    export type GimkitSchema = ObjectSchema<GimkitState>;
}
