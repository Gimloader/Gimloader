<script lang="ts">
    import type { ToggleSetting } from "$types/api/settings";
    import { Switch } from "$shared/ui/switch";
    import { StateManager, type ScriptHeaders } from "@gimloader/ipc";
    import Modals from "$core/modals.svelte";

    interface Props {
        value: boolean;
        id: string;
        setting: ToggleSetting<string>;
    }

    let { value = $bindable(), id, setting }: Props = $props();

    async function setChecked(checked: boolean) {
        if(checked) tryEnableDeps();
        else value = false;
    }

    async function tryEnableDeps(confirmed = false) {
        const needsLib = setting.needsLibs ?? [];
        const needsPlugin = setting.needsPlugins ?? [];
        if(needsLib.length === 0 && needsPlugin.length === 0) {
            value = true;
            return;
        }

        const deps = StateManager.plugin.getDependencies({ needsLib, needsPlugin } as ScriptHeaders);
        const result = await StateManager.plugin.tryEnableDeps(id, deps, confirmed);

        if(result.status === "confirm") {
            const confirmed = await Modals.open("confirm", {
                title: "Setting requires dependencies",
                text: result.message
            });

            if(confirmed) tryEnableDeps(true);
        } else if(result.status === "dependencyError" || result.status === "downloadError") {
            Modals.open("error", {
                title: "Error enabling setting",
                text: result.message
            });
        } else {
            value = true;
        }
    }
</script>

<Switch bind:checked={() => value, setChecked} />
