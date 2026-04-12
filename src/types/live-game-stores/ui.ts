import type { Untyped } from "$types/util";
import type { HexColor } from "./theme";

interface SuccessModalInfo {
  background: string;
  color: string;
  description: string;
  icon: string;
  sound?: string;
  textOptions?: Untyped;
  title: string;
}

export interface GuestUI {
  blurredScreen: boolean;
  fullBlackScreen: boolean;
  showingSuccessModal: boolean;
  snowing: boolean;
  successModalInfo: SuccessModalInfo[];
}

export interface HostUI {
  backgroundColor: HexColor;
  showingBossPreScreen: boolean;
  showingClassTip: boolean;
  showingHumansVsZombiesPreScreen: boolean;
  showingLavaPreScreen: boolean;
  snowing: boolean;
}