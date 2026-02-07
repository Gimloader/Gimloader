<script lang="ts">
    import type { SliderSetting } from "$types/settings";

    let { value = $bindable(), setting }: { value: number; setting: SliderSetting<string> } = $props();
    const ticks = $derived(setting.ticks ?? [setting.min, setting.max]);
    let thumbLeft = $derived((value - setting.min) / (setting.max - setting.min) * 100);

    let dragging = $state(false);
    let track: HTMLElement;
    let trackRect: DOMRect;
    function startDragging() {
        dragging = true;
        document.body.style.cursor = "ew-resize";
        document.body.style.userSelect = "none";
        trackRect = track.getBoundingClientRect();
    }

    function stopDragging() {
        if(!dragging) return;

        dragging = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
    }

    function onPointermove(e: PointerEvent) {
        if(!dragging || !trackRect) return;
        const percent = Math.min(Math.max((e.clientX - trackRect.left) / trackRect.width, 0), 1);
        const step = setting.step ?? 1;

        let newValue = setting.min + percent * (setting.max - setting.min);
        newValue = Math.round(newValue / step) * step;

        // Clamp, just in case
        value = Math.min(Math.max(newValue, setting.min), setting.max);
    }

    function roundValue(val: number) {
        // Clamp at three decimal places because of floating point issues
        const string = val.toString();
        const decimal = string.indexOf(".");
        if(decimal === -1) return val;

        return Number(string.slice(0, decimal + 4));
    }

    function formatValue(val: number) {
        if(setting.formatter) return setting.formatter(val);
        return val;
    }

    const margin = $derived(4.4 * formatValue(ticks.at(-1)).toString().length + 8);
</script>

<svelte:window onpointerup={stopDragging} onpointermove={onPointermove} />

<!-- I wasn't able to find any slider components that did what I wanted -->
<div
    class="w-[250px] relative h-1 bg-gray-300 rounded-full mt-3 mr-1 mb-10 font-mono"
    class:dragging={dragging}
    bind:this={track}
    style:margin-right="{margin}px;">
    <div
        class="absolute top-1/2 -translate-1/2 size-5 rounded-full bg-primary-400 hover:bg-primary-500 z-20 cursor-ew-resize thumb"
        style:left="{thumbLeft}%"
        onpointerdown={startDragging}>
    </div>
    <div
        class="absolute -translate-x-1/2 left-0 bottom-4 bg-accent rounded-md px-2 py-1 select-none value hidden z-30"
        style:left="{thumbLeft}%">
        {formatValue(roundValue(value))}
    </div>
    {#each ticks as tick}
        {@const left = ((tick - setting.min) / (setting.max - setting.min)) * 100}
        <div style:left="{left}%" class="absolute top-1/2 w-0.5 h-8 bg-gray-300 z-10 -translate-1/2"></div>
        <div style:left="{left}%" class="absolute -translate-x-1/2 text-center top-5 select-none">
            {formatValue(tick)}
        </div>
    {/each}
</div>

<style>
    .dragging .value, :hover + .value {
        display: block !important;
    }

    .dragging .thumb {
        background-color: var(--color-primary);
    }
</style>
