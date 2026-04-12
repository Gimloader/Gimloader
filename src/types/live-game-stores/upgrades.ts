import type { HexColor } from "./theme";

interface Level {
  price: number;
  value: number;
}

interface Upgrade {
  description: string;
  icon: string;
  levels: Level[];
  name: string;
}

interface LavaUpgrade {
  background: HexColor;
  description: string;
  icon: string;
  id: string;
  name: string;
  price: number;
}

interface HomebaseUpgrade {
  background: HexColor;
  baseCost: number;
  description: string;
  icon: string;
  id: string;
  name: string;
}

interface UpgradeLevels {
  insurance: number;
  moneyPerQuestion: number;
  multiplier: number;
  streakBonus: number;
}

export default interface Upgrades {
  currentlySelectedUpgrade: string;
  homebaseUpgades: HomebaseUpgrade[];
  lavaUpgrades: LavaUpgrade[];
  upgradeLevelTabs: UpgradeLevels;
  upgradeLevels: UpgradeLevels;
  upgradePricingDiscount: number;
  upgrades: Upgrade[];
}