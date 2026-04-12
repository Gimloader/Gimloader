interface Goal {
  type: string;
  value: number;
}

type Currency = "$" | "€" | "¥" | "£" | "X̶" | "₩";

// Gimkit uses google translate language codes
type LanguageCode = 
  | "en" | "af" | "sq" | "am" | "ar" | "hy" | "az" | "eu" | "be" | "bn" 
  | "bs" | "bg" | "ca" | "ceb" | "ny" | "zh-cn" | "zh-tw" | "co" | "hr" 
  | "cs" | "da" | "nl" | "eo" | "et" | "tl" | "fi" | "fr" | "fy" | "gl" 
  | "ka" | "de" | "el" | "gu" | "ht" | "ha" | "haw" | "iw" | "hi" | "hmn" 
  | "hu" | "is" | "ig" | "id" | "ga" | "it" | "ja" | "jw" | "kn" | "kk" 
  | "km" | "ko" | "ku" | "ky" | "lo" | "la" | "lv" | "lt" | "lb" | "mk" 
  | "mg" | "ms" | "ml" | "mt" | "mi" | "mr" | "mn" | "my" | "ne" | "no" 
  | "ps" | "fa" | "pl" | "pt" | "ma" | "ro" | "ru" | "sm" | "gd" | "sr" 
  | "st" | "sn" | "sd" | "si" | "sk" | "sl" | "so" | "es" | "su" | "sw" 
  | "sv" | "tg" | "ta" | "te" | "th" | "tr" | "uk" | "ur" | "uz" | "vi" 
  | "cy" | "xh" | "yi" | "yo" | "zu";

interface GameOptions {
  allowGoogleTranslate: boolean;
  clapping: boolean;
  cleanPowerupsOnly: boolean;
  currency: Currency;
  enablePowerupRNGAnimation: boolean;
  goal: Goal;
  group: string;
  handicap: number;
  language: LanguageCode;
  modeOptions: any;
  music: boolean;
  powerups: boolean;
  specialGameType: string[];
  startingCash: number;
  themes: boolean;
  type: string;
}

interface BaseGameOptionsStore extends GameOptions {
  formattedGameOptions: GameOptions;
}

export interface HostGameOptions extends BaseGameOptionsStore {
  setGameOptionsFromStorage: (gameOptions: GameOptions, defaultValues: boolean) => void;
}

export interface GuestGameOptions extends BaseGameOptionsStore {
  setGameOptions: (gameOptions: GameOptions) => void;
}
