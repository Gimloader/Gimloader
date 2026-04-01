import type { ModalOptions } from "$core/ui/modal";
import showModal from "$core/ui/modal";
import UI from "$core/ui/ui";
import { validate } from "$content/utils";
import type * as React from "react";
import * as z from "zod";
import GimkitInternals, { type Internals } from "$core/internals";

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

class BaseUIApi {
    /**
     * Shows a customizable modal to the user
     * @example
     * ```js
     * const element = document.createElement("div");
     * element.textContent = "Hello, world!";
     *
     * GL.UI.showModal(element, {
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
}

class UIApi extends BaseUIApi {
    /**
     * Adds a style to the DOM
     * @returns A function to remove the styles
     * @example
     * ```js
     * const styles = `#element {
     *     color: red;
     * }`;
     *
     * GL.UI.addStyles("MyPlugin", styles);
     * ```
     */
    addStyles(id: string, style: string) {
        validate("UI.removeStyles", arguments, ["id", "string"], ["style", "string"]);

        return UI.addStyles(id, style);
    }

    /** Remove all styles with a given id */
    removeStyles(id: string) {
        validate("UI.removeStyles", arguments, ["id", "string"]);

        UI.removeStyles(id);
    }

    /**
     * Waits for a component to load, and calls the callback with the component as an argument.
     * If the component has already loaded the callback will be fired immediately.
     * The available components are "notification", "message", and "modal".
     * @returns A function that cancels waiting
     * @example
     * ```js
     * GL.UI.onComponentLoad("MyPlugin", "message", (message) => {
     *     message.success({ content: "This is a message!" });
     * });
     * ```
     */
    onComponentLoad<K extends keyof GimkitComponents>(id: string, type: K, callback: (component: GimkitComponents[K]) => void) {
        validate("UI.onComponentLoad", arguments, ["id", "string"], ["type", ComponentsSchema], ["callback", "function"]);

        return GimkitInternals.onLoad(id, type, callback);
    }

    /** Cancels any calls made to {@link onComponentLoad} with the same id */
    offComponentLoad(id: string) {
        validate("UI.offComponentLoad", arguments, ["id", "string"]);

        GimkitInternals.offLoad(id);
    }
}

class ScopedUIApi extends BaseUIApi {
    readonly #id: string;

    constructor(id: string) {
        super();

        this.#id = id;
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
        validate("UI.removeStyles", arguments, ["style", "string"]);

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
}

Object.freeze(BaseUIApi);
Object.freeze(BaseUIApi.prototype);
Object.freeze(UIApi);
Object.freeze(UIApi.prototype);
Object.freeze(ScopedUIApi);
Object.freeze(ScopedUIApi.prototype);
export { ScopedUIApi, UIApi };
