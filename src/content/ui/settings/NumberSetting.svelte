<script lang="ts">
    import type { NumberSetting } from "$types/settings";

    let { value = $bindable(), setting }: { value: number; setting: NumberSetting<string> } = $props();
    let inputValue = $state(value);

    function onchange() {
        if(setting.step) inputValue = Math.round(inputValue / setting.step) * setting.step;
        if(setting.min) inputValue = Math.max(inputValue, setting.min);
        if(setting.max) inputValue = Math.min(inputValue, setting.max);
        value = inputValue;
    }
</script>

<input
    type="number"
    min={setting.min}
    max={setting.max}
    step={setting.step ?? 1}
    bind:value={inputValue}
    {onchange}
    class="border-gray-600 rounded-sm border-2 py-1 px-2 w-[100px]"
/>
