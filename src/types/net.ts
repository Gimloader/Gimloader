import type { Vector } from "@dimforge/rapier2d-compat";
import type WorldOptions from "./stores/worldOptions";

interface MessageForDevice {
    data: any;
    deviceId: string;
    key: string;
}

export interface PhysicsState {
    gravity: number;
    velocity: {
        x: number;
        y: number;
        desiredX: number;
        desiredY: number;
    };
    movement: {
        direction: string;
        xVelocity: number;
        accelerationTicks: number;
    };
    jump: {
        isJumping: boolean;
        jumpsLeft: number;
        jumpCounter: number;
        jumpTicks: number;
        xVelocityAtJumpStart: number;
    };
    forces: {
        id: string;
        ticks: Vector[];
    }[];
    grounded: boolean;
    groundedTicks: number;
    lastGroundedAngle: number;
}

export interface ReceivedMessages {
    "ACTIVITY_FEED_MESSAGE": {
        id: string;
        message: string;
    };
    "ALL_PROPS": {
        circleColliders: any[];
        defaultLayer: any;
        ellipseColliders: any;
        id: string;
        imageUrl: string;
        minimumRoleLevel: undefined;
        name: string;
        originX: number;
        originY: number;
        rectColliders: {
            angle: number;
            x: number;
            y: number;
            h: number;
            w: number;
        }[];
        scaleMultip: number;
        seasonTicketRequired: any;
        shadows: {
            x: number;
            y: number;
            r1: number;
            r2: number;
        }[];
    }[];
    "AUTH_ID": string;
    "CONSUME_ITEM_ERROR": {
        slot: string;
        errorMessage: string;
    };
    "DEVICES_STATES_CHANGES": {
        changes: [string, any[], any[]][];
        initial: boolean;
        removedIds: string[];
        values: string[];
    };
    "GOT_KICKED": undefined;
    "INFO_BEFORE_WORLD_SYNC": Vector;
    "KNOCKOUT": {
        id: string;
        name: string;
    };
    "LEVEL_UP": undefined;
    "MAP_PONG": number;
    "MEMORY_COSTS_AND_LIMITS": number[];
    "MESSAGE_FOR_DEVICE": MessageForDevice;
    "MY_TEAM": string;
    "NON_DISMISS_MESSAGE": {
        title: string;
        description: string;
    };
    "NOTIFICATION": {
        description: string;
        duration: number;
        id: string;
        placement: string;
        title: string;
        type: "success" | "info" | "warning" | "error";
    };
    "PHYSICS_STATE": {
        x: number;
        y: number;
        packetId: number;

        /** A stringified {@link PhysicsState} object. */
        physicsState: string;
        teleport: boolean;
    };
    "PROJECTILE_CHANGES": {
        added: {
            appearance: string;
            damage: number;
            end: Vector;
            endTime: number;
            hitPos?: Vector;
            hitTime?: number;
            id: string;
            ownerId: string;
            ownerTeamId: string;
            radius: number;
            start: Vector;
            startTime: number;
        }[];
        hit: any[];
    };
    "RESET": any;
    "SAVED": undefined;
    "TERRAIN_CHANGES": {
        added: {
            terrains: string[];
            tiles: string[][];
        };
        initial: boolean;
        removedTiles: string[];
        updateId: number;
    };
    "WORLD_CHANGES": {
        devices: {
            addedDevices: {
                devices: any[];
                values: any[];
            };
            initial: boolean;
            removedDevices: any[];
        };
    };
    "WORLD_OPTIONS": WorldOptions;
    "XP_ADDITION": {
        reason: string;
        amount: number;
    };
}

interface BaseGrid {
    deviceId: string;
    gridId: string;
}

export interface CustomAssetData {
    shapes: {
        paths: number[][];
        circles: number[][];
        rects: number[][];
        lines: number[][];
    };
}

export interface SentMessages {
    "MAP_PING": number;
    "DROP_ITEM": {
        amount: number;
        interactiveSlotNumber: any;
        itemId: string;
    };
    "MESSAGE_FOR_DEVICE": MessageForDevice;
    "PLACE_TERRAIN": {
        x: number;
        y: number;
        collides: boolean;
        depth: number;
        terrain: string;
    };
    "REMOVE_TERRAIN": {
        x: number;
        y: number;
        depth: number;
    };
    "PLACE_DEVICE": {
        x: number;
        y: number;
        copyingFromExistingDevice: any;
        depth: any;
        deviceTypeId: string;
        hooks: {
            connections: any[];
        };
        id: string;
        layerId: any;
        name: string;
        object: string;
    };
    "REMOVE_DEVICE": {
        id: string;
    };
    "START_GAME": {
        customTeams: any;
        modeType: string;
        ownerAsSpectator: boolean;
    };
    "END_GAME": undefined;
    "RESTORE_MAP_EARLIER": undefined;
    "CREATE_CODE_GRID": {
        deviceId: string;
        triggerType: string;
        triggerValue: string;
    };
    "SET_CODE_GRID_JSON": BaseGrid & {
        json: string;
    };
    "JOIN_CODE_GRID": BaseGrid;
    "LEAVE_CODE_GRID": BaseGrid;
    "DELETE_CODE_GRID": BaseGrid;
    "UPDATE_DEVICE_UI_PRESENCE": {
        action: string;
        deviceId: string;
    };
    "KICK_PLAYER": {
        characterId: string;
    };
    "SAVE": undefined;

    /** Unused by Gimkit */
    "PUBLISH": any;
    "REQUEST_INITIAL_WORLD": undefined;

    /** Tells the game that you switched cosmetics and they should refetch your character. */
    "REFETCH_LATEST_APPEARANCE": undefined;
    "UPDATE_AUTH_TOKEN": {
        token: string;
    };
    /** Unused by Gimkit */
    "HOOK_ACTION": any;
    /** Unused by Gimkit */
    "HOOK_OPTION_ACTION": any;
    "PLACE_STICKER": {
        placement: string;
        size: string;
        stickerId: string;
    };
    "PLACE_WIRE": {
        endConnection?: string;
        endDevice: string;
        startConnection?: string;
        startDevice: string;
    };
    "REMOVE_WIRE": {
        id: string;
    };
    "FIRE": {
        x: number;
        y: number;
        angle: number;
    };
    "SET_ACTIVE_INTERACTIVE_ITEM": {
        slotNum: number;
    };
    "SET_INTERACTIVE_SLOTS_ORDER": {
        order: number;
    };
    "RELOAD": undefined;

    /** Drops or consumes the current item in your inventory. */
    "CONSUME": Vector | {};
    "AIMING": {
        angle: number;
    };

    /** Adds a minute of game time. */
    "ADD_GAME_TIME": undefined;

    /** Requests for the server to send the 1k+ Creative props. Will result in `ALL_PROPS` being sent. */
    "REQUEST_ALL_PROPS": undefined;
    "SET_GLOBAL_PERMISSIONS": {
        adding: boolean;
        editing: boolean;
        manageCodeGrids: boolean;
        removing: boolean;
    };
    "TOGGLE_PHASE": {
        enabled: boolean;
    };
    /** Only in creative modes */
    "SET_SPEED": {
        speed: number;
    };
    "INPUT": number[];
    "REQUEST_TELEPORT": Vector;
    "ADD_CUSTOM_ASSET": {
        /** A stringified {@link CustomAssetData} object representing the figures in the drawing. */
        data: string;
        /** Base-64 encoded */
        icon: string;
        id: string;
        name: string;
        optionId: string;
    };
    "REMOVE_CUSTOM_ASSET": {
        id: string;
    };
}
