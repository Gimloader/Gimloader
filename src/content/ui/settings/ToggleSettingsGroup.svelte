<script lang="ts">
    import type { ToggleSettingGroup } from "$types/api/settings";
    import Storage from "$core/storage.svelte";
    import { StateManager } from "@gimloader/ipc";
    import { watch } from "runed";
    import SettingsGroup from "./SettingsGroup.svelte";
    import { Switch } from "$shared/ui/switch";

    let { pluginName, group }: { pluginName: string; group: ToggleSettingGroup<string> } = $props();

    watch(() => Storage.pluginSettings[pluginName][group.id], () => {
        const value = Storage.pluginSettings[pluginName][group.id];
        StateManager.apply("pluginSettingUpdate", { id: pluginName, key: group.id, value });
    }, { lazy: true });
</script>

<SettingsGroup {pluginName} {group}>
    <Switch bind:checked={Storage.pluginSettings[pluginName][group.id]} />
</SettingsGroup>
