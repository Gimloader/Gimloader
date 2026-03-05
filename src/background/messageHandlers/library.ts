import type { LibraryInfo, State } from "$types/net/state";
import type { Messages, OnceMessages, OnceResponses } from "$types/net/messages";
import ScriptHandler from "./script";
import Scripts from "$bg/scripts";
import Server from "$bg/net/server";
import { englishList } from "$shared/utils";

export default new class LibrariesHandler extends ScriptHandler {
    constructor() {
        super("library", "libraries");
    }

    init() {
        super.init();

        Server.on("libraryCreate", this.onLibraryCreate.bind(this));
        Server.onMessage("tryDeleteAllLibraries", this.tryDeleteAllLibraries.bind(this));
    }

    async onLibraryCreate(state: State, message: Messages["libraryCreate"]) {
        await this.deleteConflicting(message.name);

        const info: LibraryInfo = {
            name: message.name,
            code: message.code
        };

        state.libraries.push(info);
        Scripts.createLibrary(info);

        Server.executeAndSend("cacheInvalid", { invalid: true });
        this.save();
    }

    async tryDeleteAllLibraries(state: State, message: OnceMessages["tryDeleteAllLibraries"], respond: (response: OnceResponses["tryDeleteAllLibraries"]) => void) {
        const willDisable = new Set<string>();

        for(const lib of state.libraries) {
            const dependents = Scripts.checkDependents(lib.name);
            for(const dep of dependents) {
                willDisable.add(dep);
            }
        }

        if(willDisable.size > 0 && !message.confirmed) {
            const names = englishList(Array.from(willDisable));
            const message = `Deleting all libraries will also disable ${names}. Continue?`;
            respond({ status: "confirm", message });
            return;
        }

        // Disable dependents
        for(const name of willDisable) {
            await Server.executeAndSend("pluginToggled", { name, enabled: false });
        }

        Server.executeAndSend("libraryDeleteAll", undefined);
        respond({ status: "success" });
    }
}();
