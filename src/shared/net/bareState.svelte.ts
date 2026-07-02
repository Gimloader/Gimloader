import type { LibraryInfo, PluginInfo, Settings, State } from "$types/net/state";
import Port from "./port.svelte";

export default new class BareState {
    plugins: PluginInfo[] = $state([]);
    libraries: LibraryInfo[] = $state([]);
    settings: Partial<Settings> = $state({});

    init(initial?: (state: State) => void) {
        const onState = (state: State) => {
            this.plugins = state.plugins;
            this.libraries = state.libraries;
            this.settings = state.settings;
        };

        Port.init((state) => {
            onState(state);
            initial?.(state);
        }, onState);

        // sync plugins
        Port.on("pluginEdit", ({ name, code, newName }) => {
            const plugin = this.plugins.find(p => p.name === name);
            if(!plugin) return;

            plugin.code = code;
            plugin.name = newName;
        });

        Port.on("pluginCreate", ({ info }) => {
            this.plugins.push(info);
        });

        Port.on("pluginDelete", ({ name }) => {
            this.plugins = this.plugins.filter(p => p.name !== name);
        });

        Port.on("pluginDeleteAll", () => {
            this.plugins = [];
        });

        Port.on("pluginSetAll", ({ enabled }) => {
            this.plugins.forEach(p => p.enabled = enabled);
        });

        Port.on("pluginToggled", ({ name, enabled }) => {
            const plugin = this.plugins.find(p => p.name === name);
            if(plugin) plugin.enabled = enabled;
        });

        // sync libraries
        Port.on("libraryCreate", ({ info }) => this.libraries.push(info));

        Port.on("libraryDelete", ({ name }) => {
            this.libraries = this.libraries.filter(l => l.name !== name);
        });

        Port.on("libraryEdit", ({ name, code }) => {
            const library = this.libraries.find(l => l.name === name);
            if(library) library.code = code;
        });

        Port.on("libraryDeleteAll", () => this.libraries = []);

        Port.on("libraryArrange", ({ order }) => {
            const newOrder: LibraryInfo[] = [];
            for(const name in order) {
                const library = this.libraries.find(l => l.name === name);
                if(library) newOrder.push(library);
            }
            this.libraries = newOrder;
        });

        // sync settings
        Port.on("settingUpdate", ({ key, value }) => {
            // @ts-expect-error probably a better way to do this
            this.settings[key] = value;
        });
    }
}();
