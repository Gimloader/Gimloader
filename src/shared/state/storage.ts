import type { PluginStorage } from "$types/net/state";
import type { StateMessageProps } from "$types/net/messages";
import StateProperty from "./property";
import { stateMessageEvents } from "./events";
import { TypedEventEmitter } from "$shared/utils";

interface StorageEvents {
    pluginStorageChange: [];
    pluginSettingsChange: [];
    pluginValueUpdate: [id: string, key: string, value: any, remote: boolean];
    pluginSettingUpdate: [id: string, key: string, value: any, remote: boolean];
}

export default class StorageState extends TypedEventEmitter<StorageEvents> {
    storage = new StateProperty<PluginStorage>({});
    pluginSettings = new StateProperty<PluginStorage>({});

    constructor() {
        super();

        stateMessageEvents.on("pluginValueDelete", this.onValueDelete.bind(this));
        stateMessageEvents.on("pluginValueUpdate", this.onValueUpdate.bind(this));
        stateMessageEvents.on("pluginSettingUpdate", this.onPluginSettingUpdate.bind(this));
        stateMessageEvents.on("clearPluginStorage", this.onClearPluginStorage.bind(this));
    }

    init(storage: PluginStorage, pluginSettings: PluginStorage) {
        this.storage.init(storage);
        this.pluginSettings.init(pluginSettings);
    }

    update(storage: PluginStorage, pluginSettings: PluginStorage) {
        for(const id in storage) {
            if(!this.storage.value[id]) continue;

            for(const key in storage[id]) {
                if(this.storage.value[id][key] === storage[id][key]) continue;
                this.emit("pluginValueUpdate", id, key, storage[id][key], true);
            }
        }

        this.storage.value = storage;
        this.pluginSettings.value = pluginSettings;

        this.emit("pluginStorageChange");
        this.emit("pluginSettingsChange");
    }

    onValueDelete({ id, key }: StateMessageProps<"pluginValueDelete">) {
        delete this.storage.value[id]?.[key];
        this.emit("pluginStorageChange");
    }

    onValueUpdate({ id, key, value }: StateMessageProps<"pluginValueUpdate">, remote: boolean) {
        this.storage.value[id] ??= {};
        this.storage.value[id][key] = value;
        this.emit("pluginStorageChange");
        this.emit("pluginValueUpdate", id, key, value, remote);
    }

    onPluginSettingUpdate({ id, key, value }: StateMessageProps<"pluginSettingUpdate">) {
        this.pluginSettings.value[id] ??= {};
        this.pluginSettings.value[id][key] = value;
        this.emit("pluginSettingsChange");
    }

    onClearPluginStorage({ id }: StateMessageProps<"clearPluginStorage">) {
        delete this.storage.value[id];
        this.emit("pluginStorageChange");
    }
}
