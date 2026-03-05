import type { DeleteResult, ScriptArrange, ScriptDelete, ScriptEdit, ScriptTryDelete, ScriptType } from "$types/net/messages";
import type { State } from "$types/net/state";
import Server from "$bg/net/server";
import { saveDebounced } from "$bg/state";
import Scripts from "$bg/scripts";
import { englishList } from "$shared/utils";

export default abstract class ScriptHandler {
    type: ScriptType;
    key: "plugins" | "libraries";

    constructor(type: ScriptType, key: "plugins" | "libraries") {
        this.type = type;
        this.key = key;
    }

    init() {
        Server.on(`${this.type}Edit`, this.onScriptEdit.bind(this));
        Server.on(`${this.type}Delete`, this.onScriptDelete.bind(this));
        Server.on(`${this.type}Arrange`, this.onScriptArrange.bind(this));
        Server.on(`${this.type}DeleteAll`, this.onScriptDeleteAll.bind(this));
        Server.onMessage(`${this.type}TryDelete`, this.onTryDelete.bind(this));
    }

    save() {
        saveDebounced(this.key);
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

        state[this.key].splice(index, 1);
        Scripts.delete(message.name);

        Server.executeAndSend("cacheInvalid", { invalid: true });
        this.save();
    }

    onScriptArrange(state: State, message: ScriptArrange) {
        const newScripts = [];
        for(const name of message.order) {
            const script = state[this.key].find((s) => s.name === name);
            newScripts.push(script);
        }
        state[this.key] = newScripts;
        this.save();
    }

    onScriptDeleteAll(state: State) {
        Scripts.clearType(this.type);
        state[this.key] = [];

        Server.executeAndSend("cacheInvalid", { invalid: true });
        this.save();
    }

    async onTryDelete(_: State, message: ScriptTryDelete, respond: (response: DeleteResult) => void) {
        const willDisable = Scripts.checkDependents(message.name);

        if(willDisable.length > 0 && !message.confirmed) {
            const names = englishList(willDisable);
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
}
