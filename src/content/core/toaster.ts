import ConfirmToast from "$content/ui/ConfirmToast.svelte";
import { domLoaded } from "$content/utils";
import Port from "$shared/net/port.svelte";
import { mount } from "svelte";
import toast, { Toaster } from "svelte-5-french-toast";

export const toasterReady = new Promise<void>(async (res) => {
    await domLoaded;

    mount(Toaster, {
        target: document.body,
        props: { position: "bottom-right", toastOptions: { duration: 5000 } }
    });

    res();
});

Port.on("toast", (msg) => {
    if(msg.type === "success") toast.success(msg.message);
    else if(msg.type === "error") toast.error(msg.message);
    else toast(msg.message);
});

export function confirmToast(text: string, onconfirmed: (confirmed: boolean) => void) {
    // @ts-ignore
    return toast(ConfirmToast, {
        duration: Infinity,
        props: {
            text,
            onconfirmed
        }
    });
}