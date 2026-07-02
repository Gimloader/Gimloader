<script lang="ts">
    import { readUserFile, showEditor } from "$content/utils";
    import LibManager from "$core/scripts/libManager.svelte";
    import * as DropdownMenu from "$shared/ui/dropdown-menu";
    import { Button } from "$shared/ui/button";
    import ChevronDown from "@lucide/svelte/icons/chevron-down";
    import ScriptList from "../components/scripts/ScriptList.svelte";
    import ScriptItem from "../components/scripts/ScriptItem.svelte";
    import Modals from "$core/modals.svelte";

    function importLib() {
        readUserFile(".js", (code) => {
            code = code.replaceAll("\r\n", "\n");
            LibManager.create(code);
        });
    }

    function deleteAll() {
        if(!confirm("Are you sure you want to delete all libraries?")) return;
        LibManager.deleteAllConfirm();
    }

    function openUrlInstall() {
        Modals.open("urlInstall", { manager: LibManager });
    }
</script>

<ScriptList manager={LibManager} Script={ScriptItem}>
    {#snippet buttons()}
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
                <DropdownMenu.Item onclick={openUrlInstall}>Install From URL</DropdownMenu.Item>
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
    {/snippet}
    {#snippet noScripts()}
        <h2 class="text-xl">No libraries installed!</h2>
    {/snippet}
</ScriptList>
