import type { State } from "$types/net/state";
import type { Messages, OnceMessageProps, OnceResponder } from "$types/net/messages";
import ScriptHandler from "./script";
import Scripts from "$bg/scripts";
import Server from "$bg/net/server";
import { englishList } from "$shared/utils";

export default new class LibrariesHandler extends ScriptHandler<"libraries"> {
    constructor() {
        super("library", "libraries", "libraryLayout");
    }

    override init() {
        super.init();

        Server.on("libraryCreate", this.onLibraryCreate.bind(this));
        Server.onMessage("tryDeleteAllLibraries", this.onTryDeleteAllLibraries.bind(this));
    }

    async onLibraryCreate(state: State, message: Messages["libraryCreate"]) {
        await this.deleteConflicting(message.info.name);

        state.libraries.push(message.info);
        state.libraryLayout[message.folder].contents.push({
            type: "script",
            id: message.info.name
        });
        Scripts.createLibrary(message.info);

        Server.executeAndSend("cacheInvalid", { invalid: true });
        this.save();
        this.saveLayout();
    }

    async onTryDeleteAllLibraries(state: State, message: OnceMessageProps<"tryDeleteAllLibraries">, respond: OnceResponder<"tryDeleteAllLibraries">) {
        const allWillDisable = new Set<string>();
        const willDelete = new Set<string>();

        for(const lib of state.libraries) {
            Scripts.checkDependents(lib.name, allWillDisable);
            willDelete.add(lib.name);
        }

        const willDisable = allWillDisable.difference(willDelete);

        if(willDisable.size > 0 && !message.confirmed) {
            const names = englishList([...willDisable]);
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
