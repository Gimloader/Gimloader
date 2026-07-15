import { TypedEventEmitter } from "$shared/utils";
import type { HotkeyTrigger } from "$types/api/hotkeys";
import type { StateMessageProps } from "$types/net/messages";
import type { ConfigurableHotkeysState } from "$types/net/state";
import { stateMessageEvents } from "./events";
import StateProperty from "./property";

interface HotkeysEvents {
    configurableUpdate: [id: string, trigger: HotkeyTrigger | null];
    configurablesChange: [];
}

export default class HotkeysState extends TypedEventEmitter<HotkeysEvents> {
    configurable = new StateProperty<ConfigurableHotkeysState>({});

    constructor() {
        super();

        stateMessageEvents.on("hotkeyUpdate", this.onHotkeyUpdate.bind(this));
        stateMessageEvents.on("hotkeysUpdate", this.onHotkeysUpdate.bind(this));
    }

    init(hotkeys: ConfigurableHotkeysState) {
        this.configurable.init(hotkeys);
    }

    update(hotkeys: ConfigurableHotkeysState) {
        this.configurable.value = hotkeys;
        this.emit("configurablesChange");
    }

    onHotkeyUpdate({ id, trigger }: StateMessageProps<"hotkeyUpdate">) {
        this.configurable.value[id] = trigger;

        this.emit("configurableUpdate", id, trigger);
        this.emit("configurablesChange");
    }

    onHotkeysUpdate({ hotkeys }: StateMessageProps<"hotkeysUpdate">) {
        this.configurable.value = hotkeys;

        for(const id in hotkeys) {
            this.emit("configurableUpdate", id, hotkeys[id]);
        }

        this.emit("configurablesChange");
    }
}
