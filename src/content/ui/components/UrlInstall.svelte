<script lang="ts">
    import * as Dialog from "$shared/ui/dialog";
    import { Button } from "$shared/ui/button";
    import { downloadScript } from "$content/core/net/download";
    import type { ScriptType } from "$types/net/messages";

    interface Props {
        open: boolean;
        placeholder: string;
        type: ScriptType;
    }

    let { open = $bindable(), placeholder, type }: Props = $props();

    let url = $state("");

    function install() {
        if(!url) return;
        downloadScript(url, type);
        open = false;
    }
</script>

<Dialog.Root bind:open onOpenChangeComplete={() => url = ""}>
    <Dialog.Content class="text-gray-600 min-h-35 flex items-center justify-center px-12 w-max">
        <input {placeholder} bind:value={url} class="border-primary border-3 px-3 py-2 rounded-md w-[350px]" />
        <Button onclick={install}>Install</Button>
    </Dialog.Content>
</Dialog.Root>
