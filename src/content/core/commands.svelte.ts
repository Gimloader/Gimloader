import type { Command, CommandAction, CommandCallback, CommandContext, CommandOptions } from "$types/api/commands";
import Hotkeys from "./hotkeys/hotkeys.svelte";
import { clearId, validate } from "$content/utils";
import * as z from "zod";
import { isFirefox } from "$shared/consts";

class CancelError extends Error {
    constructor() {
        super("Command cancelled by user");
    }
}

const SelectSchema = z.object({
    title: z.string(),
    options: z.array(z.object({
        label: z.string(),
        value: z.any()
    })).min(1)
});

const NumberSchema = z.object({
    title: z.string(),
    min: z.number().optional(),
    max: z.number().optional(),
    decimal: z.boolean().optional()
});

const StringSchema = z.object({
    title: z.string(),
    maxLength: z.number().optional()
});

export default new class Commands {
    commands: Command[] = $state([]);
    action: CommandAction | null = $state(null);
    context: CommandContext;
    open = $state(false);

    init() {
        const chromeDefault = {
            key: "KeyP",
            ctrl: true,
            shift: true,
            alt: false
        };
        const firefoxDefault = {
            key: "KeyP",
            ctrl: false,
            shift: true,
            alt: true
        };

        Hotkeys.addConfigurableHotkey("openCommandPalette", {
            category: "Gimloader",
            title: "Open Command Palette",
            preventDefault: true,
            default: isFirefox ? firefoxDefault : chromeDefault
        }, () => this.startOpen());

        const createAction = <T extends CommandAction, R>(type: T["type"], options: T["options"]) => {
            this.startOpen();

            return new Promise<R>((res, rej) => {
                this.action = {
                    type,
                    options,
                    callback: (value: R) => {
                        this.startClose();
                        res(value);
                    },
                    cancel: () => {
                        rej(new CancelError());
                    }
                } as T;
            });
        };

        this.context = {
            select(options) {
                validate("context.select", arguments, ["options", SelectSchema]);
                return createAction("select", options);
            },
            number(options) {
                validate("context.number", arguments, ["options", NumberSchema]);
                return createAction("number", options);
            },
            string(options) {
                validate("context.string", arguments, ["options", StringSchema]);
                return createAction("string", options);
            }
        };
    }

    closeTimeout?: ReturnType<typeof setTimeout>;
    startClose() {
        this.closeTimeout = setTimeout(() => {
            this.open = false;
        }, 20);
    }

    startOpen() {
        if(this.closeTimeout) {
            clearTimeout(this.closeTimeout);
            this.closeTimeout = undefined;
        }

        this.open = true;
    }

    onClosed() {
        if(!this.action) return;

        this.action.cancel();
        this.action = null;
    }

    commandIdentifier = 0;
    addCommand(id: string | null, options: CommandOptions | string, callback: CommandCallback) {
        const identifier = this.commandIdentifier++;

        if(typeof options === "string") {
            this.commands.push({
                text: options,
                id,
                identifier,
                callback
            });
        } else {
            this.commands.push({
                ...options,
                id,
                identifier,
                callback
            });
        }

        return () => {
            const index = this.commands.findIndex(c => c.identifier === identifier);
            if(index === -1) return;

            this.commands.splice(index, 1);
        };
    }

    runCommand(callback: CommandCallback) {
        this.startClose();

        const returned = callback(this.context);
        if(returned instanceof Promise) {
            returned.catch((err) => {
                if(err instanceof CancelError) return;
                throw err;
            });
        }
    }

    removeCommands(id: string) {
        clearId(this.commands, id);
    }
}();
