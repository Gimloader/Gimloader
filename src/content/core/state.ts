import type { State } from "$types/net/state";
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
import Commands from "./commands.svelte";
import { addUpdated } from "$content/ui/modals/Changelog.svelte";
import { downloadJson } from "$shared/utils";

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
            addUpdated("Gimloader", version, changelog);
        }

        Storage.init(state.pluginStorage, state.settings, state.pluginSettings);
        LibManager.init(state.libraries, state.libraryLayout);
        PluginManager.init(state.plugins, state.pluginLayout);
        Hotkeys.init(state.hotkeys);
        UpdateNotifier.init(state.availableUpdates);
        Rewriter.init(state.cacheInvalid || versionChanged);
        Commands.init();
    }

    static syncWithState(state: State) {
        Storage.updateState(state.pluginStorage, state.settings);
        LibManager.updateState(state.libraries, state.libraryLayout);
        PluginManager.updateState(state.plugins, state.pluginLayout);
        Hotkeys.updateState(state.hotkeys);
        UpdateNotifier.onUpdate(state.availableUpdates);
        Rewriter.updateState(state.cacheInvalid);
    }

    static async downloadState() {
        const state = await Port.sendAndRecieve("getState", undefined);
        const { availableUpdates, ...savedState } = state;

        downloadJson(savedState, "gimloader_config.json");
    }

    static async loadState(e: MouseEvent) {
        if(!e.isTrusted) return;
        if(!confirm("Do you want to load a new config? You will lose everything, including plugins, libraries, settings, and hotkeys.")) return;

        readUserFile(".json", (text) => {
            try {
                const state = JSON.parse(text);
                const { plugins, libraries, pluginLayout, libraryLayout, pluginStorage, pluginSettings, settings, hotkeys, ...rest } = state;

                // confirm that at least one of the keys is present
                if(!plugins && !libraries && !pluginLayout && !libraryLayout && !pluginStorage && !pluginSettings && !settings && !hotkeys) {
                    toast.error("That config appears to be invalid!");
                    return;
                }

                // warn if there are extra keys
                if(Object.keys(rest).length > 0) {
                    toast("That config may be invalid, attempting to load anyways...");
                }

                Port.sendAndRecieve("setState", { plugins, libraries, pluginLayout, libraryLayout, pluginStorage, pluginSettings, settings, hotkeys, cacheInvalid: true });
            } catch {
                toast.error("That config appears to be invalid!");
            }
        });
    }
}
