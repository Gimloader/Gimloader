import PluginManager from "$core/scripts/pluginManager.svelte";
import { validate } from "$content/utils";

class PluginsApi {
    readonly #id: string;

    constructor(id: string) {
        this.#id = id;
    }

    /** A list of all the plugins installed */
    get list() {
        return PluginManager.getScriptNames();
    }

    /** Whether a plugin exists and is enabled */
    isEnabled(name: string) {
        validate("plugins.isEnabled", arguments, ["name", "string"]);

        return PluginManager.isEnabled(name);
    }

    /** Gets the headers of a plugin, such as version, author, and description */
    getHeaders(name: string) {
        validate("plugins.getHeaders", arguments, ["name", "string"]);

        return PluginManager.getHeaders(name);
    }

    /** Gets the exported values of a plugin, if it has been enabled */
    get<T extends keyof Gimloader.Plugins>(name: T): Gimloader.Plugins[T] {
        validate("plugins.get", arguments, ["name", "string"]);

        return PluginManager.getExports(name as string);
    }

    /**
     * Gets a plugin by name, prompting the user to enable/download it if necessary. Returns a promise with its exports
     * @example
     * ```js
     * api.libs.require("Desynchronize", "https://raw.githubusercontent.com/Gimloader/builds/main/plugins/Desynchronize.js");
     * ```
     */
    require<T extends keyof Gimloader.Plugins>(name: T, downloadUrl?: string): Promise<Gimloader.Plugins[T]> {
        validate("plugins.require", arguments, ["name", "string"], ["downloadUrl?", "string"]);

        return PluginManager.require(this.#id, name as string, downloadUrl);
    }
}

Object.freeze(PluginsApi);
Object.freeze(PluginsApi.prototype);
export default PluginsApi;
