import type { Script } from "./core/scripts/script.svelte";
import PluginManager from "$core/scripts/pluginManager.svelte";
import LibManager from "$core/scripts/libManager.svelte";

const scriptRegex = /gimloader:\/\/(plugins|libraries)\/(.+?)\.js:\d+:\d+/g;

interface ScopedInfo {
    id: string;
    script: Script;
    onStop: (cb: () => void) => void;
    openSettingsMenu?: (cb: () => void) => void;
}

export default function setupScoped(type?: string, name?: string): ScopedInfo {
    if(!type || !name) {
        const stack = new Error().stack;
        if(!stack) throw new Error("new GL() could not get stack trace, please provide type and name explicitly");

        // get the uuid of the blob that called this function
        let match: RegExpExecArray | null = null;
        let exec: RegExpExecArray | null = null;
        while(exec = scriptRegex.exec(stack)) match = exec;
        if(!match) throw new Error("new GL() needs to be called by a plugin or library");

        type = match[1];
        name = decodeURIComponent(match[2]);
    }

    if(type === "plugin") {
        const plugin = PluginManager.getScript(name);
        if(!plugin) throw new Error("new GL() called in an invalid context");

        return {
            id: plugin.headers.name,
            script: plugin,
            onStop: (cb: () => void) => plugin.onStop.push(cb),
            openSettingsMenu: (cb: () => void) => plugin.openSettingsMenu.push(cb)
        };
    } else {
        const library = LibManager.getScript(name);
        if(!library) throw new Error("new GL() called in an invalid context");

        return {
            id: library.headers.name,
            script: library,
            onStop: (cb: () => void) => library.onStop.push(cb)
        };
    }
}
