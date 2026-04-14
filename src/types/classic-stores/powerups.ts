import type { HexColor } from "./theme";

interface Powerup {
    baseCost: number;
    color: HexColor;
    description: string;
    disabled: string[];
    displayName: string;
    icon: string;
    name: string;
    percentageCost: number;
}

interface ScreenAttack {
    attackerName: string;
    fullScreen: boolean;
    powerupName: string;
}

export interface HostPowerups {
    specialSongIsPlaying: boolean;
}

export interface GuestPowerups {
    availablePowerups: Powerup[];
    disabledPowerups: Powerup[];
    hasShownHelperModal: boolean;
    linkPartnerName: string;
    personalActivePowerups: Powerup[];
    purchasedPowerups: Powerup[];
    screenAttack: ScreenAttack;
    teamActivePowerups: Powerup[];
    teamAppliedPowerups: Powerup[];
    usedPowerups: Powerup[];
    activePowerups: Powerup[];
    appliedPowerups: Powerup[];
}
