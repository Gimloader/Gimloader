import type { PluginInfo, State } from "$types/net/state";
import Server from "$bg/net/server";
import type { Messages, OnceMessages, OnceResponses, ScriptEdit, StateMessages } from "$types/net/messages";
import ScriptHandler from "./script";
import Scripts from "$bg/scripts";
import { englishList } from "$shared/utils";
import Downloader from "$bg/net/downloader";
import type { Dependency } from "$types/net/downloads";

export default new class PluginsHandler extends ScriptHandler {
    constructor() {
        super("plugin", "plugins");
    }

    init() {
        super.init();

        Server.on("pluginCreate", this.onPluginCreate.bind(this));
        Server.on("pluginToggled", this.onPluginToggled.bind(this));
        Server.on("pluginSetAll", this.onPluginsSetAll.bind(this));
        Server.onMessage("tryTogglePlugin", this.tryTogglePlugin.bind(this));
        Server.onMessage("trySetAllPlugins", this.trySetAll.bind(this));
    }

    async onPluginCreate(state: State, message: Messages["pluginCreate"]) {
        await this.deleteConflicting(message.name);

        const info: PluginInfo = {
            name: message.name,
            code: message.code,
            enabled: message.enabled
        };

        state.plugins.push(info);
        Scripts.createPlugin(info);

        Server.executeAndSend("cacheInvalid", { invalid: true });
        this.save();
    }

    onPluginToggled(state: State, message: StateMessages["pluginToggled"]) {
        const toggle = state.plugins.find(p => p.name === message.name);
        toggle.enabled = message.enabled;

        Server.executeAndSend("cacheInvalid", { invalid: true });
        this.save();
    }

    onPluginsSetAll(state: State, message: StateMessages["pluginSetAll"]) {
        for(const plugin of state.plugins) {
            plugin.enabled = message.enabled;
        }

        Server.executeAndSend("cacheInvalid", { invalid: true });
        this.save();
    }

    async onScriptEdit(state: State, message: ScriptEdit) {
        super.onScriptEdit(state, message);

        // Disable the plugin if it doesn't work anymore
        const { error, willDownload, willEnable } = Scripts.checkDependencies(message.name);
        if(error || willDownload.length > 0 || willEnable.length > 0) {
            await Server.executeAndSend("pluginToggled", { name: message.newName, enabled: false });
        }
    }

    async tryTogglePlugin(state: State, message: OnceMessages["tryTogglePlugin"], respond: (response: OnceResponses["tryTogglePlugin"]) => void) {
        if(message.enabled) {
            const { error, willDownload, willEnable } = Scripts.checkDependencies(message.name);
            if(error) {
                respond({ status: "dependencyError", message: error });
                return;
            }

            const warnAbout = willDownload.filter((dep) => (
                (dep.type === "library" && !state.settings.autoDownloadMissingLibs)
                || (dep.type === "plugin" && !state.settings.autoDownloadMissingPlugins)
            ));

            // Prompt for confirmation if needed
            if((warnAbout.length > 0 || willEnable.length > 0) && !message.confirmed) {
                let msg = `Enabling ${message.name} `;
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

                respond({ status: "confirm", message: msg });
                return;
            }

            // Download dependencies
            if(willDownload.length > 0) {
                const failed = await Downloader.downloadDeps(willDownload);
                if(failed.length > 0) {
                    const message = `Dependencies could not be downloaded:\n${failed.join("\n")}`;
                    respond({ status: "downloadError", message });
                    return;
                }
            }

            // Enable dependencies
            for(const name of willEnable) {
                await Server.executeAndSend("pluginToggled", { name, enabled: true });
            }

            Server.executeAndSend("cacheInvalid", { invalid: true });
            Server.executeAndSend("pluginToggled", { name: message.name, enabled: message.enabled });

            respond({ status: "success" });
        } else {
            const willDisable = Scripts.checkDependents(message.name);

            if(willDisable.length > 0 && !message.confirmed) {
                const names = englishList(willDisable);
                const msg = `Disabling ${message.name} will also disable ${names}. Continue?`;
                respond({ status: "confirm", message: msg });
                return;
            }

            Server.executeAndSend("pluginToggled", { name: message.name, enabled: message.enabled });

            // Disable dependents
            for(const name of willDisable) {
                await Server.executeAndSend("pluginToggled", { name, enabled: false });
            }

            respond({ status: "success" });
        }
    }

    async trySetAll(state: State, message: OnceMessages["trySetAllPlugins"], respond: (response: OnceResponses["trySetAllPlugins"]) => void) {
        if(message.enabled) {
            const checks = state.plugins.map((script) => ({
                name: script.name,
                outcome: Scripts.checkDependencies(script.name)
            }));

            // Check if any failed
            const errored = checks.filter(c => c.outcome.error);
            if(errored.length > 0) {
                const message = errored.map(c => c.outcome.error).join("\n");
                respond({ status: "dependencyError", message, scripts: errored.map(c => c.name) });
                return;
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

                    if(
                        (dep.type === "library" && !state.settings.autoDownloadMissingLibs)
                        || (dep.type === "plugin" && !state.settings.autoDownloadMissingPlugins)
                    ) {
                        warnAbout.add(dep.name);
                    }
                }
            }

            if(warnAbout.size > 0 && !message.confirmed) {
                const names = englishList(Array.from(warnAbout));
                const message = `Enabling all plugins will download ${names}. Continue?`;
                respond({ status: "confirm", message, scripts: Array.from(warnAbout) });
                return;
            }

            // Download dependencies
            if(allDownloads.size > 0) {
                const failed = await Downloader.downloadDeps(downloadDeps);
                if(failed.length > 0) {
                    const message = `Dependencies could not be downloaded:\n${failed.join("\n")}`;
                    respond({ status: "downloadError", message });
                    return;
                }
            }

            Server.executeAndSend("pluginSetAll", { enabled: true });
            respond({ status: "success" });
        } else {
            // No need to confirm anything
            Server.executeAndSend("pluginSetAll", { enabled: false });
            respond({ status: "success" });
        }
    }
}();
