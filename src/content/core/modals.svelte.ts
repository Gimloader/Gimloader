import type { Plugin } from "./scripts/plugin.svelte";
import type { Script } from "./scripts/script.svelte";
import { mount, unmount, type Component } from "svelte";
import { domLoaded } from "$content/utils";

export interface Updated {
    name: string;
    version: string;
    changes: string[];
}

interface DependencyProps {
    script: Script | Script[];
    type: string;
    title: string;
}

interface SingleChangelogProps {
    name: string;
    version: string | null;
    changes: string[];
}

interface InputProps {
    title: string;
    defaultVal?: string;
    placeholder?: string;
    otherButtons?: { text: string; onClick: () => void }[];
}

type ModalInfo<Type extends string, Props, Result = void> = { type: Type; props: Props; result: Result };
type ModalTypes =
    | ModalInfo<"error", { text: string; title: string }>
    | ModalInfo<"confirm", { text: string; title: string }, boolean>
    | ModalInfo<"pluginSettings", { plugin: Plugin }>
    | ModalInfo<"dependency", DependencyProps, boolean>
    | ModalInfo<"singleChangelog", SingleChangelogProps>
    | ModalInfo<"input", InputProps, string | null>;

type ExtractModal<Type extends ModalTypes["type"]> = Extract<ModalTypes, ModalInfo<Type, any, any>>;
export type ModalProps<Type extends ModalTypes["type"]> = ExtractModal<Type>["props"] & {
    onClose: (result: ExtractModal<Type>["result"]) => void;
};

interface OpenedModal {
    tag?: string;
    onClose: (result: any) => void;
}

export default new class Modals {
    components = new Map<ModalTypes["type"], Component>();
    opened: OpenedModal[] = [];

    register<T extends ModalTypes["type"]>(type: T, component: Component<any>) {
        this.components.set(type, component);
    }

    async open<T extends ModalTypes["type"]>(type: T, props: ExtractModal<T>["props"], tag?: string): Promise<ExtractModal<T>["result"]> {
        await domLoaded;

        const component = this.components.get(type);
        if(!component) {
            console.error(`No modal component registered for type "${type}"`);
            return;
        }

        return new Promise((res) => {
            const onClose = (result: ExtractModal<T>["result"]) => {
                res(result);
                unmount(instance);

                const openedIndex = this.opened.indexOf(opened);
                if(openedIndex !== -1) this.opened.splice(openedIndex, 1);
            };

            const opened: OpenedModal = {
                tag,
                onClose
            };

            this.opened.push(opened);

            const instance = mount(component, {
                target: document.body,
                props: {
                    ...props,
                    onClose
                }
            });
        });
    }

    async resolveAll(tag: string, result: any) {
        for(const opened of this.opened) {
            if(opened.tag !== tag) continue;
            opened.onClose(result);
        }
    }
}();
