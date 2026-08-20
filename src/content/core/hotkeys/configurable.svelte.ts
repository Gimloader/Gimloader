import StateManager from "$shared/state";
import type { ConfigurableHotkeyOptions, HotkeyCallback, HotkeyTrigger } from "$types/api/hotkeys";

export default class ConfigurableHotkey {
    id: string;
    category: string;
    title: string;
    preventDefault: boolean;
    callback: HotkeyCallback;
    trigger: HotkeyTrigger | null = $state(null);
    default?: HotkeyTrigger;
    pluginName?: string;

    constructor(id: string, callback: HotkeyCallback, options: ConfigurableHotkeyOptions, pluginName?: string) {
        this.id = id;
        this.category = options.category;
        this.title = options.title;
        this.preventDefault = options.preventDefault ?? true;
        this.default = options.default;
        this.callback = callback;
        this.pluginName = pluginName;

        this.loadTrigger();
    }

    loadTrigger() {
        const configurable = StateManager.hotkeys.configurable.value;

        if(configurable[this.id] === null) {
            this.trigger = null;
        } else if(configurable[this.id]) {
            this.trigger = Object.assign({}, configurable[this.id]);
        } else if(this.default) {
            this.trigger = Object.assign({}, this.default);
        }
    }

    reset() {
        if(this.default) this.trigger = Object.assign({}, this.default);
        else this.trigger = null;
    }
}
