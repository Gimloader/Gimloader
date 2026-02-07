import type * as React from "react";
import { focusTrapEnabled } from "$content/stores";
import GenericModal from "$content/ui/modals/Generic.svelte";
import { mount, unmount } from "svelte";

export interface ModalButton {
    text: string;
    style?: "primary" | "danger" | "close";
    onClick?: (event: MouseEvent) => boolean | void;
}

/** @inline */
export interface ModalOptions {
    id?: string;
    title?: string;
    style?: string;
    className?: string;
    closeOnBackgroundClick?: boolean;
    buttons?: ModalButton[];
    onClosed?: () => void;
}

const openModals = new Map<string, () => void>();

export default function showModal(content: HTMLElement | React.ReactElement, options: ModalOptions = {}) {
    focusTrapEnabled.set(false);

    if(options.id) {
        const close = openModals.get(options.id);
        if(close) return close;
    }

    const close = () => {
        unmount(component);
        focusTrapEnabled.set(true);
        if(options.id) openModals.delete(options.id);
        options.onClosed?.();
    };

    const component = mount(GenericModal, {
        target: document.body,
        props: {
            content,
            options,
            onClose: close
        }
    });

    if(options.id) openModals.set(options.id, close);
    return close;
}
