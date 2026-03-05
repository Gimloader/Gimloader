import type { ScriptType } from "$types/net/messages";
import type { ScriptHeaders } from "$types/scripts";
import type { PluginSettingsDescription } from "$types/api/settings";
import type { PluginInfo } from "$types/net/state";
import Port from "$shared/net/port.svelte";
import { Script } from "./script.svelte";
import Modals from "../modals.svelte";

export class Plugin extends Script<PluginInfo> {
    type: ScriptType = "plugin";
    warnAbout = true;
    enabled: boolean = $state();
    openSettingsMenu: (() => void)[] = $state([]);
    settingsDescription?: PluginSettingsDescription;

    constructor(info: PluginInfo, headers?: ScriptHeaders) {
        // The initial plugin.start call is handled externally
        super(info, headers);
        this.enabled = info.enabled;
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

    setEnabled(enabled: boolean) {
        this.enabled = enabled;
        Port.send("pluginToggled", { name: this.headers.name, enabled });
    }

    edit(code: string, headers?: ScriptHeaders) {
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

    stop() {
        super.stop();
        this.openSettingsMenu = [];
    }

    onImport(exports: any) {
        if(exports.openSettingsMenu && typeof exports.openSettingsMenu === "function") {
            this.openSettingsMenu.push(exports.openSettingsMenu);
        }
    }

    async toggleConfirm(enabled: boolean) {
        if(enabled) await this.enableConfirm();
        else this.disableConfirm();
    }

    async toggle(enabled: boolean) {
        Port.send("pluginToggled", { name: this.headers.name, enabled });
        await this.onToggled(enabled);
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

    async enableConfirm(downloadConfirmed = false) {
        const response = await Port.sendAndRecieve("tryTogglePlugin", {
            name: this.headers.name,
            enabled: true,
            confirmed: downloadConfirmed
        });

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

    async disableConfirm(stopConfirmed = false) {
        const response = await Port.sendAndRecieve("tryTogglePlugin", {
            name: this.headers.name,
            enabled: false,
            confirmed: stopConfirmed
        });

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
