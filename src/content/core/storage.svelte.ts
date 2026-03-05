import { clearId, splicer } from "$content/utils";
import { defaultSettings } from "$shared/consts";
import Port from "$shared/net/port.svelte";
import type { SettingsChangeCallback } from "$types/api/settings";
import type { PluginStorage, Settings } from "$types/net/state";
import EventEmitter2 from "eventemitter2";

/** @inline */
export type ValueChangeCallback = (value: any, remote: boolean) => void;

interface ValueChangeListener {
    id: string;
    key: string;
    callback: ValueChangeCallback;
}

interface SettingsChangeListener {
    id: string;
    key: string;
    callback: SettingsChangeCallback;
}

export default new class Storage extends EventEmitter2 {
    settings: Settings = $state(defaultSettings);
    values: PluginStorage;
    pluginSettings: PluginStorage = $state();
    valueListeners: ValueChangeListener[] = [];
    settingsListeners: SettingsChangeListener[] = [];

    init(values: PluginStorage, settings: Settings, pluginSettings: PluginStorage) {
        this.values = values;
        this.settings = settings;
        this.pluginSettings = pluginSettings;

        if(this.settings.showPluginButtons) {
            document.documentElement.classList.remove("noPluginButtons");
        }

        Port.on("settingUpdate", ({ key, value }) => this.updateSetting(key, value, false));
        Port.on("pluginValueUpdate", ({ id, key, value }) => this.setPluginValue(id, key, value, false));
        Port.on("pluginValueDelete", ({ id, key }) => this.deletePluginValue(id, key, false));
        Port.on("pluginSettingUpdate", ({ id, key, value }) => this.setPluginSetting(id, key, value, false));
        Port.on("clearPluginStorage", ({ id }) => this.deletePluginStorage(id, false));
    }

    updateState(values: PluginStorage, settings: Settings) {
        this.values = values;
        this.settings = settings;

        document.documentElement.classList.toggle("noPluginButtons", !this.settings.showPluginButtons);
    }

    updateSetting(key: string, value: any, emit = true) {
        this.settings[key] = value;
        if(emit) Port.send("settingUpdate", { key, value });
        else this.emit(key, value);

        switch (key) {
            case "showPluginButtons":
                document.documentElement.classList.toggle("noPluginButtons", !value);
                break;
        }
    }

    getPluginValue(id: string, key: string, defaultVal?: any) {
        const val = this.values[id]?.[key];
        if(val !== undefined) return val;
        return defaultVal ?? null;
    }

    setPluginValue(id: string, key: string, value: any, emit = true) {
        if(!this.values[id]) this.values[id] = {};
        this.values[id][key] = value;

        for(const listener of this.valueListeners) {
            if(listener.id === id && listener.key === key) {
                // if we are emitting it's not remote, and vice versa
                listener.callback(value, !emit);
            }
        }

        if(emit) Port.send("pluginValueUpdate", { id, key, value });
    }

    setPluginSetting(id: string, key: string, value: any, emit = true) {
        if(!this.pluginSettings[id]) this.pluginSettings[id] = {};
        this.pluginSettings[id][key] = value;

        for(const listener of this.settingsListeners) {
            if(listener.id === id && listener.key === key) {
                listener.callback(value, !emit);
            }
        }

        if(emit) Port.send("pluginSettingUpdate", { id, key, value });
    }

    deletePluginValue(id: string, key: string, emit = true) {
        const plugin = this.values[id];
        if(!plugin) return;
        delete plugin[key];
        if(emit) Port.send("pluginValueDelete", { id, key });
    }

    deletePluginStorage(id: string, emit = true) {
        delete this.values[id];
        if(emit) Port.send("clearPluginStorage", { id });
    }

    onPluginValueUpdate(id: string, key: string, callback: ValueChangeCallback) {
        return splicer(this.valueListeners, { id, key, callback });
    }

    onPluginSettingUpdate(id: string, key: string, callback: SettingsChangeCallback) {
        return splicer(this.settingsListeners, { id, key, callback });
    }

    offPluginValueUpdate(id: string, key: string, callback: ValueChangeCallback) {
        for(let i = 0; i < this.valueListeners.length; i++) {
            const listener = this.valueListeners[i];
            if(listener.id === id && listener.key === key && listener.callback === callback) {
                this.valueListeners.splice(i, 1);
                return;
            }
        }
    }

    removeValueListeners(id: string) {
        clearId(this.valueListeners, id);
    }
    removeSettingListeners(id: string) {
        clearId(this.settingsListeners, id);
    }
}();
