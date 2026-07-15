import type { ScriptHeaders } from "$types/scripts";
import type { OnceMessageProps, OnceResponder } from "$types/net/messages";
import type { Dependency, Update } from "$types/net/downloads";
import { parseScriptHeaders } from "$shared/parseHeader";
import Server from "$bg/net/server";
import Downloader from "./downloader";
import StateManager from "$shared/state";

export default class Updater {
    static updates: Update[] = [];

    static async init() {
        Server.onMessage("applyUpdates", this.onApplyUpdates.bind(this));
        Server.onMessage("updateAll", this.updateAll.bind(this));
        Server.onMessage("updateSingle", this.updateSingle.bind(this));

        if(!StateManager.settings.settings.value.autoUpdate) return;

        const stored = await chrome.storage.local.get({
            lastUpdateCheck: 0
        });

        const diff = Date.now() - stored.lastUpdateCheck;

        // check for updates once every hour
        if(diff < 60 * 60 * 1000) return;

        this.checkUpdates();
    }

    static async checkUpdates(broadcast = true) {
        return new Promise<void>(async (res) => {
            const updaters: (() => Promise<void>)[] = [];

            const checkUpdate = (headers: ScriptHeaders, downloadUrl: string) => {
                return async () => {
                    try {
                        const response = await Downloader.fetchScript(downloadUrl);
                        if(!this.shouldUpdate(headers, response.headers)) return;

                        this.updates.push({
                            name: headers.name,
                            code: response.text,
                            dependencies: response.dependencies
                        });
                    } catch (e) {
                        console.error("Error downloading", downloadUrl, e);
                    }
                };
            };

            for(const plugin of StateManager.plugin.scripts.value) {
                const headers = parseScriptHeaders(plugin.code);
                if(!headers.downloadUrl) continue;
                updaters.push(checkUpdate(headers, headers.downloadUrl));
            }

            for(const lib of StateManager.library.scripts.value) {
                const headers = parseScriptHeaders(lib.code);
                if(!headers.downloadUrl) continue;
                updaters.push(checkUpdate(headers, headers.downloadUrl));
            }

            let finished = false;

            const advance = () => {
                const update = updaters.shift();
                if(!update) {
                    if(finished) return;
                    finished = true;

                    chrome.storage.local.set({ lastUpdateCheck: Date.now() });
                    if(broadcast) StateManager.apply("availableUpdates", { updates: this.updates.map(u => u.name) });

                    res();
                    return;
                }

                update().finally(advance);
            };

            const maxConcurrent = 5;
            for(let i = 0; i < Math.min(maxConcurrent, updaters.length); i++) {
                advance();
            }
        });
    }

    static shouldUpdate(oldHeaders: ScriptHeaders, newHeaders: ScriptHeaders) {
        if(!oldHeaders.version) return true;
        if(!newHeaders.version) return false;

        const oldParts = oldHeaders.version.split(".").map((n) => parseInt(n, 10));
        const newParts = newHeaders.version.split(".").map((n) => parseInt(n, 10));

        for(let i = 0; i < newParts.length; i++) {
            const oldPart = oldParts[i];
            const newPart = newParts[i];

            if(newPart > oldPart) return true;
            if(newPart < oldPart) return false;
        }

        if(newParts.length > oldParts.length) return true;
        return false;
    }

    static async applyUpdates(apply: boolean) {
        if(apply) {
            for(const update of this.updates) {
                this.applyUpdate(update.name, update.code, update.dependencies);
            }
        }

        this.updates = [];

        StateManager.apply("availableUpdates", { updates: [] });
    }

    static async onApplyUpdates(message: OnceMessageProps<"applyUpdates">, respond: OnceResponder<"applyUpdates">) {
        await this.applyUpdates(message.apply);

        respond();
    }

    static async updateAll(_: OnceMessageProps<"updateAll">, respond: OnceResponder<"updateAll">) {
        await this.checkUpdates(false);
        const names = this.updates.map(u => u.name);

        this.applyUpdates(true);
        respond(names);
    }

    static async updateSingle(message: OnceMessageProps<"updateSingle">, respond: OnceResponder<"updateSingle">) {
        const script = StateManager.allScripts.get(message.name);
        if(!script) return respond({ updated: false, failed: true });

        const headers = parseScriptHeaders(script.info.code);
        if(!headers.downloadUrl) return respond({ updated: false });

        try {
            const result = await Downloader.fetchScript(headers.downloadUrl);
            if(!this.shouldUpdate(headers, result.headers)) return respond({ updated: false });

            await this.applyUpdate(message.name, result.text, result.dependencies);

            respond({ updated: true, version: result.headers.version });
        } catch {
            respond({ updated: false, failed: true });
        }
    }

    static async applyUpdate(name: string, code: string, dependencies: Dependency[]) {
        StateManager.allScripts.editOrCreate(code, name, undefined, true);

        for(const dep of dependencies) {
            // TODO: Some kind of confirmation
            if(!dep.url || StateManager.allScripts.exists(dep.name)) continue;

            await Downloader.downloadDeps(dependencies);
        }
    }
}
