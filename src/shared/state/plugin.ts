import type { Dependency } from "$types/net/downloads";
import type { SetAllResult, StateMessageProps, ToggleResult } from "$types/net/messages";
import type { ScriptInfo } from "$types/net/state";
import type StateManager from ".";
import { englishList } from "$shared/utils";
import { apply, stateMessageEvents } from "./events";
import ScriptState from "./script";

export default class PluginState extends ScriptState<"plugin"> {
    constructor(stateManager: typeof StateManager) {
        super(stateManager, "plugin");

        stateMessageEvents.on("pluginToggled", this.onPluginToggled.bind(this));
        stateMessageEvents.on("pluginSetAll", this.onPluginSetAll.bind(this));
    }

    getInfo(info: ScriptInfo) {
        return {
            ...info,
            enabled: false
        };
    }

    onPluginToggled({ name, enabled }: StateMessageProps<"pluginToggled">) {
        const script = this.scripts.value.find(s => s.name === name);
        if(!script) return;

        script.enabled = enabled;

        this.emit("pluginToggled", name, enabled);
        this.emit("scriptUpdate");
    }

    onPluginSetAll({ enabled, folder }: StateMessageProps<"pluginSetAll">) {
        if(!folder) {
            for(const script of this.scripts.value) {
                if(script.enabled === enabled) continue;

                script.enabled = enabled;
                this.emit("pluginToggled", script.name, enabled);
            }

            return;
        }

        this.setAllInFolder(enabled, folder);
        this.emit("scriptUpdate");
    }

    setAllInFolder(enabled: boolean, folder: string) {
        const layoutFolder = this.layout.value[folder];
        if(!folder) return;

        for(const item of layoutFolder.contents) {
            if(item.type === "folder") {
                this.setAllInFolder(enabled, item.id);
            } else {
                const plugin = this.getScript(item.id);
                if(!plugin || plugin.enabled === enabled) continue;

                plugin.enabled = enabled;
                this.emit("pluginToggled", plugin.name, enabled);
            }
        }
    }

    override create(code: string, folder: string) {
        const name = super.create(code, folder);
        this.tryTogglePlugin(name, true);

        return name;
    }

    async tryTogglePlugin(name: string, enabled: boolean, confirmed = false): Promise<ToggleResult> {
        if(enabled) {
            const { error, willDownload, willEnable } = this.checkDependencies(name);
            if(error) return { status: "dependencyError", message: error };

            const warnAbout = willDownload.filter((dep) => this.shouldWarnAbout(dep));

            // Prompt for confirmation if needed
            if((warnAbout.length > 0 || willEnable.length > 0) && !confirmed) {
                let msg = `Enabling ${name} `;
                if(warnAbout.length > 0) {
                    const names = englishList(warnAbout.map(d => d.name));
                    msg += `will download ${names}`;
                }
                if(willEnable.length > 0) {
                    if(warnAbout.length > 0) msg += " and ";
                    const names = englishList(willEnable);
                    msg += `will enable ${names}`;
                }
                msg += ". Continue?";

                return { status: "confirm", message: msg };
            }

            // Download dependencies
            if(willDownload.length > 0) {
                const failed = await this.stateManager.handlers.downloadDependencies(willDownload);
                if(failed.length > 0) {
                    const message = `Dependencies could not be downloaded:\n${failed.join("\n")}`;
                    return { status: "downloadError", message };
                }
            }

            // Enable dependencies
            for(const name of willEnable) {
                apply("pluginToggled", { name, enabled: true });
            }

            apply("cacheInvalid", { invalid: true });
            apply("pluginToggled", { name: name, enabled: enabled });

            return { status: "success" };
        } else {
            const willDisable = this.checkDependents(name);

            if(willDisable.size > 0 && !confirmed) {
                const names = englishList([...willDisable]);
                const msg = `Disabling ${name} will also disable ${names}. Continue?`;
                return { status: "confirm", message: msg };
            }

            apply("pluginToggled", { name, enabled: false });

            // Disable dependents
            for(const name of willDisable) {
                apply("pluginToggled", { name, enabled: false });
            }

            return { status: "success" };
        }
    }

    async trySetAllPlugins(enabled: boolean, folder: string | undefined, confirmed = false): Promise<SetAllResult> {
        if(!enabled) {
            if(folder) {
                const willDisable = this.getFolderWillDisable(folder);

                if(willDisable.size > 0 && !confirmed) {
                    const names = englishList([...willDisable]);
                    const folderName = this.layout.value[folder]?.name;
                    const confirmMessage = `Disabling all plugins in ${folderName} will also disable ${names}. Continue?`;
                    return { status: "confirm", message: confirmMessage };
                }

                // Disable dependents
                for(const name of willDisable) {
                    apply("pluginToggled", { name, enabled: false });
                }
            }

            // No need to confirm anything if everything is going to be disabled
            apply("pluginSetAll", { enabled: false, folder: folder });
            return { status: "success" };
        }

        const names = folder ? [...this.getScriptsInFolder(folder)] : this.scripts.value.map(p => p.name);

        const checks = names.map((name) => ({
            name,
            outcome: this.checkDependencies(name)
        }));

        // Check if any failed
        const errored = checks.filter(c => c.outcome.error);
        if(errored.length > 0) {
            const message = errored.map(c => c.outcome.error).join("\n");
            return { status: "dependencyError", message, scripts: errored.map(c => c.name) };
        }

        // Check if anything needs downloading
        const warnAbout = new Set<string>();
        const allDownloads = new Set<string>();
        const downloadDeps: Dependency[] = [];

        for(const check of checks) {
            for(const dep of check.outcome.willDownload) {
                if(allDownloads.has(dep.name)) continue;
                allDownloads.add(dep.name);
                downloadDeps.push(dep);

                if(this.shouldWarnAbout(dep)) warnAbout.add(dep.name);
            }
        }

        if(warnAbout.size > 0 && !confirmed) {
            return { status: "dependencyConfirm", scripts: Array.from(warnAbout) };
        }

        // Download dependencies
        if(allDownloads.size > 0) {
            const failed = await this.stateManager.handlers.downloadDependencies(downloadDeps);
            if(failed.length > 0) {
                const message = `Dependencies could not be downloaded:\n${failed.join("\n")}`;
                return { status: "downloadError", message };
            }
        }

        apply("pluginSetAll", { enabled: true, folder });
        return { status: "success" };
    }
}
