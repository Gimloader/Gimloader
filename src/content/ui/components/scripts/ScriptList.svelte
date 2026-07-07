<script lang="ts">
    import type ScriptManager from "$core/scripts/scriptManager.svelte";
    import type { LayoutItem } from "$types/net/state";
    import type { Component, Snippet } from "svelte";
    import Storage from "$core/storage.svelte";
    import { dndzone, type DndEvent } from "svelte-dnd-action";
    import Search from "../Search.svelte";
    import { flip } from "svelte/animate";
    import ViewControl from "../ViewControl.svelte";
    import ScriptFolder from "./ScriptFolder.svelte";
    import Modals from "$core/modals.svelte";
    import { capitalize } from "$shared/utils";
    import ScriptItem from "./ScriptItem.svelte";
    import FolderOpen from "@lucide/svelte/icons/folder-open";
    import { Portal } from "bits-ui";
    import { createTransformDragged } from "$content/utils";
    import { dndZoneSettings } from "$content/stores.svelte";
    import { flipDurationMs } from "$shared/consts";
    import FolderPlus from "@lucide/svelte/icons/folder-plus";
    import Eraser from "@lucide/svelte/icons/eraser";

    interface Props {
        buttons: Snippet;
        noScripts: Snippet;
        manager: ScriptManager;
        Script?: Component<any>;
        Folder?: Component<any>;
    }

    let {
        buttons,
        noScripts,
        manager,
        Script = ScriptItem,
        Folder = ScriptFolder
    }: Props = $props();

    let searchOpen = $state(false);
    let searchValue = $state("");
    let searchLower = $derived(searchValue.toLowerCase());
    let dragAllowed = $derived(searchValue.length === 0);
    let dragDisabled = $state(true);
    let dragging: string | null = $state(null);

    let items = $state([...manager.currentFolder.contents]);
    $effect(() => {
        if(!searchLower) {
            items = [...manager.currentFolder.contents];
            return;
        }

        // Search through all available items
        const matches = (item: LayoutItem) => manager.getItemName(item).toLowerCase().includes(searchLower);
        let newItems = manager.currentFolder.contents.filter(matches);

        const searchFolder = (id: string, isCurrent = false) => {
            if(!isCurrent) {
                if(id === manager.openFolderId) return;
                newItems = newItems.concat(manager.layout[id].contents.filter(matches));
            }

            for(const item of manager.layout[id].contents) {
                if(item.type === "folder") searchFolder(item.id);
            }
        };

        // First search items in the current folder, then others
        searchFolder(manager.openFolderId, true);
        searchFolder("root");

        items = newItems;
    });

    function startDrag(id: string) {
        dragging = id;
        dragDisabled = false;
    }

    function handleDndConsider(e: CustomEvent<DndEvent<LayoutItem>>) {
        items = e.detail.items;
    }

    function handleDndFinalize(e: CustomEvent<DndEvent<LayoutItem>>) {
        items = e.detail.items;
        dragDisabled = true;
        dragging = null;

        // Update the order of the plugins
        if(e.detail.info.trigger === "droppedIntoAnother") return;
        let order = items.map(i => i.id);
        manager.arrange(manager.openFolderId, order);
    }

    async function createFolder() {
        const name = await Modals.open("input", {
            title: "Create New Folder",
            placeholder: "Folder name",
            otherButtons: [
                {
                    text: "Import file",
                    onClick: () => manager.importFolder()
                }
            ]
        });
        if(!name) return;

        manager.createFolder(manager.openFolderId, name);
    }

    let backItems: LayoutItem[] = $state([]);

    function handleDndConsiderBack(e: CustomEvent<DndEvent<LayoutItem>>) {
        backItems = e.detail.items;
    }

    function handleDndFinalizeBack(e: CustomEvent<DndEvent<LayoutItem>>) {
        backItems = [];

        const droppedItem = e.detail.items[0];
        if(!droppedItem || !manager.currentFolder.parent) return;

        manager.moveItem($state.snapshot(droppedItem), manager.currentFolder.parent);
    }

    function closeSearch() {
        searchOpen = false;
        searchValue = "";
    }
