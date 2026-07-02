<script lang="ts">
    import type ScriptManager from "$core/scripts/scriptManager.svelte";
    import * as Dialog from "$shared/ui/dialog";
    import { Button } from "$shared/ui/button";
    import { downloadScript } from "$core/net/download";
    import { capitalize } from "$shared/utils";

    interface Props {
        manager: ScriptManager;
        onClose: () => void;
    }

    let { manager, onClose }: Props = $props();
    let open = $state(true);
    let url = $state("");

    function install() {
        if(!url) return;
        downloadScript(url, manager.openFolderId, manager.type);
        open = false;
    }
</script>

<Dialog.Root bind:open onOpenChangeComplete={onClose}>
    <Dialog.Content class="block" style="max-width: min(600px, calc(100% - 32px))">
        <Dialog.Header class="font-bold text-lg w-full border-b">
            Install {manager.singular} from URL
        </Dialog.Header>
        <div>
            <input
                placeholder="{capitalize(manager.singular)} URL"
                bind:value={url}
                class="border-primary border-3 px-3 py-2 mt-10! mb-5! rounded-md w-full text-gray-600!"
            />
        </div>
        <Dialog.Footer>
            <Button onclick={install}>Install</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
