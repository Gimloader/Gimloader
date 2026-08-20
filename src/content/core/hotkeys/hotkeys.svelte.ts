import type { ConfigurableHotkeyOptions, HotkeyCallback, HotkeyOptions, HotkeyTrigger } from "$types/api/hotkeys";
import ConfigurableHotkey from "./configurable.svelte";
import StateManager from "$shared/state";
import Cleanup from "$core/scripts/cleanup";

type DefaultHotkey = HotkeyOptions & { callback: HotkeyCallback };

export default new class Hotkeys {
    hotkeys: DefaultHotkey[] = [];
    configurableHotkeys: ConfigurableHotkey[] = $state([]);
    pressedKeys = new Set<string>();
    pressed = new Set<string>();

    init() {
        window.addEventListener("keydown", (event) => {
            this.pressed.add(event.code);
            this.pressedKeys.add(event.key.toLowerCase());
            this.checkHotkeys(event);
        });

        window.addEventListener("keyup", (event) => {
            this.pressed.delete(event.code);
            this.pressedKeys.delete(event.key.toLowerCase());
        });

        window.addEventListener("blur", () => {
            this.releaseAll();
        });

        StateManager.hotkeys.addListener("configurableUpdate", (id, trigger) => {
            const hotkey = this.configurableHotkeys.find(h => h.id === id);
            if(hotkey) hotkey.trigger = trigger;
        });
    }

    addHotkey(id: string | null, options: HotkeyOptions, callback: HotkeyCallback) {
        return Cleanup.addCleanedUpItem(id, this.hotkeys, { ...options, callback });
    }

    addConfigurableHotkey(id: string, options: ConfigurableHotkeyOptions, callback: HotkeyCallback, pluginName?: string) {
        const obj = new ConfigurableHotkey(id, callback, options, pluginName);

        return Cleanup.addCleanedUpItem(id, this.configurableHotkeys, obj);
    }

    releaseAll() {
        this.pressed.clear();
        this.pressedKeys.clear();
    }

    checkHotkeys(e: KeyboardEvent) {
        for(const hotkey of this.hotkeys) {
            if(this.checkTrigger(e, hotkey)) {
                if(hotkey.preventDefault || hotkey.preventDefault === undefined) e.preventDefault();
                hotkey.callback(e);
            }
        }

        for(const hotkey of this.configurableHotkeys) {
            if(hotkey.trigger && this.checkTrigger(e, hotkey.trigger)) {
                if(hotkey.preventDefault) e.preventDefault();
                hotkey.callback(e);
            }
        }
    }

    checkTrigger(e: KeyboardEvent, trigger: HotkeyTrigger) {
        if(trigger.key) {
            if(trigger.key !== e.code) return false;
        } else {
            if(!trigger.keys?.includes(e.code)) return false;

            for(const key of trigger.keys) {
                if(!this.pressed.has(key)) return false;
            }
        }

        return (
            (trigger.ctrl === undefined || trigger.ctrl === e.ctrlKey)
            && (trigger.shift === undefined || trigger.shift === e.shiftKey)
            && (trigger.alt === undefined || trigger.alt === e.altKey)
        );
    }
}();