</script>

{#if dragging && manager.currentFolder.parent}
    <Portal>
        <div class="fixed top-0 left-0 w-full flex justify-center pt-10 z-overlay text-white">
            <div class="w-[400px] relative h-[200px]">
                <div
                    class="absolute top-0 left-0 w-full h-full rounded-xl border-white border-2 bg-gray-500/90"
                    use:dndzone={{
                        ...dndZoneSettings,
                        items: backItems,
                        dragDisabled: true,
                        transformDraggedElement: createTransformDragged("scale(50%)", true)
                    }}
                    onconsider={handleDndConsiderBack}
                    onfinalize={handleDndFinalizeBack}
                >
                    {#each backItems as item (item.id)}
                        <div></div>
                    {/each}
                </div>
                <div class="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                    <FolderOpen color="var(--color-primary)" class="h-1/2 w-1/2" />
                    <div>
                        Move to
                        {#if manager.currentFolder.parent === "root"}
                            {capitalize(manager.plural)}
                        {:else}
                            {manager.getFolderName(manager.currentFolder.parent)}
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </Portal>
{/if}

{#snippet folderName(id: string)}
    {@const folder = manager.layout[id]}
    {#if folder.parent && folder.parent !== "root"}
        {@render folderName(folder.parent)}
    {/if}
    <div>&gt;</div>
    <button class="underline" onclick={() => manager.viewFolder(id)}>
        {folder.name}
    </button>
{/snippet}

<div class="flex flex-col max-h-full">
    <div class="flex items-center mb-[3px]">
        {@render buttons()}
        <button onclick={createFolder} class="mr-1.5!">
            <FolderPlus />
        </button>
        <ViewControl />
        <Search bind:value={searchValue} bind:searchOpen />
    </div>
    {#if searchValue.length === 0}
        {#if manager.scripts.length === 0}
            <h2 class="text-xl w-full text-center">
                {@render noScripts()}
            </h2>
        {/if}
        {#if manager.currentFolder.parent}
            <div class="flex items-center gap-2 pb-1">
                <button class="underline" onclick={() => manager.viewFolder("root")}>
                    {capitalize(manager.plural)}
                </button>
                {@render folderName(manager.openFolderId)}
            </div>
        {/if}
        {#if manager.currentFolder.contents.length === 0 && manager.openFolderId !== "root"}
            <h2 class="text-xl">
                This folder is empty!
            </h2>
        {/if}
    {:else}
        <button class="underline flex items-center gap-2 pb-1" onclick={closeSearch}>
            {capitalize(manager.singular)} Search
            <Eraser size={16} />
        </button>
        {#if items.length === 0}
            <h2 class="text-xl w-full text-center">
                No {manager.plural} or folders match your search!
            </h2>
        {/if}
    {/if}
    <div
        class="overflow-y-auto outline-none grid gap-4 pb-1 grow view-{Storage.settings.menuView} min-h-auto!"
        use:dndzone={{
            ...dndZoneSettings,
            items,
            dragDisabled,
            transformDraggedElement: createTransformDragged("", false)
        }}
        onconsider={handleDndConsider}
        onfinalize={handleDndFinalize}
    >
        {#key searchValue}
            {#each items as item (item.id)}
                <div animate:flip={{ duration: flipDurationMs }}>
                    {#if item.type === "script"}
                        {@const script = manager.getScript(item.id)!}
                        <Script {script} startDrag={() => startDrag(item.id)} {dragDisabled} {dragAllowed} />
                    {:else}
                        <Folder
                            id={item.id}
                            {dragging}
                            {manager}
                            startDrag={() => startDrag(item.id)}
                            {dragDisabled}
                            {dragAllowed}
                        />
                    {/if}
                </div>
            {/each}
        {/key}
    </div>
</div>
