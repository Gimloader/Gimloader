import type { State } from "$types/net/state";
import type { Dependency } from "$types/net/downloads";
import type { Messages, OnceMessageProps, OnceResponder, ScriptEdit, StateMessages } from "$types/net/messages";
import Server from "$bg/net/server";
import ScriptHandler from "./script";
import Scripts from "$bg/scripts";
import { englishList } from "$shared/utils";
import Downloader from "$bg/net/downloader";

export default new class PluginsHandler extends ScriptHandler<"plugins"> {
    constructor() {
        super("plugin", "plugins", "pluginLayout");
    }

    override init() {
        super.init();

        Server.on("pluginCreate", this.onPluginCreate.bind(this));
        Server.on("pluginToggled", this.onPluginToggled.bind(this));
        Server.on("pluginSetAll", this.onPluginsSetAll.bind(this));
        Server.onMessage("tryTogglePlugin", this.tryTogglePlugin.bind(this));
        Server.onMessage("trySetAllPlugins", this.trySetAll.bind(this));
    }

    async onPluginCreate(state: State, message: Messages["pluginCreate"]) {
        await this.deleteConflicting(message.info.name);

        state.plugins.push(message.info);
        state.pluginLayout[message.folder].contents.push({
            type: "script",
            id: message.info.name
        });
        Scripts.createPlugin(message.info);

        Server.executeAndSend("cacheInvalid", { invalid: true });
        this.save();
        this.saveLayout();
    }

    onPluginToggled(state: State, message: StateMessages["pluginToggled"]) {
        const toggle = state.plugins.find(p => p.name === message.name);
        if(!toggle) return;

        toggle.enabled = message.enabled;

        Server.executeAndSend("cacheInvalid", { invalid: true });
        this.save();
    }

    onPluginsSetAll(state: State, message: StateMessages["pluginSetAll"]) {
        if(message.folder) {
            const names = this.getScriptsInFolder(state, message.folder);
            for(const name of names) {
                const plugin = state.plugins.find(p => p.name === name);
                if(!plugin) continue;

                plugin.enabled = message.enabled;
            }
        } else {
            for(const plugin of state.plugins) {
                plugin.enabled = message.enabled;
            }
        }

        Server.executeAndSend("cacheInvalid", { invalid: true });
        this.save();
    }

    override async onScriptEdit(state: State, message: ScriptEdit) {
        super.onScriptEdit(state, message);

        // Disable the plugin if it doesn't work anymore
        const { error, willDownload, willEnable } = Scripts.checkDependencies(message.name);
        if(error || willDownload.length > 0 || willEnable.length > 0) {
            await Server.executeAndSend("pluginToggled", { name: message.newName, enabled: false });
        }
    }

    async tryTogglePlugin(state: State, message: OnceMessageProps<"tryTogglePlugin">, respond: OnceResponder<"tryTogglePlugin">) {
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

            if(willDisable.size > 0 && !message.confirmed) {
                const names = englishList([...willDisable]);
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

    async trySetAll(state: State, message: OnceMessageProps<"trySetAllPlugins">, respond: OnceResponder<"trySetAllPlugins">) {
        if(!message.enabled) {
            if(message.folder) {
                const willDisable = this.getFolderWillDisable(state, message.folder);

                if(willDisable.size > 0 && !message.confirmed) {
                    const names = englishList([...willDisable]);
                    const folderName = state.pluginLayout[message.folder]?.name;
                    const confirmMessage = `Disabling all plugins in ${folderName} will also disable ${names}. Continue?`;
                    respond({ status: "confirm", message: confirmMessage });
                    return;
                }

                // Disable dependents
                for(const name of willDisable) {
                    await Server.executeAndSend("pluginToggled", { name, enabled: false });
                }
            }

            // No need to confirm anything if everything is going to be disabled
            Server.executeAndSend("pluginSetAll", { enabled: false, folder: message.folder });
            respond({ status: "success" });
            return;
        }

        const names = message.folder ? [...this.getScriptsInFolder(state, message.folder)] : state.plugins.map(p => p.name);

        const checks = names.map((name) => ({
            name,
            outcome: Scripts.checkDependencies(name)
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
            respond({ status: "dependencyConfirm", scripts: Array.from(warnAbout) });
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

        Server.executeAndSend("pluginSetAll", { enabled: true, folder: message.folder });
        respond({ status: "success" });
    }
}();
