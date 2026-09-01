<script lang="ts">
    import Button from "$shared/ui/button/button.svelte";
    import * as Dialog from "$shared/ui/dialog";

    interface Props {
        title: string;
        text?: string;
        onClose: () => void;
    }

    let { title, text, onClose }: Props = $props();

    let open = $state(true);
    function onOpenChange() {
        onClose();
    }

    function onOkClick() {
        open = false;
    }
</script>

<Dialog.Root bind:open onOpenChangeComplete={onOpenChange}>
    <Dialog.Content class="block" style="max-width: min(720px, calc(100% - 32px))">
        <Dialog.Header class="font-bold text-lg w-full border-b">
            {title}
        </Dialog.Header>
        {text}
        <Dialog.Footer>
            <Button onclick={onOkClick}>OK</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
