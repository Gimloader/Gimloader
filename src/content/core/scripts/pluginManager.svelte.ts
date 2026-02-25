import ScriptManager from "./scriptManager.svelte";
import { Plugin } from "./plugin.svelte";
import Port from "$shared/net/port.svelte";
import { Deferred } from "$content/utils";
import type { PluginInfo } from "$types/state";
import Modals from "../modals.svelte";
import { parseScriptHeaders } from "$shared/parseHeader";
import { toast } from "svelte-sonner";
import Commands from "../commands.svelte";

export default new class PluginManager extends ScriptManager<Plugin, PluginInfo> {
    singular = "plugin";
    plural = "plugins";
    loaded = Deferred.create();

    constructor() {
        super(Plugin, "plugin");

        Port.on("pluginCreate", (info) => this.onCreate(info));
        Port.on("pluginSetAll", ({ enabled }) => this.onSetAll(enabled));
        Port.on("pluginToggled", ({ name, enabled }) => this.onToggled(name, enabled));
    }

    async init(info: PluginInfo[]) {
        super.init(info);

        const toRun = this.scripts.filter(p => p.enabled);
        await Promise.allSettled(toRun.map(p => p.onToggled(true, true)));

        this.loaded.resolve();
    }

    isEnabled(name: string) {
        const script = this.getScript(name);
        if(!script) return false;

        return script.enabled;
    }

    async setAllConfirm(enabled: boolean, confirmed = false) {
        const response = await Port.sendAndRecieve("trySetAllPlugins", {
            enabled,
            confirmed
        });

        switch (response.status) {
            case "dependencyError": {
                const scripts = response.scripts.map(s => this.getScript(s));
                const title = scripts.length > 1 ? "Could not enable some plugins" : `Could not enable ${scripts[0].headers.name}`;

                Modals.open("dependency", {
                    script: scripts,
                    type: "error",
                    title
                });
                return false;
            }
            case "downloadError":
                Modals.open("error", {
                    text: response.message,
                    title: "Download Error"
                });
                return false;
            case "confirm": {
                const scripts = response.scripts.map(s => this.getScript(s));
                const title = "Dependencies need to be downloaded";

                const confirmed = await Modals.open("dependency", {
                    script: scripts,
                    type: "confirm",
                    title
                });
                if(!confirmed) return;

                this.setAllConfirm(enabled, true);
                return;
            }
        }
    }

    setAll(enabled: boolean) {
        this.onSetAll(enabled);
        Port.send("pluginSetAll", { enabled });
    }

    onSetAll(enable: boolean) {
        const toSet = this.scripts.filter(p => p.enabled !== enable);
        for(const plugin of toSet) plugin.onToggled(enable);
    }

    onToggled(name: string, enabled: boolean) {
        const plugin = this.getScript(name);
        if(!plugin) return;

        plugin.onToggled(enabled);
    }

    async create(code: string) {
        const headers = parseScriptHeaders(code);
        if(headers.isLibrary !== "false") {
            toast.error("Plugins must not have the @isLibrary header set");
            return;
        }

        const info = { name: headers.name, code, enabled: false };
        this.deleteConflicting(info.name);

        const created = this.onCreate(info);

        // Create it disabled and enable it
        Port.send("pluginCreate", info);
        created.toggleConfirm(true);

        return created;
    }

    onCreate(info: PluginInfo) {
        const plugin = super.onCreate(info);
        if(info.enabled) plugin.start(false);

        return plugin;
    }

    addCommands() {
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
