import { TypedEventEmitter } from "$shared/utils";
import type { StateMessageProps } from "$types/net/messages";
import { stateMessageEvents } from "./events";
import StateProperty from "./property";

interface UpdatesEvents {
    available: [updates: string[]];
}

export default class UpdatesState extends TypedEventEmitter<UpdatesEvents> {
    available = new StateProperty<string[]>([]);

    constructor() {
        super();
        stateMessageEvents.on("availableUpdates", this.onAvailableUpdates.bind(this));
    }

    init(updates: string[]) {
        this.available.init(updates);

        if(updates.length > 0) this.emit("available", updates);
    }

    update(updates: string[]) {
        this.available.value = updates;
        this.emit("available", updates);
    }

    onAvailableUpdates({ updates }: StateMessageProps<"availableUpdates">) {
        this.available.value = updates;
        this.emit("available", updates);
    }
}
