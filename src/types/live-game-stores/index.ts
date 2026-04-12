import type { Untyped } from "$types/util";
import type { HostDraw, GuestDraw } from "./draw";
import type { GuestEntities, HostEntities } from "./entities";
import type { GuestGameOptions, HostGameOptions } from "./gameOptions";
import type { GuestGameValues, HostGameValues } from "./gameValues";
import type { GuestImposter, HostImposter } from "./imposter";
import type { GuestPardy, HostPardy } from "./pardy";
import type Players from "./players";
import type { GuestPowerups, HostPowerups } from "./powerups";
import type { Question } from "./questions";
import type Questions from "./questions";
import type ThemeStore from "./theme";
import type { GuestUI, HostUI } from "./ui";
import type Upgrades from "./upgrades";
import type User from "./user";

interface Balance {
  balance: number;
  balanceChangeIfCorrect: number;
  balanceChangeIfIncorrect: number;
  customColor: string;
  incomeMultiplier: number;
  maxBalance: number;
  streakAmount: number;
}

interface Kit {
  questions: Question[];
}

interface Metadata {
  currentGameIsUsingGroups: boolean;
  hasReceivedHostStaticState: boolean;
}

interface Stats {
  playerStats: Untyped[];
}

interface BaseLiveGameStores {
  events: Record<string, Untyped>;
  engine: Untyped;
}

interface HostLiveGameStores extends BaseLiveGameStores {
  draw: HostDraw;
  entities: HostEntities;
  gameOptions: HostGameOptions;
  gameValues: HostGameValues;
  imposter: HostImposter;
  kit: Kit;
  metadata: Metadata;
  pardy: HostPardy;
  players: Players;
  powerups: HostPowerups;
  /** Appears to be unused by Gimkit */
  stats: Stats;
  translations: Untyped;
  ui: HostUI;
}

interface GuestLiveGameStores extends BaseLiveGameStores {
  balance: Balance;
  draw: GuestDraw;
  entities: GuestEntities;
  gameOptions: GuestGameOptions;
  gameValues: GuestGameValues;
  imposter: GuestImposter;
  navigation: Navigation;
  pardy: GuestPardy;
  powerups: GuestPowerups;
  questions: Questions;
  theme: ThemeStore;
  translations: Untyped;
  ui: GuestUI;
  upgrades: Upgrades;
  user: User;
}

export type LiveGameStores = HostLiveGameStores | GuestLiveGameStores;