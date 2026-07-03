<script lang="ts">
    import Modals from "$core/modals.svelte";
    import type ScriptManager from "$core/scripts/scriptManager.svelte";
    import Storage from "$core/storage.svelte";
    import { englishList } from "$shared/utils";
    import type { Snippet } from "svelte";
    import Card from "../Card.svelte";
    import ListItem from "../ListItem.svelte";
    import FolderOpen from "@lucide/svelte/icons/folder-open";
    import Delete from "svelte-material-icons/Delete.svelte";
    import Pencil from "svelte-material-icons/Pencil.svelte";

    interface Props {
        id: string;
        manager: ScriptManager;
        startDrag: () => void;
        dragDisabled: boolean;
        dragAllowed: boolean;
        toggle?: Snippet;
    }

    let {
        id,
        manager,
        startDrag,
        dragDisabled,
        dragAllowed,
        toggle
    }: Props = $props();

    let name = $derived(manager.layout[id]?.name);
    let Component = $derived(Storage.settings.menuView === "grid" ? Card : ListItem);

    const maxListedItems = 5;
    let contentSummary = $derived.by(() => {
        const contents = manager.layout[id]?.contents;
        if(!contents) return;

        if(contents.length === 0) return `Contains no ${manager.plural} or folders.`;

        // Show up to 5 items
        const names = contents.map((item) => item.type === "script" ? item.id : manager.layout[item.id].name!);
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
</script>

<Component {dragDisabled} {startDrag} {dragAllowed} {toggle}>
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
