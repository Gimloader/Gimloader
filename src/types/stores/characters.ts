interface CharacterPermissions {
    adding: boolean;
    editing: boolean;
    manageCodeGrids: boolean;
    removing: boolean;
}

export type CharacterType = "character" | "sentry";

interface CharacterInfo {
    allowWeaponFire: boolean;
    existsBeforeReconnect: boolean;
    fragility: number;
    health: number;
    id: string;
    isActive: boolean;
    lastPlayersTeamId: string;
    name: string;
    permissions: CharacterPermissions;
    score: number;
    teamId: string;
    type: CharacterType;
}

export default interface Characters {
    characters: Map<string, CharacterInfo>;
}
