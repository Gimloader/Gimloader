<script lang="ts">
    import type { DropdownSetting } from "$types/api/settings";
    import * as Select from "$shared/ui/select";
    import Eraser from "svelte-material-icons/Eraser.svelte";

    interface Props {
        value: string | undefined;
        setting: DropdownSetting<string>;
    }

    let { value = $bindable(), setting }: Props = $props();
</script>

<div class="flex items-center gap-2">
    {#if setting.allowNone}
        <button onclick={() => value = undefined}>
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
