<script lang="ts">
    import type { SettingGroup } from "$types/api/settings";
    import Setting from "./Setting.svelte";
    import ChevronDown from "svelte-material-icons/ChevronDown.svelte";
    import ChevronUp from "svelte-material-icons/ChevronUp.svelte";

    let { pluginName, group }: { pluginName: string; group: SettingGroup } = $props();

    let expanded = $state(true);
</script>

<div class="text-xl flex items-center font-bold" class:border-b-2={!expanded}>
    <button onclick={() => expanded = !expanded}>
        {#if expanded}
            <ChevronDown size={28} />
        {:else}
            <ChevronUp size={28} />
        {/if}
    </button>
    {group.title}
</div>
{#if expanded}
    <div class="pl-2 border-l-3 flex flex-col gap-2">
        {#each group.settings as setting}
            <Setting {pluginName} {setting} />
        {/each}
    </div>
{/if}
