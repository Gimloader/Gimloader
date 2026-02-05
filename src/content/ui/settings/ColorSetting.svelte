<script lang="ts">
    import type { ColorSetting } from "$types/settings";
    import ColorPicker, { type RgbaColor } from "svelte-awesome-color-picker";

    let { value = $bindable(), setting }: { value: string; setting: ColorSetting<string> } = $props();

    const initialValue = rgbaStringToObject(value);
    function rgbaStringToObject(rgba: string): RgbaColor {
        let numbers = rgba.slice(5, -1).split(",").map(Number);
        return { r: numbers[0], g: numbers[1], b: numbers[2], a: numbers[3] };
    }
</script>

{#if setting.rgba}
    <ColorPicker
        rgb={initialValue}
        onInput={({ rgb }) => {
            value = `rgba(${rgb.r},${rgb.g},${rgb.b},${rgb.a})`;
        }}
    />
{:else}
    <ColorPicker bind:hex={value} isAlpha={false} />
{/if}
