<script lang="ts">
    import type { Script } from "$core/scripts/script.svelte";
    import * as Dialog from "$shared/ui/dialog";
    import Tree from "./Tree.svelte";
    import { Button } from "$shared/ui/button";

    interface Props {
        script: Script | Script[];
        type: string;
        title: string;
        onClose: (confirmed: boolean) => void;
    }

    let { script, type, title, onClose }: Props = $props();

    let open = $state(true);
    let confirmed = false;

    function onOpenChange() {
        onClose(confirmed);
    }

    function onCancelClick() {
        open = false;
        confirmed = false;
    }

    function onConfirmClick() {
        open = false;
        confirmed = true;
    }
</script>

<Dialog.Root bind:open onOpenChangeComplete={onOpenChange}>
    <Dialog.Content
        class="flex flex-col items-start gap-2 text-gray-600 text-lg"
        style="max-width: min(760px, calc(100% - 32px))"
    >
        <Dialog.Header class="text-2xl font-bold! border-b-2 w-full">
            {title}
        </Dialog.Header>
        {#if Array.isArray(script)}
            {#each script as s}
                <Tree name={s.headers.name} {type} stack={[]} root={true} />
            {/each}
        {:else}
            <Tree name={script.headers.name} {type} stack={[]} root={true} />
        {/if}
        {#if type === "confirm"}
            <Dialog.Footer>
                <Button onclick={onCancelClick}>Cancel</Button>
                <Button onclick={onConfirmClick}>Confirm</Button>
            </Dialog.Footer>
        {/if}
    </Dialog.Content>
</Dialog.Root>
