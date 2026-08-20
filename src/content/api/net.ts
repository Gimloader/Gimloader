import type { Schema } from "$types/schema";
import type { ReceivedMessages, SentMessages } from "$types/net";
import Net, { type ConnectionType, type RequesterOptions } from "$core/net/net";
import { validate } from "$content/utils";
import EventEmitter2 from "eventemitter2";
import * as z from "zod";
import Cleanup from "$core/scripts/cleanup";

const GamemodeSchema = z.union([z.string(), z.array(z.string())]);

type TaggedSentMessages = {
    [K in keyof SentMessages as `send:${K}`]: SentMessages[K];
};

type EventData<C extends string> = C extends keyof ReceivedMessages ? ReceivedMessages[C]
    : C extends keyof TaggedSentMessages ? TaggedSentMessages[C]
    : any;

type AllEvents = TaggedSentMessages & ReceivedMessages;

type EditFN<T> = (newValue: T | null) => void;

type EventTuple = {
    [K in keyof AllEvents]: [channel: K, data: AllEvents[K], editFn: EditFN<AllEvents[K]>];
}[keyof AllEvents];

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
class NetApi extends EventEmitter2 {
    readonly #id: string;
    readonly #defaultGamemode: string[];

    constructor(id: string, defaultGamemode: string[]) {
        super({
            wildcard: true,
            delimiter: ":"
        });

        this.#id = id;
        this.#defaultGamemode = defaultGamemode;

        const emit = this.emit.bind(this);
        Net.onAny(emit);

        Cleanup.on(id, (final) => {
            if(final) Net.offAny(emit);
            this.removeAllListeners();

            // @ts-expect-error The type is wrong, this clears onAny listeners
            this.offAny();
        });
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
    send<C extends keyof SentMessages>(channel: C, ...args: SentMessages[C] extends undefined ? [] : [data: SentMessages[C]]) {
        validate("net.send", arguments, ["channel", "string"]);

        Net.send(channel, args[0]);
    }

    override on<C extends string>(channel: C, listener: (data: EventData<C>, editFn: EditFN<EventData<C>>) => void) {
        return super.on(channel, listener);
    }

    override onAny(listener: (...args: EventTuple) => void) {
        // @ts-expect-error It works, source: trust me
        return super.onAny(listener);
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
