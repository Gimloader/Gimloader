<script lang="ts">
    import Plugin from "./Plugin.svelte";
    import { createScript, readUserFile } from "$content/utils";
    import { Button } from "$shared/ui/button";
    import PluginManager from "$core/scripts/pluginManager.svelte";
    import * as DropdownMenu from "$shared/ui/dropdown-menu";
    import ChevronDown from "@lucide/svelte/icons/chevron-down";
    import ScriptList from "../components/scripts/ScriptList.svelte";
    import Modals from "$core/modals.svelte";
    import { downloadScript } from "$core/net/download";
    import PluginFolder from "./PluginFolder.svelte";
    import Port from "$shared/net/port.svelte";

    let { officialPluginsOpen = $bindable() }: { officialPluginsOpen: boolean } = $props();

    function importPlugin() {
        readUserFile(".js", (code) => {
            code = code.replaceAll("\r\n", "\n");
            PluginManager.create(code);
        });
    }

    function sortEnabled() {
        const folders = PluginManager.currentFolder.contents.filter(i => i.type === "folder");
        const plugins = PluginManager.currentFolder.contents.filter(i => i.type !== "folder");
        const enabled = plugins.filter((p) => PluginManager.getScript(p.id)?.enabled);
        const disabled = plugins.filter((p) => !PluginManager.getScript(p.id)?.enabled);
        PluginManager.currentFolder.contents = folders.concat(enabled, disabled);

        Port.send("pluginArrange", {
            order: PluginManager.currentFolder.contents.map(p => p.id),
            folder: PluginManager.openFolderId
        });
    }

    function sortAlphabetical() {
        PluginManager.currentFolder.contents.sort((a, b) =>
            PluginManager.getItemName(a).localeCompare(PluginManager.getItemName(b))
        );

        Port.send("pluginArrange", {
            order: PluginManager.currentFolder.contents.map(p => p.id),
            folder: PluginManager.openFolderId
        });
    }

    function deleteAll() {
        if(!confirm("Are you sure you want to delete all plugins?")) return;
        PluginManager.deleteAll(false);
    }

    async function openUrlInstall() {
        const url = await Modals.open("input", {
            title: "Install plugin from URL",
            placeholder: "Plugin URL"
        });
        if(!url) return;

        downloadScript(url, PluginManager.openFolderId, "plugin");
    }
</script>

<ScriptList manager={PluginManager} Script={Plugin} Folder={PluginFolder}>
    {#snippet buttons()}
        <Button class="h-7" onclick={() => officialPluginsOpen = true}>
            Official Plugins
        </Button>
        <DropdownMenu.Root>
            <DropdownMenu.Trigger class="mx-1.5!">
                <Button class="h-7">
                    Create/Install Plugin
                    <ChevronDown size={12} />
                </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
                <DropdownMenu.Item onclick={() => createScript(PluginManager)}>Create Blank</DropdownMenu.Item>
                <DropdownMenu.Item onclick={importPlugin}>Upload File</DropdownMenu.Item>
                <DropdownMenu.Item onclick={openUrlInstall}>Install From URL</DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <Button class="h-7">
                    Bulk actions
                    <ChevronDown size={12} />
                </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
                <DropdownMenu.Item onclick={() => deleteAll()}>Delete all</DropdownMenu.Item>
                <DropdownMenu.Item onclick={() => PluginManager.setAllConfirm(true)}>Enable all</DropdownMenu.Item>
                <DropdownMenu.Item onclick={() => PluginManager.setAllConfirm(false)}>Disable all</DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
        <DropdownMenu.Root>
            <DropdownMenu.Trigger class="mx-1.5!">
                <Button class="h-7">
                    Sort by...
                    <ChevronDown size={12} />
                </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
                <DropdownMenu.Item onclick={sortEnabled}>Enabled</DropdownMenu.Item>
                <DropdownMenu.Item onclick={sortAlphabetical}>Alphabetical</DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    {/snippet}
    {#snippet noScripts()}
        No plugins installed! Check out the
        <button class="underline" onclick={() => officialPluginsOpen = true}>
            Official Plugins
        </button>
        or import or create your own.
    {/snippet}
</ScriptList>
