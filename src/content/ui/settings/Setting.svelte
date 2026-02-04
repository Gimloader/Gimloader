<script lang="ts">
    import type { PluginSetting } from "$types/settings";
    import Storage from "$core/storage.svelte";
    import { watch } from "runed";
    import DropdownSetting from "./DropdownSetting.svelte";
    import MultiselectSetting from "./MultiselectSetting.svelte";
    import NumberSetting from "./NumberSetting.svelte";
    import ToggleSetting from "./ToggleSetting.svelte";
    import TextSetting from "./TextSetting.svelte";
    import SliderSetting from "./SliderSetting.svelte";
    import RadioSetting from "./RadioSetting.svelte";
    import ColorSetting from "./ColorSetting.svelte";
    import CustomSetting from "./CustomSetting.svelte";

    let { pluginName, setting }: { pluginName: string; setting: PluginSetting<string> } = $props();

    watch(() => Storage.pluginSettings[pluginName][setting.id], () => {
        const value = Storage.pluginSettings[pluginName][setting.id];
        Storage.setPluginSetting(pluginName, setting.id, value);
    }, { lazy: true });
</script>

{#if setting.type === "customsection"}
    <div class="border-b border-gray-200">
        <CustomSetting {setting} bind:value={Storage.pluginSettings[pluginName][setting.id]} />
    </div>
{:else}
    <div class="border-b border-gray-200 flex items-start">
        <div>
            <div class="font-semibold text-lg">
                {setting.title}
            </div>
            {#if setting.description}
                <div class="text-base text-gray-500">
                    {setting.description}
                </div>
            {/if}
        </div>
        <div class="grow"></div>
        {#if setting.type === "dropdown"}
            <DropdownSetting {setting} bind:value={Storage.pluginSettings[pluginName][setting.id]} />
        {:else if setting.type === "multiselect"}
            <MultiselectSetting {setting} bind:value={Storage.pluginSettings[pluginName][setting.id]} />
        {:else if setting.type === "number"}
            <NumberSetting {setting} bind:value={Storage.pluginSettings[pluginName][setting.id]} />
        {:else if setting.type === "toggle"}
            <ToggleSetting bind:value={Storage.pluginSettings[pluginName][setting.id]} />
        {:else if setting.type === "text"}
            <TextSetting {setting} bind:value={Storage.pluginSettings[pluginName][setting.id]} />
        {:else if setting.type === "slider"}
            <SliderSetting {setting} bind:value={Storage.pluginSettings[pluginName][setting.id]} />
        {:else if setting.type === "radio"}
            <RadioSetting {setting} bind:value={Storage.pluginSettings[pluginName][setting.id]} />
        {:else if setting.type === "color"}
            <ColorSetting {setting} bind:value={Storage.pluginSettings[pluginName][setting.id]} />
        {:else if setting.type === "custom"}
            <CustomSetting {setting} bind:value={Storage.pluginSettings[pluginName][setting.id]} />
        {/if}
    </div>
{/if}
