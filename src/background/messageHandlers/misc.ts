import Server from "$bg/net/server";
import { sanitizeHotkeys, sanitizeLibraries, sanitizePlugins, sanitizePluginStorage, sanitizeSettings, saveDebounced } from "$bg/state";
import Updater from "$bg/net/updater";
import type { OnceMessages, OnceResponses, ScriptType } from "$types/messages";
import type { State } from "$types/state";
import Scripts from "$bg/scripts";
import { parseScriptHeaders } from "$shared/parseHeader";
import Poller from "$bg/net/poller";

export default class MiscHandler {
    static init() {
        Server.onMessage("getState", this.onGetState.bind(this));
        Server.onMessage("setState", this.onSetState.bind(this));
        Server.onMessage("editOrCreate", this.onEditOrCreate.bind(this));
    }

    static onGetState(state: State, _: OnceMessages["getState"], respond: (response: OnceResponses["getState"]) => void) {
        respond(state);
    }

    static onSetState(state: State, newState: OnceMessages["setState"], respond: () => void) {
        const { plugins, libraries, pluginStorage, pluginSettings, settings, hotkeys } = newState;

        if(plugins) state.plugins = sanitizePlugins(plugins);
        if(libraries) state.libraries = sanitizeLibraries(libraries);
        if(pluginStorage) state.pluginStorage = sanitizePluginStorage(pluginStorage);
        if(pluginSettings) state.pluginSettings = sanitizePluginStorage(pluginSettings);
        if(settings) state.settings = sanitizeSettings(settings);
        if(hotkeys) state.hotkeys = sanitizeHotkeys(hotkeys);
        state.cacheInvalid = true;

        Server.send("setState", state);
        Poller.setEnabled(state.settings.pollerEnabled);

        saveDebounced("plugins");
        saveDebounced("pluginStorage");
        saveDebounced("libraries");
        saveDebounced("hotkeys");
        saveDebounced("settings");
        saveDebounced("cacheInvalid");

        if(state.settings.autoUpdate) Updater.checkUpdates();
        respond();
    }

    static async onEditOrCreate(_: State, message: OnceMessages["editOrCreate"], respond: () => void) {
        const headers = parseScriptHeaders(message.code);
        const type: ScriptType = headers.isLibrary !== "false" ? "library" : "plugin";

        if(message.name && Scripts.has(message.name)) {
            const old = Scripts.get(message.name);

            // Delete and recreate the script if it changed types
            if(type !== old.type) {
                await Server.executeAndSend(`${old.type}Delete`, { name: message.name });
                await this.createScript(type, headers.name, message.code);
            } else {
                await Server.executeAndSend(`${type}Edit`, {
                    name: message.name,
                    newName: headers.name,
                    code: message.code,
                    updated: message.updated
                });
            }
        } else {
            await this.createScript(type, headers.name, message.code);
        }

        await Server.executeAndSend("cacheInvalid", { invalid: true });
        respond();
    }

    static async createScript(type: ScriptType, name: string, code: string) {
        if(type === "plugin") {
            await Server.executeAndSend("pluginCreate", {
                name,
                code,
                enabled: false
            });

            // Enable the plugin by default if there won't be any issues
            const { error, willDownload, willEnable } = Scripts.checkDependencies(name);
            if(!error && willDownload.length === 0 && willEnable.length === 0) {
                await Server.executeAndSend("pluginToggled", { name, enabled: true });
            }
        } else {
            await Server.executeAndSend("libraryCreate", {
                name,
                code
            });
        }
    }
}
