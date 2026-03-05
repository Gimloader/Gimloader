import { toast } from "svelte-sonner";
import Port from "$shared/net/port.svelte";
import type { UpdateResponse } from "$types/net/downloads";
import type { Script } from "../scripts/script.svelte";

export async function checkUpdate(script: Script) {
    const updated = await Port.sendAndRecieve("updateSingle", {
        name: script.headers.name
    });

    onUpdated(script.headers.name, updated);
}

function onUpdated(name: string, updated: UpdateResponse) {
    if(updated.updated) {
        if(updated.version) toast.success(`Updated ${name} to v${updated.version}`);
        else toast.success(`Updated ${name} to the latest version`);
    } else {
        if(updated.failed) {
            toast.error(`Failed to fetch the update for ${name}`);
        } else {
            toast.success(`${name} is already up to date`);
        }
    }
}
