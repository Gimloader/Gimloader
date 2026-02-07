interface CharacterPermissions {
    adding: boolean;
    editing: boolean;
    manageCodeGrids: boolean;
    removing: boolean;
}

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
    type: string;
}

export default interface Characters {
    characters: Map<string, CharacterInfo>;
}
