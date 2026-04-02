<script lang="ts">
    import { flip } from "svelte/animate";
    import { dndzone } from "svelte-dnd-action";
    import Plugin from "./Plugin.svelte";
    import { readUserFile, showEditor } from "$content/utils";
    import { Button } from "$shared/ui/button";
    import Search from "../components/Search.svelte";
    import PluginManager from "$core/scripts/pluginManager.svelte";
    import Storage from "$core/storage.svelte";
    import Port from "$shared/net/port.svelte";
    import { flipDurationMs } from "$shared/consts";
    import ViewControl from "../components/ViewControl.svelte";
    import * as DropdownMenu from "$shared/ui/dropdown-menu";
    import ChevronDown from "@lucide/svelte/icons/chevron-down";
    import UrlInstall from "../components/UrlInstall.svelte";

    let { officialPluginsOpen = $bindable() }: { officialPluginsOpen: boolean } = $props();

    let searchValue = $state("");
    let items = $state(PluginManager.scripts.map((plugin) => ({ id: plugin.headers.name })));

    $effect(() => {
        items = PluginManager.scripts
            .filter((plugin) => plugin.headers.name.toLowerCase().includes(searchValue.toLowerCase()))
            .map((plugin) => ({ id: plugin.headers.name }));
    });

    let dragDisabled = $state(true);

    function handleDndConsider(e: any) {
        items = e.detail.items;
    }

    function handleDndFinalize(e: any) {
        items = e.detail.items;
        dragDisabled = true;

        // Update the order of the plugins
        let order = items.map(i => i.id);
        PluginManager.arrange(order);
    }

    function startDrag() {
        dragDisabled = false;
    }

    function importPlugin() {
        readUserFile(".js", (code) => {
            code = code.replaceAll("\r\n", "\n");
            PluginManager.create(code);
        });
    }

    function sortEnabled() {
        let enabled = PluginManager.scripts.filter((p) => p.enabled);
        let disabled = PluginManager.scripts.filter((p) => !p.enabled);
        PluginManager.scripts = enabled.concat(disabled);
        Port.send("pluginArrange", { order: PluginManager.scripts.map(p => p.headers.name) });
    }

    function sortAlphabetical() {
        let sorted = PluginManager.scripts.sort((a, b) => a.headers.name.localeCompare(b.headers.name));
        PluginManager.scripts = sorted;
        Port.send("pluginArrange", { order: sorted.map(p => p.headers.name) });
    }

    function deleteAll() {
        if(!confirm("Are you sure you want to delete all plugins?")) return;
        PluginManager.deleteAll(false);
    }

    let urlInstallOpen = $state(false);
</script>

<UrlInstall bind:open={urlInstallOpen} placeholder="Plugin URL" type="plugin" />

<div class="flex flex-col max-h-full">
    <div class="flex items-center mb-[3px]">
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
                <DropdownMenu.Item onclick={() => showEditor("plugin")}>Create Blank</DropdownMenu.Item>
                <DropdownMenu.Item onclick={importPlugin}>Upload File</DropdownMenu.Item>
                <DropdownMenu.Item onclick={() => urlInstallOpen = true}>Install From URL</DropdownMenu.Item>
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
        <ViewControl />
        <Search bind:value={searchValue} />
    </div>
    {#if PluginManager.scripts.length === 0}
        <h2 class="text-xl w-full text-center">
            No plugins installed! Check out the
            <button class="underline" onclick={() => officialPluginsOpen = true}>
                Official Plugins
            </button>
            or import or create your own.
        </h2>
    {/if}
    <div
        class="overflow-y-auto outline-none grid gap-4 pb-1 grow view-{Storage.settings.menuView}"
        use:dndzone={{ items, flipDurationMs, dragDisabled, dropTargetStyle: {} }}
        onconsider={handleDndConsider}
        onfinalize={handleDndFinalize}>
        {#key searchValue}
            {#each items as item (item.id)}
                {@const plugin = PluginManager.getScript(item.id)}
                <div animate:flip={{ duration: flipDurationMs }}>
                    <Plugin {plugin} {startDrag} {dragDisabled} dragAllowed={searchValue == ""} />
                </div>
            {/each}
        {/key}
    </div>
</div>
