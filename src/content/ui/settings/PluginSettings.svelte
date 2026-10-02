<script lang="ts">
    import type { PluginSettingsDescription } from "$types/api/settings";
    import * as Dialog from "$shared/ui/dialog";
    import Setting from "./Setting.svelte";
    import SettingsGroup from "./SettingsGroup.svelte";
    import ToggleSettingsGroup from "./ToggleSettingsGroup.svelte";
    import TranscludeSetting from "./TranscludeSetting.svelte";

    interface Props {
        pluginName: string;
        inGroup?: string;
        settingsDescription: PluginSettingsDescription;
        onClose: () => void;
    }

    let { pluginName, inGroup, settingsDescription, onClose }: Props = $props();
</script>

<Dialog.Root open onOpenChangeComplete={onClose}>
    <Dialog.Content class="flex flex-col gap-2 text-gray-600" style="max-width: min(760px, calc(100% - 32px))">
        <Dialog.Header class="text-2xl font-bold! border-b-2">
            Settings for {pluginName}
            {#if inGroup}
                ({inGroup})
            {/if}
        </Dialog.Header>
        <div class="min-h-0 overflow-auto">
            {#each settingsDescription as item, i}
                {#if item.type === "group"}
                    <SettingsGroup {pluginName} group={item} />
                {:else if item.type === "togglegroup"}
                    <ToggleSettingsGroup {pluginName} group={item} />
                {:else if item.type === "transclude"}
                    <TranscludeSetting setting={item} addDivider={i !== settingsDescription.length - 1} />
                {:else}
                    <Setting {pluginName} setting={item} />
                {/if}
                {#if item.type !== "transclude" && i !== settingsDescription.length - 1}
                    <hr class="bg-black mb-2 mt-1" />
                {/if}
            {/each}
        </div>
    </Dialog.Content>
</Dialog.Root>
