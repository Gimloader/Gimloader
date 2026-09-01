import type { ModalOptions } from "$core/ui/modal";
import type * as React from "react";
import type { ToastType } from "$types/api/toast";
import showModal from "$core/ui/modal";
import UI from "$core/ui/ui";
import { validate } from "$content/utils";
import * as z from "zod";
import GimkitInternals, { type Internals } from "$core/internals";
import { toast } from "svelte-sonner";
import Modals from "$core/modals.svelte";

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

interface PromptOptions {
    text?: string;
    defaultVal?: string;
    placeholder?: string;
}

const PromptOptionsSchema = z.object({
    text: z.string().optional(),
    defaultVal: z.string().optional(),
    placeholder: z.string().optional()
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

    /**
     * Shows an alert message. Resolves once the message is dismissed.
     * @example
     * ```js
     * api.UI.alert("Something happened", "This is an alert")
     *     .then(() => console.log("Alert dismissed"));
     * ```
     */
    alert(title: string, text = "") {
        validate("UI.alert", arguments, ["title", "string"], ["text?", "string"]);

        return Modals.open("alert", { title, text });
    }

    /**
     * Shows a prompt asking the user to confirm an action. Resolves to a boolean containing their choice.
     * @example
     * ```js
     * api.UI.confirm("Are you sure?", "This cannot be undone")
     *     .then((confirmed) => console.log("Confirmation:", confirmed));
     * ```
     */
    confirm(title: string, text = "") {
        validate("UI.confirm", arguments, ["title", "string"], ["text?", "string"]);

        return Modals.open("confirm", { title, text });
    }

    /**
     * Shows a prompt asking for user input. Resolves to null if cancelled.
     * @example
     * ```js
     * api.UI.prompt("Name your character", {
     *     text: "This can be changed later",
     *     placeholder: "Character name",
     *     defaultVal: "Player"
     * }).then((name) => {
     *     if(name === null) console.log("User cancelled");
     *     else console.log("User entered:", name);
     * });
     * ```
     */
    prompt(title: string, options?: PromptOptions) {
        validate("UI.prompt", arguments, ["title", "string"], ["options?", PromptOptionsSchema]);

        return Modals.open("input", { title, ...options });
    }

    /** The toast api exposed by svelte-sonner */
    toast = toast as ToastType;
}

Object.freeze(UIApi);
Object.freeze(UIApi.prototype);
export default UIApi;
