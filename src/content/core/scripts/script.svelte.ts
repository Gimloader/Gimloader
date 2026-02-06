import type { ScriptHeaders } from "$types/scripts";
import type { ScriptType } from "$types/messages";
import type { ScriptInfo } from "$types/state";
import { error } from "$shared/utils";
import { log } from "$shared/utils";
import { getDepName, parseScriptHeaders } from "$shared/parseHeader";
import { gameState } from "$content/stores";
import Modals from "../modals.svelte";
import { scripts } from "./map";
import Commands from "../commands.svelte";
import Port from "$shared/net/port.svelte";

const apiCreatedRegex = /new\s+GL\s*\(/;

export abstract class Script<T extends ScriptInfo = ScriptInfo> {
    abstract type: ScriptType;
    abstract warnAbout: boolean;
    code: string;
    headers: ScriptHeaders = $state();
    requires: Script[] = [];
    optionalRequires: Script[] = [];
    requiredBy: Script[] = [];
    optionalBy: Script[] = [];
    onStop: (() => void)[] = [];
    exported: any;
    errored: boolean = $state(false);

    cleanupDeleteCommand: () => void;

    constructor(info: T, headers?: ScriptHeaders) {
        this.code = info.code;
        this.updateHeaders(headers);

        this.cleanupDeleteCommand = Commands.addCommand(null, {
            text: `Delete ${this.headers.name}`,
            keywords: ["remove", "uninstall"]
        }, () => {
            this.deleteConfirm();
        });
    }

    updateHeaders(headers?: ScriptHeaders) {
        if(headers) this.headers = headers;
        else this.headers = parseScriptHeaders(this.code);
    }

    started = false;
    startPromise: Promise<void> | null = null;
    start(initial: boolean, loaded: string[] = []) {
        if(this.startPromise) return this.startPromise;
        this.started = true;

        this.startPromise = new Promise<void>((res, rej) => {
            const newLoaded = [...loaded, this.headers.name];
            const { required, optional } = this.getDependencies();

            // Ensure there are no circular dependencies
            const allDeps = required.concat(optional);
            for(const dep of allDeps) {
                const name = dep.headers.name;

                if(newLoaded.includes(name)) {
                    const stack = newLoaded.join(" -> ") + ` -> ${name}`;
                    rej(new Error(`Circular dependency when loading ${this.headers.name} (${stack})`));
                    return;
                }
            }

            // Load all dependencies
            Promise.all([
                Promise.allSettled(required.map((dep) => dep.require(this, true, initial, newLoaded))),
                Promise.allSettled(optional.map((dep) => dep.require(this, false, initial, newLoaded)))
            ]).then(([requiredRes, optionalRes]) => {
                // Throw an error if any required dependencies failed to load
                for(const res of requiredRes) {
                    if(res.status === "fulfilled") continue;
                    rej(res.reason);
                    return;
                }

                this.requires = required;

                // Log any error with optional dependencies
                for(let i = 0; i < optionalRes.length; i++) {
                    const res = optionalRes[i];
                    if(res.status === "fulfilled") {
                        this.optionalRequires.push(optional[i]);
                    } else {
                        error(`Failed to load optional dependency for ${this.headers.name}:`, res.reason);
                    }
                }

                const uri = encodeURIComponent(this.headers.name);
                const sourceUrl = `\n//# sourceURL=gimloader://${this.type}/${uri}.js`;

                // Only create the api automatically if the plugin doesn't call new GL() itself for backwards compatibility
                const apiDeclaration = this.code.match(apiCreatedRegex) ? "" : `const api = new GL("${this.type}", "${this.headers.name}");\n`;

                const blob = new Blob([apiDeclaration, this.code, sourceUrl], { type: "application/javascript" });
                const url = URL.createObjectURL(blob);

                import(url)
                    .then((exports) => {
                        if(!initial) this.checkReloadNeeded();

                        if(exports.onStop && typeof exports.onStop === "function") {
                            this.onStop.push(exports.onStop);
                        }

                        if(exports.default) exports = exports.default;
                        this.exported = exports;

                        this.onImport?.(exports);
                        log(`Loaded ${this.type} ${this.headers.name}`);

                        res();
                    })
                    .catch(rej)
                    .finally(() => URL.revokeObjectURL(url));
            });
        });

        this.startPromise.catch((e) => {
            this.errored = true;
            error(e);
        });

        return this.startPromise;
    }

    onImport?(exports: any): void;

    get reloadNeeded() {
        return this.headers.reloadRequired === "true"
            || this.headers.reloadRequired === ""
            || (this.headers.reloadRequired === "ingame" && gameState.inGame)
            || (this.headers.reloadRequired === "notingame" && !gameState.inGame);
    }

    checkReloadNeeded() {
        if(this.reloadNeeded) {
            Modals.addReloadNeeded(this.headers.name);
        }
    }

    require(by: Script, required: boolean, initial: boolean, loaded: string[]) {
        if(required) this.requiredBy.push(by);
        else this.optionalBy.push(by);

        return this.start(initial, loaded);
    }

    unrequire(by: Script, required: boolean) {
        if(required) {
            const index = this.requiredBy.indexOf(by);
            if(index !== -1) this.requiredBy.splice(index, 1);
        } else {
            const index = this.optionalBy.indexOf(by);
            if(index !== -1) this.optionalBy.splice(index, 1);
        }
    }

    abstract getDependencyStrings(): Partial<Record<ScriptType, { required?: string[]; optional?: string[] }>>;

    getDependencies() {
        const strings = this.getDependencyStrings();
        const required: Script[] = [];
        const optional: Script[] = [];

        for(const type in strings) {
            const deps = strings[type as ScriptType];
            const requiredDeps = deps.required?.map(getDepName) ?? [];
            const optionalDeps = deps.optional?.map(getDepName) ?? [];
            const allDeps = requiredDeps.concat(optionalDeps);

            // Confirm the dependencies are all the correct type
            for(const depName of allDeps) {
                const script = scripts.get(depName);
                if(!script) continue;

                if(script.type !== type) throw new Error(`${this.headers.name} expected dependency ${depName} to be a ${type}, but it is a ${script.type}`);
            }

            // Confirm all required dependencies exist
            for(const depName of requiredDeps) {
                const script = scripts.get(depName);
                if(!script) throw new Error(`${this.headers.name} is missing ${type} dependency: ${depName}`);
                required.push(script);
            }

            for(const depName of optionalDeps) {
                const script = scripts.get(depName);
                if(!script) continue;
                optional.push(script);
            }
        }

        return { required, optional };
    }

    stop() {
        if(!this.started) return;

        try {
            for(const stop of this.onStop) stop?.();
        } catch (e) {
            error(`Error stopping ${this.headers.name}:`, e);
        }

        for(const used of this.requires) used.unrequire?.(this, true);
        for(const used of this.optionalRequires) used.unrequire?.(this, false);

        this.started = false;
        this.onStop = [];
        this.startPromise = null;
        this.exported = null;
        this.errored = false;
        this.requires = [];
        this.optionalRequires = [];
        this.requiredBy = [];
        this.optionalBy = [];

        log(`Stopped ${this.type} ${this.headers.name}`);
    }

    edit(code: string, headers?: ScriptHeaders) {
        this.code = code;
        this.updateHeaders(headers);
    }

    async deleteConfirm(confirmed = false) {
        const response = await Port.sendAndRecieve(`${this.type}TryDelete`, {
            name: this.headers.name,
            confirmed
        });

        if(response.status === "confirm") {
            const title = `Plugins depend on ${this.headers.name}`;
            const confirmed = await Modals.open("confirm", {
                text: response.message,
                title
            });
            if(!confirmed) return;

            this.deleteConfirm(true);
        }
    }

    delete() {
        this.stop();
        this.cleanupDeleteCommand();
    }
}
