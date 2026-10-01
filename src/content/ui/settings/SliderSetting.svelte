<script lang="ts">
    import type { SliderSetting } from "$types/api/settings";
    import { Portal } from "bits-ui";
    import { onMount, tick } from "svelte";

    let { value = $bindable(), setting }: { value: number; setting: SliderSetting<string> } = $props();
    const ticks = $derived(setting.ticks ?? [setting.min, setting.max]);
    let thumbLeft = $derived((value - setting.min) / (setting.max - setting.min) * 100);

    let dragging = $state(false);
    let hovered = $state(false);
    let thumbX = $state(0);
    let thumbY = $state(0);

    let thumb: HTMLElement;
    let track: HTMLElement;
    let trackRect: DOMRect;

    function onHover() {
        hovered = true;
        calculateThumb();
    }

    function calculateThumb() {
        const rect = thumb.getBoundingClientRect();
        thumbX = rect.left + rect.width / 2;
        thumbY = rect.top;
    }

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
        let clampedValue = Math.min(Math.max(newValue, setting.min), setting.max);
        if(clampedValue === value) return;

        value = clampedValue;
        tick().then(calculateThumb);
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

    const lastTick = $derived(ticks[ticks.length - 1]);
    const lastTickWidth = $derived(lastTick ? 4.4 * formatValue(lastTick).toString().length : 0);
</script>

<svelte:window onpointerup={stopDragging} onpointermove={onPointermove} onresize={calculateThumb} />

<Portal>
    <div
        class="absolute -translate-x-1/2 bg-accent rounded-md px-2 py-1 select-none value z-999999"
        style:left="{thumbX}px"
        style:top="{thumbY - 35}px"
    >
        {formatValue(roundValue(value))}
    </div>
</Portal>

<!-- I wasn't able to find any slider components that did what I wanted -->
<div
    class="w-62.5 relative h-1 bg-gray-300 rounded-full mt-3 mr-1 mb-10 font-mono"
    class:dragging={dragging}
    bind:this={track}
    style:margin-right="{lastTickWidth + 8}px;"
>
    <div
        class="absolute top-1/2 -translate-1/2 size-5 rounded-full bg-primary-400 hover:bg-primary-500 z-20 cursor-ew-resize thumb"
        style:left="{thumbLeft}%"
        onpointerdown={startDragging}
        onpointerover={onHover}
        onpointerout={() => hovered = false}
        bind:this={thumb}
    >
    </div>
    {#each ticks as tick}
        {@const left = ((tick - setting.min) / (setting.max - setting.min)) * 100}
        <div style:left="{left}%" class="absolute top-0 w-0.5 h-4 bg-gray-300 z-10 -translate-x-1/2"></div>
        <div style:left="{left}%" class="absolute -translate-x-1/2 text-center top-5 select-none">
            {formatValue(tick)}
        </div>
    {/each}
</div>
