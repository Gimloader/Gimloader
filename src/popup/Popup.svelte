<script lang="ts">
    import type { PluginInfo } from "$types/net/state";
    import Web from "svelte-material-icons/Web.svelte";
    import GithubIcon from "$assets/github-mark-white.svg";
    import Xml from "svelte-material-icons/Xml.svelte";
    import { version } from "../../package.json";
    import { parseScriptHeaders } from "$shared/parseHeader";
    import { toast, Toaster } from "svelte-sonner";
    import Plugin from "./Plugin.svelte";
    import StateManager from "$shared/state";

    let plugins: PluginInfo[] = $state([]);
    StateManager.plugin.scripts.bind(() => plugins, (value) => plugins = value);

    function openSite() {
        chrome.tabs.create({ url: "https://gimloader.github.io" });
    }

    function openRepo() {
        chrome.tabs.create({ url: "https://github.com/Gimloader/Gimloader" });
    }

    function copyDebugInfo() {
        const plugins = StateManager.plugin.scripts.value
            .toSorted((a, b) => a.name.localeCompare(b.name))
            .toSorted((a, b) => a.enabled === b.enabled ? 0 : a.enabled ? -1 : 1);
        const libraries = StateManager.library.scripts.value
            .toSorted((a, b) => a.name.localeCompare(b.name));

        let debugInfo = `**Core:**\nGimloader v${version}`;
        debugInfo += `\n\n**Plugins:**\n` + plugins.map((plugin) => {
            const headers = parseScriptHeaders(plugin.code);
            return `- ${plugin.name} v${headers.version || "unknown"} [${plugin.enabled ? "enabled" : "disabled"}]`;
        }).join("\n");
        debugInfo += `\n\n**Libraries:**\n` + libraries.map((library) => {
            const headers = parseScriptHeaders(library.code);
            return `- ${library.name} v${headers.version || "unknown"}`;
        }).join("\n");

        navigator.clipboard.writeText(debugInfo)
            .then(() => toast.success("Debug info copied to clipboard"))
            .catch(() => toast.error("Failed to copy debug info to clipboard"));
    }
</script>

<Toaster richColors />

<div class="w-full h-full bg-slate-900 text-white">
    <div class="flex items-center gap-2 px-1 border-b">
        <img src="./images/icon128.png" alt="The Gimloader icon" class="w-6 h-6" />
        <h1 class="whitespace-nowrap text-2xl font-bold grow">Gimloader</h1>
        <button onclick={openSite} title="Open official site"><Web size={24} /></button>
        <button onclick={openRepo} title="Open github repo">{@html GithubIcon}</button>
        <button onclick={copyDebugInfo} title="Copy debug info"><Xml size={24} /></button>
    </div>
    <div class="max-h-[500px] overflow-y-auto w-full py-1">
        {#if plugins.length === 0}
            <div class="w-full text-center text-xl font-semibold">
                No plugins installed!
            </div>
        {:else}
            {#each plugins as plugin}
                <Plugin {plugin} />
            {/each}
        {/if}
    </div>
</div>
