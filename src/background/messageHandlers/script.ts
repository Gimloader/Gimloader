import type { DeleteResult, FolderCreate, FolderDelete, FolderEdit, FolderTryDelete, ScriptArrange, ScriptDelete, ScriptEdit, ScriptTryDelete, ScriptType } from "$types/net/messages";
import type { LayoutItem, State } from "$types/net/state";
import Server from "$bg/net/server";
import { saveDebounced } from "$bg/state";
import Scripts from "$bg/scripts";
import { englishList } from "$shared/utils";

type ScriptKey = "plugins" | "libraries";
type LayoutKey = "pluginLayout" | "libraryLayout";

export default abstract class ScriptHandler<K extends ScriptKey> {
    type: ScriptType;
    key: K;
    layoutKey: LayoutKey;

    constructor(type: ScriptType, key: K, layoutKey: LayoutKey) {
        this.type = type;
        this.key = key;
        this.layoutKey = layoutKey;
    }

    init() {
        Server.on(`${this.type}Edit`, this.onScriptEdit.bind(this));
        Server.on(`${this.type}Delete`, this.onScriptDelete.bind(this));
        Server.on(`${this.type}Arrange`, this.onScriptArrange.bind(this));
        Server.on(`${this.type}DeleteAll`, this.onScriptDeleteAll.bind(this));
        Server.on(`${this.type}FolderCreate`, this.onFolderCreate.bind(this));
        Server.on(`${this.type}FolderDelete`, this.onFolderDelete.bind(this));
        Server.on(`${this.type}FolderEdit`, this.onFolderEdit.bind(this));
        Server.onMessage(`${this.type}TryDelete`, this.onTryDelete.bind(this));
        Server.onMessage(`${this.type}FolderTryDelete`, this.onTryFolderDelete.bind(this));
    }

    save() {
        saveDebounced(this.key);
    }

    saveLayout() {
        saveDebounced(this.layoutKey);
    }

    async deleteConflicting(name: string) {
        const existing = Scripts.get(name);
        if(!existing) return;

        await Server.executeAndSend(`${existing.type}Delete`, { name });

        const message = `Overwrote ${existing.type} ${name}`;
        Server.send("toast", { type: "warning", message });
    }

    async onScriptEdit(state: State, message: ScriptEdit) {
        const index = state[this.key].findIndex((s) => s.name === message.name);
        if(index === -1) return;

        const script = state[this.key][index];
        if(script.name !== message.newName) await this.deleteConflicting(message.newName);

        script.code = message.code;
        script.name = message.newName;

        // Update scripts
        Scripts.delete(script.name);
        Scripts.createScript(this.type, script);

        Server.executeAndSend("cacheInvalid", { invalid: true });
        this.save();
    }

    onScriptDelete(state: State, message: ScriptDelete) {
        const index = state[this.key].findIndex((s) => s.name === message.name);
        if(index === -1) return;

        // Delete the script
        state[this.key].splice(index, 1);
        Scripts.delete(message.name);

        // Remove it from the layout
        const folderId = Scripts.getFolder(message.name);
        const folder = state[this.layoutKey][folderId];
        const itemIndex = folder.contents.findIndex((i) => i.id === message.name);
        folder.contents.splice(itemIndex, 1);

        Server.executeAndSend("cacheInvalid", { invalid: true });
        this.save();
        this.saveLayout();
    }

    onScriptDeleteAll(state: State) {
        Scripts.clearType(this.type);
        state[this.key] = [];
        state[this.layoutKey] = { root: { contents: [] } };

        Server.executeAndSend("cacheInvalid", { invalid: true });
        this.save();
        this.saveLayout();
    }

    async onTryDelete(_: State, message: ScriptTryDelete, respond: (response: DeleteResult) => void) {
        const willDisable = Scripts.checkDependents(message.name);

        if(willDisable.size > 0 && !message.confirmed) {
            const names = englishList([...willDisable]);
            const msg = `Deleting ${message.name} will also disable ${names}. Continue?`;
            respond({ status: "confirm", message: msg });
            return;
        }

        // Disable dependents
        for(const name of willDisable) {
            await Server.executeAndSend("pluginToggled", { name, enabled: false });
        }

        Server.executeAndSend(`${this.type}Delete`, { name: message.name });
        respond({ status: "success" });
    }

    onScriptArrange(state: State, message: ScriptArrange) {
        const folder = state[this.layoutKey][message.folder];
        if(!folder) return;

        const newContents: LayoutItem[] = [];
        for(const id of message.order) {
            const script = folder.contents.find((i) => i.id === id);
            if(script) newContents.push(script);
        }

        folder.contents = newContents;
        this.saveLayout();
    }

    getScriptsInFolder(state: State, folderId: string, scripts = new Set<string>()) {
        const folder = state[this.layoutKey][folderId];

        for(const item of folder.contents) {
            if(item.type === "folder") {
                this.getScriptsInFolder(state, item.id, scripts);
            } else {
                scripts.add(item.id);
            }
        }

        return scripts;
    }

    onFolderCreate(state: State, message: FolderCreate) {
        state[this.layoutKey][message.id] = {
            name: message.name,
            parent: message.parent,
            contents: []
        };

        state[this.layoutKey][message.parent].contents.push({
            type: "folder",
            id: message.id
        });

        this.saveLayout();
    }

    async onTryFolderDelete(state: State, message: FolderTryDelete, respond: (response: DeleteResult) => void) {
        const allWillDisable = new Set<string>();
        const inFolder = this.getScriptsInFolder(state, message.id);

        for(const script of inFolder) Scripts.checkDependents(script, allWillDisable);
        const willDisable = allWillDisable.difference(inFolder);

        // Confirm if necessary
        if(willDisable.size > 0 && !message.confirmed) {
            const names = englishList([...willDisable]);
            const folderName = state[this.layoutKey][message.id]?.name;
            const confirmMessage = `Deleting ${folderName} will also disable ${names}. Continue?`;
            respond({ status: "confirm", message: confirmMessage });
            return;
        }

        // Disable dependents
        for(const name of willDisable) {
            await Server.executeAndSend("pluginToggled", { name, enabled: false });
        }

        Server.executeAndSend(`${this.type}FolderDelete`, { id: message.id });
        respond({ status: "success" });
    }

    onFolderDelete(state: State, message: FolderDelete) {
        const parent = state[this.layoutKey][message.id]?.parent;
        if(!parent) return;

        // Remove the folder entry from its parents
        const contents = state[this.layoutKey][parent].contents;
        const index = contents.findIndex((i) => i.id === message.id);
        contents.splice(index, 1);

        this.deleteFolderContents(state, message.id);

        this.save();
        this.saveLayout();
    }

    deleteFolderContents(state: State, folder: string) {
        for(const item of state[this.layoutKey][folder].contents) {
            if(item.type === "folder") {
                this.deleteFolderContents(state, item.id);
            } else {
                // Delete the script
                const index = state[this.key].findIndex((s) => s.name === item.id);
                state[this.key].splice(index, 1);
            }
        }

        delete state[this.layoutKey][folder];
    }

    onFolderEdit(state: State, message: FolderEdit) {
        state[this.layoutKey][message.id].name = message.newName;
        this.saveLayout();
    }
}
