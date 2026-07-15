import { toast, Toaster } from "svelte-sonner";
import ConfirmToast from "./ConfirmToast.svelte";
import { mount } from "svelte";

export function createToaster() {
    mount(Toaster, {
        target: document.body,
        props: {
            richColors: true,
            class: "pointer-events-auto",
            onclick: (e) => e.stopPropagation(),
            expand: true
        }
    });
}

export function createConfirmToast(text: string, onConfirm: (confirmed: boolean) => void) {
    const id = crypto.randomUUID();

    toast(ConfirmToast, {
        duration: Number.POSITIVE_INFINITY,
        componentProps: { text, id, onConfirm },
        id,
        class: "confirm-toast-wrap preflight"
    });

    return id;
}
