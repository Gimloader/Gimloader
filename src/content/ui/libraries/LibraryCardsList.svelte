<script lang="ts">
    import { readUserFile } from "$content/utils";
    import LibManager from "$core/scripts/libManager.svelte";
    import * as DropdownMenu from "$shared/ui/dropdown-menu";
    import { Button } from "$shared/ui/button";
    import ChevronDown from "@lucide/svelte/icons/chevron-down";
    import ScriptList from "../components/scripts/ScriptList.svelte";
    import Modals from "$core/modals.svelte";
    import { downloadScript } from "$core/net/download";
    import Port from "$shared/net/port.svelte";
    import StateManager from "$shared/state";

    function importLib() {
        readUserFile(".js", (code) => {
            code = code.replaceAll("\r\n", "\n");
            StateManager.library.create(code, LibManager.openFolderId);
        });
    }

    function deleteAll() {
        if(!confirm("Are you sure you want to delete all libraries?")) return;
        LibManager.deleteAllConfirm();
    }

    async function openUrlInstall() {
        const url = await Modals.open("input", {
            title: "Install library from URL",
            placeholder: "Library URL"
        });
        if(!url) return;

        downloadScript(url, LibManager.openFolderId, "library");
    }

    function createScript() {
        Port.sendAndRecieve("showEditor", {
            type: "library",
            folder: LibManager.openFolderId
        });
    }
</script>

<ScriptList manager={LibManager}>
    {#snippet buttons()}
        <DropdownMenu.Root>
            <DropdownMenu.Trigger class="mr-1.5!">
                <Button class="h-7">
                    Create/Install Library
                    <ChevronDown size={12} />
                </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
                <DropdownMenu.Item onclick={createScript}>Create Blank</DropdownMenu.Item>
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
        No libraries installed! You will be prompted to install these when plugins require them.
    {/snippet}
</ScriptList>
