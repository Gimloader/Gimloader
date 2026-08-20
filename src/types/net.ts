import type { Vector } from "@dimforge/rapier2d-compat";
import type { Stores } from "./stores";
import type { ClassicStores } from "./classicStores";
import type { Untyped } from "./util";

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

export interface ReceivedMessages2d {
    "ACTIVITY_FEED_MESSAGE": {
        id: string;
        message: string;
    };
    "ALL_PROPS": {
        circleColliders: Stores.CircleShort[];
        defaultLayer?: string;
        ellipseColliders: Stores.RotatedEllipse[];
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
        seasonTicketRequired?: boolean;
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
    "RESET": undefined;
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
                values: string[];
            };
            initial: boolean;
            removedDevices: string[];
        };
    };
    "WORLD_OPTIONS": Stores.WorldOptions;
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

export interface SentMessages2d {
    "MAP_PING": number;
    "DROP_ITEM": {
        amount: number;
        interactiveSlotNumber?: number;
        itemId?: string;
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
        copyingFromExistingDevice?: string;
        depth?: number;
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
        customTeams: Record<string, string>;
        modeType: Stores.SessionModeType;
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
    "CONSUME": Vector | Record<string, never>;
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

export interface ReceivedMessages1d {
    "HOST_STATIC_STATE": {
        gameCode: string;
        options: ClassicStores.GameOptions;
        powerups: ClassicStores.Powerup[];
        themes: ClassicStores.ShopTheme[];
    };
    "PLAYER_JOINS_STATIC_STATE": {
        disabledThemes: string[];
        gameOptions: ClassicStores.GameOptions;
        news: Untyped[];
        powerups: ClassicStores.Powerup[];
        themes: ClassicStores.ShopTheme[];
        upgrades: ClassicStores.Upgrade[];
    };
    "STATE_UPDATE": {
        type: string;
        value: any;
    };
    "VIEWABLE_GAME_CODE": string;
    "UPDATED_PLAYER_LEADERBOARD": {
        items: ClassicStores.Player[];
        key: string;
    };
    "UPDATED_TEAM_LEADERBOARD": {
        items: ClassicStores.Team[];
        key?: string;
    };
    "NEW_GAME_STATUS": string;
    "TOAST": {
        message: string;
        type: string;
        blockedSound?: boolean;
    };
    "NEW_ACTIVITY_ITEM": {
        name: string;
        action: string;
        customTextColor?: string;
    };
    "SPECIAL_SONG_PLAYED": {
        audioFile: string;
        background: string;
    };
    "NEW_PLAYER_STATS": Untyped;
    "CLAP_COUNT": number;
    "PLAY_AGAIN_INTENT_ID": string;
    "ERROR_MODAL": {
        title: string;
        content: string;
    };
    "SET_REPORT_ID": {
        reportId: string;
    };
    "NON_DISMISS_MESSAGE": ClassicStores.NonDismissMessage;
    "BALANCE_FLASH_RED": undefined;
    "DEFLECTED": undefined;
    "ENABLE_POWERUP_RNG_ANIMATION": undefined;
    "PLAY_AGAIN_NEW_GAME_CODE": string;
    "SUCCESS_MODAL_INFO": ClassicStores.SuccessModalInfo;
    "THANOS_RESULTS": ClassicStores.ThanosValues;
    "DEFENDING_HOMEBASES": ClassicStores.DefendingHomebase[];
    "DEFENDING_HOMEBASE_RESULTS": ClassicStores.DefendingHomebaseResults;
    "AVAILABLE_HOMEBASE_UPGRADES": ClassicStores.HomebaseUpgrade[];
    "DEFENDING_HOMEBASE_STATUS": ClassicStores.DefendingHomebase;
    "IMPOSTER_MODE_PEOPLE": ClassicStores.Person[];
    "IMPOSTER_MODE_MEETING_RESULTS": ClassicStores.MeetingResult;
    "IMPOSTER_MODE_QUICK_STATS": {
        impostersLeft: number;
        meetingsLeft: number;
        investigationsLeft: number;
    };
    "AVAILABLE_LAVA_UPGRADES": ClassicStores.LavaUpgrade[];
    "LAVA_RESULTS": ClassicStores.Lava;
    "IMPOSTER_MODE_CALL_A_MEETING": undefined;
    "IMPOSTER_MODE_VOTE_IN_COUNT": number;
    "DRAW_MODE_LINE": ClassicStores.Line;
    "DRAW_MODE_FEED_ITEM": ClassicStores.FeedItem;
    "DRAW_MODE_PERSON_COUNT": number;
    "DRAW_MODE_POINT_ADDITIONS": ClassicStores.PointAddition[];
    "DRAW_MODE_CLEAR": undefined;
}

export interface SentMessages1d {
    "NEW_GAME_STATUS": string;
    "PLAYER_LEADERBOARD_REQUESTED": undefined;
    "TEAM_LEADERBOARD_REQUESTED": undefined;
    "QUESTION_ANSWERED": {
        questionId: string;
        answer: string;
    };
    "UPGRADE_PURCHASED": {
        level: number;
        upgradeName: string;
    };
    "POWERUP_PURCHASED": string;
    "POWERUP_ACTIVATED": string;
    "POWERUP_ATTACK": {
        name: string;
        target: string;
    };
    "THEME_PURCHASED": string;
    "THEME_APPLIED": string;
    "OUTNUMBERED_COMPLETE": undefined;
    "CLAP": {
        amount: number;
    };
    "KICK_PLAYER": string;
    "LEADERBOARD_CHANGE_BALANCE": {
        balancePercentageChange: number;
        playerId: string;
    };
    "LEADERBOARD_FREEZE_PLAYER": {
        playerId: string;
    };
    "PLAY_AGAIN": undefined;
    "MAKE_TEAMS": undefined;
    "IMPOSTER_REQUEST_PEOPLE": undefined;
    "IMPOSTER_MODE_STATUS": ClassicStores.ImposterStatus;
    "IMPOSTER_MODE_IMPOSTER_WIN": undefined;
    "DRAW_MODE_CREATE_ROUND": string;
    "DRAW_MODE_END_ROUND": undefined;
    "DRAW_MODE_CLEAR": undefined;
    "PARDY_SET_NEW_ROUND_DETAILS": ClassicStores.Round;
    "PARDY_SET_SCREEN": ClassicStores.Screen;
    "PARDY_QUESTION_SCREEN": ClassicStores.QuestionScreen;
    "PARDY_SET_QUESTION_STATUS": ClassicStores.QuestionStatus;
    "UPGRADE_DEFENDING_HOMEBASE": {
        id: string;
    };
    "LAVA_PURCHASE_PIECE": {
        type: string;
    };
    "IMPOSTER_MODE_PURCHASE": {
        item: string;
    };
    "IMPOSTER_MODE_VOTE": string;
    "IMPOSTER_MODE_NOTES": string;
    "DRAW_MODE_TERM_SELECTED": string;
    "DRAW_MODE_LD": ClassicStores.Line;
    "DRAW_MODE_ID": string;
    "DRAW_MODE_GUESS": string;
    "PARDY_SET_POWER": string;
    "PARDY_SET_BET": number;
}
