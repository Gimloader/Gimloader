<script lang="ts">
    import Tree from "./Tree.svelte";
    import { scripts } from "$core/scripts/map";
    import { parseDep } from "$shared/parseHeader";
    import ArrowRightBottom from "svelte-material-icons/ArrowRightBottom.svelte";
    import AlertCircle from "svelte-material-icons/AlertCircleOutline.svelte";
    import AlertTriangle from "svelte-material-icons/AlertOutline.svelte";
    import ArrowUp from "svelte-material-icons/ArrowUp.svelte";
    import Link from "svelte-material-icons/Link.svelte";
    import LinkOff from "svelte-material-icons/LinkOff.svelte";
    import Download from "svelte-material-icons/Download.svelte";
    import { Plugin } from "$core/scripts/plugin.svelte";
    import { downloadScript } from "$core/net/download";

    interface Props {
        name: string;
        type: string;
        stack: string[];
        root?: boolean;
        url?: string;
        optional?: boolean;
    }

    let { name, type, stack, root = false, optional = false, url }: Props = $props();
    let script = $state(scripts.get(name));

    function getError() {
        if(root) return null;
        if(stack.includes(name)) return "circular dependency";
        if(!script && !optional && !url) return "missing and cannot be downloaded";
        return null;
    }

    function getWarning() {
        if(root) return null;
        if(script) {
            if(type === "confirm" && script.type === "plugin" && !(script as Plugin).enabled && !optional) {
                return "will be enabled";
            }
            return null;
        }
        if(!optional && url) {
            if(type === "confirm") return "needs to be downloaded";
            return "missing, can be downloaded";
        }
        return null;
    }

    let error = $state(getError());
    let warning = $state(getWarning());

    async function download() {
        if(!url) return;
        await downloadScript(url);

        script = scripts.get(name);
        error = getError();
        warning = getWarning();
    }
</script>

{#snippet dependency(dep: string, optional: boolean)}
    {@const [scriptName, url] = parseDep(dep)}
    <div class="flex items-start gap-2 w-full">
        <ArrowRightBottom size={24} />
        <Tree name={scriptName} {type} stack={[...stack, name]} {url} {optional} />
    </div>
{/snippet}

<div class="flex flex-col w-full">
    <div class="flex items-center gap-2 w-full">
        <div class:text-red-500={error} class:text-yellow-400={warning} class:font-bold={root}>
            <div class="flex items-center gap-2" class:opacity-60={!error && !warning && !script}>
                {name}
                {#if error}
                    <AlertCircle size={18} />
                {:else if warning}
                    <AlertTriangle size={18} />
                {/if}
            </div>
            <div class="flex items-center gap-2">
                {#if error}
                    <ArrowUp size={18} />
                    {error}
                {:else if warning}
                    <ArrowUp size={18} />
                    {warning}
                {/if}
            </div>
        </div>
        <div class="grow"></div>
        {#if root}
            <div class="font-bold text-sm w-[70px]">Installed?</div>
            <div class="font-bold text-sm w-[70px]">Required?</div>
            <div class="font-bold text-sm w-[30px]">Link</div>
        {:else}
            {#if type === "info" && !script && url}
                <button class="w-[30px]" onclick={download}>
                    <Download size={18} />
                </button>
            {/if}
            <div class="text-sm text-gray-500 w-[70px]">
                {script ? "Yes" : "No"}
            </div>
            <div class="text-sm text-gray-500 w-[70px]">
                {optional ? "No" : "Yes"}
            </div>
            <div class="w-[30px]">
                {#if url}
                    <a href={url} target="_blank">
                        <Link size={18} />
                    </a>
                {:else}
                    <LinkOff size={18} />
                {/if}
            </div>
        {/if}
    </div>
    {#if script}
        {#each Object.values(script.getDependencyStrings()) as deps}
            {#each deps.required as dep}
                {@render dependency(dep, false)}
            {/each}
            {#each deps.optional as dep}
                {@render dependency(dep, true)}
            {/each}
        {/each}
    {/if}
</div>
