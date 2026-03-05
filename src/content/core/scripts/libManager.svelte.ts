import ScriptManager from "./scriptManager.svelte";
import { Library } from "./library.svelte";
import type { LibraryInfo } from "$types/net/state";
import Port from "$shared/net/port.svelte";
import Modals from "../modals.svelte";
import { parseScriptHeaders } from "$shared/parseHeader";
import { toast } from "svelte-sonner";
import { downloadScript } from "../net/download";
import { scripts } from "./map";

export default new class LibraryManager extends ScriptManager<Library, LibraryInfo> {
    singular = "library";
    plural = "libraries";

    constructor() {
        super(Library, "library");

        Port.on("libraryCreate", (info) => this.onCreate(info));
    }

    async create(code: string) {
        const headers = parseScriptHeaders(code);
        if(headers.isLibrary === "false") {
            toast.error("Libraries must have the @isLibrary header set");
            return;
        }

        const info = { name: headers.name, code };
        this.deleteConflicting(info.name);

        const created = this.onCreate(info);
        Port.send("libraryCreate", info);

        return created;
    }

    async deleteAllConfirm(confirmed = false) {
        const response = await Port.sendAndRecieve("tryDeleteAllLibraries", { confirmed });

        if(response.status === "confirm") {
            const title = "Plugins depend on some libraries";
            const confirmed = await Modals.open("confirm", {
                text: response.message,
                title
            });
            if(!confirmed) return;

            this.deleteAllConfirm(true);
        }
    }

    async require(requirer: string, name: string, downloadUrl?: string) {
        const requirerScript = scripts.get(requirer);
        if(!requirerScript) throw new Error(`Requirer script ${requirer} not found`);

        // Try to enable the plugin if it already exists
        const existing = this.getScript(name);
        if(existing) {
            if(existing.exported) return existing.exported;

            // Require the script
            if(!requirerScript.requires.includes(existing)) requirerScript.requires.push(existing);
            await existing.require(requirerScript, true, false, [requirer]);

            return existing.exported;
        }

        if(!downloadUrl) throw new Error(`Library ${name} is required but cannot be automatically downloaded`);

        // Ask about downloading the plugin
        const confirmed = await Modals.open("confirm", {
            title: "Download Confirmation",
            text: `${requirer} is asking to install and enable the library ${name}. Do you want to proceed?`
        });

        if(!confirmed) throw new Error("User declined downloading dependency");

        // Download the plugin
        await downloadScript(downloadUrl, "library", true);
        const script = this.getScript(name);
        if(!script) throw new Error(`Failed to download dependency ${name}`);

        // Require the script
        if(!requirerScript.requires.includes(script)) requirerScript.requires.push(script);
        await script.require(requirerScript, true, false, [requirer]);

        return script.exported;
    }
}();
