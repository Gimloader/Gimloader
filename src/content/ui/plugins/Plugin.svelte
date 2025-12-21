<script lang="ts">
    import type { Plugin } from "$core/scripts/plugin.svelte";
    import { checkUpdate } from "$core/net/checkUpdates";
    import Card from "../components/Card.svelte";
    import ListItem from "../components/ListItem.svelte";
    import Storage from "$core/storage.svelte";
    import { showEditor } from "$content/utils";
    import * as Tooltip from "$shared/ui/tooltip";
    import { Switch } from "$shared/ui/switch";

    import Delete from "svelte-material-icons/Delete.svelte";
    import Pencil from "svelte-material-icons/Pencil.svelte";
    import BookSettings from "svelte-material-icons/BookSettings.svelte";
    import Update from "svelte-material-icons/Update.svelte";
    import Cog from "svelte-material-icons/Cog.svelte";
    import ScriptTextOutline from "svelte-material-icons/ScriptTextOutline.svelte";
    import AlertCircleOutline from "svelte-material-icons/AlertCircleOutline.svelte";
    import AlertTriangleOutline from "svelte-material-icons/AlertOutline.svelte";
    import Modals from "$content/core/modals.svelte";

    interface Props {
        startDrag: () => void;
        dragDisabled: boolean;
        plugin: Plugin;
        dragAllowed: boolean;
    }

    let {
        startDrag,
        dragDisabled,
        plugin,
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

    function deletePlugin() {
        if(!confirm(`Are you sure you want to delete ${plugin.headers.name}?`)) return;
        plugin.deleteConfirm();
    }

    let component = $derived(Storage.settings.menuView === "grid" ? Card : ListItem);
    const SvelteComponent = $derived(component);

    function showDependencies() {
        Modals.open("dependency", {
            script: plugin,
            type: "info",
            title: `Dependencies for ${plugin.headers.name}`
        });
    }
</script>

<SvelteComponent
    {dragDisabled}
    {startDrag}
    {loading}
    {dragAllowed}
    error={plugin?.errored}
    deprecated={plugin?.headers.deprecated !== null}>
    {#snippet header()}
        <h2 class="overflow-ellipsis overflow-hidden whitespace-nowrap grow text-xl font-bold! mb-0!">
            {plugin?.headers.name}
            {#if plugin?.headers.version}
                <span class="text-sm">
                    v{plugin?.headers.version}
                </span>
            {/if}
        </h2>
    {/snippet}
    {#snippet toggle()}
        <Switch bind:checked={() => enabled, (enabled) => setEnabled(enabled)} />
    {/snippet}
    {#snippet author()}
        By {plugin?.headers.author}
    {/snippet}
    {#snippet description()}
        {plugin?.headers.description}
    {/snippet}
    {#snippet buttons()}
        <button title="Delete" onclick={deletePlugin}>
            <Delete size={28} />
        </button>
        <button title="Open plugin editor" onclick={() => showEditor("plugin", plugin.headers.name)}>
            <Pencil size={28} />
        </button>
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
        {#if plugin?.headers.downloadUrl}
            <button title="Check for updates" onclick={() => checkUpdate(plugin)}>
                <Update size={28} />
            </button>
        {/if}
        {#if plugin?.headers.needsLib?.length || plugin?.headers.optionalLib?.length
            || plugin?.headers.needsPlugin?.length}
            <button title="View dependencies" onclick={showDependencies}>
                <BookSettings size={24} />
            </button>
        {/if}
        {#if plugin?.headers.webpage}
            <a title="Open webpage for plugin" href={plugin.headers.webpage} target="_blank">
                <ScriptTextOutline size={28} />
            </a>
        {/if}
        {#if plugin?.headers.deprecated !== null}
            <Tooltip.Provider>
                <Tooltip.Root delayDuration={100}>
                    <Tooltip.Trigger>
                        <AlertTriangleOutline size={28} color="#faca15" />
                    </Tooltip.Trigger>
                    <Tooltip.Content class="text-base">
                        {#if plugin?.headers.deprecated === ""}
                            This plugin has been marked as deprecated.
                        {:else}
                            This plugin has been marked as deprecated:
                            {plugin?.headers.deprecated}
                        {/if}
                    </Tooltip.Content>
                </Tooltip.Root>
            </Tooltip.Provider>
        {/if}
        {#if plugin?.errored}
            <Tooltip.Provider>
                <Tooltip.Root delayDuration={100}>
                    <Tooltip.Trigger>
                        <AlertCircleOutline size={28} color="#f05252" />
                    </Tooltip.Trigger>
                    <Tooltip.Content class="text-base">
                        An error occured when this plugin was enabling.
                    </Tooltip.Content>
                </Tooltip.Root>
            </Tooltip.Provider>
        {/if}
    {/snippet}
</SvelteComponent>
