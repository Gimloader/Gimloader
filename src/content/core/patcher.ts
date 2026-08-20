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

        // reset the property to its original value
        object[property] = patches.original;

        // apply all patches
        for(const patch of patches.patches) {
            const original = object[property];
            switch (patch.type) {
                case "before":
                    object[property] = function() {
                        const cancel = patch.callback(this, arguments as any);
                        if(cancel) return;
                        return original.apply(this, arguments);
                    };
                    break;
                case "after":
                    object[property] = function() {
                        const returnValue = original.apply(this, arguments);
                        const newReturn = patch.callback(this, arguments as any, returnValue);

                        if(newReturn) return newReturn;
                        return returnValue;
                    };
                    break;
                case "instead":
                    object[property] = function() {
                        return patch.callback(this, arguments as any);
                    };
                    break;
                case "swap":
                    object[property] = function() {
                        return patch.callback.apply(this, arguments as any);
                    };
                    break;
            }

            // copy over prototypes and attributes
            for(const key of Object.getOwnPropertyNames(patches.original)) {
                try {
                    object[property][key] = patches.original[key];
                } catch {}
            }

            Object.setPrototypeOf(object[property], Object.getPrototypeOf(patches.original));

            // copy toString from the original
            object[property].toString = () => patches.original.toString();
        }
    }

    static addPatch(id: string | null, object: any, property: PropertyKey, patch: Patch) {
        if(!this.patches.has(object)) this.patches.set(object, new Map());

        const properties = this.patches.get(object);
        if(!properties) return;

        if(!properties.has(property)) {
            properties.set(property, { original: object[property], patches: [] });
        }

        const patches = properties.get(property);
        if(!patches) return;

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
