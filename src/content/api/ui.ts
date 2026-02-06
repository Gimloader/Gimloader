import type { ModalOptions } from "$core/ui/modal";
import showModal from "$core/ui/modal";
import UI from "$core/ui/ui";
import { validate } from "$content/utils";
import type { ReactElement } from "react";
import * as z from "zod";
import GimkitInternals from "$content/core/internals";

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
    /** Shows a customizable modal to the user */
    showModal(element: HTMLElement | ReactElement, options: ModalOptions = {}) {
        validate("UI.showModal", arguments, ["element", "any"], ["options?", ModalOptionsSchema]);

        showModal(element, options);
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
     */
    addStyles(style: string) {
        validate("UI.removeStyles", arguments, ["style", "string"]);

        return UI.addStyles(this.#id, style);
    }
}

Object.freeze(BaseUIApi);
Object.freeze(BaseUIApi.prototype);
Object.freeze(UIApi);
Object.freeze(UIApi.prototype);
Object.freeze(ScopedUIApi);
Object.freeze(ScopedUIApi.prototype);
export { ScopedUIApi, UIApi };
