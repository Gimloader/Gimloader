import type { PluginSettings } from "$types/settings";
import { Plugin } from "$core/scripts/plugin.svelte";
import { HotkeysApi, ScopedHotkeysApi } from "./hotkeys";
import { ParcelApi, ScopedParcelApi } from "./parcel";
import { NetApi, ScopedNetApi } from "./net";
import { ScopedUIApi, UIApi } from "./ui";
import { ScopedStorageApi, StorageApi } from "./storage";
import { PatcherApi, ScopedPatcherApi } from "./patcher";
import { RewriterApi, ScopedRewriterApi } from "./rewriter";
import { CommandsApi, ScopedCommandsApi } from "./commands";
import GimkitInternals from "$core/internals";
import Net from "$core/net/net";
import UI from "$core/ui/ui";
import LibsApi from "./libs";
import PluginsApi from "./plugins";
import setupScoped from "$content/scopedApi";
import Hotkeys from "$core/hotkeys/hotkeys.svelte";
import Patcher from "$core/patcher";
import Storage from "$core/storage.svelte";
import Rewriter from "$core/rewriter";
import createSettingsApi from "./settings";
import Commands from "$content/core/commands.svelte";
import { nop } from "$shared/utils";
import Modals from "$content/core/modals.svelte";

class Api {
    /**
     * @deprecated Gimkit has switched from Parcel to vite, rendering this api useless.
     * @hidden
     */
    static parcel = Object.freeze(new ParcelApi());

    /** Functions to edit Gimkit's code */
    static rewriter = Object.freeze(new RewriterApi());

    /** Functions to listen for key combinations */
    static hotkeys = Object.freeze(new HotkeysApi());

    /**
     * Ways to interact with the current connection to the server,
     * and functions to send general requests
     */
    static net = Object.freeze(new NetApi());

    /** Functions for interacting with the DOM */
    static UI = Object.freeze(new UIApi());

    /** Functions for persisting data between reloads */
    static storage = Object.freeze(new StorageApi());

    /** Functions for intercepting the arguments and return values of functions */
    static patcher = Object.freeze(new PatcherApi());

    /** Functions for adding commands to the command palette */
    static commands = Object.freeze(new CommandsApi());

    /** Methods for getting info on libraries */
    static libs = Object.freeze(new LibsApi());

    /** Gets the exported values of a library */
    static lib = this.libs.get;

    /** Methods for getting info on plugins */
    static plugins = Object.freeze(new PluginsApi());

    /** Gets the exported values of a plugin, if it has been enabled */
    static plugin = this.plugins.get;

    /** Gimkit's internal react instance */
    static get React() {
        return UI.React;
    }

    /** Gimkit's internal reactDom instance */
    static get ReactDOM() {
        return UI.ReactDOM;
    }

    /** A variety of Gimkit internal objects available in 2d gamemodes */
    static get stores() {
        return GimkitInternals.stores;
    }

    /**
     * @deprecated Use GL.UI.notification
     * @hidden
     */
    static get notification() {
        return GimkitInternals.notification;
    }

    /**
     * @deprecated No longer supported
     * @hidden
     */
    static get contextMenu() {
        return { showContextMenu: nop, createReactContextMenu: nop };
    }

    /**
     * @deprecated No longer supported
     * @hidden
     */
    static get platformerPhysics() {
        return GimkitInternals.platformerPhysics;
    }

    /**
     * @deprecated The api no longer emits events. Use GL.net.loaded to listen to load events
     * @hidden
     */
    static addEventListener(type: string, callback: () => void) {
        if(type === "loadEnd") {
            Net.on("load:*", callback);
        }
    }

    /**
     * @deprecated The api no longer emits events
     * @hidden
     */
    static removeEventListener(type: string, callback: () => void) {
        if(type === "loadEnd") {
            Net.off("load:*", callback);
        }
    }

    /**
     * @deprecated Use {@link plugins} instead
     * @hidden
     */
    static get pluginManager() {
        return this.plugins;
    }

