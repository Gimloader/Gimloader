<script lang="ts">
    import type { TextSetting } from "$types/settings";

    let { value = $bindable(), setting }: { value: string; setting: TextSetting<string> } = $props();
</script>

<input
    type="text"
    bind:value
    maxlength={setting.maxLength}
    placeholder={setting.placeholder}
    class="border-gray-600 rounded-sm border-2 py-1 px-2 w-[200px]"
/>
