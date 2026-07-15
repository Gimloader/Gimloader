import type { ScriptType } from "$types/net/messages";
import type { ScriptHeaders } from "$types/scripts";
import type { PluginSettingsDescription } from "$types/api/settings";
import type { PluginInfo } from "$types/net/state";
import { Script } from "./script.svelte";
import Modals from "../modals.svelte";
import StateManager from "$shared/state";

export class Plugin extends Script<PluginInfo> {
    type: ScriptType = "plugin";
    warnAbout = true;
    enabled: boolean = $state(false);
    openSettingsMenu: (() => void)[] = $state([]);
    settingsDescription?: PluginSettingsDescription;

    constructor(info: PluginInfo, headers?: ScriptHeaders) {
        // The initial plugin.start call is handled externally
        super(info, headers);
        this.enabled = info.enabled;
    }

    getInfo() {
        return {
            name: this.headers.name,
            code: this.code,
            enabled: this.enabled
        };
    }

    getDependencyStrings() {
        return {
            plugin: {
                required: this.headers.needsPlugin
            },
            library: {
                required: this.headers.needsLib,
                optional: this.headers.optionalLib
            }
        };
    }

    override edit(code: string, headers?: ScriptHeaders) {
        super.edit(code, headers);
        if(this.started) this.stop();
        if(this.enabled) {
            this.start(false).catch((e) => {
                Modals.open("error", {
                    text: e,
                    title: `Error starting ${this.headers.name}`
                });
            });
        }
    }

    override stop() {
        super.stop();
        this.openSettingsMenu = [];
    }

    override onImport(exports: any) {
        if(exports.openSettingsMenu && typeof exports.openSettingsMenu === "function") {
            this.openSettingsMenu.push(exports.openSettingsMenu);
        }
    }

    async toggleConfirm(enabled: boolean) {
        if(enabled) await this.enableConfirm();
        else this.disableConfirm();
    }

    async onToggled(enabled: boolean, initial = false) {
        this.enabled = enabled;

        if(enabled) {
            await this.start(initial).catch((e) => {
                Modals.open("error", {
                    text: e,
                    title: `Error starting ${this.headers.name}`
                });
            });
        } else {
            this.stop();
        }
    }

    async enableConfirm(confirmed = false): Promise<boolean> {
        const response = await StateManager.plugin.tryTogglePlugin(this.headers.name, true, confirmed);

        switch (response.status) {
            case "dependencyError":
                Modals.open("dependency", {
                    script: this,
                    type: "error",
                    title: "Cannot Enable " + this.headers.name
                });
                return false;
            case "downloadError": {
                Modals.open("error", {
                    text: response.message,
                    title: "Download Error"
                });
                return false;
            }
            case "confirm": {
                const title = "Dependencies need to be downloaded/enabled";
                const confirmed = await Modals.open("dependency", {
                    script: this,
                    type: "confirm",
                    title
                });
                if(!confirmed) return false;

                return this.enableConfirm(true);
            }
            case "success": {
                return true;
            }
        }
    }

    async disableConfirm(confirmed = false) {
        const response = await StateManager.plugin.tryTogglePlugin(this.headers.name, false, confirmed);

        if(response.status === "confirm") {
            const title = "Other plugins depend on this plugin";
            const confirmed = await Modals.open("confirm", {
                text: response.message,
                title
            });
            if(!confirmed) return;

            this.disableConfirm(true);
        }
    }
}
