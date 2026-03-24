import type { ConfigurableHotkeyOptions, HotkeyOptions } from "$types/api/hotkeys";
import Hotkeys from "$core/hotkeys/hotkeys.svelte";
import { validate } from "$content/utils";
import * as z from "zod";

interface OldConfigurableOptions {
    category: string;
    title: string;
    preventDefault?: boolean;
    defaultKeys?: Set<string>;
}

/** @inline */
type KeyboardCallback = (e: KeyboardEvent) => void;

function keySetToCodes(keys: Set<string>) {
    const newKeys: string[] = [];

    const mapKeys = ["~", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "+", "{", "}", "|", ":", '"', "<", ">", "?"];
    const mapped = ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "[", "]", "\\", ";", "'", ",", ".", "/"];
    const codes = [
        "Backquote",
        "Digit1",
        "Digit2",
        "Digit3",
        "Digit4",
        "Digit5",
        "Digit6",
        "Digit7",
        "Digit8",
        "Digit9",
        "Digit0",
        "Minus",
        "Equal",
        "BracketLeft",
        "BracketRight",
        "Backslash",
        "Semicolon",
        "Quote",
        "Comma",
        "Period",
        "Slash"
    ];

    for(const key of keys) {
        let index = mapKeys.indexOf(key);
        if(index === -1) index = mapped.indexOf(key);
        if(index !== -1) newKeys.push(codes[index]);
        else if(key === "control") newKeys.push("ControlLeft");
        else if(key === "shift") newKeys.push("ShiftLeft");
        else if(key === "alt") newKeys.push("AltLeft");
        else {
            newKeys.push("Key" + key.charAt(0).toUpperCase() + key.slice(1));
        }
    }
    return newKeys;
}

const HotkeyTriggerSchema = z.union([
    z.object({ key: z.string() }),
    z.object({ keys: z.array(z.string()).min(1) })
]).and(z.object({
    ctrl: z.boolean().optional(),
    shift: z.boolean().optional(),
    alt: z.boolean().optional()
}));

const HotkeyOptionsSchema = HotkeyTriggerSchema.and(z.object({
    preventDefault: z.boolean().optional()
}));

const ConfigurableHotkeyOptionsSchema = z.object({
    category: z.string(),
    title: z.string(),
    preventDefault: z.boolean().optional(),
    default: HotkeyTriggerSchema.optional()
});

class BaseHotkeysApi {
    /**
     * Releases all keys, needed if a hotkey opens something that will
     * prevent keyup events from being registered, such as an alert
     */
    releaseAll() {
        Hotkeys.releaseAll();
    }

    /** Which key codes are currently being pressed */
    get pressed() {
        return Hotkeys.pressed;
    }

    /**
     * @deprecated Use {@link pressed} instead
     * @hidden
     */
    get pressedKeys() {
        return Hotkeys.pressedKeys;
    }
}

class HotkeysApi extends BaseHotkeysApi {
    /**
     * Adds a hotkey with a given id
     * @returns A function to remove the hotkey
     * @example
     * ```js
     * GL.hotkeys.addHotkey("MyPlugin", {
     *     key: "Digit1",
     *     ctrl: true,
     *     shift: true,
     *     preventDefault: true
     * }, (e) => {
     *     console.log("Hotkey pressed", e.key);
     * });
     * ```
     */
    addHotkey(id: string, options: HotkeyOptions, callback: KeyboardCallback) {
        validate("hotkeys.addHotkey", arguments, ["id", "string"], ["options", HotkeyOptionsSchema], ["callback", "function"]);

        return Hotkeys.addHotkey(id, options, callback);
    }

    /** Removes all hotkeys with a given id */
    removeHotkeys(id: string) {
        validate("hotkeys.removeHotkeys", arguments, ["id", "string"]);

        Hotkeys.removeHotkeys(id);
    }

