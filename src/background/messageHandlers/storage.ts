import type { StateMessages } from "$types/net/messages";
import type { State } from "$types/net/state";
import Server from "$bg/net/server";
import { saveDebounced } from "../state";

export default class StorageHandler {
    static init() {
        Server.on("pluginValueUpdate", this.onPluginValueUpdate.bind(this));
        Server.on("pluginValueDelete", this.onPluginValueDelete.bind(this));
        Server.on("pluginSettingUpdate", this.onPluginSettingUpdate.bind(this));
        Server.on("clearPluginStorage", this.onClearPluginStorage.bind(this));
    }

    static saveStorage() {
        saveDebounced("pluginStorage");
    }
    static saveSettings() {
        saveDebounced("pluginSettings");
    }

    static onPluginValueUpdate(state: State, message: StateMessages["pluginValueUpdate"]) {
        if(!state.pluginStorage[message.id]) state.pluginStorage[message.id] = {};
        state.pluginStorage[message.id][message.key] = message.value;
        this.saveStorage();
    }

    static onPluginValueDelete(state: State, message: StateMessages["pluginValueDelete"]) {
        delete state.pluginStorage[message.id]?.[message.key];
        this.saveStorage();
    }

    static onPluginSettingUpdate(state: State, message: StateMessages["pluginSettingUpdate"]) {
        if(!state.pluginSettings[message.id]) state.pluginSettings[message.id] = {};
        state.pluginSettings[message.id][message.key] = message.value;
        this.saveSettings();
    }

    static onClearPluginStorage(state: State, message: StateMessages["clearPluginStorage"]) {
        delete state.pluginStorage[message.id];
        delete state.pluginSettings[message.id];
        this.saveStorage();
        this.saveSettings();
    }
}
