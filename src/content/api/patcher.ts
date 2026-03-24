import type { FunctionKeys, PatcherAfterCallback, PatcherBeforeCallback, PatcherInsteadCallback, PatcherSwapCallback } from "$types/api/patcher";
import Patcher from "$core/patcher";
import { validate } from "$content/utils";

function checkMethod(fnName: string, object: object, method: PropertyKey) {
    const type = typeof object?.[method];
    if(type === "function") return;

    throw new Error(`${fnName} expected object.${String(method)} to be a function, but got ${type}`);
}

class PatcherApi {
    /**
     * Runs a callback after a function on an object has been run
     * @returns A function to remove the patch
     * @example
     * ```js
     * const object = { method: () => 100 };
     * GL.patcher.after("MyPlugin", object, "method", (thisVal, args, returnVal) => {
     *     console.log("Came after:", returnVal);
     * });
     *
     * object.method(); // Logs "Came after: 100"
     * ```
     */
    after<O extends object, K extends FunctionKeys<O>>(
        id: string,
        object: O,
        method: K,
        callback: PatcherAfterCallback<O[K]>
    ) {
        validate("patcher.after", arguments, ["id", "string"], ["object", "any"], ["method", "string"], ["callback", "function"]);
        checkMethod("patcher.after", object, method);

        return Patcher.after(id, object, method, callback);
    }

    /**
     * Runs a callback before a function on an object has been run.
     * Return true from the callback to prevent the function from running
     * @returns A function to remove the patch
     * @example
     * ```js
     * const object = { method: (arg1, arg2) => 100 };
     * GL.patcher.before("MyPlugin", object, "method", (thisVal, args) => {
     *     console.log("Came before:", args);
     * });
     *
     * object.method(5, 6); // Logs "Came before: [5, 6]"
     * ```
     */
    before<O extends object, K extends FunctionKeys<O>>(
        id: string,
        object: O,
        method: K,
        callback: PatcherBeforeCallback<O[K]>
    ) {
        validate("patcher.before", arguments, ["id", "string"], ["object", "any"], ["method", "string"], ["callback", "function"]);
        checkMethod("patcher.before", object, method);

        return Patcher.before(id, object, method, callback);
    }

    /**
     * Runs a function instead of a function on an object
     * @returns A function to remove the patch
     * @example
     * ```js
     * const object = { method: (arg1, arg2) => 100 };
     * GL.patcher.instead("MyPlugin", object, "method", (thisVal, args) => {
     *     return args[0] + args[1];
     * });
     *
     * console.log(object.method(5, 6)); // Logs "11" instead of "100"
     * ```
     */
    instead<O extends object, K extends FunctionKeys<O>>(
        id: string,
        object: O,
        method: K,
        callback: PatcherInsteadCallback<O[K]>
    ) {
        validate("patcher.instead", arguments, ["id", "string"], ["object", "any"], ["method", "string"], ["callback", "function"]);
        checkMethod("patcher.instead", object, method);

        return Patcher.instead(id, object, method, callback);
    }

    /**
     * Replaces a function on an object with another function
     * @returns A function to remove the patch
     * @example
     * ```js
     * const object = { method: (arg1, arg2) => 100 };
     * GL.patcher.swap("MyPlugin", object, "method", (arg1, arg2) => {
     *     return arg1 + arg2;
     * });
     *
     * console.log(object.method(5, 6)); // Logs "11" instead of "100"
     * ```
     */
    swap<O extends object, K extends FunctionKeys<O>>(
        id: string,
        object: O,
        method: K,
        callback: PatcherSwapCallback<O[K]>
    ) {
        validate("patcher.swap", arguments, ["id", "string"], ["object", "any"], ["method", "string"], ["callback", "function"]);
        checkMethod("patcher.swap", object, method);

        return Patcher.swap(id, object, method, callback);
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
     * @example
     * ```js
     * const object = { method: () => 100 };
     * api.patcher.after(object, "method", (thisVal, args, returnVal) => {
     *     console.log("Came after:", returnVal);
     * });
     *
     * object.method(); // Logs "Came after: 100"
     * ```
     */
    after<O extends object, K extends FunctionKeys<O>>(
        object: O,
        method: K,
        callback: PatcherAfterCallback<O[K]>
    ) {
        validate("patcher.after", arguments, ["object", "any"], ["method", "string"], ["callback", "function"]);
        checkMethod("patcher.after", object, method);

        return Patcher.after(this.#id, object, method, callback);
    }

    /**
     * Runs a callback before a function on an object has been run.
     * Return true from the callback to prevent the function from running
     * @returns A function to remove the patch
     * @example
     * ```js
     * const object = { method: (arg1, arg2) => 100 };
     * api.patcher.before(object, "method", (thisVal, args) => {
     *     console.log("Came before:", args);
     * });
     *
     * object.method(5, 6); // Logs "Came before: [5, 6]"
     * ```
     */
    before<O extends object, K extends FunctionKeys<O>>(
        object: O,
        method: K,
        callback: PatcherBeforeCallback<O[K]>
    ) {
        validate("patcher.before", arguments, ["object", "any"], ["method", "string"], ["callback", "function"]);
        checkMethod("patcher.before", object, method);

        return Patcher.before(this.#id, object, method, callback);
    }

    /**
     * Runs a function instead of a function on an object
     * @returns A function to remove the patch
     * @example
     * ```js
     * const object = { method: (arg1, arg2) => 100 };
     * api.patcher.instead(object, "method", (thisVal, args) => {
     *     return args[0] + args[1];
     * });
     *
     * console.log(object.method(5, 6)); // Logs "11" instead of "100"
     * ```
     */
    instead<O extends object, K extends FunctionKeys<O>>(
        object: O,
        method: K,
        callback: PatcherInsteadCallback<O[K]>
    ) {
        validate("patcher.instead", arguments, ["object", "any"], ["method", "string"], ["callback", "function"]);
        checkMethod("patcher.instead", object, method);

        return Patcher.instead(this.#id, object, method, callback);
    }

    /**
     * Replaces a function on an object with another function
     * @returns A function to remove the patch
     * @example
     * ```js
     * const object = { method: (arg1, arg2) => 100 };
     * api.patcher.swap(object, "method", (arg1, arg2) => {
     *     return arg1 + arg2;
     * });
     *
     * console.log(object.method(5, 6)); // Logs "11" instead of "100"
     * ```
     */
    swap<O extends object, K extends FunctionKeys<O>>(
        object: O,
        method: K,
        callback: PatcherSwapCallback<O[K]>
    ) {
        validate("patcher.swap", arguments, ["object", "any"], ["method", "string"], ["callback", "function"]);
        checkMethod("patcher.swap", object, method);

        return Patcher.swap(this.#id, object, method, callback);
    }
}

Object.freeze(PatcherApi);
Object.freeze(PatcherApi.prototype);
Object.freeze(ScopedPatcherApi);
Object.freeze(ScopedPatcherApi.prototype);
export { PatcherApi, ScopedPatcherApi };
