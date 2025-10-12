interface Character {
    allowWeaponFire: boolean;
    existsBeforeReconnect: boolean;
    fragility: number;
    health: number;
    id: string;
    isActive: boolean;
    lastPlayersTeamId: string;
    name: string;
    permissions: {
        adding: boolean;
        editing: boolean;
        manageCodeGrids: boolean;
        removing: boolean;
    };
    score: number;
    teamId: string;
    type: string;
}

export default interface Characters {
    characters: {
        data_: Map<string, {
            value_: Character;
        }>;
    };
}