<script lang="ts">
    import PluginManager from "$core/scripts/pluginManager.svelte";
    import LibManager from "$core/scripts/libManager.svelte";
    import { checkUpdate } from "$core/net/checkUpdates";
    import Update from "svelte-material-icons/Update.svelte";
    import InformationOutline from "svelte-material-icons/InformationOutline.svelte";
    import { version } from "../../../package.json";
    import { toast } from "svelte-sonner";
    import Port from "$shared/net/port.svelte";
    import { englishList } from "$shared/utils";
    import Modals from "$content/core/modals.svelte";
    import { changelog } from "$content/utils";

    async function checkAll() {
        if(!confirm("Do you want to try to update all plugins and all libraries?")) return;
        let names: string[] = await Port.sendAndRecieve("updateAll");

        if(names.length === 0) return toast.success("All scripts are up to date!");
        toast.success(`Updated ${englishList(names)}`);
    }
</script>

{#snippet update(name: string, changes: string[], version?: string)}
    <div class="flex gap-1">
        {name}{version && ` v${version}`}
        {#if changes.length > 0}
            <button title="View changelog" onclick={() => Modals.open("singleChangelog", { name, version, changes })}>
                <InformationOutline size={20} color="var(--primary-500)" />
            </button>
        {/if}
    </div>
{/snippet}

<div class="h-full overflow-y-auto">
    <div class="flex items-center">
        <button onclick={checkAll}>
            <Update size={25} />
        </button>
        Check all updates
    </div>
    <div class="font-bold text-xl mt-2">Gimloader</div>
    <div class="flex items-center">
        {@render update("Gimloader", changelog, version)}
    </div>
    <div class="font-bold text-xl mt-2">Plugins</div>
    {#if PluginManager.scripts.length === 0}
        <h2 class="text-lg">No plugins installed</h2>
    {:else}
        {#each PluginManager.scripts as plugin}
            <div class="flex items-center">
                {#if plugin.headers.downloadUrl}
                    <button onclick={() => checkUpdate(plugin)}>
                        <Update size={25} />
                    </button>
                {/if}
                {@render update(plugin.headers.name, plugin.headers.changelog, plugin.headers.version)}
            </div>
        {/each}
    {/if}
    <div class="font-bold text-xl mt-2">Libraries</div>
    {#if LibManager.scripts.length === 0}
        <h2 class="text-lg">No libraries installed</h2>
    {:else}
        {#each LibManager.scripts as lib}
            <div class="flex items-center">
                {#if lib.headers.downloadUrl}
                    <button title="Check for updates" onclick={() => checkUpdate(lib)}>
                        <Update size={25} />
                    </button>
                {/if}
                {@render update(lib.headers.name, lib.headers.changelog, lib.headers.version)}
            </div>
        {/each}
    {/if}
</div>
