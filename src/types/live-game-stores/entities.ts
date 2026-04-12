import type { HexColor } from "./theme";

interface Lava {
  buildHeight: number;
  buildPieces: number;
  buildsInProgress: number;
  lavaHeight: number;
  lavaIncreasePaused: boolean;
  lavaIncreaseSpeed: number;
  secondsLasted: number;
}

interface DefendingHomebase {
  backgroundColor: HexColor;
  health: number;
  healthDecreasePerTick: number;
  healthRegenPerTick: number;
  icon: string;
  id: string;
  linkedWith: string;
  maxHealth: number;
  name: string;
}

interface BaseEntities {
  lava: Lava | null;
}

export interface HostEntities extends BaseEntities {
  defendingHomebase: DefendingHomebase[] | null;
}

export interface GuestEntities extends BaseEntities {
  defendingHomebase: DefendingHomebase | null;
}