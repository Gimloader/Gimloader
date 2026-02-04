<script lang="ts">
    import type { DropdownSetting } from "$types/settings";
    import * as Select from "$shared/ui/select";
    import Eraser from "svelte-material-icons/Eraser.svelte";

    let { value = $bindable(), setting }: { value: string; setting: DropdownSetting<string> } = $props();
</script>

<div class="flex items-center gap-2">
    {#if setting.allowNone}
        <button onclick={() => value = null}>
            <Eraser size={24} />
        </button>
    {/if}
    <Select.Root type="single" bind:value>
        <Select.Trigger>
            {setting.options.find(option => option.value === value)?.label || "Select..."}
        </Select.Trigger>
        <Select.Content>
            {#each setting.options as option}
                <Select.Item value={option.value}>
                    {option.label}
                </Select.Item>
            {/each}
        </Select.Content>
    </Select.Root>
</div>
