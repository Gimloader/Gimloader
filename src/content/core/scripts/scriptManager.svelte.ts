import type { Script } from "./script.svelte";
import type { ScriptHeaders } from "$types/scripts";
import type { LayoutItem, ScriptInfo, ScriptLayout } from "$types/net/state";
import Port from "$shared/net/port.svelte";
import { parseScriptHeaders } from "$shared/parseHeader";
import { toast } from "svelte-sonner";
import { folderLocations, getItemFolder, scripts } from "./map";
import Commands from "../commands.svelte";
import type { CommandContext } from "$types/api/commands";
import { addUpdated } from "$content/ui/modals/Changelog.svelte";
import Modals from "$core/modals.svelte";
import { amountWithS, downloadJson } from "$shared/utils";
import type { FolderExport } from "$types/net/messages";
import { readUserFile } from "$content/utils";

export default abstract class ScriptManager<I extends ScriptInfo = any, T extends Script<I> = any> {
    abstract singular: string;
    abstract plural: string;
    scripts: T[] = $state([]);
    layout: ScriptLayout = $state({ root: { contents: [] } });
    openFolderId = $state("root");
    currentFolder = $derived(this.layout[this.openFolderId]);
    type: T["type"];
    ScriptClass: new(info: I, headers?: ScriptHeaders) => T;

    constructor(script: new(info: I, headers?: ScriptHeaders) => T, type: T["type"]) {
        this.ScriptClass = script;
        this.type = type;

        Port.on(`${type}Edit`, ({ name, code, updated }) => this.onEdit(name, code, updated));
        Port.on(`${type}Delete`, ({ name }) => this.onDelete(name));
        Port.on(`${type}DeleteAll`, () => this.onDeleteAll());
        Port.on(`${type}Arrange`, ({ folder, order }) => this.onArrange(folder, order));
        Port.on(`${type}FolderCreate`, ({ parent, name, id }) => this.onCreateFolder(parent, name, id));
        Port.on(`${type}FolderDelete`, ({ id }) => this.onFolderDelete(id));
        Port.on(`${type}FolderEdit`, ({ id, newName }) => this.onEditFolder(id, newName));
    }

    init(info: I[], layout: ScriptLayout) {
        for(const item of info) {
            const script = new this.ScriptClass(item);
            this.scripts.push(script);
            scripts.set(script.headers.name, script);
        }

        // Set the folders that scripts are in
        for(const folderId in layout) {
            for(const item of layout[folderId].contents) {
                if(item.type === "folder") continue;
                folderLocations.set(item.id, folderId);
            }
        }

        this.layout = layout;

        const savedFolder = localStorage.getItem(`gl-${this.type}Folder`);
        if(savedFolder && this.layout[savedFolder]) this.openFolderId = savedFolder;

        this.addCommands();
    }

    updateState(scriptInfo: I[], layout: ScriptLayout) {
        // Update the folders that things are in
        for(const folderId in layout) {
            for(const item of layout[folderId].contents) {
                folderLocations.set(item.id, folderId);
            }
        }

        // check if any scripts were added
        for(const info of scriptInfo) {
            if(!this.getScript(info.name)) {
                this.onCreate(info, getItemFolder(info.name));
            }
        }

        // check if any scripts were removed
        for(const script of this.scripts) {
            if(!scriptInfo.some(i => i.name === script.headers.name)) {
                this.onDelete(script.headers.name);
            }
        }

        // check if any scripts were updated
        for(const info of scriptInfo) {
            const existing = this.getScript(info.name);
            if(existing && existing.code !== info.code) {
                this.onEdit(info.name, info.code);
            }
        }

        if(!layout[this.openFolderId]) this.openFolderId = "root";
        this.layout = layout;
    }

    getScriptNames(): string[] {
        return this.scripts.map(s => s.headers.name);
    }

    getScript(name: string): T | null {
        const script = scripts.get(name);

        if(script instanceof this.ScriptClass) return script;
        return null;
    }

    getExports(name: string): any {
        const script = this.getScript(name);
        return script?.exported;
    }

