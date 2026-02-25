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

    console.log = (...data: any[]) => {
        // Allow all Gimloader logs through
        if(data[0] === "%c[GL]") return log(...data);

        remainingIgnores--;
        if(remainingIgnores <= 0) console.log = log;
    };
}
