<script lang="ts">
    import type { CustomSection, CustomSetting } from "$types/settings";
    import { onMount } from "svelte";

    let { value = $bindable(), setting }: {
        value: string[];
        setting: CustomSetting<string> | CustomSection<string>;
    } = $props();

    let node: HTMLElement;
    onMount(() => {
        const cleanup = setting.render(node, value, (newValue: any) => {
            value = newValue;
        });

        return () => {
            if(typeof cleanup === "function") cleanup();
        };
    });
</script>

<div bind:this={node}></div>
