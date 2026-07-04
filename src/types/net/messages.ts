import type { HotkeyTrigger } from "../api/hotkeys";
import type { UpdateResponse } from "./downloads";
import type { ConfigurableHotkeysState, LayoutItem, LibraryInfo, PluginInfo, SavedState, State } from "./state";

export type ScriptType = "plugin" | "library";
export interface ScriptEdit {
    name: string;
    newName: string;
    code: string;
    updated?: boolean;
}
export interface ScriptDelete {
    name: string;
}
export interface ScriptArrange {
    folder: string;
    order: string[];
}
export interface FolderCreate {
    parent: string;
    name: string;
    id: string;
}
export interface FolderDelete {
    id: string;
}
export interface FolderEdit {
    id: string;
    newName: string;
}
export interface ItemMove {
    item: LayoutItem;
    folder: string;
}

// These go both ways
export interface StateMessages {
    hotkeyUpdate: { id: string; trigger: HotkeyTrigger | null };
    hotkeysUpdate: { hotkeys: ConfigurableHotkeysState };

    libraryDelete: ScriptDelete;
    libraryDeleteAll: void;
    libraryCreate: { folder: string; info: LibraryInfo };
    libraryArrange: ScriptArrange;
    libraryFolderCreate: FolderCreate;
    libraryFolderDelete: FolderDelete;
    libraryFolderEdit: FolderEdit;
    libraryItemMove: ItemMove;

    pluginDelete: ScriptDelete;
    pluginDeleteAll: void;
    pluginCreate: { folder: string; info: PluginInfo };
    pluginArrange: ScriptArrange;
    pluginToggled: { name: string; enabled: boolean };
    pluginSetAll: { enabled: boolean; folder?: string };
    pluginFolderCreate: FolderCreate;
    pluginFolderDelete: FolderDelete;
    pluginFolderEdit: FolderEdit;
    pluginItemMove: ItemMove;

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
    setState: State;
    toast: { type: "success" | "error" | "warning" | "normal"; message: string };
    availableUpdates: string[];
}

export interface ScriptTryDelete {
    name: string;
    confirmed?: boolean;
}
export interface FolderTryDelete {
    id: string;
    confirmed?: boolean;
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

interface DependencyConfirm {
    status: "dependencyConfirm";
    scripts: string[];
}

interface MultipleDependencyError extends DependencyError {
    scripts: string[];
}

interface DownloadSuccess extends Success {
    name: string;
}

export type ToggleResult = Success | DependencyError | DownloadError | Confirm;
export type DeleteResult = Success | Confirm;
export type SetAllResult = Success | MultipleDependencyError | DownloadError | DependencyConfirm | Confirm;
export type DownloadResult = DownloadSuccess | Confirm | DownloadError;

export type OnceMessage<Channel extends string, Props, Response = void> = { channel: Channel; props: Props; response: Response };
export type OnceMessages =
    | OnceMessage<"getState", void, State>
    | OnceMessage<"setState", SavedState>
    | OnceMessage<"applyUpdates", { apply: boolean }>
    | OnceMessage<"updateAll", void, string[]>
    | OnceMessage<"updateSingle", { name: string }, UpdateResponse>
    | OnceMessage<"showEditor", { type: ScriptType; folder?: string; name?: string }>
    | OnceMessage<"pluginTryDelete", ScriptTryDelete, DeleteResult>
    | OnceMessage<"libraryTryDelete", ScriptTryDelete, DeleteResult>
    | OnceMessage<"pluginFolderTryDelete", FolderTryDelete, DeleteResult>
    | OnceMessage<"libraryFolderTryDelete", FolderTryDelete, DeleteResult>
    | OnceMessage<"tryDeleteAllLibraries", { confirmed?: boolean }, DeleteResult>
    | OnceMessage<"tryTogglePlugin", { name: string; enabled: boolean; confirmed?: boolean }, ToggleResult>
    | OnceMessage<"trySetAllPlugins", { enabled: boolean; folder?: string; confirmed?: boolean }, SetAllResult>
    | OnceMessage<"downloadScript", { url: string; folder: string; confirmed?: boolean; type?: ScriptType }, DownloadResult>
    | OnceMessage<"editOrCreate", { code: string; name: string | null; folder?: string; updated?: boolean }>;

export type ExtractOnceMessage<Channel extends OnceMessages["channel"]> = Extract<OnceMessages, OnceMessage<Channel, any, any>>;
export type OnceMessageProps<Channel extends OnceMessages["channel"]> = ExtractOnceMessage<Channel>["props"];
export type OnceResponder<Channel extends OnceMessages["channel"]> = (response: ExtractOnceMessage<Channel>["response"]) => void;
