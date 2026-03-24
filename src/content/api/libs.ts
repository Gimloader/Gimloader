import LibManager from "$core/scripts/libManager.svelte";
import { validate } from "$content/utils";

class LibsApi {
    /** A list of all the libraries installed */
    get list() {
        return LibManager.getScriptNames();
    }

    /** Gets whether or not a plugin is installed and enabled */
    isEnabled(name: string) {
        validate("libs.isEnabled", arguments, ["name", "string"]);

        return LibManager.isRunning(name);
    }

    /** Gets the headers of a library, such as version, author, and description */
    getHeaders(name: string) {
        validate("libs.getHeaders", arguments, ["name", "string"]);

        return LibManager.getHeaders(name);
    }

    /** Gets the exported values of a library */
    get<T extends keyof Gimloader.Libraries>(name: T): Gimloader.Libraries[T] {
        validate("libs.get", arguments, ["name", "string"]);

        return LibManager.getExports(name as string);
    }
}

class ScopedLibsApi extends LibsApi {
    readonly #id: string;

    constructor(id: string) {
        super();
        this.#id = id;
    }

    /**
     * Gets a library by name, prompting the user to enable/download it if necessary. Returns a promise with its exports.
     * @example
     * ```js
     * api.libs.require("Communication", "https://raw.githubusercontent.com/Gimloader/builds/main/libraries/Communication.js");
     * ```
     */
    require(name: string, downloadUrl?: string) {
        validate("plugins.require", arguments, ["name", "string"], ["downloadUrl?", "string"]);

        return LibManager.require(this.#id, name, downloadUrl);
    }
}

Object.freeze(LibsApi);
Object.freeze(LibsApi.prototype);
Object.freeze(ScopedLibsApi);
Object.freeze(ScopedLibsApi.prototype);
export { LibsApi, ScopedLibsApi };
