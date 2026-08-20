import type { ConfigurableHotkeysState, LayoutItem, LibraryInfo, PluginInfo, PluginStorage, SavedState, ScriptLayout, Settings, State } from "$types/net/state";
import type { ScriptType } from "$types/net/messages";
import { defaultSettings } from "$shared/consts";
import debounce from "debounce";
import StateManager from "$shared/state";
import Downloader from "./net/downloader";
import Server from "./net/server";

const isString = (value: any) => value && typeof value === "string";
const isObject = (value: any) => typeof value === "object" && value !== null;

export default async function loadState() {
    const savedState = await chrome.storage.local.get<SavedState>({
        plugins: [],
        libraries: [],
        pluginLayout: { root: { contents: [] } },
        libraryLayout: { root: { contents: [] } },
        pluginStorage: {},
        pluginSettings: {},
        settings: defaultSettings,
        hotkeys: {},
        cacheInvalid: false
    });

    StateManager.plugin.on("scriptUpdate", () => saveDebounced("plugins"));
    StateManager.plugin.on("layoutUpdate", () => saveDebounced("pluginLayout"));
    StateManager.library.on("scriptUpdate", () => saveDebounced("libraries"));
    StateManager.library.on("layoutUpdate", () => saveDebounced("libraryLayout"));
    StateManager.settings.on("any", () => saveDebounced("settings"));
    StateManager.storage.on("pluginStorageChange", () => saveDebounced("pluginStorage"));
    StateManager.storage.on("pluginSettingsChange", () => saveDebounced("pluginSettings"));
    StateManager.hotkeys.on("configurablesChange", () => saveDebounced("hotkeys"));
    StateManager.cache.on("invalidUpdate", () => saveDebounced("cacheInvalid"));

    StateManager.init(sanitizeState(savedState), {
        downloadDependencies: (deps) => Downloader.downloadDeps(deps),
        broadcast: (type, props) => Server.send(type, props)
    });

    Server.onMessage("setState", (newState) => {
        if(!isObject(newState)) return;

        const merged = Object.assign({}, StateManager.getSavedState(), newState);
        const state = sanitizeState(merged);
        state.cacheInvalid = true;

        StateManager.update(state);
        Server.send("setState", state);
    });
}

function sanitizeState(state: SavedState): State {
    const usedNames = new Set<string>();
    const plugins = sanitizePlugins(state.plugins, usedNames);
    const libraries = sanitizeLibraries(state.libraries, usedNames);
    const pluginNames = new Set(plugins.map(p => p.name));
    const libraryNames = new Set(libraries.map(p => p.name));

    return {
        plugins,
        libraries,
        pluginLayout: sanitizeLayout(state.pluginLayout, pluginNames),
        libraryLayout: sanitizeLayout(state.libraryLayout, libraryNames),
        pluginStorage: sanitizePluginStorage(state.pluginStorage),
        pluginSettings: sanitizePluginStorage(state.pluginSettings),
        settings: sanitizeSettings(state.settings),
        hotkeys: sanitizeHotkeys(state.hotkeys),
        cacheInvalid: sanitizeCacheInvalid(state.cacheInvalid),
        availableUpdates: []
    };
}

const debounced: Record<string, () => void> = {};

function saveDebounced(key: keyof SavedState) {
    // debounce just to be safe
    debounced[key] ??= debounce(async () => {
        chrome.storage.local.set({
            [key]: StateManager.getSavedState()[key]
        });
    }, 100);

    debounced[key]();
}

function sanitizeScriptInfo(info: PluginInfo[], type: "plugin", usedNames: Set<string>): PluginInfo[];
function sanitizeScriptInfo(info: LibraryInfo[], type: "library", usedNames: Set<string>): LibraryInfo[];
function sanitizeScriptInfo(info: any[], type: ScriptType, usedNames: Set<string>) {
    if(!Array.isArray(info)) return [];

    const needsEnabled = type === "plugin";
    for(let i = 0; i < info.length; i++) {
        const item = info[i];
        if(item.script && !item.code) item.code = item.script;

        if(
            typeof item.name !== "string"
            || typeof item.code !== "string"
            || (needsEnabled && typeof (item as PluginInfo).enabled !== "boolean")
        ) {
            info.splice(i, 1);
            i--;
            continue;
        }

        info[i] = { name: item.name, code: item.code };
        if(needsEnabled) (info[i] as PluginInfo).enabled = (item as PluginInfo).enabled;
    }

    // Remove duplicates
    for(let i = 0; i < info.length; i++) {
        if(usedNames.has(info[i].name)) {
            info.splice(i, 1);
            i--;
        } else {
            usedNames.add(info[i].name);
        }
    }

    return info;
}

