import Api from "./api/api";
import Net from "$core/net/net";
import UI from "$core/ui/ui";
import GimkitInternals from "$core/internals";
import { log } from "$shared/utils";
import Port from "$shared/net/port.svelte";
import { version } from "../../package.json";
import { disableConsoleWarning, fixRDT } from "$content/core/qol";
import StateManager from "$core/state";
import setupModals from "./core/ui/setupModals";
import { toast } from "svelte-sonner";
import { createToaster } from "$shared/toast/create";
import { domLoaded } from "./utils";

Object.defineProperty(window, "GL", {
    value: Api,
    writable: false,
    configurable: false
});

disableConsoleWarning();
UI.init();
Net.init();
GimkitInternals.init();
StateManager.init();
setupModals();
domLoaded.then(createToaster);

Port.on("toast", (msg) => {
    if(msg.type === "success") toast.success(msg.message);
    else if(msg.type === "error") toast.error(msg.message);
    else if(msg.type === "warning") toast.warning(msg.message);
    else toast(msg.message);
});

Port.init((state) => {
    StateManager.initState(state);
}, (state) => {
    log("Resynchronizing with state", state);
    StateManager.syncWithState(state);
}, "game");

fixRDT();

log(`Gimloader v${version} loaded`);