    /**
     * Adds a hotkey which can be changed by the user
     * @param id A unique id for the hotkey, such as `myplugin-myhotkey`
     * @returns A function to remove the hotkey
     * @example
     * ```js
     * GL.hotkeys.addConfigurableHotkey("MyPlugin-MyHotkey", {
     *     category: "My Plugin",
     *     title: "Do a thing",
     *     preventDefault: true,
     *     default: {
     *         key: "Digit1",
     *         ctrl: true,
     *         shift: true
     *     }
     * }, (e) => {
     *     console.log("Configurable hotkey pressed", e.key);
     * });
     * ```
     */
    addConfigurableHotkey(id: string, options: ConfigurableHotkeyOptions, callback: KeyboardCallback) {
        validate("hotkeys.addConfigurableHotkey", arguments, ["id", "string"], ["options", ConfigurableHotkeyOptionsSchema], ["callback", "function"]);

        return Hotkeys.addConfigurableHotkey(id, options, callback);
    }

    /** Removes a configurable hotkey with a given id */
    removeConfigurableHotkey(id: string) {
        validate("hotkeys.removeConfigurableHotkey", arguments, ["id", "string"]);

        Hotkeys.removeConfigurableHotkey(id);
    }

    /**
     * @deprecated Use {@link addHotkey} instead
     * @hidden
     */
    add(keys: Set<string>, callback: KeyboardCallback, preventDefault: boolean = false) {
        Hotkeys.addHotkey(keys, {
            keys: keySetToCodes(keys),
            preventDefault
        }, callback);
    }

    /**
     * @deprecated Use {@link removeHotkeys} instead
     * @hidden
     */
    remove(keys: Set<string>) {
        Hotkeys.removeHotkeys(keys);
    }

    /**
     * @deprecated Use {@link addConfigurableHotkey} instead
     * @hidden
     */
    addConfigurable(pluginName: string, hotkeyId: string, callback: KeyboardCallback, options: OldConfigurableOptions) {
        const opts: ConfigurableHotkeyOptions = {
            title: options.title,
            category: options.category
        };
        if(options.preventDefault) opts.preventDefault = true;
        if(options.defaultKeys) opts.default = { keys: keySetToCodes(options.defaultKeys) };

        Hotkeys.addConfigurableHotkey(`${pluginName}-${hotkeyId}`, opts, callback);
    }

    /**
     * @deprecated Use {@link removeConfigurableHotkeys} instead
     * @hidden
     */
    removeConfigurable(pluginName: string, hotkeyId: string) {
        Hotkeys.removeConfigurableHotkey(`${pluginName}-${hotkeyId}`);
    }
}

class ScopedHotkeysApi extends BaseHotkeysApi {
    readonly #id: string;

    constructor(id: string) {
        super();

        this.#id = id;
    }

    /**
     * Adds a hotkey which will fire when certain keys are pressed
     * @returns A function to remove the hotkey
     * @example
     * ```js
     * api.hotkeys.addHotkey({
     *     key: "Digit1",
     *     ctrl: true,
     *     shift: true,
     *     preventDefault: true
     * }, (e) => {
     *     console.log("Hotkey pressed", e.key);
     * });
     * ```
     */
    addHotkey(options: HotkeyOptions, callback: KeyboardCallback) {
        validate("hotkeys.addHotkey", arguments, ["options", HotkeyOptionsSchema], ["callback", "function"]);

        return Hotkeys.addHotkey(this.#id, options, callback);
    }

    /**
     * Adds a hotkey which can be changed by the user
     * @returns A function to remove the hotkey
     * @example
     * ```js
     * api.hotkeys.addConfigurableHotkey({
     *     category: "My Plugin",
     *     title: "Do a thing",
     *     preventDefault: true,
     *     default: {
     *         key: "Digit1",
     *         ctrl: true,
     *         shift: true
     *     }
     * }, (e) => {
     *     console.log("Configurable hotkey pressed", e.key);
     * });
     * ```
     */
    addConfigurableHotkey(options: ConfigurableHotkeyOptions, callback: KeyboardCallback) {
        validate("hotkeys.addConfigurableHotkey", arguments, ["options", ConfigurableHotkeyOptionsSchema], ["callback", "function"]);

        return Hotkeys.addConfigurableHotkey(`${this.#id}-${options.category}-${options.title}`, options, callback, this.#id);
    }
}

Object.freeze(HotkeysApi);
Object.freeze(HotkeysApi.prototype);
Object.freeze(ScopedHotkeysApi);
Object.freeze(ScopedHotkeysApi.prototype);
export { HotkeysApi, ScopedHotkeysApi };
