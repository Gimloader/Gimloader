import Rewriter, { type Exposer, type RunInScopeCallback } from "$core/rewriter";
import { validate } from "$content/utils";
import * as z from "zod";

const ExposerSchema = z.object({
    check: z.string().optional(),
    find: z.instanceof(RegExp),
    callback: z.function(),
    multiple: z.boolean().optional()
});

/**
 * The rewriter API allows you to modify the bundled code of Gimkit in order to expose values
 * or change certain behaviors. Due to the unpredictable nature of bundling, you cannot assume that variable names
 * will remain the same beteen updates.
 */
class RewriterApi {
    /**
     * Creates a hook that will modify the code of a script before it is run.
     * This value is cached, so this hook may not run on subsequent page loads.
     * addParseHook should always be called in the top level of a script.
     * @param pluginName The name of the plugin creating the hook.
     * @param prefix Limits the hook to only running on scripts beginning with this prefix.
     * Passing `true` will only run on the index script, and passing `false` will run on all scripts.
     * @param modifier A function that will modify the code, which should return the modified code.
     * @returns A function that removes the hook when called
     * @example
     * ```js
     * GL.rewriter.addParseHook("MyPlugin", "App", (code) => {
     *     let index = code.indexOf("something");
     *     code = code.slice(0, index) + `console.log("something else")` + code.slice(index);
     *     code += "console.log(someVar)";
     *     return code;
     * });
     * ```
     */
    addParseHook(pluginName: string, prefix: string | boolean, modifier: (code: string) => string) {
        validate("rewriter.addParseHook", arguments, ["pluginName", "string"], ["prefix", "string|boolean"], ["modifier", "function"]);

        return Rewriter.addParseHook(pluginName, prefix, modifier);
    }

    /** Removes all parse hooks created by a certain plugin */
    removeParseHooks(pluginName: string) {
        validate("rewriter.removeParseHooks", arguments, ["pluginName", "string"]);

        Rewriter.removeParseHooks(pluginName);
    }

    /**
     * Creates a shared value that can be accessed from any script.
     * @param pluginName The name of the plugin creating the shared value.
     * @param id A unique identifier for the shared value.
     * @param value The value to be shared.
     * @returns A string representing the code to access the shared value.
     * @example
     * ```js
     * const callback = GL.rewriter.createShared("MyPlugin", "uniqueId", (val) => {
     *     console.log(val);
     * });
     *
     * eval(`${callback}("15")`); // Don't actually do this, but it logs 15
     * ```
     */
    createShared(pluginName: string, id: string, value: any) {
        validate("rewriter.createShared", arguments, ["pluginName", "string"], ["id", "string"], ["value", "any"]);

        return Rewriter.createShared(pluginName, id, value);
    }

    /** Removes all values created by {@link createShared} by a certain plugin */
    removeShared(pluginName: string) {
        validate("rewriter.removeShared", arguments, ["pluginName", "string"]);

        Rewriter.removeShared(pluginName);
    }

    /** Removes the shared value with a certain id created by {@link createShared} */
    removeSharedById(pluginName: string, id: string) {
        validate("rewriter.removeSharedById", arguments, ["pluginName", "string"], ["id", "string"]);

        Rewriter.removeSharedById(pluginName, id);
    }

    /**
     * Runs code in the scope of modules when they are loaded, or when runInScope is called with them already loaded.
     * Returning true from the callback will remove the hook.
     * @returns A function that removes the hook when called
     * @example
     * ```js
     * GL.rewriter.runInScope("MyPlugin", "App", (code, run, initial) => {
     *     if(code.includes("something")) {
     *         run(`someVar=15`);
     *     }
     * });
     * ```
     */
    runInScope(pluginName: string, prefix: string | boolean, callback: RunInScopeCallback) {
        validate("rewriter.runInScope", arguments, ["pluginName", "string"], ["prefix", "string|boolean"], ["callback", "function"]);

        return Rewriter.runInScope(pluginName, prefix, callback);
    }

    /** Stops all hooks created by {@link runInScope} */
    removeRunInScope(pluginName: string) {
        validate("rewriter.removeRunInScopeHooks", arguments, ["pluginName", "string"]);

        Rewriter.removeRunInScope(pluginName);
    }

