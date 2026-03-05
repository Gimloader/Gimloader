import type { HotkeyTrigger } from "../api/hotkeys";

export interface ScriptInfo {
    code: string;
    name: string;
}

export interface PluginInfo extends ScriptInfo {
    enabled: boolean;
}

export type LibraryInfo = ScriptInfo;

export type PluginStorage = Record<string, Record<string, any>>;
export type ConfigurableHotkeysState = Record<string, HotkeyTrigger | null>;

export interface Settings {
    pollerEnabled: boolean;
    autoUpdate: boolean;
    autoDownloadMissingLibs: boolean;
    autoDownloadMissingPlugins: boolean;
    menuView: "grid" | "list";
    showPluginButtons: boolean;
}

export interface SavedState {
    plugins: PluginInfo[];
    libraries: LibraryInfo[];
    pluginStorage: PluginStorage;
    pluginSettings: PluginStorage;
    settings: Settings;
    hotkeys: ConfigurableHotkeysState;
    cacheInvalid: boolean;
}

export interface State extends SavedState {
    availableUpdates: string[];
}
