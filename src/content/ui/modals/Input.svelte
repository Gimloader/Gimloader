<script lang="ts">
    import type { ModalProps } from "$core/modals.svelte";
    import { Button } from "$shared/ui/button";
    import * as Dialog from "$shared/ui/dialog";
    import type { Action } from "svelte/action";

    let { title, placeholder, defaultVal = "", otherButtons = [], onClose }: ModalProps<"input"> = $props();

    let cancelled = false;
    let value = $state(defaultVal);
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

    function onkeydown(e: KeyboardEvent) {
        if(e.key === "Enter") {
            open = false;
            e.preventDefault();
        }
    }

    const focusAction: Action = (input) => {
        if(!defaultVal || !(input instanceof HTMLInputElement)) return;
        input.focus();
        input.select();
    };
</script>

<Dialog.Root bind:open onOpenChangeComplete={onOpenChange}>
    <Dialog.Content class="block" style="max-width: min(600px, calc(100% - 32px))">
        <Dialog.Header class="font-bold text-lg w-full border-b">
            {title}
        </Dialog.Header>
        <input
            {placeholder}
            {onkeydown}
            bind:value
            use:focusAction
            class="
                border-primary border-3 rounded-md
                w-full mt-10! mb-5! px-3 py-2 text-gray-600!
            "
        />
        <Dialog.Footer>
            {#each otherButtons as button}
                <Button
                    onclick={() => {
                        open = false;
                        cancelled = true;
                        button.onClick();
                    }}
                >
                    {button.text}
                </Button>
            {/each}
            <Button onclick={onCancelClick}>Cancel</Button>
            <Button onclick={onConfirmClick}>Confirm</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
