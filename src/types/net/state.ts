import type { HotkeyTrigger } from "../api/hotkeys";

export interface ScriptInfo {
    code: string;
    name: string;
}

export interface PluginInfo extends ScriptInfo {
    enabled: boolean;
}

export type LibraryInfo = ScriptInfo;

export interface ScriptInfoTypes {
    plugin: PluginInfo;
    library: LibraryInfo;
}

export type PluginStorage = Record<string, Record<string, any>>;
export type ConfigurableHotkeysState = Record<string, HotkeyTrigger | null>;

export interface LayoutItem {
    type: "folder" | "script";
    id: string;
}

export interface LayoutPath {
    parent?: string;
    name?: string;
    contents: LayoutItem[];
}

export type ScriptLayout = Record<string, LayoutPath>;

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
    pluginLayout: ScriptLayout;
    libraryLayout: ScriptLayout;
    pluginStorage: PluginStorage;
    pluginSettings: PluginStorage;
    settings: Settings;
    hotkeys: ConfigurableHotkeysState;
    cacheInvalid: boolean;
}

export interface State extends SavedState {
    availableUpdates: string[];
}
