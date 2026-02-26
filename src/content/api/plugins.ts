import PluginManager from "$core/scripts/pluginManager.svelte";
import { validate } from "$content/utils";

class BasePluginsApi {
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

class PluginsApi extends BasePluginsApi {
    /** Gets a plugin by name, prompting the user to enable/download it if necessary. Returns a promise with its exports. */
    require(id: string, name: string, downloadUrl?: string) {
        validate("plugins.require", arguments, ["id", "string"], ["name", "string"], ["downloadUrl?", "string"]);

        return PluginManager.require(id, name, downloadUrl);
    }
}

class ScopedPluginsApi extends BasePluginsApi {
    readonly #id: string;

    constructor(id: string) {
        super();
        this.#id = id;
    }

    /** Gets a plugin by name, prompting the user to enable/download it if necessary. Returns a promise with its exports. */
    require(name: string, downloadUrl?: string) {
        validate("plugins.require", arguments, ["name", "string"], ["downloadUrl?", "string"]);

        return PluginManager.require(this.#id, name, downloadUrl);
    }
}

Object.freeze(BasePluginsApi);
Object.freeze(BasePluginsApi.prototype);
Object.freeze(PluginsApi);
Object.freeze(PluginsApi.prototype);
export { PluginsApi, ScopedPluginsApi };
