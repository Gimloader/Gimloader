<script lang="ts">
    import type { ModalButton, ModalOptions } from "$core/ui/modal";
    import type { ReactElement } from "react";
    import * as Dialog from "$shared/ui/dialog";
    import UI from "$core/ui/ui";
    import { Button } from "$shared/ui/button";
    import type { Action } from "svelte/action";

    interface Props {
        content: HTMLElement | ReactElement;
        options: ModalOptions;
        onClose: () => void;
    }

    let { content, options, onClose }: Props = $props();

    const mountContent: Action = (node) => {
        if(content instanceof HTMLElement) {
            node.appendChild(content);
        } else {
            UI.ReactDOM.createRoot(node).render(content);
        }
    };

    function onButtonClick(e: MouseEvent, button: ModalButton) {
        button.onClick?.(e);
        onClose();
    }
</script>

<Dialog.Root open={true} onOpenChangeComplete={onClose}>
    <Dialog.Content
        class="w-auto h-auto flex flex-col {options.className}"
        style={options.style}
        preflight={false}
        interactOutsideBehavior={options.closeOnBackgroundClick === false ? "ignore" : "close"}
    >
        {#if options.title}
            <Dialog.Header class="text-2xl font-bold!">{options.title}</Dialog.Header>
        {/if}
        <div class="grow" use:mountContent></div>
        <Dialog.Footer class="preflight">
            {#each options.buttons ?? [] as button}
                <Button
                    variant={button.style === "close"
                    ? "secondary"
                    : button.style === "danger"
                    ? "destructive"
                    : "default"}
                    onclick={(e: MouseEvent) => onButtonClick(e, button)}
                >
                    {button.text}
                </Button>
            {/each}
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
