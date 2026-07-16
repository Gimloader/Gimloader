import type { ScriptType } from "$types/net/messages";
import type StateManager from ".";
import { parseScriptHeaders } from "$shared/parseHeader";
import { apply } from "./events";
import { scriptMap } from "./script";

export default class AllScripts {
    stateManager: typeof StateManager;

    constructor(stateManager: typeof StateManager) {
        this.stateManager = stateManager;
    }

    editOrCreate(code: string, name: string | null, folder?: string, updated?: boolean) {
        const headers = parseScriptHeaders(code);
        const type: ScriptType = headers.isLibrary !== "false" ? "library" : "plugin";

        if(name && scriptMap.has(name)) {
            const old = scriptMap.get(name)!;

            // Delete and recreate the script if it changed types
            if(type !== old.type) {
                apply(`${old.type}Delete`, { name });
                this.stateManager[type].create(code, folder ?? "root");
            } else {
                apply(`${type}Edit`, {
                    name: name,
                    newName: headers.name,
                    code: code,
                    updated: updated
                });
            }
        } else {
            this.stateManager[type].create(code, folder ?? "root");
        }

        apply("cacheInvalid", { invalid: true });
    }

    exists(name: string) {
        return scriptMap.has(name);
    }

    get(name: string) {
        return scriptMap.get(name);
    }
}
