<script lang="ts">
    import PluginManager from "$core/scripts/pluginManager.svelte";
    import ScriptFolder from "../components/scripts/ScriptFolder.svelte";
    import Check from "@lucide/svelte/icons/check";
    import X from "@lucide/svelte/icons/x";

    interface Props {
        id: string;
        startDrag: () => void;
        dragDisabled: boolean;
        dragAllowed: boolean;
    }

    let { id, startDrag, dragDisabled, dragAllowed }: Props = $props();

    function setAll(enabled: boolean) {
        const name = PluginManager.layout[id].name;
        if(!confirm(`Are you sure you want to ${enabled ? "enable" : "disable"} all plugins in ${name}?`)) return;
        PluginManager.setAllConfirm(enabled, id);
    }
</script>

<ScriptFolder {id} {startDrag} {dragDisabled} {dragAllowed} manager={PluginManager}>
    {#snippet toggle()}
        <div class="border-gray-700 border rounded-md flex overflow-hidden shrink-0">
            <button class="p-1 hover:bg-gray-300 border-r border-gray-700" onclick={() => setAll(true)}>
                <Check size={14} />
            </button>
            <button class="p-1 hover:bg-gray-300" onclick={() => setAll(false)}>
                <X size={14} />
            </button>
        </div>
    {/snippet}
</ScriptFolder>