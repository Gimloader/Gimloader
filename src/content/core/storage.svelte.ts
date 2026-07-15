import type { SettingsChangeCallback } from "$types/api/settings";
import type { PluginStorage, Settings } from "$types/net/state";
import { clearId, splicer } from "$content/utils";
import { defaultSettings } from "$shared/consts";
import StateManager from "$shared/state";

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

export default new class Storage {
    settings: Settings = $state(defaultSettings);
    pluginSettings: PluginStorage = $state({});
    valueListeners: ValueChangeListener[] = [];
    settingsListeners: SettingsChangeListener[] = [];

    init() {
        if(this.settings.showPluginButtons) {
            document.documentElement.classList.remove("noPluginButtons");
        }

        StateManager.settings.settings.bind(() => this.settings, (settings) => this.settings = settings);
        StateManager.storage.pluginSettings.bind(() => this.pluginSettings, (pluginSettings) => this.pluginSettings = pluginSettings);

        StateManager.settings.on("showPluginButtons", (value) => {
            document.documentElement.classList.toggle("noPluginButtons", !value);
        });

        StateManager.storage.on("pluginValueUpdate", (id, key, value, remote) => {
            for(const listener of this.valueListeners) {
                if(listener.id === id && listener.key === key) {
                    listener.callback(value, remote);
                }
            }
        });

        StateManager.storage.on("pluginSettingUpdate", (id, key, value, remote) => {
            for(const listener of this.valueListeners) {
                if(listener.id === id && listener.key === key) {
                    listener.callback(value, remote);
                }
            }
        });
    }

    getPluginValue(id: string, key: string, defaultVal?: any) {
        const val = StateManager.storage.storage.value[id]?.[key];
        if(val !== undefined) return val;
        return defaultVal ?? null;
    }

    setPluginValue(id: string, key: string, value: any) {
        StateManager.apply("pluginValueUpdate", { id, key, value });
    }

    deletePluginValue(id: string, key: string) {
        StateManager.apply("pluginValueDelete", { id, key });
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
