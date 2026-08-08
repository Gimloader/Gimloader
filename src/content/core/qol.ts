import StateManager from "$shared/state";
import { nop } from "$shared/utils";
import Rewriter from "./rewriter";

export function fixRDT() {
    if(makeHookUnenumerable()) return;
    setTimeout(makeHookUnenumerable);
}

// On load, Gimkit enumerates through all the properties of the react devtools hook and deletes them
function makeHookUnenumerable() {
    const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if(!hook) return false;

    for(const key in hook) {
        Object.defineProperty(hook, key, {
            enumerable: false
        });
    }

    return true;
}

export function disableConsoleWarning() {
    // biome-ignore lint/suspicious/noConsole: Used to disable other console logs
    const log = console.log;
    let remainingIgnores = 2;

    console.log = (start, ...data: any[]) => {
        // Allow other logs through
        if(
            typeof start !== "string"
            || !start.startsWith("%cStop")
                && !start.startsWith("%cThis is a browser")
        ) return log(start, ...data);

        remainingIgnores--;
        if(remainingIgnores <= 0) console.log = log;
    };
}

export function setupLogSuppression() {
    const fakeConsole = Object.assign({}, console) as any;
    const allowKeys = ["context"];

    const setConsoleKeys = (callback: (key: keyof Console) => any) => {
        for(const key in fakeConsole) {
            if(allowKeys.includes(key) || typeof fakeConsole[key] !== "function") continue;
            fakeConsole[key] = callback(key as keyof Console);
        }
    };

    StateManager.events.on("init", (state) => {
        if(!state.settings.suppressGimkitLogs) return;
        setConsoleKeys(() => nop);
    });

    StateManager.settings.on("suppressGimkitLogs", (enabled) => {
        if(enabled) setConsoleKeys(() => nop);
        else setConsoleKeys((key) => window.console[key]);
    });

    const fakeConsoleShared = Rewriter.createShared(null, "fakeConsole", fakeConsole);

    Rewriter.addParseHook(null, false, (code) => {
        return `const console=${fakeConsoleShared};${code}`;
    });
}
