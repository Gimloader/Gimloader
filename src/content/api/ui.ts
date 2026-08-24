import type { ModalOptions } from "$core/ui/modal";
import showModal from "$core/ui/modal";
import UI from "$core/ui/ui";
import { validate } from "$content/utils";
import type * as React from "react";
import * as z from "zod";
import GimkitInternals, { type Internals } from "$core/internals";
import { toast } from "svelte-sonner";
import type { ToastType } from "$types/api/toast";

const gimkitComponents = ["notification", "message", "modal"] as const;
type GimkitComponents = Pick<Internals, typeof gimkitComponents[number]>;
const ComponentsSchema = z.union(gimkitComponents.map((type) => z.literal(type)));

const ButtonSchema = z.object({
    text: z.string(),
    style: z.enum(["primary", "danger", "close"]).optional(),
    onClick: z.function({ output: z.any() }).optional()
});

const ModalOptionsSchema = z.object({
    id: z.string().optional(),
    title: z.string().optional(),
    style: z.string().optional(),
    className: z.string().optional(),
    closeOnBackgroundClick: z.boolean().optional(),
    buttons: z.array(ButtonSchema).optional(),
    onClosed: z.function().optional()
});

/** Functions for interacting with user interfaces */
class UIApi {
    readonly #id: string;

    constructor(id: string) {
        this.#id = id;
    }

    /**
     * Shows a customizable modal to the user
     * @example
     * ```js
     * const element = document.createElement("div");
     * element.textContent = "Hello, world!";
     *
     * api.UI.showModal(element, {
     *     id: "my-modal",
     *     title: "My Modal",
     *     style: "width: 300px;",
     *     className: "someClass",
     *     closeOnBackgroundClick: true,
     *     onClosed: () => {},
     *     buttons: [
     *         { text: "OK", style: "primary", onClick: () => {} },
     *         { text: "Cancel", style: "close" },
     *         { text: "Revert", style: "danger", onClick: () => {} }
     *     ]
     * });
     * ```
     */
    showModal(element: HTMLElement | React.ReactElement, options: ModalOptions = {}) {
        validate("UI.showModal", arguments, ["element", "any"], ["options?", ModalOptionsSchema]);

        showModal(element, options);
    }

    /** Forces Gimkit's react tree to fully rerender */
    forceReactUpdate() {
        UI.forceReactUpdate();
    }

    /**
     * Gimkit's notification object, only available when joining or playing a game
     *
     * {@link https://ant.design/components/notification#api}
     */
    get notification() {
        return GimkitInternals.notification;
    }

    /**
     * Gimkit's message object
     *
     * {@link https://ant.design/components/message#api}
     */
    get message() {
        return GimkitInternals.message;
    }

    /**
     * Gimkit's modal object
     *
     * {@link https://ant.design/components/modal#modalmethod}
     */
    get modal() {
        return GimkitInternals.modal;
    }

    /**
     * Adds a style to the DOM
     * @returns A function to remove the styles
     * @example
     * ```js
     * const styles = `#element {
     *     color: red;
     * }`;
     *
     * api.UI.addStyles(styles);
     * ```
     */
    addStyles(style: string) {
        validate("UI.addStyles", arguments, ["style", "string"]);

        return UI.addStyles(this.#id, style);
    }

    /**
     * Waits for a component to load, and calls the callback with the component as an argument.
     * If the component has already loaded the callback will be fired immediately.
     * The available components are "notification", "message", and "modal".
     * @returns A function that cancels waiting
     * @example
     * ```js
     * api.UI.onComponentLoad("message", (message) => {
     *     message.success({ content: "This is a message!" });
     * });
     * ```
     */
    onComponentLoad<K extends keyof GimkitComponents>(type: K, callback: (component: GimkitComponents[K]) => void) {
        validate("UI.onComponentLoad", arguments, ["type", ComponentsSchema], ["callback", "function"]);

        return GimkitInternals.onLoad(this.#id, type, callback);
    }

    /** The toast api exposed by svelte-sonner */
    toast = toast as ToastType;
}

Object.freeze(UIApi);
Object.freeze(UIApi.prototype);
export default UIApi;
