import type { ConfigurableHotkeyOptions, HotkeyOptions } from "$types/api/hotkeys";
import Hotkeys from "$core/hotkeys/hotkeys.svelte";
import { validate } from "$content/utils";
import * as z from "zod";

/** @inline */
type KeyboardCallback = (e: KeyboardEvent) => void;

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

class HotkeysApi {
    readonly #id: string;

    constructor(id: string) {
        this.#id = id;
    }

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
export default HotkeysApi;
