import type { State } from "$types/state";
import Storage from "$core/storage.svelte";
import LibManager from "$core/scripts/libManager.svelte";
import PluginManager from "$core/scripts/pluginManager.svelte";
import Hotkeys from "$core/hotkeys/hotkeys.svelte";
import UpdateNotifier from "$core/updateNotifier.svelte";
import Port from "$shared/net/port.svelte";
import { changelog, readUserFile } from "$content/utils";
import { toast } from "svelte-sonner";
import Rewriter from "./rewriter";
import { version } from "../../../package.json";
import Modals from "./modals.svelte";
import Commands from "./commands.svelte";

export default class StateManager {
    static init() {
        Port.on("setState", (state: State) => {
            this.syncWithState(state);
            toast.success("New config loaded!");
        });
    }

    static initState(state: State) {
        const lastVersion = localStorage.getItem("gl-version");
        localStorage.setItem("gl-version", version);

        const versionChanged = version !== lastVersion;
        const updated = lastVersion && versionChanged;

        if(updated) {
            Modals.addUpdated("Gimloader", version, changelog);
        }

        Storage.init(state.pluginStorage, state.settings, state.pluginSettings);
        LibManager.init(state.libraries);
        PluginManager.init(state.plugins);
        Hotkeys.init(state.hotkeys);
        UpdateNotifier.init(state.availableUpdates);
        Rewriter.init(state.cacheInvalid || versionChanged);
        Commands.init();
    }

    static syncWithState(state: State) {
        Storage.updateState(state.pluginStorage, state.settings);
        LibManager.updateState(state.libraries);
        PluginManager.updateState(state.plugins);
        Hotkeys.updateState(state.hotkeys);
        UpdateNotifier.onUpdate(state.availableUpdates);
        Rewriter.updateState(state.cacheInvalid);
    }

    static async downloadState() {
        const state = await Port.sendAndRecieve("getState");
        delete state.availableUpdates;

        const blob = new Blob([JSON.stringify(state, null, 4)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = "gimloader_config.json";
        link.href = url;
        link.click();

        URL.revokeObjectURL(url);
    }

    static async loadState(e: MouseEvent) {
        if(!e.isTrusted) return;
        if(!confirm("Do you want to load a new config? You will lose everything, including plugins, libraries, settings, and hotkeys.")) return;

        readUserFile(".json", (text) => {
            try {
                const state = JSON.parse(text);
                const { plugins, libraries, pluginStorage, pluginSettings, settings, hotkeys, ...rest } = state;

                // confirm that at least one of the keys is present
                if(!plugins && !libraries && !pluginStorage && !pluginSettings && !settings && !hotkeys) {
                    toast.error("That config appears to be invalid!");
                    return;
                }

                // warn if there are extra keys
                if(Object.keys(rest).length > 0) {
                    toast("That config may be invalid, attempting to load anyways...");
                }

                Port.sendAndRecieve("setState", { plugins, libraries, pluginStorage, pluginSettings, settings, hotkeys, cacheInvalid: true });
            } catch {
                toast.error("That config appears to be invalid!");
            }
        });
    }
}
