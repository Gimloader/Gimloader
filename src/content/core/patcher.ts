import { nop } from "$shared/utils";
import type { FunctionKeys, PatcherAfterCallback, PatcherBeforeCallback, PatcherInsteadCallback, PatcherSwapCallback } from "$types/api/patcher";
import Cleanup from "./scripts/cleanup";

type Patch =
    | { callback: PatcherBeforeCallback<any>; type: "before" }
    | { callback: PatcherAfterCallback<any>; type: "after" }
    | { callback: PatcherInsteadCallback<any>; type: "instead" }
    | { callback: PatcherSwapCallback<any>; type: "swap" };

interface PatchedProperty {
    original: any;
    patches: Patch[];
}

export default class Patcher {
    static patches = new WeakMap<object, Map<PropertyKey, PatchedProperty>>();

    static applyPatches(object: any, property: PropertyKey) {
        const properties = this.patches.get(object);
        if(!properties) return;

        const patches = properties.get(property);
        if(!patches) return;

        delete object[property];

        if(patches.patches.length === 0) {
            object[property] = patches.original;
        } else {
            object[property] = createPatch(patches.patches, patches.original);
        }
    }

    static addPatch(id: string | null, object: any, property: PropertyKey, patch: Patch) {
        if(!this.patches.has(object)) this.patches.set(object, new Map());

        const properties = this.patches.get(object);
        if(!properties) return nop;

        if(!properties.has(property)) {
            properties.set(property, { original: object[property], patches: [] });
        }

        const patches = properties.get(property);
        if(!patches) return nop;

        patches.patches.push(patch);
        this.applyPatches(object, property);

        return Cleanup.manualOrAutoCleanup(id, () => {
            const index = patches.patches.indexOf(patch);
            if(index === -1) return;

            patches.patches.splice(index, 1);
            this.applyPatches(object, property);

            if(patches.patches.length > 0) return;
            properties.delete(property);

            if(properties.size > 0) return;
            this.patches.delete(object);
        });
    }

    static after<O extends object, K extends FunctionKeys<O>>(
        id: string | null,
        object: O,
        property: K,
        callback: PatcherAfterCallback<O[K]>
    ) {
        const patch: Patch = { callback, type: "after" };

        return this.addPatch(id, object, property, patch);
    }

    static before<O extends object, K extends FunctionKeys<O>>(
        id: string | null,
        object: O,
        property: K,
        callback: PatcherBeforeCallback<O[K]>
    ) {
        const patch: Patch = { callback, type: "before" };

        return this.addPatch(id, object, property, patch);
    }

    static instead<O extends object, K extends FunctionKeys<O>>(
        id: string | null,
        object: O,
        property: K,
        callback: PatcherInsteadCallback<O[K]>
    ) {
        const patch: Patch = { callback, type: "instead" };

        return this.addPatch(id, object, property, patch);
    }

    static swap<O extends object, K extends FunctionKeys<O>>(
        id: string | null,
        object: O,
        property: K,
        callback: PatcherSwapCallback<O[K]>
    ) {
        const patch: Patch = { callback, type: "swap" };

        return this.addPatch(id, object, property, patch);
    }
}

const originalSymbol = Symbol("originalFunction");
const patchesSymbol = Symbol("patches");

function createPatch(patches: Patch[], original: any) {
    const newFunction = function PatchedFunction(this: any) {
        let shouldRunOriginal = true;
        let returnValue: any;
        let patchIndex = patches.length - 1;

        // Run patches in reverse order
        for(; patchIndex >= 0; patchIndex--) {
            const patch = patches[patchIndex];

            if(patch.type === "before") {
                const cancel = patch.callback(this, arguments as any);
                if(cancel) return;
            } else if(patch.type === "instead") {
                returnValue = patch.callback(this, arguments as any);
                shouldRunOriginal = false;
                break;
            } else if(patch.type === "swap") {
                returnValue = patch.callback.apply(this, arguments as any);
                shouldRunOriginal = false;
                break;
            }
        }

        if(shouldRunOriginal) returnValue = original.apply(this, arguments);
        if(patchIndex < 0) patchIndex = 0;

        // Go back up the stack for after patches
        for(; patchIndex < patches.length; patchIndex++) {
            const patch = patches[patchIndex];
            if(patch.type !== "after") continue;

            const newReturn = patch.callback(this, arguments as any, returnValue);
            if(newReturn) returnValue = newReturn;
        }

        return returnValue;
    } as any;

    // copy over prototypes and attributes
    for(const key of Object.getOwnPropertyNames(original)) {
        try {
            newFunction[key] = original[key];
        } catch {}
    }

    Object.setPrototypeOf(newFunction, Object.getPrototypeOf(original));

    // copy toString from the original
    newFunction.toString = () => original.toString();

    // Show what the patches/original were for debugging
    newFunction[originalSymbol] = original;
    newFunction[patchesSymbol] = patches;

    return newFunction;
}
