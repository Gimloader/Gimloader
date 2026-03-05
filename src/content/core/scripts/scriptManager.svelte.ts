import type { Script } from "./script.svelte";
import type { ScriptHeaders } from "$types/scripts";
import type { ScriptInfo } from "$types/net/state";
import Port from "$shared/net/port.svelte";
import { parseScriptHeaders } from "$shared/parseHeader";
import Modals from "../modals.svelte";
import { toast } from "svelte-sonner";
import { scripts } from "./map";
import Commands from "../commands.svelte";
import type { CommandContext } from "$types/api/commands";

export default abstract class ScriptManager<T extends Script, I extends ScriptInfo> {
    abstract singular: string;
    abstract plural: string;
    scripts: T[] = $state([]);
    type: T["type"];
    ScriptClass: new(info: I, headers?: ScriptHeaders) => T;

    constructor(script: new(info: I, headers?: ScriptHeaders) => T, type: T["type"]) {
        this.ScriptClass = script;
        this.type = type;

        Port.on(`${type}Edit`, ({ name, code, updated }) => this.onEdit(name, code, updated));
        Port.on(`${type}Delete`, ({ name }) => this.onDelete(name));
        Port.on(`${type}DeleteAll`, () => this.onDeleteAll());
        Port.on(`${type}Arrange`, ({ order }) => this.onArrange(order));
    }

    init(info: I[]) {
        for(const item of info) {
            const script = new this.ScriptClass(item);
            this.scripts.push(script);
            scripts.set(script.headers.name, script);
        }

        this.addCommands();
    }

    updateState(scriptInfo: I[]) {
        // check if any scripts were added
        for(const info of scriptInfo) {
            if(!this.getScript(info.name)) {
                this.onCreate(info);
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
            if(existing.code !== info.code) {
                this.onEdit(info.name, info.code);
            }
        }

        // move the scripts into the correct order
        const newOrder = [];
        for(const info of scriptInfo) {
            const addScript = this.getScript(info.name);
            if(addScript) newOrder.push(addScript);
        }

        this.scripts = newOrder;
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

        if(updated && headers.changelog.length > 0) {
            Modals.addUpdated(headers.name, headers.version, headers.changelog);
        }

        script.edit(code, headers);
    }

    onDelete(name: string) {
        const index = this.scripts.findIndex(s => s.headers.name === name);
        if(index === -1) return;

        this.scripts[index].delete();
        this.scripts.splice(index, 1);
        scripts.delete(name);
    }

    deleteAll(shouldToast: boolean) {
        if(this.scripts.length === 0) {
            toast.error(`No ${this.plural} to delete`);
            return;
        }

        const deleted = this.scripts.length;

        this.onDeleteAll();
        Port.send(`${this.type}DeleteAll`);
        if(shouldToast) toast.success(`Deleted ${deleted} ${deleted === 1 ? this.singular : this.plural}`);
    }

    onDeleteAll() {
        for(const script of this.scripts) {
            script.delete();
            scripts.delete(script.headers.name);
        }

        this.scripts = [];
    }

    onCreate(info: I) {
        const headers = parseScriptHeaders(info.code);
        const script = new this.ScriptClass(info, headers);
        this.scripts.push(script);
        scripts.set(script.headers.name, script);

        return script;
    }

    arrange(order: string[]) {
        this.onArrange(order);
        Port.send(`${this.type}Arrange`, { order });
    }

    onArrange(order: string[]) {
        const newOrder: T[] = [];

        for(const name of order) {
            const script = this.getScript(name);
            if(script) newOrder.push(script);
        }

        this.scripts = newOrder;
    }

    deleteConflicting(name: string) {
        const index = this.scripts.findIndex(s => s.headers.name === name);
        if(index === -1) return;

        this.scripts.splice(index, 1);
        scripts.delete(name);
        Port.send(`${this.type}Delete`, { name });
        toast.warning(`Overwrote ${this.singular} ${name}`);
    }

    async selectScript(context: CommandContext, title: string, filter?: (script: T) => boolean): Promise<T> {
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
            script.deleteConfirm();
        });
    }
}
