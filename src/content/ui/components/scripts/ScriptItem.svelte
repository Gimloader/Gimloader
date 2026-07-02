<script lang="ts">
    import type { Script } from "$core/scripts/script.svelte";
    import type { Snippet } from "svelte";
    import Storage from "$core/storage.svelte";
    import Card from "../Card.svelte";
    import ListItem from "../ListItem.svelte";
    import VerifiedCheck from "../VerifiedCheck.svelte";
    import AuthorDisplay from "../AuthorDisplay.svelte";
    import Modals from "$core/modals.svelte";
    import { showEditor } from "$content/utils";
    import { checkUpdate } from "$core/net/checkUpdates";
    import * as Tooltip from "$shared/ui/tooltip";
    import Delete from "svelte-material-icons/Delete.svelte";
    import Pencil from "svelte-material-icons/Pencil.svelte";
    import BookSettings from "svelte-material-icons/BookSettings.svelte";
    import Update from "svelte-material-icons/Update.svelte";
    import Cog from "svelte-material-icons/Cog.svelte";
    import Reload from "svelte-material-icons/Reload.svelte";
    import ScriptTextOutline from "svelte-material-icons/ScriptTextOutline.svelte";
    import AlertCircleOutline from "svelte-material-icons/AlertCircleOutline.svelte";
    import AlertTriangleOutline from "svelte-material-icons/AlertOutline.svelte";

    interface Props {
        script: Script;
        startDrag: () => void;
        dragDisabled: boolean;
        dragAllowed: boolean;
        loading?: boolean;
        toggle?: Snippet;
        scriptButtons?: Snippet;
    }

    let {
        script,
        startDrag,
        dragDisabled,
        dragAllowed,
        loading = $bindable(false),
        toggle,
        scriptButtons
    }: Props = $props();

    let Component = $derived(Storage.settings.menuView === "grid" ? Card : ListItem);

    function deleteScript() {
        if(!confirm(`Are you sure you want to delete ${script.headers.name}?`)) return;
        script.deleteConfirm();
    }

    function showDependencies() {
        Modals.open("dependency", {
            script,
            type: "info",
            title: `Dependencies for ${script.headers.name}`
        });
    }
</script>

<Component
    {dragDisabled}
    {startDrag}
    {dragAllowed}
    {loading}
    error={script?.errored}
    deprecated={script?.headers.deprecated !== null}
    {toggle}
>
    {#snippet header()}
        <h2 class="overflow-ellipsis overflow-hidden whitespace-nowrap grow text-xl font-bold! mb-0!">
            {script?.headers.name}
            {#if script?.headers.version}
                <span class="text-sm">
                    v{script?.headers.version}
                </span>
            {/if}
            <VerifiedCheck {script} />
        </h2>
    {/snippet}
    {#snippet author()}
        {#if !script?.headers.signature}
            <AuthorDisplay author={script?.headers.author} />
        {/if}
    {/snippet}
    {#snippet description()}
        {script?.headers.description}
    {/snippet}
    {#snippet buttons()}
        <button title="Delete" onclick={deleteScript}>
            <Delete size={28} />
        </button>
        <button title="Open plugin editor" onclick={() => showEditor(script.type, script.headers.name)}>
            <Pencil size={28} />
        </button>
        {@render scriptButtons?.()}
        {#if script?.headers.downloadUrl}
            <button title="Check for updates" onclick={() => checkUpdate(script)}>
                <Update size={28} />
            </button>
        {/if}
        {#if script?.headers.needsLib?.length || script?.headers.optionalLib?.length
            || script?.headers.needsPlugin?.length}
            <button title="View dependencies" onclick={showDependencies}>
                <BookSettings size={24} />
            </button>
        {/if}
        {#if script?.headers.webpage}
            <a title="Open webpage for plugin" href={script.headers.webpage} target="_blank">
                <ScriptTextOutline size={28} />
            </a>
        {/if}
        {#if script?.headers.deprecated !== null}
            <Tooltip.Provider>
                <Tooltip.Root delayDuration={100}>
                    <Tooltip.Trigger>
                        <AlertTriangleOutline size={28} color="#faca15" />
                    </Tooltip.Trigger>
                    <Tooltip.Content class="text-base">
                        {#if script?.headers.deprecated === ""}
                            This {script?.type} has been marked as deprecated.
                        {:else}
                            This {script?.type} has been marked as deprecated:
                            {script?.headers.deprecated}
                        {/if}
                    </Tooltip.Content>
                </Tooltip.Root>
            </Tooltip.Provider>
        {/if}
        {#if script?.errored}
            <Tooltip.Provider>
                <Tooltip.Root delayDuration={100}>
                    <Tooltip.Trigger>
                        <AlertCircleOutline size={28} color="#f05252" />
                    </Tooltip.Trigger>
                    <Tooltip.Content class="text-base">
                        An error occured when this {script?.type} was enabling.
                    </Tooltip.Content>
                </Tooltip.Root>
            </Tooltip.Provider>
        {/if}
    {/snippet}
</Component>
