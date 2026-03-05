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

        Port.on("pluginCreate", ({ name, code }) => {
            this.plugins.push({ name, code, enabled: true });
        });

        Port.on("pluginDelete", ({ name }) => {
            this.plugins = this.plugins.filter(p => p.name !== name);
        });

        Port.on("pluginDeleteAll", () => {
            this.plugins = [];
        });

        Port.on("pluginArrange", ({ order }) => {
            const newOrder: PluginInfo[] = [];
            for(const name in order) {
                newOrder.push(this.plugins.find(p => p.name === name));
            }
            this.plugins = newOrder;
        });

        Port.on("pluginSetAll", ({ enabled }) => {
            this.plugins.forEach(p => p.enabled = enabled);
        });

        Port.on("pluginToggled", ({ name, enabled }) => {
            this.plugins.find(p => p.name === name).enabled = enabled;
        });

        // sync libraries
        Port.on("libraryCreate", (item) => this.libraries.push(item));

        Port.on("libraryDelete", ({ name }) => {
            this.libraries = this.libraries.filter(l => l.name !== name);
        });

        Port.on("libraryEdit", ({ name, code }) => {
            this.libraries.find(l => l.name === name).code = code;
        });

        Port.on("libraryDeleteAll", () => this.libraries = []);

        Port.on("libraryArrange", ({ order }) => {
            const newOrder: LibraryInfo[] = [];
            for(const name in order) {
                newOrder.push(this.libraries.find(l => l.name === name));
            }
            this.libraries = newOrder;
        });

        // sync settings
        Port.on("settingUpdate", ({ key, value }) => {
            this.settings[key] = value;
        });
    }
}();
