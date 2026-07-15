import type { SavedState, State } from "$types/net/state";
import type { Dependency } from "$types/net/downloads";
import { log } from "$shared/utils";
import CacheState from "./cache";
import { apply, filterBroadcast, handle, stateEvents } from "./events";
import LibraryState from "./library";
import PluginState from "./plugin";
import AllScripts from "./allScripts";
import StorageState from "./storage";
import SettingsState from "./settings";
import HotkeysState from "./hotkeys";
import UpdatesState from "./updates";

interface Handlers {
    downloadDependencies: (deps: Dependency[]) => Promise<string[]> | string[];
    broadcast: (type: any, props: any) => void;
}

export default class StateManager {
    static events = stateEvents;
    static handle = handle;
    static apply = apply;
    static filterBroadcast = filterBroadcast;

    static handlers: Handlers;

    static allScripts = new AllScripts(this);
    static plugin = new PluginState(this);
    static library = new LibraryState(this);
    static settings = new SettingsState();
    static storage = new StorageState();
    static hotkeys = new HotkeysState();
    static cache = new CacheState();
    static updates = new UpdatesState();

    static init(state: State, handlers: Handlers) {
        log("Initial state:", state);

        this.events.on("broadcast", (type, props) => handlers.broadcast(type, props));
        this.handlers = handlers;

        this.plugin.init(state.plugins, state.pluginLayout);
        this.library.init(state.libraries, state.libraryLayout);
        this.settings.init(state.settings);
        this.storage.init(state.pluginStorage, state.pluginSettings);
        this.hotkeys.init(state.hotkeys);
        this.cache.init(state.cacheInvalid);
        this.updates.init(state.availableUpdates);

        this.events.emit("init", state);
    }

    static update(state: State) {
        this.plugin.update(state.plugins, state.pluginLayout);
        this.library.update(state.libraries, state.libraryLayout);
        this.settings.update(state.settings);
        this.storage.update(state.pluginStorage, state.pluginSettings);
        this.hotkeys.update(state.hotkeys);
        this.cache.update(state.cacheInvalid);
        this.updates.update(state.availableUpdates);

        this.plugin.afterUpdate();
        this.library.afterUpdate();
    }

    static getSavedState(): SavedState {
        return {
            plugins: this.plugin.scripts.value,
            libraries: this.library.scripts.value,
            pluginLayout: this.plugin.layout.value,
            libraryLayout: this.library.layout.value,
            pluginStorage: this.storage.storage.value,
            pluginSettings: this.storage.pluginSettings.value,
            settings: this.settings.settings.value,
            hotkeys: this.hotkeys.configurable.value,
            cacheInvalid: this.cache.invalid.value
        };
    }

    static getState(): State {
        return {
            ...this.getSavedState(),
            availableUpdates: this.updates.available.value
        };
    }
}
