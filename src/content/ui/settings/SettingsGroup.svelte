<script lang="ts">
    import Modals from "$core/modals.svelte";
    import type { SettingGroup, ToggleSettingGroup } from "$types/api/settings";
    import PopOut from "@lucide/svelte/icons/square-arrow-out-up-right";
    import type { Snippet } from "svelte";

    interface Props {
        pluginName: string;
        group: SettingGroup | ToggleSettingGroup<string>;
        children?: Snippet;
    }

    let { pluginName, group, children }: Props = $props();

    function showGroup() {
        Modals.open("pluginSettings", {
            pluginName,
            settingsDescription: group.settings,
            inGroup: group.title
        });
    }
</script>

<div class="flex">
    <div class="grow">
        <button class="text-lg flex items-center font-semibold gap-2" onclick={showGroup}>
            {group.title}
            <PopOut />
        </button>
        {group.description}
    </div>
    {@render children?.()}
</div>
