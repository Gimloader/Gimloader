<script lang="ts">
    import type { Settings, State } from "$types/net/state";
    import { Button } from "$shared/ui/button";
    import { Switch } from "$shared/ui/switch";
    import Storage from "$core/storage.svelte";
    import StateManager from "$shared/state";
    import { downloadJson } from "$shared/utils";
    import { readUserFile } from "$content/utils";
    import { toast } from "svelte-sonner";
    import Port from "$shared/net/port.svelte";
    import Modals from "$core/modals.svelte";

    async function onShowButtonsChange(shown: boolean) {
        // Show a confirmation screen if they are trying to hide the buttons
        if(!shown) {
            const text = "Are you sure you want to hide the buttons that open the Gimloader menu? "
                + "The menu is still accessible by pressing Alt+P.";

            const confirmed = await Modals.open("confirm", { text, title: "Hide Gimloader Menu Buttons" });
            if(!confirmed) return;
        }

        StateManager.apply("settingUpdate", {
            key: "showPluginButtons",
            value: shown
        });
    }

    function saveKey(key: keyof Settings) {
        StateManager.apply("settingUpdate", { key, value: Storage.settings[key] });
    }

    function downloadState() {
        downloadJson(StateManager.getSavedState(), "gimloader_config.json");
    }

    async function loadState(e: MouseEvent) {
        if(!e.isTrusted) return;

        const text =
            "Do you want to import a new config? You will lose everything, including plugins, libraries, settings, and hotkeys.";
        const confirmed = await Modals.open("confirm", { text, title: "Import Config" });
        if(!confirmed) return;

        readUserFile(".json", (text) => {
            try {
                const state: State = JSON.parse(text);
                if(typeof state !== "object" || state === null) throw new Error("Invalid config");

                const {
                    plugins,
                    libraries,
                    pluginLayout,
                    libraryLayout,
                    pluginStorage,
                    pluginSettings,
                    settings,
                    hotkeys
                } = state;
                if(
                    !plugins && !libraries && !pluginLayout && !libraryLayout && !pluginStorage && !pluginSettings
                    && !settings && !hotkeys
                ) {
                    throw new Error("No valid keys present");
                }

                Port.sendAndRecieve("setState", state);
            } catch (e) {
                console.error(e);
                toast.error("That config appears to be invalid");
            }
        });
    }
</script>

<h2 class="text-xl font-bold! mb-0!">General Settings</h2>
<div class="flex items-center gap-2">
    <Switch bind:checked={Storage.settings.autoUpdate} onCheckedChange={() => saveKey("autoUpdate")} />
    Automatically check for plugin updates
</div>
<div class="flex items-center gap-2 mt-2!">
    <Switch bind:checked={() => Storage.settings.showPluginButtons, onShowButtonsChange} />
    Show buttons to open Gimloader menu
</div>
<div class="flex items-center gap-2 mt-2!">
    <Switch
        bind:checked={Storage.settings.autoDownloadMissingLibs}
        onCheckedChange={() => saveKey("autoDownloadMissingLibs")}
    />
    Attempt to automatically download missing libraries
</div>
<div class="flex items-center gap-2 mt-2!">
    <Switch
        bind:checked={Storage.settings.autoDownloadMissingPlugins}
        onCheckedChange={() => saveKey("autoDownloadMissingPlugins")}
    />
    Attempt to automatically download missing plugins
</div>

<h2 class="text-xl font-bold! mt-3! mb-0!">Developer Settings</h2>
<div class="flex items-center gap-2">
    <Switch
        bind:checked={Storage.settings.pollerEnabled}
        onCheckedChange={() => {
            StateManager.apply("settingUpdate", { key: "pollerEnabled", value: Storage.settings.pollerEnabled });
        }}
    />
    Poll for plugins/libraries being served locally
</div>

<h2 class="text-xl font-bold! mt-3! mb-0!">Export/Import Config</h2>
<div>Your config consists of plugins, plugin values, libraries, hotkeys, and settings.</div>
<Button onclick={downloadState}>Export Config</Button>
<Button onclick={loadState}>Import Config</Button>
