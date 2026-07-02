<script lang="ts">
    import { Button } from "$shared/ui/button";
    import * as Dialog from "$shared/ui/dialog";

    interface Props {
        title: string;
        placeholder?: string;
        onClose: (value: string) => void;
    }

    let { title, placeholder, onClose }: Props = $props();

    let cancelled = false;
    let value = $state("");
    let open = $state(true);

    function onOpenChange() {
        if(cancelled) onClose("");
        else onClose(value);
    }

    function onCancelClick() {
        cancelled = true;
        open = false;
    }

    function onConfirmClick() {
        open = false;
    }
</script>

<Dialog.Root bind:open onOpenChangeComplete={onOpenChange}>
    <Dialog.Content class="block" style="max-width: min(760px, calc(100% - 32px))">
        <Dialog.Header class="font-bold text-lg w-full border-b">
            {title}
        </Dialog.Header>
        <input
            {placeholder}
            bind:value
            class="
                text-2xl! not-focus:border-b-gray-400 border-b
                w-full mt-10! mb-5! px-2 py-1 text-gray-600!
            "
        />
        <Dialog.Footer>
            <Button onclick={onCancelClick}>Cancel</Button>
            <Button onclick={onConfirmClick}>Confirm</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
