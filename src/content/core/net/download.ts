import type { ScriptType } from "$types/net/messages";
import { toast } from "svelte-sonner";
import Port from "$shared/net/port.svelte";
import Modals from "../modals.svelte";

export async function downloadScript(url: string, type?: ScriptType, confirmed = false) {
    const result = await Port.sendAndRecieve("downloadScript", { url, type, confirmed });

    if(result.status === "downloadError") {
        Modals.open("error", { title: "Failed to download script", text: result.message });
        return;
    }

    if(result.status === "confirm") {
        const confirmed = await Modals.open("confirm", { title: "Download Confirmation", text: result.message });
        if(!confirmed) return;

        return downloadScript(url, type, true);
    }

    toast.success(`Downloaded ${result.name}`);
}
