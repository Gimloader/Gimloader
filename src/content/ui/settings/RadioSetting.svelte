<script lang="ts">
    import type { RadioSetting } from "$types/settings";
    import * as RadioGroup from "$shared/ui/radio-group";

    let { value = $bindable(), setting }: { value: string; setting: RadioSetting<string> } = $props();
</script>

<RadioGroup.Root bind:value class="gap-1">
    {#each setting.options as option}
        <div class="flex items-center gap-2">
            <RadioGroup.Item value={option.value} />
            {option.label}
        </div>
    {/each}
</RadioGroup.Root>
