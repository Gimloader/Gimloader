<script lang="ts">
    import type { Plugin } from "$core/scripts/plugin.svelte";
    import { Switch } from "$shared/ui/switch";
    import Cog from "svelte-material-icons/Cog.svelte";
    import Reload from "svelte-material-icons/Reload.svelte";
    import ScriptItem from "../components/scripts/ScriptItem.svelte";

    interface Props {
        startDrag: () => void;
        dragDisabled: boolean;
        script: Plugin;
        dragAllowed: boolean;
    }

    let {
        startDrag,
        dragDisabled,
        script: plugin,
        dragAllowed
    }: Props = $props();

    let loading = $state(false);
    let enabled = $state(plugin?.enabled ?? false);
    $effect(() => {
        enabled = plugin?.enabled;
    });

    async function setEnabled(enabled: boolean) {
        let loadingTimeout = setTimeout(() => loading = true, 200);
        await plugin.toggleConfirm(enabled);

        clearTimeout(loadingTimeout);
        loading = false;
    }
</script>

<ScriptItem {startDrag} {dragAllowed} {dragDisabled} script={plugin} {loading}>
    {#snippet toggle()}
        <Switch bind:checked={() => enabled, (enabled) => setEnabled(enabled)}>
            {#if plugin?.reloadNeeded}
                <div class="relative -mr-0.5 flex h-full items-center justify-center">
                    <Reload size={15} />
                </div>
            {/if}
        </Switch>
    {/snippet}
    {#snippet scriptButtons()}
        {#if plugin?.openSettingsMenu?.length !== 0}
            <button title="Open settings" onclick={() => plugin.openSettingsMenu.forEach(c => c())}>
                <Cog size={28} />
            </button>
        {:else if plugin?.headers.hasSettings !== "false"}
            <Cog
                size={28}
                class="opacity-50"
                title={plugin?.enabled
                ? "This plugin's settings menu is missing/invalid"
                : "Plugins need to be enabled to open settings"}
            />
        {/if}
    {/snippet}
</ScriptItem>
