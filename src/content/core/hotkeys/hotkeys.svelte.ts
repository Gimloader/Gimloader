import type { ConfigurableHotkeyOptions, HotkeyCallback, HotkeyOptions, HotkeyTrigger } from "$types/hotkeys";
import type { ConfigurableHotkeysState } from "$types/state";
import ConfigurableHotkey from "./configurable.svelte";
import { splicer } from "$content/utils";
import Port from "$shared/net/port.svelte";

type DefaultHotkey = HotkeyOptions & { callback: HotkeyCallback, id: string };

export default new class Hotkeys {
    hotkeys: DefaultHotkey[] = [];
    configurableHotkeys: ConfigurableHotkey[] = $state([]);
    pressedKeys = new Set<string>();
    pressed = new Set<string>();
    savedHotkeys: ConfigurableHotkeysState;

    init(saved: ConfigurableHotkeysState) {
        this.savedHotkeys = saved;

        window.addEventListener('keydown', (event) => {
            this.pressed.add(event.code);
            this.pressedKeys.add(event.key.toLowerCase());
            this.checkHotkeys(event);
        });

        window.addEventListener('keyup', (event) => {
            this.pressed.delete(event.code);
            this.pressedKeys.delete(event.key.toLowerCase());
        });

        window.addEventListener('blur', () => {
            this.releaseAll();
        });

        Port.on('hotkeyUpdate', ({ id, trigger }) => this.updateConfigurable(id, trigger));
        Port.on('hotkeysUpdate', ({ hotkeys }) => this.updateAllConfigurable(hotkeys));
    }

    updateState(saved: ConfigurableHotkeysState) {
        this.savedHotkeys = saved;

        for(let hotkey of this.configurableHotkeys) {
            hotkey.loadTrigger();
        }
    }

    addHotkey(id: any, options: HotkeyOptions, callback: HotkeyCallback) {
        let obj = { ...options, id, callback };
        this.hotkeys.push(obj);

        return splicer(this.hotkeys, obj);
    }

    removeHotkeys(id: any) {
        for(let i = 0; i < this.hotkeys.length; i++) {
            if(this.hotkeys[i].id === id) {
                this.hotkeys.splice(i, 1);
                i--;
            }
        }
    }
    
    addConfigurableHotkey(id: string, options: ConfigurableHotkeyOptions, callback: HotkeyCallback, pluginName?: string) {
        let obj = new ConfigurableHotkey(id, callback, options, pluginName);
        this.configurableHotkeys.push(obj);

        return splicer(this.configurableHotkeys, obj);
    }

    removeConfigurableHotkey(id: string) {
        for(let i = 0; i < this.configurableHotkeys.length; i++) {
            if(this.configurableHotkeys[i].id === id) {
                this.configurableHotkeys.splice(i, 1);
                i--;
            }
        }
    }

    removeConfigurableFromPlugin(pluginName: string) {
        for(let i = 0; i < this.configurableHotkeys.length; i++) {
            if(this.configurableHotkeys[i].pluginName === pluginName) {
                this.configurableHotkeys.splice(i, 1);
                i--;
            }
        }
    }

    releaseAll() {
        this.pressed.clear();
        this.pressedKeys.clear();
    }

    checkHotkeys(e: KeyboardEvent) {
        for(let hotkey of this.hotkeys) {
            if(this.checkTrigger(e, hotkey)) {
                if(hotkey.preventDefault || hotkey.preventDefault === undefined) e.preventDefault();
                hotkey.callback(e);
            }
        }

        for(let hotkey of this.configurableHotkeys) {
            if(hotkey.trigger && this.checkTrigger(e, hotkey.trigger)) {
                if(hotkey.preventDefault) e.preventDefault();
                hotkey.callback(e);
            }
        }
    }

    checkTrigger(e: KeyboardEvent, trigger: HotkeyTrigger) {
        if(trigger.key) {
            if(trigger.key != e.code) return false;
        } else {
            if(!trigger.keys.includes(e.code)) return false;

            for(let key of trigger.keys) {
                if(!this.pressed.has(key)) return false;
            }
        }

        return (!(trigger.ctrl && !e.ctrlKey) &&
        !(trigger.alt && !e.altKey) &&
        !(trigger.shift && !e.shiftKey));
    }

    saveConfigurable(id: string, trigger: HotkeyTrigger | null) {
        this.savedHotkeys[id] = $state.snapshot(trigger);
        Port.send("hotkeyUpdate", { id, trigger });
    }

    saveAllConfigurable() {
        for(let hotkey of this.configurableHotkeys) {
            this.savedHotkeys[hotkey.id] = $state.snapshot(hotkey.trigger);
        }

        Port.send("hotkeysUpdate", { hotkeys: this.savedHotkeys });
    }

    updateConfigurable(id: string, trigger: HotkeyTrigger | null) {
        let hotkey = this.configurableHotkeys.find(h => h.id === id);
        if(!hotkey) return;
        
        hotkey.trigger = trigger;
    }

    updateAllConfigurable(hotkeys: ConfigurableHotkeysState) {
        this.savedHotkeys = hotkeys;

        for(let id in hotkeys) {
            let existing = this.configurableHotkeys.find(h => h.id === id);
            if(existing && existing.trigger != hotkeys[id]) {
                existing.trigger = hotkeys[id];
            }
        }
    }
}