import { SvelteSet } from "svelte/reactivity";
import type { Plugin } from "./scripts/plugin.svelte";
import type { Script } from "./scripts/script.svelte";
import { mount, unmount, type Component } from "svelte";
import { domLoaded } from "$content/utils";

export interface Updated {
    name: string;
    version: string;
    changes: string[];
}

interface ModalProps {
    error: { text: string; title: string };
    confirm: { text: string; title: string };
    pluginSettings: { plugin: Plugin };
    dependency: {
        script: Script | Script[];
        type: string;
        title: string;
    };
    singleChangelog: {
        name: string;
        version: string;
        changes: string[];
    }
}

export default new class Modals {
    reloadNeeded = new SvelteSet<string>();
    reloadNames = $derived(Array.from(this.reloadNeeded));
    updated: Updated[] = $state([]);
    components = new Map<keyof ModalProps, Component>();

    register<T extends keyof ModalProps>(type: T, component: Component) {
        this.components.set(type, component);
    }

    async open<T extends keyof ModalProps>(type: T, props: ModalProps[T]) {
        await domLoaded;
        return new Promise<boolean>((res) => {
            const component = this.components.get(type);
            const instance = mount(component, {
                target: document.body,
                props: {
                    ...props,
                    onClose: (confirmed: boolean | undefined) => {
                        res(Boolean(confirmed));
                        unmount(instance);
                    }
                }
            });
        });
    }

    addReloadNeeded(name: string) {
        this.reloadNeeded.add(name);
    }

    addUpdated(name: string, version: string, changes: string[]) {
        this.updated.push({ name, version, changes });
    }

    clearUpdated() {
        this.updated = [];
    }
}();
