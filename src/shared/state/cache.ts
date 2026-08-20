import type { StateMessageProps } from "$types/net/messages";
import { TypedEventEmitter } from "$shared/utils";
import { stateMessageEvents } from "./events";
import StateProperty from "./property";

interface CacheEvents {
    invalidChange: [];
    invalid: [remote: boolean];
}

export default class CacheState extends TypedEventEmitter<CacheEvents> {
    invalid = new StateProperty<boolean>(false);

    constructor() {
        super();

        stateMessageEvents.on("cacheInvalid", this.onCacheInvalid.bind(this));
    }

    init(invalid: boolean) {
        this.invalid.value = invalid;

        this.emit("invalidChange");
        if(invalid) this.emit("invalid", true);
    }

    update(invalid: boolean) {
        this.invalid.value = invalid;

        this.emit("invalidChange");
        if(invalid) this.emit("invalid", true);
    }

    onCacheInvalid({ invalid }: StateMessageProps<"cacheInvalid">, remote: boolean) {
        this.invalid.value = invalid;

        this.emit("invalidChange");
        if(invalid) this.emit("invalid", remote);
    }
}
