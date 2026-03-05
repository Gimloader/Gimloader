import Server from "$bg/net/server";
import { saveDebounced } from "$bg/state";
import type { StateMessages } from "$types/net/messages";
import type { State } from "$types/net/state";

export default class JsCacheHandler {
    static init() {
        Server.on("cacheInvalid", this.onCacheInvalid.bind(this));
    }

    static save() {
        saveDebounced("cacheInvalid");
    }

    static onCacheInvalid(state: State, message: StateMessages["cacheInvalid"]) {
        // Cancel the message if nothing changed
        if(state.cacheInvalid === message.invalid) return true;

        state.cacheInvalid = message.invalid;
        this.save();
    }
}
