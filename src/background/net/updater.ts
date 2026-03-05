import type { ScriptHeaders } from "$types/scripts";
import type { OnceMessages, OnceResponses } from "$types/net/messages";
import type { State } from "$types/net/state";
import type { Dependency, Update } from "$types/net/downloads";
import { parseScriptHeaders } from "$shared/parseHeader";
import Server from "$bg/net/server";
import { statePromise } from "../state";
import Scripts from "$bg/scripts";
import Downloader from "./downloader";

export default class Updater {
    static updates: Update[] = [];

    static async init() {
        Server.onMessage("applyUpdates", this.applyUpdates.bind(this));
        Server.onMessage("updateAll", this.updateAll.bind(this));
        Server.onMessage("updateSingle", this.updateSingle.bind(this));

        const state = await statePromise;
        if(!state.settings.autoUpdate) return;

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
            const state = await statePromise;
            const updaters: (() => Promise<void>)[] = [];

            const checkUpdate = (headers: ScriptHeaders) => {
                return async () => {
                    try {
                        const response = await Downloader.fetchScript(headers.downloadUrl);
                        if(!this.shouldUpdate(headers, response.headers)) return;

                        this.updates.push({
                            name: headers.name,
                            code: response.text,
                            dependencies: response.dependencies
                        });
                    } catch (e) {
                        console.error("Error downloading", headers.downloadUrl, e);
                    }
                };
            };

            for(const plugin of state.plugins) {
                const headers = parseScriptHeaders(plugin.code);
                if(!headers.downloadUrl) continue;
                updaters.push(checkUpdate(headers));
            }

            for(const lib of state.libraries) {
                const headers = parseScriptHeaders(lib.code);
                if(!headers.downloadUrl) continue;
                updaters.push(checkUpdate(headers));
            }

            let finished = false;

            const advance = () => {
                const update = updaters.shift();
                if(!update) {
                    if(finished) return;
                    finished = true;

                    chrome.storage.local.set({ lastUpdateCheck: Date.now() });

                    if(broadcast) {
                        state.availableUpdates = this.updates.map(s => s.name);
                        Server.send("availableUpdates", state.availableUpdates);
                    }
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

    static async applyUpdates(state: State, apply: boolean) {
        if(apply) {
            for(const update of this.updates) {
                this.applyUpdate(update.name, update.code, update.dependencies);
            }
        }

        this.updates = [];
        state.availableUpdates = [];

        Server.send("availableUpdates", []);
    }

    static async onApplyUpdates(state: State, message: OnceMessages["applyUpdates"], respond: () => void) {
        await this.applyUpdates(state, message.apply);

        respond();
    }

    static async updateAll(state: State, _: OnceMessages["updateAll"], respond: (names: OnceResponses["updateAll"]) => void) {
        await this.checkUpdates(false);
        const names = this.updates.map(u => u.name);

        this.applyUpdates(state, true);
        respond(names);
    }

    static async updateSingle(_: State, message: OnceMessages["updateSingle"], respond: (updated: OnceResponses["updateSingle"]) => void) {
        const script = Scripts.get(message.name);

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
        await Server.trigger("editOrCreate", {
            name,
            code,
            updated: true
        });

        for(const dep of dependencies) {
            // TODO: Some kind of confirmation
            if(!dep.url || Scripts.has(dep.name)) continue;

            await Downloader.downloadDeps(dependencies);
        }
    }
}
