import type { ConfigurableHotkeysState, LayoutItem, LibraryInfo, PluginInfo, PluginStorage, SavedState, ScriptLayout, Settings, State } from "$types/net/state";
import { defaultSettings } from "$shared/consts";
import debounce from "debounce";
import type { ScriptType } from "$types/net/messages";
import Scripts from "./scripts";

export const statePromise = new Promise<State>(async (res) => {
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

    const plugins = sanitizePlugins(savedState.plugins);
    const libraries = sanitizeLibraries(savedState.libraries);
    const pluginNames = new Set(plugins.map(p => p.name));
    const libraryNames = new Set(libraries.map(p => p.name));

    res({
        plugins,
        libraries,
        pluginLayout: sanitizeLayout(savedState.pluginLayout, pluginNames),
        libraryLayout: sanitizeLayout(savedState.libraryLayout, libraryNames),
        pluginStorage: sanitizePluginStorage(savedState.pluginStorage),
        pluginSettings: sanitizePluginStorage(savedState.pluginSettings),
        settings: sanitizeSettings(savedState.settings),
        hotkeys: sanitizeHotkeys(savedState.hotkeys),
        cacheInvalid: sanitizeCacheInvalid(savedState.cacheInvalid),
        availableUpdates: []
    });
});

const debounced: Record<string, () => void> = {};

export function saveDebounced(key: keyof SavedState) {
    // debounce just to be safe
    if(!debounced[key]) {
        debounced[key] = debounce(async () => {
            chrome.storage.local.set({ [key]: (await statePromise)[key] });
        }, 100);
    }

    debounced[key]();
}

const isString = (value: any) => value && typeof value === "string";
const isObject = (value: any) => typeof value === "object" && value !== null;

export function sanitizeScriptInfo(info: PluginInfo[], type: "plugin"): PluginInfo[];
export function sanitizeScriptInfo(info: LibraryInfo[], type: "library"): LibraryInfo[];
export function sanitizeScriptInfo(info: any[], type: ScriptType) {
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
        let failed = false;
        if(Scripts.has(info[i].name)) failed = true;
        else failed = Scripts.createScript(type, info[i]);

        if(failed) {
            info.splice(i, 1);
            i--;
        }
    }

    return info;
}

export function sanitizePlugins(plugins: PluginInfo[]) {
    return sanitizeScriptInfo(plugins, "plugin");
}

export function sanitizeLibraries(libraries: LibraryInfo[]) {
    return sanitizeScriptInfo(libraries, "library");
}

export function sanitizeLayout(layout: ScriptLayout, scripts: Set<string>) {
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
    layout.root ??= { contents: [] };

    // Confirm all the items are valid
    for(const folderId in layout) {
        const folder = layout[folderId];
        const contents: LayoutItem[] = [];

        for(const item of folder.contents) {
            if(!isObject(item)) continue;

            if(item.type === "script") {
                if(!scripts.has(item.id)) continue;
                scripts.delete(item.id);

                contents.push({ type: "script", id: item.id });
                Scripts.setFolder(item.id, folderId);
            } else if(item.type === "folder") {
                if(!layout[item.id]) continue;

                layout[item.id].parent = folderId;
                contents.push({ type: "folder", id: item.id });
            }
        }
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

export function sanitizePluginStorage(storage: PluginStorage) {
    if(!isObject(storage)) return {};

    for(const key in storage) {
        if(typeof storage[key] !== "object" || storage[key] === null) {
            delete storage[key];
        }
    }

    return storage;
}

export function sanitizeHotkeys(hotkeys: ConfigurableHotkeysState) {
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

export function copyOverDefault<T extends Record<string, any>>(obj: T, defaultVal: T): T {
    const newObj = Object.assign({}, defaultVal);
    if(!isObject(obj)) return newObj;

    for(const key in defaultVal) {
        if(typeof obj[key] === typeof defaultVal[key]) {
            newObj[key] = obj[key];
        }
    }

    return newObj;
}

export function sanitizeSettings(settings: Settings) {
    const newSettings = copyOverDefault(settings, defaultSettings);

    // make sure menu view is either "grid" or "list"
    if(newSettings.menuView !== "grid" && newSettings.menuView !== "list") {
        newSettings.menuView = "grid";
    }

    return newSettings;
}

export function sanitizeCacheInvalid(cacheInvalid: boolean) {
    return typeof cacheInvalid === "boolean" ? cacheInvalid : false;
}
