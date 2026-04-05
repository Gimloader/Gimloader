<script lang="ts" module>
    let openState = $state(false);
    let currentTab = $state("plugins");
    let officialPluginsOpen = $state(false);

    export function showMenu(tab = "plugins", officialOpen = false) {
        openState = true;
        currentTab = tab;
        officialPluginsOpen = officialOpen;
    }
</script>

<script lang="ts">
    import LibraryCardsList from "../libraries/LibraryCardsList.svelte";
    import PluginCardsList from "../plugins/PluginCardsList.svelte";
    import Updates from "../Updates.svelte";
    import Settings from "../Settings.svelte";
    import Hotkeys from "../Hotkeys.svelte";
    import OfficialPlugins from "../plugins/OfficialPlugins.svelte";
    import Port from "$shared/net/port.svelte";
    import { toast } from "svelte-sonner";
    import PluginManager from "$core/scripts/pluginManager.svelte";
    import LibManager from "$core/scripts/libManager.svelte";
    import * as Dialog from "$shared/ui/dialog";
    import * as Tabs from "$shared/ui/tabs";

    import Wrench from "svelte-material-icons/Wrench.svelte";
    import Book from "svelte-material-icons/Book.svelte";
    import KeyboardOutline from "svelte-material-icons/KeyboardOutline.svelte";
    import Update from "svelte-material-icons/Update.svelte";
    import Cog from "svelte-material-icons/Cog.svelte";
    import FileUploadOutline from "svelte-material-icons/FileUploadOutline.svelte";

    let modalDragCounter = $state(0);
    let canDrop = $derived(currentTab === "plugins" || currentTab === "libraries");

    async function onDrop(e: DragEvent) {
        if(!canDrop) return;

        e.preventDefault();
        modalDragCounter = 0;

        let file = e.dataTransfer.files[0];
        if(!file) return;

        if(file.type !== "text/javascript") {
            toast.error("That doesn't appear to be a script you can install");
            return;
        }
        let text = await file.text();

        if(currentTab === "plugins") PluginManager.create(text);
        else LibManager.create(text);
    }

    function blurFocused() {
        (document.activeElement as HTMLElement)?.blur();
    }
</script>

<Dialog.Root bind:open={openState} onOpenChangeComplete={blurFocused}>
    <Dialog.Content
        class="text-gray-600 min-h-[65vh]"
        trapFocus={false}
        ondragenter={() => modalDragCounter++}
        ondragleave={() => modalDragCounter--}
        ondragover={(e) => e.preventDefault()}
        ondrop={onDrop}
        style="max-width: min(1280px, calc(100% - 32px))">
        {#if Port.disconnected}
            <div
                class="
                    z-50 absolute left-0 top-0 w-full h-full bg-gray-500
                    rounded-lg opacity-70 flex flex-col items-center justify-center
                ">
                <h2 class="text-3xl text-white">Connection lost with extension</h2>
                <div class="xl text-white">
                    Attempting to reconnect... you can always refresh the page if this fails
                </div>
            </div>
        {/if}
        {#if canDrop && modalDragCounter > 0}
            <div
                class="
                    z-50 absolute left-0 top-0 w-full h-full pointer-events-none
                    rounded-lg opacity-70 flex items-center justify-center
                    bg-gray-500 border-white border-4 border-dashed
                "
                role="dialog">
                <FileUploadOutline size={128} color="white" />
            </div>
        {/if}
        <Tabs.Root bind:value={currentTab} class="w-full">
            <Tabs.List class="w-full">
                <Tabs.Trigger value="plugins">
                    <Wrench size={24} />
                    <span class="ml-2">Plugins</span>
                </Tabs.Trigger>
                <Tabs.Trigger value="libraries">
                    <Book size={24} />
                    <span class="ml-2">Libraries</span>
                </Tabs.Trigger>
                <Tabs.Trigger value="hotkeys">
                    <KeyboardOutline size={24} />
                    <span class="ml-2">Hotkeys</span>
                </Tabs.Trigger>
                <Tabs.Trigger value="updates">
                    <Update size={24} />
                    <span class="ml-2">Updates</span>
                </Tabs.Trigger>
                <Tabs.Trigger value="settings">
                    <Cog size={24} />
                    <span class="ml-2">Settings</span>
                </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="plugins">
                {#if officialPluginsOpen}
                    <OfficialPlugins bind:officialPluginsOpen />
                {:else}
                    <PluginCardsList bind:officialPluginsOpen />
                {/if}
            </Tabs.Content>
            <Tabs.Content value="libraries">
                <LibraryCardsList />
            </Tabs.Content>
            <Tabs.Content value="hotkeys">
                <Hotkeys />
            </Tabs.Content>
            <Tabs.Content value="updates">
                <Updates />
            </Tabs.Content>
            <Tabs.Content value="settings">
                <Settings />
            </Tabs.Content>
        </Tabs.Root>
    </Dialog.Content>
</Dialog.Root>
