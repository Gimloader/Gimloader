import type { FunctionKeys, PatcherAfterCallback, PatcherBeforeCallback, PatcherInsteadCallback, PatcherSwapCallback } from "$types/api/patcher";

type Patch =
    | { callback: PatcherBeforeCallback<any>; point: "before" }
    | { callback: PatcherAfterCallback<any>; point: "after" }
    | { callback: PatcherInsteadCallback<any>; point: "instead" }
    | { callback: PatcherSwapCallback<any>; point: "swap" };

export default class Patcher {
    static patches: Map<object, Map<PropertyKey, { original: any; patches: Patch[] }>> = new Map();
    static unpatchers: Map<string, (() => void)[]> = new Map();

    static applyPatches(object: object, property: PropertyKey) {
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
            switch (patch.point) {
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

    static addPatch(object: object, property: PropertyKey, patch: Patch) {
        if(!this.patches.has(object)) {
            this.patches.set(object, new Map([[property, { original: object[property], patches: [] }]]));
        }

        const properties = this.patches.get(object);
        if(!properties) return;

        if(!properties.has(property)) {
            properties.set(property, { original: object[property], patches: [] });
        }

        const patches = properties.get(property);
        if(!patches) return;

        patches.patches.push(patch);

        // apply patches to the object
        this.applyPatches(object, property);
    }

    static getRemovePatch(id: string | null, object: object, property: PropertyKey, patch: Patch) {
        const unpatch = () => {
            if(id) {
                // remove the patch from the id's list of unpatchers
                const unpatchers = this.unpatchers.get(id);
                if(unpatchers) {
                    const index = unpatchers.indexOf(unpatch);
                    if(index !== -1) {
                        unpatchers.splice(index, 1);
                    }
                }
            }

            // remove the patch from the patches map
            if(!this.patches.has(object)) return;

            const properties = this.patches.get(object);
            if(!properties) return;

            if(!properties.has(property)) return;

            const patches = properties.get(property);
            if(!patches) return;

            const index = patches.patches.indexOf(patch);
            if(index === -1) return;

            patches.patches.splice(index, 1);

            // apply patches to the object
            this.applyPatches(object, property);

            // if the list of patches is empty, remove the property from the map
            if(patches.patches.length === 0) {
                properties.delete(property);
            }

            // if the map of properties is empty, remove the object from the map
            if(properties.size === 0) {
                this.patches.delete(object);
            }
        };

        if(id) {
            if(!this.unpatchers.has(id)) {
                this.unpatchers.set(id, [unpatch]);
            } else {
                this.unpatchers.get(id)?.push(unpatch);
            }
        }

        return unpatch;
    }

    static after<O extends object, K extends FunctionKeys<O>>(
        id: string | null,
        object: O,
        property: K,
        callback: PatcherAfterCallback<O[K]>
    ) {
        const patch: Patch = { callback, point: "after" };

        this.addPatch(object, property, patch);

        return this.getRemovePatch(id, object, property, patch);
    }

    static before<O extends object, K extends FunctionKeys<O>>(
        id: string | null,
        object: O,
        property: K,
        callback: PatcherBeforeCallback<O[K]>
    ) {
        const patch: Patch = { callback, point: "before" };

        this.addPatch(object, property, patch);

        return this.getRemovePatch(id, object, property, patch);
    }

    static instead<O extends object, K extends FunctionKeys<O>>(
        id: string | null,
        object: O,
        property: K,
        callback: PatcherInsteadCallback<O[K]>
    ) {
        const patch: Patch = { callback, point: "instead" };

        this.addPatch(object, property, patch);

        return this.getRemovePatch(id, object, property, patch);
    }

    static swap<O extends object, K extends FunctionKeys<O>>(
        id: string | null,
        object: O,
        property: K,
        callback: PatcherSwapCallback<O[K]>
    ) {
        const patch: Patch = { callback, point: "swap" };

        this.addPatch(object, property, patch);

        return this.getRemovePatch(id, object, property, patch);
    }

    static unpatchAll(id: string) {
        const unpatchers = this.unpatchers.get(id);
        if(!unpatchers) return;

        for(let i = unpatchers.length - 1; i >= 0; i--) {
            unpatchers[i]();
        }
    }
}