function sanitizePlugins(plugins: PluginInfo[], usedNames: Set<string>) {
    return sanitizeScriptInfo(plugins, "plugin", usedNames);
}

function sanitizeLibraries(libraries: LibraryInfo[], usedNames: Set<string>) {
    return sanitizeScriptInfo(libraries, "library", usedNames);
}

function sanitizeLayout(layout: ScriptLayout, scripts: Set<string>) {
    if(!isObject(layout)) layout = {};

    // Remove invalid folders
    for(const folderId in layout) {
        const folder = layout[folderId];

        if(
            !isObject(folder)
            || !Array.isArray(folder.contents)
            || (folderId !== "root" && !isString(folder.name))
        ) {
            delete layout[folderId];
        }
    }

    // Make sure root exists
    const rootContents = layout.root.contents ?? [];
    layout.root = { contents: rootContents };

    // Confirm all the items are valid
    const seenFolders = new Set<string>(["root"]);

    for(const folderId in layout) {
        const folder = layout[folderId];
        const contents: LayoutItem[] = [];

        for(const item of folder.contents) {
            if(!isObject(item)) continue;

            if(item.type === "script") {
                if(!scripts.has(item.id)) continue;
                scripts.delete(item.id);

                contents.push({ type: "script", id: item.id });
            } else if(item.type === "folder") {
                if(!layout[item.id] || seenFolders.has(item.id)) continue;
                seenFolders.add(item.id);

                layout[item.id].parent = folderId;
                contents.push({ type: "folder", id: item.id });
            }
        }

        layout[folderId].contents = contents;
    }

    // Add unlinked folders to root
    for(const folderId in layout) {
        if(seenFolders.has(folderId)) continue;

        layout.root.contents.push({
            type: "folder",
            id: folderId
        });
    }

    // Add scripts that are not elsewhere to root
    for(const script of scripts) {
        layout.root.contents.push({
            type: "script",
            id: script
        });
    }

    return layout;
}

function sanitizePluginStorage(storage: PluginStorage) {
    if(!isObject(storage)) return {};

    for(const key in storage) {
        if(typeof storage[key] !== "object" || storage[key] === null) {
            delete storage[key];
        }
    }

    return storage;
}

function sanitizeHotkeys(hotkeys: ConfigurableHotkeysState) {
    if(!isObject(hotkeys)) return {};

    for(const id in hotkeys) {
        const invalidate = () => delete hotkeys[id];

        // null is allowed, it's an unbound hotkey
        if(typeof hotkeys[id] !== "object") {
            invalidate();
            continue;
        }
        if(hotkeys[id] === null) continue;

        let { key, keys, ctrl, shift, alt } = hotkeys[id];

        if(!key && !keys) {
            invalidate();
            continue;
        }
        if(key && keys) keys = undefined;

        if(key) {
            if(typeof key !== "string") {
                invalidate();
                continue;
            }
        } else {
            if(!Array.isArray(keys)) {
                invalidate();
                continue;
            }

            for(let i = 0; i < keys.length; i++) {
                if(typeof keys[i] !== "string") {
                    keys.splice(i, 1);
                    i--;
                }
            }

            if(keys.length === 0) {
                invalidate();
                continue;
            }
        }

        if(typeof ctrl !== "boolean") ctrl = undefined;
        if(typeof shift !== "boolean") shift = undefined;
        if(typeof alt !== "boolean") alt = undefined;

        hotkeys[id] = { key, keys, ctrl, shift, alt };
    }

    return hotkeys;
}

function copyOverDefault<T extends Record<string, any>>(obj: T, defaultVal: T): T {
    const newObj = Object.assign({}, defaultVal);
    if(!isObject(obj)) return newObj;

    for(const key in defaultVal) {
        if(typeof obj[key] === typeof defaultVal[key]) {
            newObj[key] = obj[key];
        }
    }

    return newObj;
}

function sanitizeSettings(settings: Settings) {
    const newSettings = copyOverDefault(settings, defaultSettings);

    // make sure menu view is either "grid" or "list"
    if(newSettings.menuView !== "grid" && newSettings.menuView !== "list") {
        newSettings.menuView = "grid";
    }

    return newSettings;
}

function sanitizeCacheInvalid(cacheInvalid: boolean) {
    return typeof cacheInvalid === "boolean" ? cacheInvalid : false;
}
