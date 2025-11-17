<script lang="ts">
    import type { Lib } from "$core/scripts/scripts.svelte";
    import { flip } from "svelte/animate";
    import { dndzone } from "svelte-dnd-action";
    import Library from "./Library.svelte";
    import { readUserFile, showEditor } from "$content/utils";
    import LibManager from "$core/scripts/libManager.svelte";
    import Storage from "$core/storage.svelte";
    import Search from "../components/Search.svelte";
    import * as DropdownMenu from "$shared/ui/dropdown-menu";
    import { Button } from "$shared/ui/button";
    import ViewControl from "../components/ViewControl.svelte";

    import PlusBoxOutline from 'svelte-material-icons/PlusBoxOutline.svelte';
    import Import from 'svelte-material-icons/Import.svelte';

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
        <DropdownMenu.Root>
            <DropdownMenu.Trigger class="mr-1.5!">
                <Button class="h-7">Install Library</Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
                <DropdownMenu.Item onclick={() => showEditor("library")}>Open Editor</DropdownMenu.Item>
                <DropdownMenu.Item onclick={importLib}>Upload</DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
        <DropdownMenu.Root>
            <DropdownMenu.Trigger class="mr-2!">
                <Button class="h-7">
                    Bulk actions
                </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
                <DropdownMenu.Item onclick={() => LibManager.deleteAllConfirm(false)}>
                    Delete all
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
        <ViewControl />
        <Search bind:value={searchValue} />
    </div>
    {#if LibManager.libs.length === 0}
        <h2 class="text-xl">No libraries installed!</h2>
    {/if}
    <div class="overflow-y-auto outline-none grid gap-4 view-{Storage.settings.menuView} pb-1 grow"
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
