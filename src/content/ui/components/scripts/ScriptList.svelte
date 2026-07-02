<script lang="ts">
    import type ScriptManager from "$core/scripts/scriptManager.svelte";
    import type { LayoutItem } from "$types/net/state";
    import type { Component, Snippet } from "svelte";
    import Storage from "$core/storage.svelte";
    import { dndzone } from "svelte-dnd-action";
    import Search from "../Search.svelte";
    import { flipDurationMs } from "$shared/consts";
    import { flip } from "svelte/animate";
    import ViewControl from "../ViewControl.svelte";
    import ScriptFolder from "./ScriptFolder.svelte";
    import Modals from "$core/modals.svelte";
    import FolderPlus from "@lucide/svelte/icons/folder-plus";
    import { capitalize } from "$shared/utils";

    interface Props {
        buttons: Snippet;
        noScripts: Snippet;
        manager: ScriptManager<any, any>;
        Script: Component<any>;
    }

    let { buttons, noScripts, manager, Script }: Props = $props();

    let searchValue = $state("");
    let searchLower = $derived(searchValue.toLowerCase());
    let dragAllowed = $derived(searchValue.length === 0);
    let dragDisabled = $state(true);

    const getItemName = (item: LayoutItem) => {
        if(item.type === "folder") return manager.layout[item.id].name!;
        return item.id;
    };

    let items = $state([...manager.currentFolder.contents]);
    $effect(() => {
        items = manager.currentFolder.contents
            .filter(item => getItemName(item).toLowerCase().includes(searchLower));
    });

    function startDrag() {
        dragDisabled = false;
    }

    function handleDndConsider(e: any) {
        items = e.detail.items;
    }

    function handleDndFinalize(e: any) {
        items = e.detail.items;
        dragDisabled = true;

        // Update the order of the plugins
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
</script>

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
        class="overflow-y-auto outline-none grid gap-4 pb-1 grow view-{Storage.settings.menuView}"
        use:dndzone={{ items, flipDurationMs, dragDisabled, dropTargetStyle: {} }}
        onconsider={handleDndConsider}
        onfinalize={handleDndFinalize}
    >
        {#key searchValue}
            {#each items as item (item.id)}
                <div animate:flip={{ duration: flipDurationMs }}>
                    {#if item.type === "script"}
                        {@const script = manager.getScript(item.id)!}
                        <Script {script} {startDrag} {dragDisabled} {dragAllowed} />
                    {:else}
                        <ScriptFolder id={item.id} {manager} {startDrag} {dragDisabled} {dragAllowed} />
                    {/if}
                </div>
            {/each}
        {/key}
    </div>
</div>
