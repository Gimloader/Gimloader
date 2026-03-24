import Storage, { type ValueChangeCallback } from "$core/storage.svelte";
import { validate } from "$content/utils";

class StorageApi {
    /** Gets a value that has previously been saved */
    getValue(pluginName: string, key: string, defaultValue?: any) {
        validate("storage.getValue", arguments, ["pluginName", "string"], ["key", "string"]);

        return Storage.getPluginValue(pluginName, key, defaultValue);
    }

    /** Sets a value which can be retrieved later, through reloads */
    setValue(pluginName: string, key: string, value: any) {
        validate("storage.setValue", arguments, ["pluginName", "string"], ["key", "string"]);

        return Storage.setPluginValue(pluginName, key, value);
    }

    /** Removes a value which has been saved */
    deleteValue(pluginName: string, key: string) {
        validate("storage.deleteValue", arguments, ["pluginName", "string"], ["key", "string"]);

        return Storage.deletePluginValue(pluginName, key);
    }

    /**
     * @deprecated use {@link deleteValue}
     * @hidden
     */
    get removeValue() {
        return this.deleteValue;
    }

    /**
     * Adds a listener for when a plugin's stored value with a certain key changes
     * @returns a function that removes the listener when called
     * @example
     * ```js
     * GL.storage.onChange("MyPlugin", "key", (value, remote) => {
     *     console.log("Value is now", value);
     *     console.log("Value was updated", remote ? "remotely" : "locally");
     * });
     * ```
     */
    onChange(pluginName: string, key: string, callback: ValueChangeCallback) {
        validate("storage.onChange", arguments, ["pluginName", "string"], ["key", "string"], ["callback", "function"]);

        return Storage.onPluginValueUpdate(pluginName, key, callback);
    }

    /** Removes a listener added by onChange */
    offChange(pluginName: string, key: string, callback: ValueChangeCallback) {
        validate("storage.offChange", arguments, ["pluginName", "string"], ["key", "string"], ["callback", "function"]);

        Storage.offPluginValueUpdate(pluginName, key, callback);
    }

    /** Removes all listeners added by onChange for a certain plugin */
    offAllChanges(pluginName: string) {
        validate("storage.offAllChanges", arguments, ["pluginName", "string"]);

        Storage.removeValueListeners(pluginName);
    }
}

class ScopedStorageApi {
    readonly #id: string;

    constructor(id: string) {
        this.#id = id;
    }

    /** Gets a value that has previously been saved */
    getValue(key: string, defaultValue?: any) {
        validate("storage.getValue", arguments, ["key", "string"]);

        return Storage.getPluginValue(this.#id, key, defaultValue);
    }

    /** Sets a value which can be retrieved later, persisting through reloads */
    setValue(key: string, value: any) {
        validate("storage.setValue", arguments, ["key", "string"]);

        Storage.setPluginValue(this.#id, key, value);
    }

    /** Removes a value which has been saved */
    deleteValue(key: string) {
        validate("storage.deleteValue", arguments, ["key", "string"]);

        Storage.deletePluginValue(this.#id, key);
    }

    /**
     * Adds a listener for when a stored value with a certain key changes
     * @returns a function that removes the listener when called
     * @example
     * ```js
     * api.storage.onChange("key", (value, remote) => {
     *     console.log("Value is now", value);
     *     console.log("Value was updated", remote ? "remotely" : "locally");
     * });
     * ```
     */
    onChange(key: string, callback: ValueChangeCallback) {
        return Storage.onPluginValueUpdate(this.#id, key, callback);
    }
}

Object.freeze(StorageApi);
Object.freeze(StorageApi.prototype);
Object.freeze(ScopedStorageApi);
Object.freeze(ScopedStorageApi.prototype);
export { ScopedStorageApi, StorageApi };
