import Server from "$bg/net/server";
import { parseScriptHeaders } from "$shared/parseHeader";
import StateManager from "$shared/state";

export default class Poller {
    static enabled = false;
    static uid = Math.random().toString(36).substring(2);

    static init(enabled: boolean) {
        this.setEnabled(enabled);

        StateManager.settings.on("pollerEnabled", (enabled) => {
            this.setEnabled(enabled);
        });
    }

    static setEnabled(enabled: boolean) {
        this.enabled = enabled;

        if(enabled) this.sendRequest();
    }

    static async sendRequest() {
        if(!this.enabled) return;

        const tryAgain = () => {
            setTimeout(() => this.sendRequest(), 5000);
        };

        const res = await fetch("http://localhost:5822/getUpdate", { headers: { uid: this.uid } })
            .catch(tryAgain);
        if(!res) return;

        if(res.status !== 200) return tryAgain();
        const code = await res.text();

        if(!this.enabled) return;
        this.sendRequest();

        // This doesn't properly handle the plugin being renamed, but there's no good way to tell
        // The difference between a plugin being renamed and the server switching which plugin its serving
        // So this works well enough for now
        const headers = parseScriptHeaders(code);
        Server.send("toast", { type: "success", message: `Hot reloaded ${headers.name}` });

        StateManager.allScripts.editOrCreate(code, headers.name);
    }
}
