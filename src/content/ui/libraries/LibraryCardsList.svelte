<script lang="ts">
    import type { Lib } from "$core/scripts/scripts.svelte";
    import { flip } from "svelte/animate";
    import { dndzone } from "svelte-dnd-action";
    import Library from "./Library.svelte";
    import { Button, Dropdown, DropdownItem } from "flowbite-svelte";
    import { readUserFile, showEditor } from "$content/utils";
    import LibManager from "$core/scripts/libManager.svelte";
    import Storage from "$core/storage.svelte";
    import Search from "../components/Search.svelte";

    import PlusBoxOutline from 'svelte-material-icons/PlusBoxOutline.svelte';
    import Import from 'svelte-material-icons/Import.svelte';
    import ChevronDown from 'svelte-material-icons/ChevronDown.svelte';
    import ViewControl from "../components/ViewControl.svelte";
    
    let { onDrop }: { onDrop: (callback: (text: string) => void) => void } = $props();

    onDrop((text: string) => {
        LibManager.createLib(text);
    });

    let searchValue = $state("");
    let items = $state(LibManager.libs.map((lib: Lib) => ({ id: lib.headers.name })));
    $effect(() => {
        items = LibManager.libs
            .filter((lib) => lib.headers.name.toLowerCase().includes(searchValue.toLowerCase()))
            .map((lib) => ({ id: lib.headers.name }));
    });

    let dragDisabled = $state(true);

    function handleDndConsider(e: any) {
        items = e.detail.items;
    }

    function handleDndFinalize(e: any) {
        items = e.detail.items;
        dragDisabled = true;

        // Update the order of the libraries
        let order = items.map(i => i.id);

        LibManager.arrangeLibs(order);
    }

    function startDrag() {
        dragDisabled = false;
    }

    let bulkOpen = $state(false);

    function deleteAll() {
        bulkOpen = false;
        
        if(LibManager.libs.length === 0) return;
        const conf = confirm(`Are you sure you want to delete all libraries?`);
        if(!conf) return;

        LibManager.deleteAll();
    }

    function importLib() {
        readUserFile(".js", (code) => {
            code = code.replaceAll("\r\n", "\n");
            LibManager.createLib(code);
        });
    }

    let flipDurationMs = $state(0);
    setTimeout(() => flipDurationMs = 300);
</script>

<div class="flex flex-col max-h-full">
    <div class="flex items-center mb-[3px]">
        <button onclick={() => showEditor("library")}>
            <PlusBoxOutline size={32} />
        </button>
        <button onclick={importLib}>
            <Import size={32} />
        </button>
        <Button class="h-7 mr-2">Bulk actions<ChevronDown class="ml-1" size={20} /></Button>
        <Dropdown bind:open={bulkOpen}>
            <DropdownItem on:click={deleteAll}>Delete all</DropdownItem>
        </Dropdown>
        <ViewControl />
        <Search bind:value={searchValue} />
    </div>
    {#if LibManager.libs.length === 0}
        <h2 class="text-xl">No libraries installed!</h2>
    {/if}
    <div class="overflow-y-auto grid gap-4 view-{Storage.settings.menuView} pb-1 flex-grow"
    use:dndzone={{ items, flipDurationMs, dragDisabled, dropTargetStyle: {} }}
    onconsider={handleDndConsider} onfinalize={handleDndFinalize}>
        {#key searchValue}
            {#each items as item (item.id)}
                {@const library = LibManager.getLib(item.id)}
                <div animate:flip={{ duration: flipDurationMs }}>
                    <Library {library} {startDrag} {dragDisabled} dragAllowed={searchValue == ''} />
                </div>
            {/each}
        {/key}
    </div>
</div>