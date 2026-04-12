import type { Theme } from "./theme";

export interface Player {
  activePowerups: string[];
  balance: number;
  id: string;
  name: string;
  theme: string;
  /** Only in the "What Is..." gamemode */
  power?: string;
}

interface Team {
  activePowerups: string[];
  balance: number;
  color: Theme;
  icon: string | undefined;
  id: string;
  players: string[];
}

export default interface Players {
  finalResults: Player[];
  players: Player[];
  teams: Team[];
  filteredPlayers: Player[];
  totalBalance: number;
  totalStones: number;
}