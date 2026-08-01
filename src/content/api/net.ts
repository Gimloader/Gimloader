import Net, { type ConnectionType, type RequesterOptions } from "$core/net/net";
import { validate } from "$content/utils";
import EventEmitter2 from "eventemitter2";
import * as z from "zod";
import type { Schema } from "$types/schema";
import type { CancelablePromise, GeneralEventEmitter, ListenToOptions, WaitForFilter, WaitForOptions } from "eventemitter2";
import Cleanup from "$core/scripts/cleanup";

const GamemodeSchema = z.union([z.string(), z.array(z.string())]);

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
class NetApi {
    readonly #id: string;
    readonly #defaultGamemode: string[];

    constructor(id: string, defaultGamemode: string[]) {
        this.#id = id;
        this.#defaultGamemode = defaultGamemode;

        const emit = this.emit.bind(this);
        Net.onAny(emit);

        Cleanup.on(id, (final) => {
            if(final) Net.offAny(emit);
            this.removeAllListeners();
        });
    }

    #events = new EventEmitter2({
        wildcard: true,
        delimiter: ":"
    });

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
        // We pretend that this is always defined for ease of use
        if(Net.type !== "Colyseus") return undefined as any;
        return Net.room?.state;
    }

    /** Colyseus's Callbacks function for listening to state changes */
    get Callbacks() {
        return Net.Callbacks;
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

    emit(event: string | string[], ...args: any[]) {
        this.#events.emit(event, ...args);
    }

    emitAsync(event: string | string[], ...args: any[]) {
        return this.#events.emitAsync(event, ...args);
    }

    addListener(event: string | string[], listener: (...data: any[]) => void) {
        this.#events.addListener(event, listener);
    }

    on(event: string | string[], listener: (...data: any[]) => void) {
        this.#events.on(event, listener);
    }

    prependListener(event: string | string[], listener: (...data: any[]) => void) {
        this.#events.prependListener(event, listener);
    }

    once(event: string | string[], listener: (...data: any[]) => void) {
        this.#events.once(event, listener);
    }

    prependOnceListener(event: string | string[], listener: (...data: any[]) => void) {
        this.#events.prependOnceListener(event, listener);
    }

    many(event: string | string[], timesToListen: number, listener: (...data: any[]) => void) {
        this.#events.many(event, timesToListen, listener);
    }

    prependMany(event: string | string[], timesToListen: number, listener: (...data: any[]) => void) {
        this.#events.many(event, timesToListen, listener);
    }

    onAny(listener: (event: string | string[], ...data: any[]) => void) {
        this.#events.onAny(listener);
    }

    prependAny(listener: (event: string | string[], ...data: any[]) => void) {
        this.#events.prependAny(listener);
    }

    offAny(listener: (event: string | string[], ...data: any[]) => void) {
        this.#events.offAny(listener);
    }

    removeListener(event: string | string[], listener: (...data: any[]) => void) {
        this.#events.removeListener(event, listener);
    }

    off(event: string | string[], listener: (...data: any[]) => void) {
        this.#events.removeListener(event, listener);
    }

    removeAllListeners(event?: string | string[]) {
        this.#events.removeAllListeners(event);
    }

    setMaxListeners(amount: number) {
        this.#events.setMaxListeners(amount);
    }

    getMaxListeners() {
        return this.#events.getMaxListeners();
    }

    eventNames(nsAsArray?: boolean) {
        return this.#events.eventNames(nsAsArray);
    }

    listenerCount(event: string | string[]) {
        return this.#events.listenerCount(event);
    }

    listeners(event: string | string[]) {
        return this.#events.listeners(event);
    }

    listenersAny() {
        return this.#events.listenersAny();
    }

    waitFor(event: string | string[], timeout?: number): CancelablePromise<any[]>;
    waitFor(event: string | string[], filter?: WaitForFilter): CancelablePromise<any[]>;
    waitFor(event: string | string[], options?: WaitForOptions): CancelablePromise<any[]>;
    waitFor(event: string | string[], options: any) {
        return this.#events.waitFor(event, options);
    }

    listenTo(target: GeneralEventEmitter, events: string | string[], options?: ListenToOptions): EventEmitter2;
    listenTo(target: GeneralEventEmitter, events: Record<string, string>, options?: ListenToOptions): EventEmitter2;
    listenTo(target: GeneralEventEmitter, events: any, options?: ListenToOptions) {
        return this.#events.listenTo(target, events, options);
    }

    stopListeningTo(target: GeneralEventEmitter, event?: string | string[]) {
        return this.#events.stopListeningTo(target, event);
    }

    hasListeners(event: string | string[]) {
        // @ts-expect-error EventEmitter2's type is wrong
        return this.#events.hasListeners(event);
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

Object.freeze(NetApi);
Object.freeze(NetApi.prototype);
export default NetApi;
