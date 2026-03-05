<script lang="ts">
    import type { PluginInfo } from "$types/net/state";
    import { Switch } from "$shared/ui/switch";
    import DeleteOutline from "svelte-material-icons/DeleteOutline.svelte";
    import { createConfirmToast } from "$shared/toast/create";
    import Port from "$shared/net/port.svelte";
    import { toast } from "svelte-sonner";

    let waiting = false;
    let { plugin }: { plugin: PluginInfo } = $props();

    async function tryToggle(enabled: boolean, confirmed = false) {
        if(waiting) return;
        waiting = true;
        const response = await Port.sendAndRecieve("tryTogglePlugin", {
            name: plugin.name,
            enabled,
            confirmed
        });

        switch (response.status) {
            case "dependencyError":
            case "downloadError":
                waiting = false;
                toast.error(response.message);
                break;
            case "confirm":
                createConfirmToast(response.message, (confirmed) => {
                    waiting = false;
                    if(!confirmed) return;
                    tryToggle(enabled, true);
                });
                break;
            case "success":
                waiting = false;
                break;
        }
    }

    async function tryDelete(confirmed = false) {
        if(waiting) return;
        waiting = true;
        const response = await Port.sendAndRecieve("pluginTryDelete", {
            name: plugin.name,
            confirmed
        });

        if(response.status !== "confirm") {
            waiting = false;
            return;
        }

        createConfirmToast(response.message, (confirmed) => {
            waiting = false;
            if(!confirmed) return;
            tryDelete(true);
        });
    }
</script>

<div class="text-lg flex items-center px-1">
    <Switch bind:checked={() => plugin.enabled, (enabled) => tryToggle(enabled)} />
    <div class="pl-2 grow whitespace-nowrap overflow-ellipsis overflow-x-hidden">
        {plugin.name}
    </div>
    <button onclick={() => tryDelete()}>
        <DeleteOutline size={24} />
    </button>
</div>
