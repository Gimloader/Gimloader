<script lang="ts">
    import type { Library } from "$core/scripts/library.svelte";
    import Card from "../components/Card.svelte";
    import Delete from "svelte-material-icons/Delete.svelte";
    import Pencil from "svelte-material-icons/Pencil.svelte";
    import Update from "svelte-material-icons/Update.svelte";
    import { checkUpdate } from "$core/net/checkUpdates";
    import ListItem from "../components/ListItem.svelte";
    import Storage from "$core/storage.svelte";
    import { showEditor } from "$content/utils";
    import * as Tooltip from "$shared/ui/tooltip";
    import BookSettings from "svelte-material-icons/BookSettings.svelte";
    import ScriptTextOutline from "svelte-material-icons/ScriptTextOutline.svelte";
    import AlertTriangleOutline from "svelte-material-icons/AlertOutline.svelte";
    import Modals from "$content/core/modals.svelte";
    import InformationOutline from "svelte-material-icons/InformationOutline.svelte";

    interface Props {
        startDrag: () => void;
        dragDisabled: boolean;
        library: Library;
        dragAllowed: boolean;
    }

    let {
        startDrag,
        dragDisabled,
        library,
        dragAllowed
    }: Props = $props();

    let component = $derived(Storage.settings.menuView === "grid" ? Card : ListItem);
    const SvelteComponent = $derived(component);

    function deleteLibrary() {
        if(!confirm(`Are you sure you want to delete ${library.headers.name}?`)) return;
        library.deleteConfirm();
    }

    function showDependencies() {
        Modals.open("dependency", {
            script: library,
            type: "info",
            title: `Dependencies for ${library.headers.name}`
        });
    }

    function showChangelog() {
        Modals.open("singleChangelog", {
            name: library.headers.name,
            changes: library.headers.changelog,
            version: library.headers.version
        });
    }
</script>

<SvelteComponent {dragDisabled} {startDrag} {dragAllowed} deprecated={library?.headers.deprecated !== null}>
    {#snippet header()}
        <h2 class="overflow-ellipsis overflow-hidden whitespace-nowrap grow text-xl font-bold! mb-0!">
            {library?.headers.name}
            {#if library?.headers.version}
                <span class="text-sm">
                    v{library?.headers.version}
                    {#if library?.headers.changelog.length > 0}
                        <button title="View changlog" onclick={showChangelog}>
                            <InformationOutline size={10} color="blue" />
                        </button>
                    {/if}
                </span>
            {/if}
        </h2>
    {/snippet}
    {#snippet author()}
        By {library?.headers.author}
    {/snippet}
    {#snippet description()}
        {library?.headers.description}
    {/snippet}
    {#snippet buttons()}
        <button title="Delete" onclick={deleteLibrary}>
            <Delete size={28} />
        </button>
        <button title="Open library in editor" onclick={() => showEditor("library", library.headers.name)}>
            <Pencil size={28} />
        </button>
        {#if library?.headers.downloadUrl}
            <button title="Check for updates" onclick={() => checkUpdate(library)}>
                <Update size={28} />
            </button>
        {/if}
        {#if library?.headers.needsLib?.length || library?.headers.optionalLib?.length}
            <button title="See libraries used by this library" onclick={showDependencies}>
                <BookSettings size={24} />
            </button>
        {/if}
        {#if library?.headers.webpage}
            <a title="Open webpage for library" href={library.headers.webpage} target="_blank">
                <ScriptTextOutline size={28} />
            </a>
        {/if}
        {#if library?.headers.deprecated !== null}
            <Tooltip.Provider>
                <Tooltip.Root delayDuration={100}>
                    <Tooltip.Trigger>
                        <AlertTriangleOutline size={28} color="#faca15" />
                    </Tooltip.Trigger>
                    <Tooltip.Content class="text-base">
                        {#if library?.headers.deprecated === ""}
                            This library has been marked as deprecated.
                        {:else}
                            This library has been marked as deprecated:
                            {library?.headers.deprecated}
                        {/if}
                    </Tooltip.Content>
                </Tooltip.Root>
            </Tooltip.Provider>
        {/if}
    {/snippet}
</SvelteComponent>
