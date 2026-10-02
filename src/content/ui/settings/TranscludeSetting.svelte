<script lang="ts">
    import type { TranscludeSetting } from "$types/api/settings";
    import PluginManager from "$core/scripts/pluginManager.svelte";
    import Setting from "./Setting.svelte";
    import SettingsGroup from "./SettingsGroup.svelte";
    import ToggleSettingsGroup from "./ToggleSettingsGroup.svelte";

    let { setting, addDivider }: { setting: TranscludeSetting; addDivider: boolean } = $props();

    const item = $derived(PluginManager.getScript(setting.fromPlugin)?.settingIdMap?.[setting.id]);
</script>

{#if item}
    {#if setting.label}
        <div class="text-xs">
            {setting.label}
        </div>
    {/if}
    {#if item.type === "group"}
        <SettingsGroup pluginName={setting.fromPlugin} group={item} />
    {:else if item.type === "togglegroup"}
        <ToggleSettingsGroup pluginName={setting.fromPlugin} group={item} />
    {:else if item.type !== "transclude"}
        <Setting pluginName={setting.fromPlugin} setting={item} />
    {/if}
{:else}
    {#if !setting.hideIfMissing}
        <div class="font-semibold text-[#f05252]">
            Transcluded setting from {setting.fromPlugin} with id {setting.id} is missing
        </div>
    {/if}
{/if}

{#if addDivider && (item || !setting.hideIfMissing)}
    <hr class="bg-black mb-2 mt-1" />
{/if}
