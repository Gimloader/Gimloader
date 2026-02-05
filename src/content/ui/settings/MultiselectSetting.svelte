<script lang="ts">
    import type { MultiselectSetting } from "$types/settings";
    import * as Select from "$shared/ui/select";

    let { value = $bindable(), setting }: { value: string[]; setting: MultiselectSetting<string> } = $props();
</script>

<Select.Root type="multiple" bind:value>
    <Select.Trigger>
        Select...
    </Select.Trigger>
    <Select.Content>
        {#each setting.options as option}
            <Select.Item value={option.value}>
                {option.label}
            </Select.Item>
        {/each}
    </Select.Content>
</Select.Root>
