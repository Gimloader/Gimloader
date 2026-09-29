<script lang="ts">
    import type { ToggleSettingGroup } from "$types/api/settings";
    import Storage from "$core/storage.svelte";
    import { StateManager } from "@gimloader/ipc";
    import { watch } from "runed";
    import SettingsGroup from "./SettingsGroup.svelte";
    import ToggleSetting from "./ToggleSetting.svelte";

    let { pluginName, group }: { pluginName: string; group: ToggleSettingGroup<string> } = $props();

    watch(() => Storage.pluginSettings[pluginName][group.id], () => {
        const value = Storage.pluginSettings[pluginName][group.id];
        StateManager.apply("pluginSettingUpdate", { id: pluginName, key: group.id, value });
    }, { lazy: true });
</script>

<SettingsGroup {pluginName} {group}>
    <ToggleSetting bind:value={Storage.pluginSettings[pluginName][group.id]} />
</SettingsGroup>
