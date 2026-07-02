<script lang="ts">
    import type ScriptManager from "$core/scripts/scriptManager.svelte";
    import * as Dialog from "$shared/ui/dialog";
    import { Button } from "$shared/ui/button";
    import { downloadScript } from "$core/net/download";

    interface Props {
        open: boolean;
        placeholder: string;
        manager: ScriptManager<any, any>;
    }

    let { open = $bindable(), placeholder, manager }: Props = $props();

    let url = $state("");

    function install() {
        if(!url) return;
        downloadScript(url, manager.openFolderId, manager.type);
        open = false;
    }
</script>

<Dialog.Root bind:open onOpenChangeComplete={() => url = ""}>
    <Dialog.Content class="text-gray-600 min-h-35 flex items-center justify-center px-12 w-max">
        <input {placeholder} bind:value={url} class="border-primary border-3 px-3 py-2 rounded-md w-[350px]" />
        <Button onclick={install}>Install</Button>
    </Dialog.Content>
</Dialog.Root>
