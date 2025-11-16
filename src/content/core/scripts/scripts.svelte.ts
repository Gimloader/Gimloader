import { log } from "$content/utils";
import { parseScriptHeaders } from "$shared/parseHeader";
import type { ScriptHeaders } from "$types/scripts";
import Net from "$core/net/net";
import LibManager from "./libManager.svelte";
import Modals from "../modals.svelte";
import type { PluginSettingsDescription } from "$types/settings";
import Commands from "../commands.svelte";
import PluginManager from "./pluginManager.svelte";
import toast from "svelte-5-french-toast";
import { showMenu } from "$content/ui/mount";

const apiCreatedRegex = /new\s+GL\s*\(/;

// Unfortunately everything needs to be in one file for esbuild to not explode
// because of some circular dependencies
abstract class BaseScript {
    abstract type: string;
    script: string;
    headers: ScriptHeaders = $state();
    usedLibs: Lib[] = [];
    cleanupDeleteCommand: () => void;
    cleanupConfigureCommand: () => void;

    constructor(script: string, headers?: ScriptHeaders) {
        this.script = script;

        if(headers) this.headers = headers;
        else this.headers = parseScriptHeaders(script);
    }

    get id() {
        return `${this.type}-${this.headers.name}`;
    }

    runScript(initial: boolean, alreadyStartedLibs: string[] = []) {
        return new Promise<any>(async (res, rej) => {
            let success = await this.loadLibs(initial, alreadyStartedLibs)
                .catch(rej);
            if(!success) return;

            const uri = encodeURIComponent(this.headers.name);
            const host = this.type === "Plugin" ? "plugins" : "libraries";
            const sourceUrl = `\n//# sourceURL=gimloader://${host}/${uri}.js`;
            
            // Only create the api automatically if the plugin doesn't call new GL() itself for backwards compatibility
            const apiDeclaration = this.script.match(apiCreatedRegex) ? "" : `const api = new GL("${host}", "${this.headers.name}");\n`;
    
            const blob = new Blob([apiDeclaration, this.script, sourceUrl], { type: "application/javascript" });
            const url = URL.createObjectURL(blob);
    
            import(url)
                .then((returnVal) => {
                    if(!initial) this.checkReloadNeeded();
                    res(returnVal);
                })
                .catch(rej)
                .finally(() => URL.revokeObjectURL(url));
        });
    }

    checkReloadNeeded() {
        if(
            this.headers.reloadRequired === 'true' || 
            this.headers.reloadRequired === '' ||
            (this.headers.reloadRequired === 'ingame' && Net.type !== "None") ||
            (this.headers.reloadRequired === 'notingame' && Net.type === "None")
        ) {
            Modals.addReloadNeeded(this.headers.name);
        }
    }

    loadLibs(initial: boolean, alreadyStartedLibs: string[]) {
        return new Promise<boolean>(async (res, rej) => {
            this.usedLibs = [];

            if(this.type === "Library") {
                if(alreadyStartedLibs.includes(this.headers.name)) {
                    // circular import, bad
                    rej(new Error(`Circular reference when importing library ${this.headers.name}`));
                    return;
                }
                alreadyStartedLibs.push(this.headers.name);
            }

            let libObjs: Lib[] = [];
            let optionalLibObjs: Lib[] = [];

            // load required libs
            for(let lib of this.headers.needsLib) {
                let libName = lib.split('|')[0].trim();
                let libObj = LibManager.getLib(libName);

                if(!libObj) {
                    rej(new Error(`${this.type} ${this.headers.name} requires library ${libName} which is not installed`));
                    return;
                }

                libObjs.push(libObj);
            }

            // load optional libs
            for(let lib of this.headers.optionalLib) {
                let libName = lib.split('|')[0].trim();
                let libObj = LibManager.getLib(libName);

                if(!libObj) continue;
                optionalLibObjs.push(libObj);
            }

            this.usedLibs.push(...libObjs, ...optionalLibObjs);

            let [results, optionalResults] = await Promise.all([
                Promise.allSettled(libObjs.map(lib => lib.start(this.id, initial, alreadyStartedLibs))),
                Promise.allSettled(optionalLibObjs.map(lib => lib.start(this.id, initial, alreadyStartedLibs)))
            ]);

            // log errors with optional libs, but don't fail the load
            for(let result of optionalResults) {
                if(result.status === 'rejected') {
                    log(`Failed to enable optional library for ${this.type.toLowerCase()} ${this.headers.name}:`, result.reason);
                }
            }

            let failed = results.filter(r => r.status === 'rejected') as PromiseRejectedResult[];
            if(failed.length > 0) {
                let failMsg = failed.map(f => f.reason).join("\n");
                let err = new Error(`Error while enabling libraries for ${this.type.toLowerCase()} ${this.headers.name}:\n${failMsg}`);
                rej(err);
                return;
            }

            res(true);
        });
    }

    unloadLibs() {
        for(let lib of this.usedLibs) {
            lib.removeUsed(this.id);
        }
    }

    onDelete() {
        this.cleanupDeleteCommand?.();
        this.cleanupConfigureCommand?.();
    }
}

export class Plugin extends BaseScript {
    type = "Plugin";
    enabled: boolean = $state();
    exported: any;
    onStop: (() => void)[] = [];
    openSettingsMenu: (() => void)[] = $state([]);
    enablePromise: Promise<void> | null = null;
    errored = $state(false);
    settingsDescription?: PluginSettingsDescription;

    constructor(script: string, enabled = true) {
        super(script);
        this.setEnabled(enabled);

        this.cleanupDeleteCommand = Commands.addCommand(null, {
            group: "Plugins",
            text: `Delete ${this.headers.name}`,
            keywords: ["remove", "uninstall"]
        }, () => this.confirmDelete());

        this.cleanupConfigureCommand = Commands.addCommand(null, {
            group: "Plugins",
            text: `Configure ${this.headers.name}`,
            keywords: ["setting", "settings", "configure", "config"]
        }, () => {
            if (this.openSettingsMenu.length === 0) return;
            this.openSettingsMenu.forEach(c => c())
        });
    }

    confirmDelete() {
        if(!confirm(`Are you sure you want to delete ${this.headers.name}?`)) return;
        PluginManager.deletePlugin(this);
        toast.success(`Deleted plugin ${this.headers.name}`);
    }

    cleanupToggleCommand: () => void;
    setEnabled(enabled: boolean) {
        if(this.enabled === enabled) return;
        
        this.enabled = enabled;
        this.cleanupToggleCommand?.();

        const action = enabled ? "Disable" : "Enable";
        this.cleanupToggleCommand = Commands.addCommand(null, {
            group: "Plugins",
            text: `${action} ${this.headers.name}`,
            keywords: ["toggle"]
        }, () => {
            PluginManager.setEnabled(this, !enabled);
            toast.success(`${action}d ${this.headers.name}`);
        });
    }
    
    start(initial = false) {
        if(this.enablePromise) return this.enablePromise;

        this.enablePromise = new Promise<void>(async (res, rej) => {
            this.runScript(initial)
                .then((returnVal) => {
                    this.exported = returnVal;

                    if(returnVal.onStop && typeof returnVal.onStop === "function") {
                        this.onStop.push(returnVal.onStop);
                    }
                    if(returnVal.openSettingsMenu && typeof returnVal.openSettingsMenu === "function") {
                        this.openSettingsMenu.push(returnVal.openSettingsMenu);
                    }
            
                    log(`Loaded plugin: ${this.headers.name}`);

                    res();
                })
                .catch((e) => {
                    console.error(e);
                    this.errored = true;
                    rej(e);
                })
        });

        return this.enablePromise;
    }

    stop() {
        if(!this.enabled) return;

        try {
            for(let stop of this.onStop) stop?.();
        } catch (e) {
            console.error(`Error stopping plugin ${this.headers.name}:`, e);
        }

        this.onStop = [];
        this.openSettingsMenu = [];
        this.enablePromise = null;
        this.exported = null;
        this.errored = false;
        this.unloadLibs();
    }

    onDelete() {
        this.cleanupDeleteCommand?.();
        this.cleanupToggleCommand?.();
    }
}

export class Lib extends BaseScript {
    type = "Library";
    library: any;
    usedBy = new Set<string>();
    onStop: (() => void)[] = [];
    enablePromise: Promise<void> | null = null;

    constructor(script: string, headers?: ScriptHeaders) {
        super(script, headers);

        this.cleanupDeleteCommand = Commands.addCommand(null, {
            group: "Libraries",
            text: `Delete ${this.headers.name}`,
            keywords: ["remove", "uninstall"]
        }, () => this.confirmDelete());
    }

    confirmDelete() {
        if(!confirm(`Are you sure you want to delete ${this.headers.name}?`)) return;
        LibManager.deleteLib(this);
        toast.success(`Deleted library ${this.headers.name}`);
    }

    start(starter?: string, initial: boolean = false, alreadyStartedLibs: string[] = []) {
        if(this.enablePromise) return this.enablePromise;

        this.enablePromise = new Promise<void>((res, rej) => {
            if(starter) this.usedBy.add(starter);

            this.runScript(initial, alreadyStartedLibs)
                .then((returnVal) => {
                    if(returnVal.onStop && typeof returnVal.onStop === "function") {
                        this.onStop.push(returnVal.onStop);
                    }
    
                    if(returnVal.default) {
                        returnVal = returnVal.default;
                    }
            
                    this.library = returnVal;
                    res();
                })
                .catch(rej)
        });

        return this.enablePromise;
    }

    removeUsed(id: string) {
        this.usedBy.delete(id);
    
        if(this.usedBy.size === 0) {
            this.stop();
        }
    }

    stop() {
        // call onStop if it exists
        try {
            for(let stop of this.onStop) stop();
        } catch(e) {
            log(`Error stopping library ${this.headers.name}:`, e);
        }

        // reset the library
        this.onStop = [];
        this.library = null;
        this.enablePromise = null;
        this.unloadLibs();
    }
}
