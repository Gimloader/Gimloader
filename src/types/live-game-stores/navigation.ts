interface AttackModal {
  open: boolean;
  powerup: string;
}

type CurrentShopTab = 'defendingHomebase' | "upgrades" | "powerups" | "themes" | "powerupsNonMusic" | "powerupsMusic" | "lava";

export default interface Navigation {
  attackModal: AttackModal;
  canChangeRoute: boolean;
  currentRoute: string;
  currentShopTab: CurrentShopTab;
  drawerOpen: boolean;
  leaderboardDrawerOpen: boolean;
  powerupRNGAnimationDone: boolean;
  settingsOpen: boolean;
  visitedPowerupSection: boolean;
  changeRoute(route: string): void;
}