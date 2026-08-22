import type { PluginSettings } from "$types/api/settings";
import type { ScriptHeaders } from "$types/scripts";
import type { Script } from "$core/scripts/script.svelte";
import type { Plugin } from "$core/scripts/plugin.svelte";
import HotkeysApi from "./hotkeys";
import RewriterApi from "./rewriter";
import NetApi from "./net";
import UIApi from "./ui";
import StorageApi from "./storage";
import PatcherApi from "./patcher";
import CommandsApi from "./commands";
import LibsApi from "./libs";
import PluginsApi from "./plugins";
import LoggerApi from "./logger";
import Svelte from "./svelte";
import Components from "./components";
import GimkitInternals from "$core/internals";
import UI from "$core/ui/ui";
import createSettingsApi from "./settings";
import { addReloadNeeded } from "$content/ui/modals/ReloadConfirm.svelte";
import Cleanup from "$core/scripts/cleanup";

class Api {
    /** Functions to edit Gimkit's code */
    rewriter: Readonly<RewriterApi>;

    /** Functions to listen for key combinations */
    hotkeys: Readonly<HotkeysApi>;

    /**
     * Ways to interact with the current connection to the server,
     * and functions to send general requests
     */
    net: Readonly<NetApi>;

    /** Functions for interacting with the DOM */
    UI: Readonly<UIApi>;

    /** Functions for persisting data between reloads */
    storage: Readonly<StorageApi>;

    /** Functions for intercepting the arguments and return values of functions */
    patcher: Readonly<PatcherApi>;

    /** Functions for adding commands to the command palette */
    commands: Readonly<CommandsApi>;

    /** Methods for getting info on libraries */
    libs: Readonly<LibsApi>;

    /** Gets the exported values of a library */
    lib: LibsApi["get"];

    /** Methods for getting info on plugins */
    plugins: Readonly<PluginsApi>;

    /** Gets the exported values of a plugin, if it has been enabled */
    plugin: PluginsApi["get"];

    /** Utilities for pretty logs with a tag showing they are from this script */
    logger: Readonly<LoggerApi>;

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

    /** A variety of gimkit internal objects available in 1d gamemodes */
    get classicStores() {
        return GimkitInternals.classicStores;
    }

    /** Physics variables available in platformer gamemodes */
    get platformerPhysics() {
        return GimkitInternals.platformerPhysics;
    }

    /**
     * The exports of svelte v5.43.0, used internally by Gimloader and exposed to make scripts smaller.
     * Should never be used by hand.
     */
    svelte_5_43_0 = Svelte;

    /** Useful svelte components which can be used by scripts */
    Components = Components;

    #id: string;
    constructor(id: string, script?: Script) {
        this.#id = id;

        this.rewriter = Object.freeze(new RewriterApi(id));
        this.hotkeys = Object.freeze(new HotkeysApi(id));
        this.net = new NetApi(id, script?.headers.gamemode ?? []);
        this.UI = Object.freeze(new UIApi(id));
        this.storage = Object.freeze(new StorageApi(id));
        this.patcher = Object.freeze(new PatcherApi(id));
        this.commands = Object.freeze(new CommandsApi(id));
        this.libs = Object.freeze(new LibsApi(id));
        this.plugins = Object.freeze(new PluginsApi(id));

        // For type convenience we pretend these always exist always exists
        if(script?.type === "plugin") {
            const plugin = script as Plugin;

            this.openSettingsMenu = (cb) => plugin.openSettingsMenu.push(cb);
            this.settings = createSettingsApi(plugin);
        }

        this.lib = this.libs.get.bind(this.libs);
        this.plugin = this.plugins.get.bind(this.plugins);

        const color = !script ? "#e01f39" : script.type === "plugin" ? "#4287f5" : "#2ade42";
        this.logger = Object.freeze(new LoggerApi(id, color));
        this.headers = script?.getHeaders()!;

        // Patch append_styles to automatically clean up
        const styleCleanups = new Map<string, () => void>();
        this.svelte_5_43_0.Client.append_styles = (_: any, css: any) => {
            const cleanup = styleCleanups.get(css.hash);
            if(cleanup) cleanup();

            styleCleanups.set(css.hash, this.UI.addStyles(css.code));
        };
    }

    /** A utility for creating persistent settings menus, only available to plugins */
    settings!: PluginSettings;

    /** Run a callback when this script is disabled */
    onStop = (...callbacks: (() => void)[]) => {
        for(const cb of callbacks) Cleanup.on(this.#id, cb);
    };

    /**
     * Run a callback when this plugin's settings menu button is clicked
     *
     * This function is not available for libraries
     */
    openSettingsMenu!: (...callbacks: (() => void)[]) => void;

    /** Display a modal to the user indicating that this script requires a reload */
    requestReload = () => addReloadNeeded(this.#id);

    /** The headers containing this script's metadata */
    headers: Readonly<ScriptHeaders>;

    /** Cleans up everything performed through this script's api */
    cleanup = () => Cleanup.cleanup(this.#id, false);
}

Object.freeze(Api);
Object.freeze(Api.prototype);
export default Api;
