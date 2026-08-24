<script lang="ts">
    import type { ColorSetting } from "$types/api/settings";
    import ColorPicker, { type RgbaColor } from "svelte-awesome-color-picker";
    import * as Popover from "$shared/ui/popover";

    let { value = $bindable(), setting }: { value: string; setting: ColorSetting<string> } = $props();

    const initialValue = rgbaStringToObject(value);
    function rgbaStringToObject(rgba: string): RgbaColor {
        let numbers = rgba.slice(5, -1).split(",").map(Number);
        return { r: numbers[0], g: numbers[1], b: numbers[2], a: numbers[3] };
    }
</script>

<Popover.Root>
    <Popover.Trigger>
        <div class="rounded-full w-8 h-8 border border-black" style:background-color={value}></div>
    </Popover.Trigger>
    <Popover.Content class="p-0 w-auto bg-transparent border-none shadow-none">
        {#if setting.rgba}
            <ColorPicker
                rgb={initialValue}
                onInput={({ rgb }) => {
                    if(rgb) value = `rgba(${rgb.r},${rgb.g},${rgb.b},${rgb.a})`;
                }}
                isDialog={false}
            />
        {:else}
            <ColorPicker bind:hex={value} isAlpha={false} isDialog={false} />
        {/if}
    </Popover.Content>
</Popover.Root>

<style>
    :global(.color-picker > div) {
        margin: 0 !important;
    }
</style>
