<script lang="ts">
    import type { OfficialScriptInfo } from "$types/scripts";
    import { onMount } from "svelte";
    import Card from "../components/Card.svelte";
    import { Button } from "$shared/ui/button";
    import PluginManager from "$core/scripts/pluginManager.svelte";
    import ScriptTextOutline from "svelte-material-icons/ScriptTextOutline.svelte";
    import Download from "svelte-material-icons/Download.svelte";
    import Search from "../components/Search.svelte";
    import { downloadScript } from "$core/net/download";
    import { error } from "$shared/utils";
    import * as Tooltip from "$shared/ui/tooltip";
    import BadgeCheck from "@lucide/svelte/icons/badge-check";
    import { officialUrlBase } from "$shared/consts";

    let { officialPluginsOpen = $bindable() }: { officialPluginsOpen: boolean } = $props();

    let officialPlugins: OfficialScriptInfo[] = $state([]);
    let searchValue = $state("");
    let plugins = $derived.by(() => {
        PluginManager.scripts.length;
        return officialPlugins.filter(p => (
            !PluginManager.getScript(p.title)
            && p.title.toLowerCase().includes(searchValue.toLowerCase())
        ));
    });

    const saved = localStorage.getItem("gl-officialPlugins");
    if(saved) {
        try {
            officialPlugins = JSON.parse(saved);
        } catch {
            error("Failed to parse saved official plugins:", saved);
        }
    }

    onMount(async () => {
        const lastFetch = parseInt(localStorage.getItem("gl-lastOfficialFetch") ?? "0", 10);
        const delay = 1000 * 60 * 60; // 1 hour
        const now = Date.now();

        if(now - lastFetch < delay) return;

        try {
            const res = await fetch("https://gimloader.github.io/plugins.json");
            officialPlugins = await res.json();
            localStorage.setItem("gl-officialPlugins", JSON.stringify(officialPlugins));
        } catch (e) {
            error("Failed to fetch official plugins", e);
            return;
        }
    });
</script>

<div class="flex flex-col max-h-full">
    <div class="flex items-center mb-[3px] mt-1">
        <Button class="h-7" onclick={() => officialPluginsOpen = false}>
            &lt; Installed Plugins
        </Button>
        <Search bind:value={searchValue} />
    </div>
    <div class="overflow-y-auto grid gap-4 pb-1 grow view-grid">
        {#each plugins as plugin}
            <div>
                <Card dragDisabled={false} hasDrag={false}>
                    {#snippet header()}
                        <h2 class="overflow-ellipsis overflow-hidden whitespace-nowrap grow text-xl font-bold! mb-0!">
                            {plugin.title}
                            <Tooltip.Provider>
                                <Tooltip.Root>
                                    <Tooltip.Trigger>
                                        {@const href =
                                        `${officialUrlBase}/plugins/${plugin.title}`}
                                        <a target="_blank" {href}>
                                            <BadgeCheck class="text-primary" size={16} />
                                        </a>
                                    </Tooltip.Trigger>
                                    <Tooltip.Content side="bottom">
                                        This plugin has been verified as an official Gimloader script.
                                    </Tooltip.Content>
                                </Tooltip.Root>
                            </Tooltip.Provider>
                        </h2>
                    {/snippet}
                    {#snippet toggle()}
                        <Button class="px-2 py-2" onclick={() => downloadScript(plugin.downloadUrl, "plugin")}>
                            <Download size={20} />
                        </Button>
                    {/snippet}
                    {#snippet description()}
                        {plugin.description}
                    {/snippet}
                    {#snippet buttons()}
                        <a href={plugin.webpage} target="_blank">
                            <ScriptTextOutline size={28} />
                        </a>
                    {/snippet}
                </Card>
            </div>
        {/each}
        {#if officialPlugins.length === 0}
            <h2 class="text-xl">Loading...</h2>
        {:else if plugins.length === 0}
            {#if searchValue === ""}
                <h2 class="text-xl">All official plugins are installed</h2>
            {:else}
                <h2 class="text-xl">No plugins match your search</h2>
            {/if}
        {/if}
    </div>
</div>
