import Port from "$shared/net/port.svelte";
import { englishList } from "$shared/utils";
import { createConfirmToast } from "$shared/toast/create";
import { toast } from "svelte-sonner";
import StateManager from "$shared/state";

export default class UpdateNotifier {
    static init() {
        this.updateToast(StateManager.updates.available.value);
        StateManager.updates.on("available", this.updateToast.bind(this));
    }

    static toastId: string | null = null;
    static updateToast(availableUpdates: string[]) {
        if(this.toastId) {
            toast.dismiss(this.toastId);
            this.toastId = null;
        }

        if(availableUpdates.length === 0) return;

        const names = englishList(availableUpdates);
        const descriptor = availableUpdates.length === 1 ? "has an update" : "have updates";
        const plural = availableUpdates.length === 1 ? "it" : "them";
        const message = `${names} ${descriptor} available. Would you like to download ${plural}?`;

        this.toastId = createConfirmToast(message, (apply) => {
            Port.sendAndRecieve("applyUpdates", { apply });
        });
    }
}