    /**
     * A utility function that exposes a variable based on regex to get its name.
     * @returns A function that removes the hook when called
     * @example
     * ```js
     * GL.rewriter.exposeVar("MyPlugin", "App", {
     *     check: "StringThatMustExistInFile",
     *     find: /let (\w+) = something/g,
     *     multiple: false,
     *     callback: (var) => console.log(var)
     * });
     * ```
     */
    exposeVar(pluginName: string, prefix: string | boolean, exposer: Exposer) {
        validate("rewriter.exposeVar", arguments, ["pluginName", "string"], ["prefix", "string|boolean"], ["exposer", ExposerSchema]);

        return Rewriter.exposeVar(pluginName, prefix, exposer);
    }
}

/**
 * The rewriter API allows you to modify the bundled code of Gimkit in order to expose values
 * or change certain behaviors. Due to the unpredictable nature of bundling, you cannot assume that variable names
 * will remain the same beteen updates.
 */
class ScopedRewriterApi {
    readonly #id: string;

    constructor(id: string) {
        this.#id = id;
    }

    /**
     * Creates a hook that will modify the code of a script before it is run.
     * This value is cached, so this hook may not run on subsequent page loads.
     * addParseHook should always be called in the top level of a script.
     * @param prefix Limits the hook to only running on scripts beginning with this prefix.
     * Passing `true` will only run on the index script, and passing `false` will run on all scripts.
     * @param modifier A function that will modify the code, which should return the modified code.
     * @returns A function that removes the hook when called
     * @example
     * ```js
     * api.rewriter.addParseHook("App", (code) => {
     *     let index = code.indexOf("something");
     *     code = code.slice(0, index) + `console.log("something else")` + code.slice(index);
     *     code += "console.log(someVar)";
     *     return code;
     * });
     * ```
     */
    addParseHook(prefix: string | boolean, modifier: (code: string) => string) {
        validate("rewriter.addParseHook", arguments, ["prefix", "string|boolean"], ["modifier", "function"]);

        return Rewriter.addParseHook(this.#id, prefix, modifier);
    }

    /**
     * Creates a shared value that can be accessed from any script.
     * @param id A unique identifier for the shared value.
     * @param value The value to be shared.
     * @returns A string representing the code to access the shared value.
     * @example
     * ```js
     * const callback = api.rewriter.createShared("uniqueId", (val) => {
     *     console.log(val);
     * });
     *
     * eval(`${callback}("15")`); // Don't actually do this, but it logs 15
     * ```
     */
    createShared(id: string, value: any) {
        validate("rewriter.createShared", arguments, ["id", "string"], ["value", "any"]);

        return Rewriter.createShared(this.#id, id, value);
    }

    /** Removes the shared value with a certain id created by {@link createShared} */
    removeSharedById(id: string) {
        validate("rewriter.removeSharedById", arguments, ["id", "string"]);

        Rewriter.removeSharedById(this.#id, id);
    }

    /**
     * Runs code in the scope of modules when they are loaded, or when runInScope is called with them already loaded.
     * Returning true from the callback will remove the hook.
     * @returns A function that removes the hook when called
     * @example
     * ```js
     * api.rewriter.runInScope("App", (code, run, initial) => {
     *     if(code.includes("something")) {
     *         run(`someVar=15`);
     *     }
     * });
     * ```
     */
    runInScope(prefix: string | boolean, callback: RunInScopeCallback) {
        validate("rewriter.runInScope", arguments, ["prefix", "string|boolean"], ["callback", "function"]);

        return Rewriter.runInScope(this.#id, prefix, callback);
    }

    /**
     * A utility function that exposes a variable based on regex to get its name.
     * @returns A function that removes the hook when called
     * @example
     * ```js
     * api.rewriter.exposeVar("App", {
     *     check: "StringThatMustExistInFile",
     *     find: /let (\w+) = something/g,
     *     multiple: false,
     *     callback: (var) => console.log(var)
     * });
     * ```
     */
    exposeVar(prefix: string | boolean, exposer: Exposer) {
        validate("rewriter.exposeVar", arguments, ["prefix", "string|boolean"], ["exposer", ExposerSchema]);

        return Rewriter.exposeVar(this.#id, prefix, exposer);
    }
}

Object.freeze(RewriterApi);
Object.freeze(RewriterApi.prototype);
Object.freeze(ScopedRewriterApi);
Object.freeze(ScopedRewriterApi.prototype);
export { RewriterApi, ScopedRewriterApi };
