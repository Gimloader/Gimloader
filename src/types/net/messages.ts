import type { HotkeyTrigger } from "../api/hotkeys";
import type { Dependency, UpdateResponse } from "./downloads";
import type { ConfigurableHotkeysState, LayoutItem, SavedState, ScriptInfo, ScriptInfoTypes, ScriptLayout, State } from "./state";

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
export type Message<Type extends string, Props = void> = { type: Type; props: Props };

export type ScriptStateMessages<T extends ScriptType> =
    | Message<`${T}Delete`, ScriptDelete>
    | Message<`${T}DeleteAll`>
    | Message<`${T}Create`, { folder: string; info: ScriptInfoTypes[T] }>
    | Message<`${T}Arrange`, ScriptArrange>
    | Message<`${T}FolderCreate`, FolderCreate>
    | Message<`${T}FolderDelete`, FolderDelete>
    | Message<`${T}FolderEdit`, FolderEdit>
    | Message<`${T}ItemMove`, ItemMove>
    | Message<`${T}Edit`, ScriptEdit>;

export type StateMessages =
    | Message<"hotkeyUpdate", { id: string; trigger: HotkeyTrigger | null }>
    | Message<"hotkeysUpdate", { hotkeys: ConfigurableHotkeysState }>
    | Message<"settingUpdate", { key: string; value: any }>
    | Message<"pluginValueUpdate", { id: string; key: string; value: string }>
    | Message<"pluginValueDelete", { id: string; key: string }>
    | Message<"pluginSettingUpdate", { id: string; key: string; value: string }>
    | Message<"clearPluginStorage", { id: string }>
    | Message<"cacheInvalid", { invalid: boolean }>
    | Message<"pluginToggled", { name: string; enabled: boolean }>
    | Message<"pluginSetAll", { enabled: boolean; folder?: string }>
    | ScriptStateMessages<"library">
    | ScriptStateMessages<"plugin">
    | Message<"availableUpdates", { updates: string[] }>;

export type StateMessageProps<Type extends StateMessages["type"]> = Extract<StateMessages, { type: Type }>["props"];

// These only go from the background to content
export type Messages =
    | StateMessages
    | Message<"setState", State>
    | Message<"toast", { type: "success" | "error" | "warning" | "normal"; message: string }>;

export interface FolderExport {
    layout: ScriptLayout;
    entryId: string;
    type: ScriptType;
    scripts: ScriptInfo[];
}

export interface ImportResults {
    scripts: number;
    folders: number;
}

export interface Success {
    status: "success";
}

export interface DependencyError {
    status: "dependencyError";
    message: string;
}

export interface DownloadError {
    status: "downloadError";
    message: string;
}

export interface Confirm {
    status: "confirm";
    message: string;
}

export interface DependencyConfirm {
    status: "dependencyConfirm";
    scripts: string[];
}

export interface MultipleDependencyError extends DependencyError {
    scripts: string[];
}

export interface DownloadSuccess extends Success {
    name: string;
}

export type ToggleResult = Success | DependencyError | DownloadError | Confirm;
export type DeleteResult = Success | Confirm;
export type SetAllResult = Success | MultipleDependencyError | DownloadError | DependencyConfirm | Confirm;
export type DownloadResult = DownloadSuccess | Confirm | DownloadError;

export type OnceMessage<Channel extends string, Props, Response = void> = { channel: Channel; props: Props; response: Response };
export type OnceMessages =
    | OnceMessage<"setState", SavedState>
    | OnceMessage<"applyUpdates", { apply: boolean }>
    | OnceMessage<"updateAll", void, string[]>
    | OnceMessage<"updateSingle", { name: string }, UpdateResponse>
    | OnceMessage<"showEditor", { type: ScriptType; folder?: string; name?: string }>
    | OnceMessage<"downloadScript", { url: string; folder: string; confirmed?: boolean; type?: ScriptType }, DownloadResult>
    | OnceMessage<"downloadDependencies", Dependency[], string[]>;

export type ExtractOnceMessage<Channel extends OnceMessages["channel"]> = Extract<OnceMessages, OnceMessage<Channel, any, any>>;
export type OnceMessageProps<Channel extends OnceMessages["channel"]> = ExtractOnceMessage<Channel>["props"];
export type OnceResponder<Channel extends OnceMessages["channel"]> = (response: ExtractOnceMessage<Channel>["response"]) => void;
