<script lang="ts">
    import type ScriptManager from "$core/scripts/scriptManager.svelte";
    import type { LayoutItem } from "$types/net/state";
    import type { Snippet } from "svelte";
    import Modals from "$core/modals.svelte";
    import Storage from "$core/storage.svelte";
    import { englishList } from "$shared/utils";
    import Card from "../Card.svelte";
    import ListItem from "../ListItem.svelte";
    import FolderOpen from "@lucide/svelte/icons/folder-open";
    import Delete from "svelte-material-icons/Delete.svelte";
    import Pencil from "svelte-material-icons/Pencil.svelte";
    import { dndzone, type DndEvent } from "svelte-dnd-action";
    import { createTransformDragged } from "$content/utils";
    import { dndZoneSettings } from "$content/stores.svelte";

    interface Props {
        id: string;
        dragging: string | null;
        manager: ScriptManager;
        startDrag: () => void;
        dragDisabled: boolean;
        dragAllowed: boolean;
        toggle?: Snippet;
    }

    let {
        id,
        dragging,
        manager,
        startDrag,
        dragDisabled,
        dragAllowed,
        toggle
    }: Props = $props();

    let name = $derived(manager.getFolderName(id));
    let Component = $derived(Storage.settings.menuView === "grid" ? Card : ListItem);

    const maxListedItems = 5;
    let contentSummary = $derived.by(() => {
        const contents = manager.layout[id]?.contents;
        if(!contents) return;

        if(contents.length === 0) return `Contains no ${manager.plural} or folders.`;

        // Show up to 5 items
        const names = contents.map((item) => manager.getItemName(item));
        if(names.length <= maxListedItems) return `Contains ${englishList(names)}.`;
        return `Contains ${englishList([...names, `${names.length - maxListedItems} more`])}.`;
    });

    function openFolder() {
        manager.viewFolder(id);
    }

    function deleteFolder() {
        if(!confirm(`Are you sure you want to delete ${name} and everything in it?`)) return;
        manager.folderTryDelete(id);
    }

    async function editFolder() {
        const newName = await Modals.open("input", {
            title: "Enter new name for folder",
            defaultVal: name,
            placeholder: "Name for folder"
        });
        if(!newName) return;

        manager.editFolder(id, newName);
    }

    let items: LayoutItem[] = $state([]);

    function handleDndConsider(e: CustomEvent<DndEvent<LayoutItem>>) {
        items = e.detail.items;
    }

    function handleDndFinalize(e: CustomEvent<DndEvent<LayoutItem>>) {
        items = [];

        const droppedItem = e.detail.items[0];
        if(!droppedItem) return;

        manager.moveItem($state.snapshot(droppedItem), id);
    }
</script>

<Component {dragDisabled} {startDrag} {dragAllowed} {toggle}>
    {#snippet overlay()}
        {#if dragging && dragging !== id}
            <div
                class="absolute top-0 left-0 w-full h-full bg-gray-500/50"
                use:dndzone={{
                    ...dndZoneSettings,
                    items,
                    dragDisabled: true,
                    transformDraggedElement: createTransformDragged("scale(50%)", true)
                }}
                onconsider={handleDndConsider}
                onfinalize={handleDndFinalize}
            >
                {#each items as item (item.id)}
                    <div></div>
                {/each}
            </div>
            <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <FolderOpen color="var(--color-primary)" class="h-1/2 w-1/2" />
            </div>
        {/if}
    {/snippet}
    {#snippet header()}
        <button class="flex items-center gap-2 border-b border-gray-400 w-full" onclick={openFolder}>
            <FolderOpen />
            <h2 class="overflow-ellipsis overflow-hidden whitespace-nowrap text-xl font-bold! mb-0!">
                {name}
            </h2>
        </button>
    {/snippet}
    {#snippet description()}
        {contentSummary}
    {/snippet}
    {#snippet buttons()}
        <button title="Delete" onclick={deleteFolder}>
            <Delete size={28} />
        </button>
        <button title="Change folder name" onclick={editFolder}>
            <Pencil size={28} />
        </button>
    {/snippet}
</Component>
