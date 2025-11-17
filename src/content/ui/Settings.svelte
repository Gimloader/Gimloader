<script lang="ts">
    import { Button } from "$shared/ui/button";
    import { Switch } from "$shared/ui/switch";
    import Storage from "$core/storage.svelte";
    import StateManager from "$core/state";

    function saveAutoUpdate() {
        Storage.updateSetting('autoUpdate', Storage.settings.autoUpdate);
    }

    function saveAutoDownloadLibs() {
        Storage.updateSetting('autoDownloadMissingLibs', Storage.settings.autoDownloadMissingLibs);
    }
</script>

<h2 class="text-xl font-bold! mb-0!">General Settings</h2>
<div class="flex items-center gap-2">
    <Switch bind:checked={Storage.settings.autoUpdate} onCheckedChange={saveAutoUpdate} />
    Automatically check for plugin updates
</div>
<div class="flex items-center gap-2 mt-2!">
    <Switch bind:checked={Storage.settings.showPluginButtons} onCheckedChange={() => {
        if(!Storage.settings.showPluginButtons) {
            let conf = confirm("Are you sure you want to hide the buttons that open the Gimloader menu? " +
                "The menu is still accessible by pressing Alt+P.");
            if(!conf) {
                Storage.settings.showPluginButtons = true;
                return;
            }
        }
        Storage.updateSetting("showPluginButtons", Storage.settings.showPluginButtons);
    }} />
    Show buttons to open Gimloader menu
</div>
<div class="flex items-center gap-2 mt-2!">
    <Switch bind:checked={Storage.settings.autoDownloadMissingLibs} onCheckedChange={saveAutoDownloadLibs} />
    Attempt to automatically download missing libraries
</div>

<h2 class="text-xl font-bold! mt-3! mb-0!">Developer Settings</h2>
<div class="flex items-center gap-2">
    <Switch bind:checked={Storage.settings.pollerEnabled} onCheckedChange={() => {
        Storage.updateSetting("pollerEnabled", Storage.settings.pollerEnabled);
    }} />
    Poll for plugins/libraries being served locally
</div>

<h2 class="text-xl font-bold! mt-3! mb-0!">Export/Import Config</h2>
<div>Your config consists of plugins, plugin values, libraries, hotkeys, and settings.</div>
<Button onclick={StateManager.downloadState}>Export Config</Button>
<Button onclick={StateManager.loadState}>Import Config</Button>
