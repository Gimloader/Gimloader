export type HexColor = `#${string}`;

export interface Theme {
  background: HexColor;
  text?: string;
}

export interface ShopTheme {
  cost: number;
  description: string;
  name: string;
  palette: Theme[];
  question: Theme;
}

interface ActiveThemeResponse {
  continue: Theme;
  correctAnswer: Theme;
  incorrectAnswer: Theme;
  shop: Theme;
}

interface ActiveTheme {
  defaultBackground: HexColor;
  desktopBreakpoint: number;
  palette: Theme[];
  question: Theme;
  response: ActiveThemeResponse;
}

export default interface ThemeStore {
  availableThemes: ShopTheme[];
  disabledThemes: string[];
  ownedThemes: string[];
  theme: ActiveTheme;
  themeName: string;
}