    getHeaders(name: string): ScriptHeaders | null {
        const script = this.getScript(name);
        return script?.headers ?? null;
    }

    isRunning(name: string): boolean {
        const script = this.getScript(name);
        if(!script) return false;
        return script.started;
    }

    onEdit(name: string, code: string, updated?: boolean) {
        const script = this.getScript(name);
        if(!script) return;

        // Update the name if needed
        const oldName = script.headers.name;
        const headers = parseScriptHeaders(code);
        if(oldName !== headers.name) {
            scripts.delete(oldName);
            scripts.set(headers.name, script);

            // Move the folder location if renamed
            const folder = folderLocations.get(oldName);
            if(folder) {
                folderLocations.delete(oldName);
                folderLocations.set(headers.name, folder);
            }
        }

        if(updated && headers.version && headers.changelog.length > 0) {
            addUpdated(headers.name, headers.version, headers.changelog);
        }

        script.edit(code, headers);
    }

    onDelete(name: string) {
        const index = this.scripts.findIndex(s => s.headers.name === name);
        if(index === -1) return;

        const folder = getItemFolder(name);
        const itemIndex = this.layout[folder].contents.findIndex(i => i.id === name);
        this.layout[folder].contents.splice(itemIndex, 1);

        this.scripts[index].delete();
        this.scripts.splice(index, 1);
    }

    deleteAll(shouldToast: boolean) {
        if(this.scripts.length === 0) {
            toast.error(`No ${this.plural} to delete`);
            return;
        }

        const deleted = this.scripts.length;

        this.onDeleteAll();
        Port.send(`${this.type}DeleteAll`, undefined);
        if(shouldToast) toast.success(`Deleted ${deleted} ${deleted === 1 ? this.singular : this.plural}`);
    }

    onDeleteAll() {
        for(const script of this.scripts) {
            script.delete();
        }

        this.scripts = [];
        this.layout = { root: { contents: [] } };
    }

    onCreate(info: I, folder: string) {
        const headers = parseScriptHeaders(info.code);
        const script = new this.ScriptClass(info, headers);

        this.scripts.push(script);
        this.layout[folder].contents.push({
            type: "script",
            id: info.name
        });

        scripts.set(script.headers.name, script);
        folderLocations.set(script.headers.name, folder);

        return script;
    }

    deleteConflicting(name: string) {
        if(!this.getScript(name)) return;

        this.onDelete(name);
        Port.send(`${this.type}Delete`, { name });

        toast.warning(`Overwrote ${this.singular} ${name}`);
    }

    async selectScript(context: CommandContext, title: string, filter?: (script: T) => boolean): Promise<T | null> {
        const scripts = filter ? this.scripts.filter(filter) : this.scripts;

        const name = await context.select({
            title,
            options: scripts.map(s => ({ label: s.headers.name, value: s.headers.name }))
        });

        return this.getScript(name);
    }

    addCommands() {
        // Add a command for deleting a script
        Commands.addCommand(null, {
            text: `Delete ${this.singular}`,
            keywords: ["remove", "uninstall"],
            hidden: () => this.scripts.length === 0
        }, async (context) => {
            const script = await this.selectScript(context, `Select ${this.singular} to delete`);
            script?.deleteConfirm();
        });
    }

    getFolderName(id: string) {
        return this.layout[id]?.name ?? this.plural;
    }

    getItemName(item: LayoutItem) {
        if(item.type === "folder") return this.getFolderName(item.id);
        return item.id;
    }

    arrange(folder: string, order: string[]) {
        this.onArrange(folder, order);
        Port.send(`${this.type}Arrange`, { folder, order });
    }

    onArrange(folder: string, order: string[]) {
        const folderValue = this.layout[folder];
        if(!folderValue) return;

        const newContents: LayoutItem[] = [];
        for(const id of order) {
            const script = folderValue.contents.find((i) => i.id === id);
            if(script) newContents.push(script);
        }

        folderValue.contents = newContents;
    }

