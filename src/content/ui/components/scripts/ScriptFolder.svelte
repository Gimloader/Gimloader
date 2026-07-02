<script lang="ts">
    import type ScriptManager from "$core/scripts/scriptManager.svelte";
    import Storage from "$core/storage.svelte";
    import Card from "../Card.svelte";
    import ListItem from "../ListItem.svelte";
    import FolderOpen from "@lucide/svelte/icons/folder-open";

    interface Props {
        id: string;
        manager: ScriptManager;
        startDrag: () => void;
        dragDisabled: boolean;
        dragAllowed: boolean;
    }

    let {
        id,
        manager,
        startDrag,
        dragDisabled,
        dragAllowed
    }: Props = $props();

    let Component = $derived(Storage.settings.menuView === "grid" ? Card : ListItem);

    function openFolder() {
        manager.viewFolder(id);
    }
</script>

<Component {dragDisabled} {startDrag} {dragAllowed}>
    {#snippet header()}
        <button class="flex items-center gap-2 border-b border-gray-400 w-full" onclick={openFolder}>
            <FolderOpen />
            <h2 class="overflow-ellipsis overflow-hidden whitespace-nowrap text-xl font-bold! mb-0!">
                {manager.layout[id]?.name}
            </h2>
        </button>
    {/snippet}
</Component>
