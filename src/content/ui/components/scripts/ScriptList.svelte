<script lang="ts">
    import type ScriptManager from "$core/scripts/scriptManager.svelte";
    import type { LayoutItem } from "$types/net/state";
    import type { Component, Snippet } from "svelte";
    import Storage from "$core/storage.svelte";
    import { dndzone, type DndEvent } from "svelte-dnd-action";
    import Search from "../Search.svelte";
    import { dndZoneSettings, flipDurationMs } from "$shared/consts";
    import { flip } from "svelte/animate";
    import ViewControl from "../ViewControl.svelte";
    import ScriptFolder from "./ScriptFolder.svelte";
    import Modals from "$core/modals.svelte";
    import FolderPlus from "@lucide/svelte/icons/folder-plus";
    import { capitalize } from "$shared/utils";
    import ScriptItem from "./ScriptItem.svelte";
    import FolderOpen from "@lucide/svelte/icons/folder-open";
    import { Portal } from "bits-ui";
    import { createTransformDragged } from "$content/utils";

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

    let searchValue = $state("");
    let searchLower = $derived(searchValue.toLowerCase());
    let dragAllowed = $derived(searchValue.length === 0);
    let dragDisabled = $state(true);
    let dragging: string | null = $state(null);

    const getItemName = (item: LayoutItem) => {
        if(item.type === "folder") return manager.layout[item.id].name!;
        return item.id;
    };

    let items = $state([...manager.currentFolder.contents]);
    $effect(() => {
        items = manager.currentFolder.contents
            .filter(item => getItemName(item).toLowerCase().includes(searchLower));
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
            placeholder: "Folder name"
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

        manager.moveItem(droppedItem, manager.currentFolder.parent);
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
                        transformDraggedElement: createTransformDragged("scale(50%)")
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
                            {manager.layout[manager.currentFolder.parent]?.name}
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
        <Search bind:value={searchValue} />
    </div>
    {#if manager.scripts.length === 0}
        {@render noScripts()}
    {/if}
    {#if manager.currentFolder.parent}
        <div class="flex items-center gap-2 pb-1">
            <button class="underline" onclick={() => manager.viewFolder("root")}>
                {capitalize(manager.plural)}
            </button>
            {@render folderName(manager.openFolderId)}
        </div>
    {/if}
    <div
        class="overflow-y-auto outline-none grid gap-4 pb-1 grow view-{Storage.settings.menuView} min-h-auto!"
        use:dndzone={{ ...dndZoneSettings, items, dragDisabled, transformDraggedElement: createTransformDragged("") }}
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