    #id: string;
    constructor(type?: string, name?: string) {
        const scoped = setupScoped(type, name);
        this.#id = scoped.id;

        this.onStop = scoped.onStop;
        this.openSettingsMenu = scoped.openSettingsMenu;

        this.rewriter = Object.freeze(new ScopedRewriterApi(scoped.id));
        this.parcel = Object.freeze(new ScopedParcelApi());
        this.hotkeys = Object.freeze(new ScopedHotkeysApi(scoped.id));
        this.net = Object.freeze(new ScopedNetApi(scoped.id, scoped.script.headers.gamemode));
        this.UI = Object.freeze(new ScopedUIApi(scoped.id));
        this.storage = Object.freeze(new ScopedStorageApi(scoped.id));
        this.patcher = Object.freeze(new ScopedPatcherApi(scoped.id));
        this.commands = Object.freeze(new ScopedCommandsApi(scoped.id));
        if(scoped.script instanceof Plugin) {
            this.settings = createSettingsApi(scoped.script);
        }

        const netOnAny = (channel: string, ...args: any[]) => {
            this.net.emit(channel, ...args);
        };

        // emit events to the net object (not done there to allow for cleanup)
        Net.onAny(netOnAny);

        const cleanup = () => {
            Rewriter.removeParseHooks(scoped.id);
            Rewriter.removeShared(scoped.id);
            Rewriter.removeRunInScope(scoped.id);
            Net.offAny(netOnAny);
            this.net.removeAllListeners();
            Hotkeys.removeHotkeys(scoped.id);
            Hotkeys.removeConfigurableFromPlugin(scoped.id);
            Net.pluginOffLoad(scoped.id);
            Net.stopModifyRequest(scoped.id);
            Net.stopModifyResponse(scoped.id);
            UI.removeStyles(scoped.id);
            Patcher.unpatchAll(scoped.id);
            Storage.removeValueListeners(scoped.id);
            Storage.removeSettingListeners(scoped.id);
            Commands.removeCommands(scoped.id);
        };

        this.onStop(cleanup);
    }

    /**
     * @deprecated Gimkit has switched from Parcel to vite, rendering this api useless.
     * @hidden
     */
    parcel: Readonly<ScopedParcelApi>;

    /** Functions to edit Gimkit's code */
    rewriter: Readonly<ScopedRewriterApi>;

    /** Functions to listen for key combinations */
    hotkeys: Readonly<ScopedHotkeysApi>;

    /**
     * Ways to interact with the current connection to the server,
     * and functions to send general requests
     */
    net: Readonly<ScopedNetApi>;

    /** Functions for interacting with the DOM */
    UI: Readonly<ScopedUIApi>;

    /** Functions for persisting data between reloads */
    storage: Readonly<ScopedStorageApi>;

    /** Functions for intercepting the arguments and return values of functions */
    patcher: Readonly<ScopedPatcherApi>;

    /** Functions for adding commands to the command palette */
    commands: Readonly<ScopedCommandsApi>;

    /** A utility for creating persistent settings menus, only available to plugins */
    settings: PluginSettings;

    /** Methods for getting info on libraries */
    libs = Api.libs;

    /** Gets the exported values of a library */
    lib = Api.libs.get;

    /** Methods for getting info on plugins */
    plugins = Api.plugins;

    /** Gets the exported values of a plugin, if it has been enabled */
    plugin = Api.plugins.get;

    /** Gimkit's internal react instance */
    get React() {
        return UI.React;
    }

    /** Gimkit's internal reactDom instance */
    get ReactDOM() {
        return UI.ReactDOM;
    }

    /** A variety of gimkit internal objects available in 2d gamemodes */
    get stores() {
        return GimkitInternals.stores;
    }

    /**
     * @deprecated Use api.UI.notification
     * @hidden
     */
    get notification() {
        return GimkitInternals.notification;
    }

    /** Run a callback when the script is disabled */
    onStop: (callback: () => void) => void;

    /**
     * Run a callback when the plugin's settings menu button is clicked
     *
     * This function is not available for libraries
     */
    openSettingsMenu: (callback: () => void) => void;

    /** Display a modal to the user indicating that the script requires a reload */
    requestReload = () => Modals.addReloadNeeded(this.#id);
}

Object.freeze(Api);
Object.freeze(Api.prototype);
export default Api;
