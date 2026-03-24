import Net, { type ConnectionType, type RequesterOptions } from "$core/net/net";
import { validate } from "$content/utils";
import EventEmitter2 from "eventemitter2";
import * as z from "zod";
import type { Schema } from "$types/schema";

const GamemodeSchema = z.union([z.string(), z.array(z.string())]);

class BaseNetApi extends EventEmitter2 {
    constructor() {
        super({
            wildcard: true,
            delimiter: ":"
        });

        // @ts-expect-error do this for eventemitter2 as it gets frozen
        this._all = [];
    }

    /** Which type of server the client is currently connected to */
    get type() {
        return Net.type;
    }

    /** The id of the gamemode the player is currently playing */
    get gamemode() {
        return Net.gamemode;
    }

    /** The room that the client is connected to, or null if there is no connection */
    get room() {
        return Net.room;
    }

    /** Gimkit's internal Colyseus state */
    get state(): Schema.GimkitSchema {
        if(Net.type !== "Colyseus") return undefined;
        return Net.room?.state;
    }

    /** Whether the user is the one hosting the current game */
    get isHost() {
        return Net.isHost;
    }

    /** Sends a message to the server on a specific channel */
    send(channel: string, message?: any) {
        validate("net.send", arguments, ["channel", "string"]);

        Net.send(channel, message);
    }
}

/**
 * The net api extends [EventEmitter2](https://github.com/EventEmitter2/EventEmitter2)
 * and uses wildcards with ":" as a delimiter.
 * ```js
 * // fired when data is recieved on a certain channel
 * GL.net.on("CHANNEL", (data, editFn) => {
 *     editFn("new data"); // Replace the data with "new data" before Gimkit processes it
 * });
 *
 * // fired when data is sent on a certain channel
 * GL.net.on("send:CHANNEL", (data, editFn) => {
 *     editFn(null); // Cancel the data being sent
 * });
 *
 * // you can also use wildcards, eg
 * GL.net.on("send:*", () => {});
 * ```
 */
class NetApi extends BaseNetApi {
    constructor() {
        super();

        Net.onAny((channel: string, ...args: any[]) => {
            this.emit(channel, ...args);
        });
    }

    /**
     * Runs a callback when the game is loaded, or runs it immediately if the game has already loaded
     * @returns A function to cancel waiting for load
     */
    onLoad(id: string, callback: (type: ConnectionType, gamemode: string) => void, gamemode?: string | ReadonlyArray<string>) {
        validate("Net.onLoad", arguments, ["id", "string"], ["callback", "function"], ["gamemode?", GamemodeSchema]);

        return Net.pluginOnLoad(id, callback, gamemode);
    }

    /** Cancels any calls to {@link onLoad} with the same id */
    offLoad(id: string) {
        validate("Net.offLoad", arguments, ["id", "string"]);

        Net.pluginOffLoad(id);
    }

    /**
     * Runs a callback when a request is made that matches a certain path (can have wildcards)
     * @returns A function to stop the modification
     * @example
     * ```js
     * GL.net.modifyFetchRequest("MyPlugin", "/api/experiences", (request) => {
     *     console.log(request.data);
     *     request.data.modified = true;
     *
     *     return null; // Cancel the request
     * });
     * ```
     */
    modifyFetchRequest(id: string, path: string, callback: (options: RequesterOptions) => any) {
        validate("net.modifyFetchRequest", arguments, ["id", "string"], ["path", "string"], ["callback", "function"]);

        return Net.modifyFetchRequest(id, path, callback);
    }

    /**
     * Runs a callback when a response is recieved for a request under a certain path (can have wildcards)
     * @returns A function to stop the modification
     * @example
     * ```js
     * GL.net.modifyFetchResponse("MyPlugin", "/api/experience/map/hooks", (data) => {
     *     console.log(data);
     *     return "modified data";
     * });
     * ```
     */
    modifyFetchResponse(id: string, path: string, callback: (response: any) => any) {
        validate("net.modifyFetchResponse", arguments, ["id", "string"], ["path", "string"], ["callback", "function"]);

        return Net.modifyFetchResponse(id, path, callback);
    }

    /** Stops any modifications made by {@link modifyFetchRequest} with the same id */
    stopModifyRequest(id: string) {
        validate("net.stopModifyRequest", arguments, ["id", "string"]);

        Net.stopModifyRequest(id);
    }

