import type { Script } from "./script.svelte";
import type { ScriptHeaders } from "$types/scripts";
import type { LayoutItem, ScriptInfo, ScriptLayout } from "$types/net/state";
import type { CommandContext } from "$types/api/commands";
import type { FolderExport, ScriptType } from "$types/net/messages";
import { parseScriptHeaders } from "$shared/parseHeader";
import { toast } from "svelte-sonner";
import Commands from "../commands.svelte";
import { addUpdated } from "$content/ui/modals/Changelog.svelte";
import Modals from "$core/modals.svelte";
import { amountWithS, downloadJson } from "$shared/utils";
import { readUserFile } from "$content/utils";
import StateManager from "$shared/state";

export default abstract class ScriptManager<I extends ScriptInfo = any, T extends Script<I> = any> {
    abstract singular: string;
    abstract plural: string;
    scripts: T[] = $state([]);
    layout: ScriptLayout = $state({ root: { contents: [] } });
    openFolderId = $state("root");
    currentFolder = $derived(this.layout[this.openFolderId]);
    type: ScriptType;
    ScriptClass: new(info: I, headers?: ScriptHeaders) => T;

    constructor(script: new(info: I, headers?: ScriptHeaders) => T, type: T["type"]) {
        this.ScriptClass = script;
        this.type = type;

        StateManager[this.type].layout.bind(() => this.layout, (layout) => this.layout = layout);

        StateManager[this.type].on("scriptDelete", this.onDelete.bind(this));
        StateManager[this.type].on("scriptEdit", this.onEdit.bind(this));
        StateManager[this.type].on("scriptCreate", this.onCreate.bind(this) as (info: unknown, initial: boolean) => void);
        StateManager[this.type].on("stateUpdate", () => {
            if(!this.layout[this.openFolderId]) this.openFolderId = "root";
        });
    }

    init() {
        const savedFolder = localStorage.getItem(`gl-${this.type}Folder`);
        if(savedFolder && this.layout[savedFolder]) this.openFolderId = savedFolder;

        this.addCommands();
    }

    getScriptNames(): string[] {
        return this.scripts.map(s => s.headers.name);
    }

    getScript(name: string): T | null {
        const script = this.scripts.find(s => s.headers.name === name);
        if(!script) return null;
        return script;
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

    onEdit(name: string, newName: string, code: string, updated?: boolean) {
        const script = this.getScript(name);
        if(!script) return;

        const headers = parseScriptHeaders(code);
        if(updated && headers.version && headers.changelog.length > 0) {
            addUpdated(newName, headers.version, headers.changelog);
        }

        script.edit(code, headers);
    }

    onDelete(name: string) {
        const index = this.scripts.findIndex(s => s.headers.name === name);
        if(index === -1) return;

        this.scripts[index].delete();
        this.scripts.splice(index, 1);
    }

    onCreate(info: I, _initial: boolean) {
        const headers = parseScriptHeaders(info.code);
        const script = new this.ScriptClass(info, headers);

        this.scripts.push(script);

        return script;
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

    viewFolder(id: string) {
        this.openFolderId = id;
        localStorage.setItem(`gl-${this.type}Folder`, id);
    }

    async folderTryDelete(id: string, confirmed = false) {
        const response = StateManager[this.type].tryDeleteFolder(id, confirmed);

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

                const { scripts, folders } = StateManager[this.type].importFolder(this.openFolderId, json);

                toast.success(`Imported a folder containing ${amountWithS(scripts, "script")} and ${amountWithS(folders, "folder")}`);
            } catch (e) {
                console.error(e);
                toast.error("That folder appears to be invalid!");
            }
        });
    }
}
