<script lang="ts">
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
    import * as Dialog from "$shared/ui/dialog";
    import ChevronDown from "@lucide/svelte/icons/chevron-down";
    import UrlInstall from "../components/UrlInstall.svelte";

    let searchValue = $state("");
    let items = $state(LibManager.scripts.map((lib) => ({ id: lib.headers.name })));
    $effect(() => {
        items = LibManager.scripts
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

        LibManager.arrange(order);
    }

    function startDrag() {
        dragDisabled = false;
    }

    function importLib() {
        readUserFile(".js", (code) => {
            code = code.replaceAll("\r\n", "\n");
            LibManager.create(code);
        });
    }

    const flipDurationMs = 300;

    function deleteAll() {
        if(!confirm("Are you sure you want to delete all libraries?")) return;
        LibManager.deleteAllConfirm();
    }

    let urlInstallOpen = $state(false);
</script>

<UrlInstall bind:open={urlInstallOpen} placeholder="Library URL" type="library" />

<div class="flex flex-col max-h-full">
    <div class="flex items-center mb-[3px]">
        <DropdownMenu.Root>
            <DropdownMenu.Trigger class="mr-1.5!">
                <Button class="h-7">
                    Create/Install Library
                    <ChevronDown size={12} />
                </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
                <DropdownMenu.Item onclick={() => showEditor("library")}>Create Blank</DropdownMenu.Item>
                <DropdownMenu.Item onclick={importLib}>Upload File</DropdownMenu.Item>
                <DropdownMenu.Item onclick={() => urlInstallOpen = true}>Install From URL</DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
        <DropdownMenu.Root>
            <DropdownMenu.Trigger class="mr-2!">
                <Button class="h-7">
                    Bulk actions
                    <ChevronDown size={12} />
                </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
                <DropdownMenu.Item onclick={() => deleteAll()}>
                    Delete all
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
        <ViewControl />
        <Search bind:value={searchValue} />
    </div>
    {#if LibManager.scripts.length === 0}
        <h2 class="text-xl">No libraries installed!</h2>
    {/if}
    <div
        class="overflow-y-auto outline-none grid gap-4 view-{Storage.settings.menuView} pb-1 grow"
        use:dndzone={{ items, flipDurationMs, dragDisabled, dropTargetStyle: {} }}
        onconsider={handleDndConsider}
        onfinalize={handleDndFinalize}>
        {#key searchValue}
            {#each items as item (item.id)}
                {@const library = LibManager.getScript(item.id)!}
                <div animate:flip={{ duration: flipDurationMs }}>
                    <Library {library} {startDrag} {dragDisabled} dragAllowed={searchValue == ""} />
                </div>
            {/each}
        {/key}
    </div>
</div>
