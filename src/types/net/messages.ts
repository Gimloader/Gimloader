import type { HotkeyTrigger } from "../api/hotkeys";
import type { ConfigurableHotkeysState, LibraryInfo, PluginInfo, SavedState, State } from "./state";

export type ScriptType = "plugin" | "library";
export type ScriptEdit = { name: string; newName: string; code: string; updated?: boolean };
export type ScriptDelete = { name: string };
export type ScriptArrange = { order: string[] };

// These go both ways
export interface StateMessages {
    hotkeyUpdate: { id: string; trigger: HotkeyTrigger };
    hotkeysUpdate: { hotkeys: ConfigurableHotkeysState };

    libraryDelete: ScriptDelete;
    libraryDeleteAll: void;
    libraryCreate: LibraryInfo;
    libraryArrange: ScriptArrange;

    pluginDelete: ScriptDelete;
    pluginDeleteAll: void;
    pluginCreate: PluginInfo;
    pluginArrange: ScriptArrange;
    pluginToggled: { name: string; enabled: boolean };
    pluginSetAll: { enabled: boolean };

    settingUpdate: { key: string; value: any };

    pluginValueUpdate: { id: string; key: string; value: string };
    pluginValueDelete: { id: string; key: string };
    pluginSettingUpdate: { id: string; key: string; value: string };
    clearPluginStorage: { id: string };

    cacheInvalid: { invalid: boolean };
}

// These only go from the background to content
export interface Messages extends StateMessages {
    pluginEdit: ScriptEdit;
    libraryEdit: ScriptEdit;
    setState: SavedState;
    toast: { type: "success" | "error" | "warning" | "normal"; message: string };
    availableUpdates: string[];
}

export interface ScriptTryDelete {
    name: string;
    confirmed?: boolean;
}

export interface OnceMessages {
    getState: void;
    setState: SavedState;
    applyUpdates: { apply: boolean };
    updateAll: void;
    updateSingle: { name: string };
    showEditor: { type: ScriptType; name?: string };
    pluginTryDelete: ScriptTryDelete;
    libraryTryDelete: ScriptTryDelete;
    tryDeleteAllLibraries: { confirmed?: boolean };
    tryTogglePlugin: { name: string; enabled: boolean; confirmed?: boolean };
    trySetAllPlugins: { enabled: boolean; confirmed?: boolean };
    downloadScript: { url: string; confirmed?: boolean; type?: ScriptType };
    editOrCreate: { code: string; name?: string; updated?: boolean };
}

interface Success {
    status: "success";
}

interface DependencyError {
    status: "dependencyError";
    message: string;
}

interface DownloadError {
    status: "downloadError";
    message: string;
}

interface Confirm {
    status: "confirm";
    message: string;
}

interface MultipleDependencyError extends DependencyError {
    scripts: string[];
}

interface MultipleConfirm extends Confirm {
    scripts: string[];
}

interface DownloadSuccess extends Success {
    name: string;
}

type ToggleResult = Success | DependencyError | DownloadError | Confirm;
export type DeleteResult = Success | Confirm;
type SetAllResult = Success | MultipleDependencyError | DownloadError | MultipleConfirm;
type DownloadResult = DownloadSuccess | Confirm | DownloadError;

export interface OnceResponses {
    getState: State;
    setState: void;
    applyUpdates: void;
    updateAll: string[];
    updateSingle: { updated: boolean; failed?: boolean; version?: string };
    showEditor: void;
    pluginTryDelete: DeleteResult;
    libraryTryDelete: DeleteResult;
    tryDeleteAllLibraries: DeleteResult;
    tryTogglePlugin: ToggleResult;
    trySetAllPlugins: SetAllResult;
    downloadScript: DownloadResult;
    editOrCreate: void;
}
