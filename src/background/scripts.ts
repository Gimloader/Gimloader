import { parseDep, parseScriptHeaders } from "$shared/parseHeader";
import type { Dependency } from "$types/net/downloads";
import type { ScriptType } from "$types/net/messages";
import type { ScriptHeaders } from "$types/scripts";
import type { LibraryInfo, PluginInfo } from "$types/net/state";

interface BaseEntry {
    // Only direct dependents/dependencies
    dependencies: Dependency[];
    dependents: string[];
}

interface PluginEntry extends BaseEntry {
    type: "plugin";
    info: PluginInfo;
}

interface LibraryEntry extends BaseEntry {
    type: "library";
    info: LibraryInfo;
}

type ScriptEntry = PluginEntry | LibraryEntry;

export default class Scripts {
    static map = new Map<string, ScriptEntry>();

    static get(name: string) {
        return this.map.get(name);
    }

    static has(name: string) {
        return this.map.has(name);
    }

    static delete(name: string) {
        const entry = this.map.get(name);
        if(!entry) return;

        // Remove this as a dependency
        for(const dep of entry.dependencies) {
            const depEntry = this.map.get(dep.name);
            if(!depEntry) continue;

            depEntry.dependents = depEntry.dependents.filter(d => d !== name);
        }

        this.map.delete(name);
    }

    static clearType(type: ScriptType) {
        for(const [name, entry] of this.map) {
            if(entry.type === type) {
                this.map.delete(name);
            }
        }
    }

    static createScript(type: ScriptType, info: PluginInfo | LibraryInfo) {
        if(type === "plugin") return this.createPlugin(info as PluginInfo);
        else return this.createLibrary(info as LibraryInfo);
    }

    static findDependents(name: string): string[] {
        const dependents: string[] = [];

        for(const [scriptName, entry] of this.map) {
            if(entry.dependencies.some(dep => dep.name === name)) {
                dependents.push(scriptName);
            }
        }

        return dependents;
    }

    static createDeps(headers: ScriptHeaders, includePlugin: boolean) {
        const dependencies: Dependency[] = [];
        for(const lib of headers.needsLib) {
            const [name, url] = parseDep(lib);
            dependencies.push({ name, type: "library", url });
        }

        if(includePlugin) {
            for(const plugin of headers.needsPlugin) {
                const [name, url] = parseDep(plugin);
                dependencies.push({ name, type: "plugin", url });
            }
        }

        // Add to dependents
        for(const dep of dependencies) {
            const entry = this.map.get(dep.name);
            if(!entry) continue;
            entry.dependents.push(headers.name);
        }

        return dependencies;
    }

    static createPlugin(info: PluginInfo) {
        const headers = parseScriptHeaders(info.code);
        if(headers.isLibrary !== "false") return true;

        const dependencies = this.createDeps(headers, true);

        const dependents = this.findDependents(info.name);
        this.map.set(info.name, { type: "plugin", dependencies, info, dependents });
        return false;
    }

    static createLibrary(info: LibraryInfo) {
        const headers = parseScriptHeaders(info.code);
        if(headers.isLibrary === "false") return true;

        const dependencies = this.createDeps(headers, false);

        const dependents = this.findDependents(info.name);
        this.map.set(info.name, { type: "library", dependencies, info, dependents });
        return false;
    }

    static checkDependencies(name: string) {
        let error: string | null = null;
        const willDownload: Dependency[] = [];
        const willEnable: string[] = [];

        // Confirm there are no missing undownloadable scripts or circular dependencies
        const check = (checkName: string, stack: string[]) => {
            if(error) return;

            const script = this.map.get(checkName);
            if(!script) return;

            for(const dep of script.dependencies) {
                if(stack.includes(dep.name)) {
                    error = `Circular dependency found: ${[...stack, dep.name].join(" -> ")}`;
                    return;
                }

                const entry = this.map.get(dep.name);

                if(entry) {
                    if(entry.type === "plugin" && !entry.info.enabled) {
                        if(!willEnable.includes(dep.name)) {
                            willEnable.push(dep.name);
                        }
                    }

                    check(dep.name, [...stack, dep.name]);
                } else if(dep.url) {
                    if(!willDownload.some(d => d.name === dep.name)) {
                        willDownload.push(dep);
                    }
                } else {
                    error = `${name} requires ${dep.name}, which cannot be automatically downloaded`;
                    return;
                }
            }
        };
        check(name, [name]);

        return { error, willDownload, willEnable };
    }

    static checkDependents(name: string) {
        const willDisable: string[] = [];

        const check = (name: string) => {
            const script = this.map.get(name);
            if(!script) return;

            for(const depName of script.dependents) {
                const entry = this.map.get(depName);
                if(!entry) continue;

                if(entry.type === "plugin" && entry.info.enabled) {
                    willDisable.push(depName);
                }

                check(depName);
            }
        };
        check(name);

        return willDisable;
    }
}
