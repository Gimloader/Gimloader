import PluginManager from "$core/scripts/pluginManager.svelte";
import { validate } from "$content/utils";

class PluginsApi {
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
     * @deprecated Use {@link get} instead
     * @hidden
     */
    getPlugin(name: string) {
        return { return: PluginManager.getExports(name) };
    }
}

class ScopedPluginsApi extends PluginsApi {
    readonly #id: string;

    constructor(id: string) {
        super();
        this.#id = id;
    }

    /**
     * Gets a plugin by name, prompting the user to enable/download it if necessary. Returns a promise with its exports
     * @example
     * ```js
     * api.libs.require("Desynchronize", "https://raw.githubusercontent.com/Gimloader/builds/main/plugins/Desynchronize.js");
     * ```
     */
    require(name: string, downloadUrl?: string) {
        validate("plugins.require", arguments, ["name", "string"], ["downloadUrl?", "string"]);

        return PluginManager.require(this.#id, name, downloadUrl);
    }
}

Object.freeze(PluginsApi);
Object.freeze(PluginsApi.prototype);
Object.freeze(ScopedPluginsApi);
Object.freeze(ScopedPluginsApi.prototype);
export { PluginsApi, ScopedPluginsApi };
