import Commands from "$content/core/commands.svelte";
import { validate } from "$content/utils";
import type { CommandCallback, CommandOptions } from "$types/api/commands";
import * as z from "zod";

const CommandOptionsSchema = z.union([
    z.string(),
    z.object({
        text: z.union([z.string(), z.function()]),
        keywords: z.array(z.string()).optional(),
        hidden: z.function().optional()
    })
]);

/** An API for adding commands to the command palette */
export class CommandsApi {
    /**
     * Adds a command to the user's command palette. Can request additional input within the callback.
     * @returns A function to remove the command
     * @example
     * ```js
     * GL.commands.addCommand("MyPlugin", {
     *     text: "Do a thing",
     *     keywords: ["execute", "run"],
     *     hidden: () => false
     * }, async (context) => {
     *     const choice = await context.select({
     *         title: "Choose an option",
     *         options: [
     *             { label: "Option 1", value: "one" },
     *             { label: "Option 2", value: "two" }
     *          ]
     *     });
     *     const number = await context.number({
     *         title: "Pick a number"
     *         min: 1,
     *         max: 10,
     *         decimal: true
     *     });
     *     const string = await context.string({
     *         title: "Enter a string",
     *         maxLength: 20
     *     });
     *
     *     console.log("User chose:", { choice, number, string });
     * });
     * ```
     */
    addCommand(id: string, options: CommandOptions, callback: CommandCallback) {
        validate("commands.addCommand", arguments, ["id", "string"], ["options", CommandOptionsSchema], ["callback", "function"]);

        return Commands.addCommand(id, options, callback);
    }

    /** Removes all commands that were added with the same id */
    removeCommands(id: string) {
        validate("commands.removeCommands", arguments, ["id", "string"]);

        Commands.removeCommands(id);
    }
}

/** An API for adding commands to the command palette */
export class ScopedCommandsApi {
    readonly #id: string;

    constructor(id: string) {
        this.#id = id;
    }

    /**
     * Adds a command to the user's command palette. Can request additional input within the callback.
     * @returns A function to remove the command
     * @example
     * ```js
     * api.commands.addCommand({
     *     text: "Do a thing",
     *     keywords: ["execute", "run"],
     *     hidden: () => false
     * }, async (context) => {
     *     const choice = await context.select({
     *         title: "Choose an option",
     *         options: [
     *             { label: "Option 1", value: "one" },
     *             { label: "Option 2", value: "two" }
     *         ]
     *     });
     *     const number = await context.number({
     *         title: "Pick a number"
     *         min: 1,
     *         max: 10,
     *         decimal: true
     *     });
     *     const string = await context.string({
     *         title: "Enter a string",
     *         maxLength: 20
     *     });
     *
     *     console.log("User chose:", { choice, number, string });
     * });
     * ```
     */
    addCommand(options: CommandOptions, callback: CommandCallback) {
        validate("commands.addCommand", arguments, ["options", CommandOptionsSchema], ["callback", "function"]);

        return Commands.addCommand(this.#id, options, callback);
    }
}
