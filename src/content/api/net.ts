import type { Schema } from "$types/schema";
import type { ReceivedMessages1d, ReceivedMessages2d, SentMessages1d, SentMessages2d } from "$types/net";
import type { ConnectionType, EditableEmitter, Listener, OnAnyListener, RequesterOptions } from "$core/net/net";
import Net from "$core/net/net";
import { validate } from "$content/utils";
import * as z from "zod";
import Cleanup from "$core/scripts/cleanup";

const GamemodeSchema = z.union([z.string(), z.array(z.string())]);

type TaggedSentMessages2d = {
    [K in keyof SentMessages2d as `send:${K}`]: SentMessages2d[K];
};

type TaggedSentMessages1d = {
    [K in keyof SentMessages1d as `send:${K}`]: SentMessages1d[K];
};

type Messages2d = ReceivedMessages2d & TaggedSentMessages2d;
type Messages1d = ReceivedMessages1d & TaggedSentMessages1d;

abstract class NetTypeApi<Send extends Record<string, any>> {
    #id: string;
    #emitter: EditableEmitter;

    constructor(id: string, emitter: EditableEmitter) {
        this.#id = id;
        this.#emitter = emitter;
    }

    /** Listens for an incoming or outgoing message on a specific channel */
    on<C extends keyof Send>(channel: C, listener: Listener<Send[C]>) {
        this.#emitter.on(channel, listener);
        Cleanup.on(this.#id, () => this.#emitter.off(channel, listener));
    }

    /** Listens for the next incoming or outgoing message on a specific channel */
    once<C extends keyof Send>(channel: C, listener: Listener<Send[C]>) {
        const cleanup = () => this.#emitter.off(channel, listener);

        this.#emitter.once(channel, (data, editFn) => {
            Cleanup.off(this.#id, cleanup);
            listener(data, editFn);
        });

        Cleanup.on(this.#id, cleanup);
    }

    /** Removes a listener added by on or once */
    off<C extends keyof Send>(channel: C, listener: Listener<Send[C]>) {
        this.#emitter.off(channel, listener);
    }

    /** Listens for any messages on any channel */
    onAny(listener: OnAnyListener) {
        this.#emitter.onAny(listener);
        Cleanup.on(this.#id, () => this.#emitter.offAny(listener));
    }

    /** Removes a listener added by onAny */
    offAny(listener: OnAnyListener) {
        this.#emitter.offAny(listener);
    }
}

/**
 * The colyseus api is for sending and recieving data in 2d modes.
 * ```js
 * // fired when data is recieved on a certain channel
 * api.net.colyseus.on("CHANNEL", (data, editFn) => {
 *     editFn("new data"); // Replace the data with "new data" before Gimkit processes it
 * });
 *
 * // fired when data is sent on a certain channel
 * api.net.colyseus.on("send:CHANNEL", (data, editFn) => {
 *     editFn(null); // Cancel the data being sent
 * });
 * ```
 */
export class ColyseusApi extends NetTypeApi<Messages2d> {
    constructor(id: string) {
        super(id, Net.colyseusEvents);
    }

    /** Sends a message to the server on a specific channel */
    send<C extends keyof SentMessages2d>(channel: C, ...args: SentMessages2d[C] extends undefined ? [] : [data: SentMessages2d[C]]) {
        validate("net.colyseus.send", arguments, ["channel", "string"]);

        Net.send(channel, args[0]);
    }

    /** Sends a message to the server on a specific channel, bypassing listeners added by plugins */
    sendDirect<C extends keyof SentMessages2d>(channel: C, ...args: SentMessages2d[C] extends undefined ? [] : [data: SentMessages2d[C]]) {
        validate("net.colyseus.send", arguments, ["channel", "string"]);

        Net.sendDirect(channel, args[0]);
    }

    /** The colyseus room that the client is connected to, or null if there is no connection */
    get room() {
        if(Net.type !== "Colyseus") return null;
        return Net.room;
    }

    /** Gimkit's internal Colyseus state */
    get state(): Schema.GimkitSchema {
        // We pretend that this is always defined for ease of use
        if(Net.type !== "Colyseus") return undefined as any;
        return Net.room?.state;
    }
}

/**
 * The colyseus api is for sending and recieving data in non-2d (classic) modes.
 * ```js
 * // fired when data is recieved on a certain channel
 * api.net.blueboat.on("CHANNEL", (data, editFn) => {
 *     editFn("new data"); // Replace the data with "new data" before Gimkit processes it
 * });
 *
 * // fired when data is sent on a certain channel
 * api.net.blueboat.on("send:CHANNEL", (data, editFn) => {
 *     editFn(null); // Cancel the data being sent
 * });
 * ```
 */
export class BlueboatApi extends NetTypeApi<Messages1d> {
    constructor(id: string) {
        super(id, Net.blueboatEvents);
    }

    /** Sends a message to the server on a specific channel */
    send<C extends keyof SentMessages1d>(channel: C, ...args: SentMessages1d[C] extends undefined ? [] : [data: SentMessages1d[C]]) {
        validate("net.blueboat.send", arguments, ["channel", "string"]);

        Net.send(channel, args[0]);
    }

    /** Sends a message to the server on a specific channel, bypassing listeners added by plugins */
    sendDirect<C extends keyof SentMessages1d>(channel: C, ...args: SentMessages1d[C] extends undefined ? [] : [data: SentMessages1d[C]]) {
        validate("net.blueboat.send", arguments, ["channel", "string"]);

        Net.send(channel, args[0]);
    }

    /** The blueboat room that the client is connected to, or null if there is no connection */
    get room() {
        if(Net.type !== "Blueboat") return null;
        return Net.room;
    }
}

/** Functions to interact with the current connection to the server */
class NetApi {
    readonly #id: string;
    readonly #defaultGamemode: string[];

    /** Tools for sending and receiving data and interacting with state in 2d modes */
    colyseus: ColyseusApi;
    /** Tools for sending and receiving data in non-2d modes */
    blueboat: BlueboatApi;

    constructor(id: string, defaultGamemode: string[]) {
        this.#id = id;
        this.#defaultGamemode = defaultGamemode;
        this.colyseus = new ColyseusApi(id);
        this.blueboat = new BlueboatApi(id);
    }

    /** Which type of server the client is currently connected to */
    get type() {
        return Net.type;
    }

    /** The id of the gamemode the player is currently playing */
    get gamemode() {
        return Net.gamemode;
    }

    /**
     * The room that the client is connected to, or null if there is no connection
     * @deprecated use `net.blueboat.room` or `net.colyseus.room` instead
     * @hidden
     */
    get room() {
        return Net.room;
    }

    /**
     * Gimkit's internal Colyseus state
     * @deprecated use `net.colyseus.state` instead
     * @hidden
     */
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

    /**
     * Sends a message to the server on a specific channel
     * @deprecated use `net.blueboat.send` or `net.colyseus.send` instead
     * @hidden
     */
    send(channel: string, message?: any) {
        validate("net.send", arguments, ["channel", "string"]);

        Net.send(channel, message);
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
