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
        version: string | null;
        changes: string[];
    };
}

export default new class Modals {
    components = new Map<keyof ModalProps, Component>();

    register<T extends keyof ModalProps>(type: T, component: Component<any>) {
        this.components.set(type, component);
    }

    async open<T extends keyof ModalProps>(type: T, props: ModalProps[T]) {
        await domLoaded;

        const component = this.components.get(type);
        if(!component) {
            console.error(`No modal component registered for type "${type}"`);
            return;
        }

        return new Promise<boolean>((res) => {
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
}();