    viewFolder(id: string) {
        this.openFolderId = id;
        localStorage.setItem(`gl-${this.type}Folder`, id);
    }

    createFolder(parent: string, name: string) {
        const id = crypto.randomUUID();
        this.onCreateFolder(parent, name, id);
        Port.send(`${this.type}FolderCreate`, { parent, name, id });
    }

    onCreateFolder(parent: string, name: string, id: string) {
        this.layout[id] = {
            parent,
            name,
            contents: []
        };

        this.layout[parent].contents.push({
            type: "folder",
            id
        });
    }

    async folderTryDelete(id: string, confirmed = false) {
        const response = await Port.sendAndRecieve(`${this.type}FolderTryDelete`, { id, confirmed });

        if(response.status === "confirm") {
            const title = `Plugins depend on ${this.plural} in this folder`;
            const confirmed = await Modals.open("confirm", {
                text: response.message,
                title
            });
            if(!confirmed) return;

            this.folderTryDelete(id, true);
        }
    }

    onFolderDelete(id: string) {
        const parent = this.layout[id].parent;
        if(!parent) return;

        const contents = this.layout[parent].contents;
        const index = contents.findIndex((s) => s.id === id);
        contents.splice(index, 1);

        this.deleteFolderContents(id);
    }

    deleteFolderContents(id: string) {
        for(const item of this.layout[id].contents) {
            if(item.type === "script") {
                const index = this.scripts.findIndex((s) => s.headers.name === item.id);
                this.scripts[index].delete();
                this.scripts.splice(index, 1);
            } else {
                this.onFolderDelete(item.id);
            }
        }

        delete this.layout[id];
    }

    editFolder(id: string, newName: string) {
        this.onEditFolder(id, newName);
        Port.send("pluginFolderEdit", { id, newName });
    }

    onEditFolder(id: string, newName: string) {
        this.layout[id].name = newName;
    }

    moveItem(item: LayoutItem, folder: string) {
        this.onMoveItem(item, folder);
        Port.send(`${this.type}ItemMove`, { item, folder });
        toast.success(`Moved ${this.getItemName(item)} into ${this.getFolderName(folder)}`);
    }

    onMoveItem(item: LayoutItem, folder: string) {
        const parentId = item.type === "folder" ? this.layout[item.id]?.parent : getItemFolder(item.id);
        if(!parentId) return;

        const parent = this.layout[parentId];
        if(!parent) return;

        const index = parent.contents.findIndex((i) => i.id === item.id);
        parent.contents.splice(index, 1);
        this.layout[folder]?.contents?.push(item);

        if(item.type === "script") folderLocations.set(item.id, folder);
        else this.layout[item.id].parent = folder;
    }

    exportFolder(id: string) {
        const exportedLayout: ScriptLayout = {};
        const scripts: I[] = [];

        const addFolder = (folderId: string) => {
            exportedLayout[folderId] = this.layout[folderId];

            for(const item of this.layout[folderId].contents) {
                if(item.type === "folder") {
                    addFolder(item.id);
                } else {
                    const script = this.getScript(item.id);
                    if(script) scripts.push(script.getInfo());
                }
            }
        };

        addFolder(id);

        const exported: FolderExport = {
            layout: exportedLayout,
            entryId: id,
            type: this.type,
            scripts
        };

        downloadJson(exported, `${this.getFolderName(id)}.json`);
    }

    importFolder() {
        readUserFile(".json", async (contents) => {
            try {
                const json: FolderExport = JSON.parse(contents);

                if(json.type !== this.type) {
                    toast.error(`That folder import isn't for ${this.plural}!`);
                    return;
                }

                const { scripts, folders } = await Port.sendAndRecieve(`${this.type}FolderImport`, {
                    folder: this.openFolderId,
                    exported: json
                });

                toast.success(`Imported a folder containing ${amountWithS(scripts, "script")} and ${amountWithS(folders, "folder")}`);
            } catch (e) {
                console.error(e);
                toast.error("That folder appears to be invalid!");
            }
        });
    }
}
