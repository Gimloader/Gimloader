<script lang="ts">
    import DotsGrid from "svelte-material-icons/DotsGrid.svelte";
    import ChevronRight from "svelte-material-icons/ChevronRight.svelte";
    import type { Snippet } from "svelte";

    interface Props {
        startDrag?: () => void;
        dragDisabled: boolean;
        loading?: boolean;
        dragAllowed?: boolean;
        error?: boolean;
        toggle?: Snippet;
        header?: Snippet;
        buttons?: Snippet;
        author?: Snippet;
        description?: Snippet;
        hasDrag?: boolean;
        deprecated?: boolean;
        overlay?: Snippet;
    }

    let {
        startDrag,
        dragDisabled,
        loading = false,
        dragAllowed = true,
        error,
        toggle,
        header,
        buttons,
        author,
        description,
        hasDrag = true,
        deprecated,
        overlay
    }: Props = $props();

    function checkDrag() {
        if(dragAllowed) startDrag?.();
    }

    let expanded = $state(false);
    let classes = $derived(
        (error ? "border-2 border-red-500" : deprecated ? "border-2 border-yellow-300" : "border border-gray-500")
            + " p-3 h-full bg-white preflight rounded-xl relative overflow-hidden origin-right transition-transform duration-150"
    );
</script>

<div class={classes}>
    {@render overlay?.()}
    <div class="flex items-center">
        {#if loading}
            <div class="absolute bottom-0 left-0 z-0 overflow-hidden w-full rounded-bl-xl rounded-br-xl h-6 animWrap">
                <div class="loadAnim w-40 bg-primary-500 h-1 z-0 mt-5"></div>
            </div>
        {/if}
        <button
            class="transition-transform"
            style={expanded ? "transform: rotate(90deg)" : ""}
            onclick={() => expanded = !expanded}
        >
            <ChevronRight width={28} height={28} />
        </button>
        {@render toggle?.()}
        <div class="grow leading-3 ml-2 min-w-0">
            {@render header?.()}
        </div>

        <div class="flex flex-row-reverse items-end">
            {@render buttons?.()}
        </div>
        {#if hasDrag}
            <div
                style:cursor={dragAllowed ? dragDisabled ? "grab" : "grabbing" : "not-allowed"}
                title={dragAllowed ? "" : "Cannot rearrange while searching"}
                class:opacity-50={!dragAllowed}
                onpointerdown={checkDrag}
            >
                <DotsGrid size={28} />
            </div>
        {/if}
    </div>
    {#if expanded}
        <div class="ml-7">
            <div class="overflow-ellipsis overflow-hidden whitespace-nowrap w-full text-base leading-5">
                {@render author?.()}
            </div>
            <div class="grow text-sm pr-7 overflow-hidden overflow-ellipsis">
                {@render description?.()}
            </div>
        </div>
    {/if}
</div>
