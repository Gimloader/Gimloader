import type { PluginInfo } from "$types/net/state";
import ScriptManager from "./scriptManager.svelte";
import { Plugin } from "./plugin.svelte";
import { Deferred } from "$content/utils";
import Modals from "../modals.svelte";
import Commands from "../commands.svelte";
import { downloadScript } from "../net/download";
import StateManager from "$shared/state";
import { scriptInstanceMap } from "./map";

export default new class PluginManager extends ScriptManager<PluginInfo, Plugin> {
    singular = "plugin";
    plural = "plugins";
    loaded = Deferred.create();

    constructor() {
        super(Plugin, "plugin");

        StateManager.plugin.on("pluginToggled", this.onToggled.bind(this));
        StateManager.events.on("init", async () => {
            const toRun = this.scripts.filter(p => p.enabled);
            await Promise.allSettled(toRun.map(p => p.onToggled(true, true)));

            this.loaded.resolve();
        });
    }

    isEnabled(name: string) {
        const script = this.getScript(name);
        if(!script) return false;

        return script.enabled;
    }

    async setAllConfirm(enabled: boolean, folder?: string, confirmed = false) {
        const response = await StateManager.plugin.trySetAllPlugins(enabled, folder, confirmed);

        switch (response.status) {
            case "dependencyError": {
                const scripts = response.scripts.map(s => this.getScript(s)).filter(s => s) as Plugin[];
                const title = scripts.length > 1 ? "Could not enable some plugins" : `Could not enable ${scripts[0].headers.name}`;

                Modals.open("dependency", {
                    script: scripts,
                    type: "error",
                    title
                });
                return;
            }
            case "downloadError":
                Modals.open("error", {
                    text: response.message,
                    title: "Download Error"
                });
                return;
            case "dependencyConfirm": {
                const scripts = response.scripts.map(s => this.getScript(s)).filter(s => s) as Plugin[];
                const title = "Dependencies need to be downloaded";

                const confirmed = await Modals.open("dependency", {
                    script: scripts,
                    type: "confirm",
                    title
                });
                if(!confirmed) return;

                this.setAllConfirm(enabled, folder, true);
                return;
            }
            case "confirm": {
                const title = `Plugins depend on plugins in this folder`;
                const confirmed = await Modals.open("confirm", {
                    text: response.message,
                    title
                });
                if(!confirmed) return;

                this.setAllConfirm(enabled, folder, true);
                return;
            }
        }
    }

    onToggled(name: string, enabled: boolean) {
        const plugin = this.getScript(name);
        if(!plugin) return;

        plugin.onToggled(enabled);
    }

    override onCreate(info: PluginInfo, initial: boolean) {
        const plugin = super.onCreate(info, initial);
        if(!initial && info.enabled) plugin.start(false);

        return plugin;
    }

    async require(requirer: string, name: string, downloadUrl?: string) {
        const requirerScript = scriptInstanceMap.get(requirer);
        if(!requirerScript) throw new Error(`Requirer script ${requirer} not found`);

        // Try to enable the plugin if it already exists
        const existing = this.getScript(name);
        if(existing) {
            if(existing.enabled) return existing.exported;

            const confirmed = await Modals.open("dependency", {
                script: existing,
                type: "confirm",
                title: `${requirer} is asking to enable ${name}`
            });

            if(!confirmed) throw new Error("User declined enabling dependency");

            const success = await existing.enableConfirm(true);
            if(!success) throw new Error(`Failed to enable dependency ${name}`);

            // Require the script
            if(!requirerScript.requires.includes(existing)) requirerScript.requires.push(existing);
            await existing.require(requirerScript, true, false, [requirer]);

            return existing.exported;
        }

        if(!downloadUrl) throw new Error(`Plugin ${name} is required but cannot be automatically downloaded`);

        // Ask about downloading the plugin
        const confirmed = await Modals.open("confirm", {
            title: "Download Confirmation",
            text: `${requirer} is asking to install and enable the plugin ${name}. Do you want to proceed?`
        });

        if(!confirmed) throw new Error("User declined downloading dependency");

        // Download the plugin
        await downloadScript(downloadUrl, "root", "plugin", true);
        const script = this.getScript(name);
        if(!script) throw new Error(`Failed to download dependency ${name}`);

        // Require the script
        if(!requirerScript.requires.includes(script)) requirerScript.requires.push(script);
        await script.require(requirerScript, true, false, [requirer]);

        return script.exported;
    }

    override addCommands() {
        super.addCommands();

        const hasSettings = (p: Plugin) => p.openSettingsMenu.length > 0;
        const isDisabled = (p: Plugin) => !p.enabled;
        const isEnabled = (p: Plugin) => p.enabled;

        // Add plugin settings command
        Commands.addCommand(null, {
            text: "Open plugin settings",
            keywords: ["preferences", "options", "configure"],
            hidden: () => this.scripts.filter(hasSettings).length === 0
        }, async (context) => {
            const plugin = await this.selectScript(context, "Select plugin to view settings of", hasSettings);
            if(plugin) plugin.openSettingsMenu.forEach(fn => fn());
        });

        // Add plugin enable command
        Commands.addCommand(null, {
            text: "Enable plugin",
            hidden: () => this.scripts.filter(isDisabled).length === 0
        }, async (context) => {
            const plugin = await this.selectScript(context, "Select plugin to enable", isDisabled);
            if(plugin) plugin.toggleConfirm(true);
        });

        // Add plugin disable command
        Commands.addCommand(null, {
            text: "Disable plugin",
            hidden: () => this.scripts.filter(isEnabled).length === 0
        }, async (context) => {
            const plugin = await this.selectScript(context, "Select plugin to disable", isEnabled);
            if(plugin) plugin.toggleConfirm(false);
        });
    }
}();
