import type { FunctionKeys, PatcherAfterCallback, PatcherBeforeCallback, PatcherInsteadCallback } from "$types/patcher";
import Patcher from "$core/patcher";
import { validate } from "$content/utils";

class PatcherApi {
    /**
     * Runs a callback after a function on an object has been run
     * @returns A function to remove the patch
     */
    after<O extends object, K extends FunctionKeys<O>>(
        id: string,
        object: O,
        method: K,
        callback: PatcherAfterCallback<O[K]>
    ) {
        validate("patcher.after", arguments, ["id", "string"], ["object", "object"], ["method", "string"], ["callback", "function"]);

        return Patcher.after(id, object, method, callback);
    }

    /**
     * Runs a callback before a function on an object has been run.
     * Return true from the callback to prevent the function from running
     * @returns A function to remove the patch
     */
    before<O extends object, K extends FunctionKeys<O>>(
        id: string,
        object: O,
        method: K,
        callback: PatcherBeforeCallback<O[K]>
    ) {
        validate("patcher.before", arguments, ["id", "string"], ["object", "object"], ["method", "string"], ["callback", "function"]);

        return Patcher.before(id, object, method, callback);
    }

    /**
     * Runs a function instead of a function on an object
     * @returns A function to remove the patch
     */
    instead<O extends object, K extends FunctionKeys<O>>(
        id: string,
        object: O,
        method: K,
        callback: PatcherInsteadCallback<O[K]>
    ) {
        validate("patcher.instead", arguments, ["id", "string"], ["object", "object"], ["method", "string"], ["callback", "function"]);

        return Patcher.instead(id, object, method, callback);
    }

    /** Removes all patches with a given id */
    unpatchAll(id: string) {
        validate("patcher.unpatchAll", arguments, ["id", "string"]);

        Patcher.unpatchAll(id);
    }
}

class ScopedPatcherApi {
    readonly #id: string;

    constructor(id: string) {
        this.#id = id;
    }

    /**
     * Runs a callback after a function on an object has been run
     * @returns A function to remove the patch
     */
    after<O extends object, K extends FunctionKeys<O>>(
        object: O,
        method: K,
        callback: PatcherAfterCallback<O[K]>
    ) {
        validate("patcher.after", arguments, ["object", "object"], ["method", "string"], ["callback", "function"]);

        return Patcher.after(this.#id, object, method, callback);
    }

    /**
     * Runs a callback before a function on an object has been run.
     * Return true from the callback to prevent the function from running
     * @returns A function to remove the patch
     */
    before<O extends object, K extends FunctionKeys<O>>(
        object: O,
        method: K,
        callback: PatcherBeforeCallback<O[K]>
    ) {
        validate("patcher.after", arguments, ["object", "object"], ["method", "string"], ["callback", "function"]);

        return Patcher.before(this.#id, object, method, callback);
    }

    /**
     * Runs a function instead of a function on an object
     * @returns A function to remove the patch
     */
    instead<O extends object, K extends FunctionKeys<O>>(
        object: O,
        method: K,
        callback: PatcherInsteadCallback<O[K]>
    ) {
        validate("patcher.after", arguments, ["object", "object"], ["method", "string"], ["callback", "function"]);

        return Patcher.instead(this.#id, object, method, callback);
    }
}

Object.freeze(PatcherApi);
Object.freeze(PatcherApi.prototype);
Object.freeze(ScopedPatcherApi);
Object.freeze(ScopedPatcherApi.prototype);
export { PatcherApi, ScopedPatcherApi };
