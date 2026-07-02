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

export default abstract class ScriptManager<T extends Script = any, I extends ScriptInfo = any> {
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
    }

    init(info: I[], layout: ScriptLayout) {
        for(const item of info) {
            const script = new this.ScriptClass(item);
            this.scripts.push(script);
            scripts.set(script.headers.name, script);
        }

        // Set the folders that items are in
        for(const folderId in layout) {
            for(const item of layout[folderId].contents) {
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
        folderLocations.clear();
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
        }

        if(updated && headers.version && headers.changelog.length > 0) {
            addUpdated(headers.name, headers.version, headers.changelog);
        }

        script.edit(code, headers);
    }

    onDelete(name: string) {
        const index = this.scripts.findIndex(s => s.headers.name === name);
        if(index === -1) return;

        this.scripts[index].delete();
        this.scripts.splice(index, 1);

        const folder = getItemFolder(name);
        const itemIndex = this.layout[folder].contents.findIndex(i => i.id === name);
        this.layout[folder].contents.splice(itemIndex, 1);

        scripts.delete(name);
        folderLocations.delete(name);
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
            scripts.delete(script.headers.name);
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

        return script;
    }

    deleteConflicting(name: string) {
        const index = this.scripts.findIndex(s => s.headers.name === name);
        if(index === -1) return;

        this.scripts.splice(index, 1);
        scripts.delete(name);
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
}
