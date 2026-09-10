/** @inline */
export interface HotkeyTrigger {
    /** Should be a keyboardevent [code](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code) */
    key?: string;
    /** Should be keyboardevent [codes](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code) */
    keys?: ReadonlyArray<string>;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
}

/** @inline */
export interface HotkeyModifiers {
    /** If set to false, the hotkey will still trigger default actions */
    preventDefault?: boolean;
    /**
     * If set to true, the hotkey will have propagation and immediate propagation stopped,
     * which generally prevents Gimkit from detecting the keystroke
     */
    stopPropagation?: boolean;
}

/** @inline */
export interface HotkeyOptions extends HotkeyTrigger, HotkeyModifiers {}

/** @inline */
export interface ConfigurableHotkeyOptions extends HotkeyModifiers {
    category: string;
    /** There should be no duplicate titles within a category */
    title: string;
    default?: HotkeyTrigger;
}

export type HotkeyCallback = (e: KeyboardEvent) => void;
