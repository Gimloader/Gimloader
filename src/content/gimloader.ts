import Api from "./api/api";
import Net from "$core/net/net";
import UI from "$core/ui/ui";
import GimkitInternals from "$core/internals";
import { log } from "$shared/utils";
import Port from "$shared/net/port.svelte";
import { version } from "../../package.json";
import { disableConsoleWarning, fixRDT } from "$core/qol";
import setupModals from "./core/ui/setupModals";
import { toast } from "svelte-sonner";
import { createToaster } from "$shared/toast/create";
import { changelog, domLoaded } from "./utils";
import StateManager from "$shared/state";
import { addUpdated } from "./ui/modals/Changelog.svelte";
import Storage from "$core/storage.svelte";
import LibManager from "$core/scripts/libManager.svelte";
import PluginManager from "$core/scripts/pluginManager.svelte";
import Hotkeys from "$core/hotkeys/hotkeys.svelte";
import UpdateNotifier from "$core/updateNotifier.svelte";
import Rewriter from "$core/rewriter";
import Commands from "$core/commands.svelte";

Object.defineProperty(window, "GL", {
    value: Api,
    writable: false,
    configurable: false
});

disableConsoleWarning();
UI.init();
Net.init();
GimkitInternals.init();
setupModals();
domLoaded.then(createToaster);

StateManager.events.on("error", toast.error);
StateManager.events.on("init", () => {
    const lastVersion = localStorage.getItem("gl-version");
    localStorage.setItem("gl-version", version);

    const versionChanged = version !== lastVersion;
    const updated = lastVersion && versionChanged;
    if(updated) addUpdated("Gimloader", version, changelog);

    Storage.init();
    LibManager.init();
    PluginManager.init();
    Hotkeys.init();
    UpdateNotifier.init();
    Rewriter.init();
    Commands.init();

    if(updated) Rewriter.invalidate();
});

Port.on("toast", (msg) => {
    if(msg.type === "success") toast.success(msg.message);
    else if(msg.type === "error") toast.error(msg.message);
    else if(msg.type === "warning") toast.warning(msg.message);
    else toast(msg.message);
});

Port.on("setState", (state) => {
    StateManager.update(state);
    toast.success("New config applied");
});

Port.init("game");

fixRDT();

log(`Gimloader v${version} loaded`);
