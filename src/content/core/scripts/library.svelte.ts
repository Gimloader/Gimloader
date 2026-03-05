import type { ScriptType } from "$types/net/messages";
import type { ScriptInfo } from "$types/net/state";
import { Script } from "./script.svelte";

export class Library extends Script<ScriptInfo> {
    type: ScriptType = "library";
    warnAbout = false;

    getDependencyStrings() {
        return {
            library: {
                required: this.headers.needsLib,
                optional: this.headers.optionalLib
            }
        };
    }

    // Automatically stop the library when not needed
    unrequire(by: Script, required: boolean) {
        super.unrequire(by, required);

        if(this.requiredBy.length === 0 && this.optionalBy.length === 0) {
            this.stop();
        }
    }
}
