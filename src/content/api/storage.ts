import Storage, { type ValueChangeCallback } from "$core/storage.svelte";
import { validate } from "$content/utils";

/** Functions for persisting data between reloads */
class StorageApi {
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
    onChange(key: any, callback: ValueChangeCallback) {
        return Storage.onPluginValueUpdate(this.#id, key, callback);
    }

    /** Gets a value from the script's IndexedDB store */
    idbGet(key: any) {
        validate("storage.idbGet", arguments, ["key", "any"]);

        return Storage.idbGet(this.#id, key);
    }

    /**
     * Sets a value in the script's IndexedDB store. Can be anything which is structured-clonable,
     * including files, objects, arrays, etc.
     */
    idbSet(key: any, value: any) {
        validate("storage.idbSet", arguments, ["key", "any"], ["value", "any"]);

        return Storage.idbSet(this.#id, key, value);
    }

    /** Deletes a value from the script's IndexedDB store */
    idbDelete(key: any) {
        validate("storage.idbDelete", arguments, ["key", "any"]);

        return Storage.idbDelete(this.#id, key);
    }

    /** Clears the script's IndexedDB storage */
    idbClear() {
        return Storage.idbClear(this.#id);
    }
}

Object.freeze(StorageApi);
Object.freeze(StorageApi.prototype);
export default StorageApi;