    /** Stops any modifications made by {@link modifyFetchResponse} with the same id */
    stopModifyResponse(id: string) {
        validate("net.stopModifyResponse", arguments, ["id", "string"]);

        Net.stopModifyResponse(id);
    }

    /**
     * @deprecated Methods for both transports are now on the base net api
     * @hidden
     */
    get colyseus() {
        return this;
    }

    /**
     * @deprecated Methods for both transports are now on the base net api
     * @hidden
     */
    get blueboat() {
        return this;
    }

    /** @hidden */
    private wrappedListeners = new WeakMap<(...args: any[]) => void, (data: any) => void>();

    /**
     * @deprecated use net.on
     * @hidden
     */
    addEventListener(channel: string, callback: (...args: any[]) => void) {
        let listener = this.wrappedListeners.get(callback);
        if(!listener) {
            listener = (data: any) => {
                callback(new CustomEvent(channel, { detail: data }));
            };
        }

        this.on(channel, listener);
    }

    /**
     * @deprecated use net.off
     * @hidden
     */
    removeEventListener(channel: string, callback: (...args: any[]) => void) {
        const listener = this.wrappedListeners.get(callback);
        if(!listener) return;

        this.off(channel, listener);
    }
}

/**
 * The net api extends [EventEmitter2](https://github.com/EventEmitter2/EventEmitter2)
 * and uses wildcards with ":" as a delimiter.
 * ```js
 * // fired when data is recieved on a certain channel
 * api.net.on("CHANNEL", (data, editFn) => {
 *     editFn("new data"); // Replace the data with "new data" before Gimkit processes it
 * });
 *
 * // fired when data is sent on a certain channel
 * api.net.on("send:CHANNEL", (data, editFn) => {
 *     editFn(null); // Cancel the data being sent
 * });
 *
 * // you can also use wildcards, eg
 * api.net.on("send:*", () => {});
 * ```
 */
class ScopedNetApi extends BaseNetApi {
    readonly #id: string;
    readonly #defaultGamemode: string[];

    constructor(id: string, defaultGamemode: string[]) {
        super();

        this.#id = id;
        this.#defaultGamemode = defaultGamemode;
    }

    /**
     * Runs a callback when the game is loaded, or runs it immediately if the game has already loaded.
     * If the \@gamemode header is set the callback will only fire if the gamemode matches one of the provided gamemodes.
     * @returns A function to cancel waiting for load
     */
    onLoad(callback: (type: ConnectionType, gamemode: string) => void, gamemode?: string | ReadonlyArray<string>) {
        validate("Net.onLoad", arguments, ["callback", "function"], ["gamemode?", GamemodeSchema]);
        if(gamemode === undefined) gamemode = this.#defaultGamemode;

        return Net.pluginOnLoad(this.#id, callback, gamemode);
    }

    /**
     * Runs a callback when a request is made that matches a certain path (can have wildcards)
     * @returns A function to stop the modification
     * @example
     * ```js
     * api.net.modifyFetchRequest("/api/experiences", (request) => {
     *     console.log(request.data);
     *     request.data.modified = true;
     *
     *     return null; // Cancel the request
     * });
     * ```
     */
    modifyFetchRequest(path: string, callback: (options: RequesterOptions) => any) {
        validate("net.modifyFetchRequest", arguments, ["path", "string"], ["callback", "function"]);

        return Net.modifyFetchRequest(this.#id, path, callback);
    }

    /**
     * Runs a callback when a response is recieved for a request under a certain path (can have wildcards)
     * @returns A function to stop the modification
     * @example
     * ```js
     * api.net.modifyFetchResponse("/api/experience/map/hooks", (data) => {
     *     console.log(data);
     *     return "modified data";
     * });
     * ```
     */
    modifyFetchResponse(path: string, callback: (response: any) => any) {
        validate("net.modifyFetchResponse", arguments, ["path", "string"], ["callback", "function"]);

        return Net.modifyFetchResponse(this.#id, path, callback);
    }
}

Object.freeze(BaseNetApi);
Object.freeze(BaseNetApi.prototype);
Object.freeze(NetApi);
Object.freeze(NetApi.prototype);
Object.freeze(ScopedNetApi);
Object.freeze(ScopedNetApi.prototype);
export { NetApi, ScopedNetApi };
