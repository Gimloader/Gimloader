import Internals from "$core/internals";
import EventEmitter2 from "eventemitter2";
import { clearId, splicer } from "$content/utils";
import { error, nop } from "$shared/utils";
import { log } from "$shared/utils";
import Patcher from "../patcher";
import Rewriter from "../rewriter";
import wildcardMatch from "wildcard-match";
import { gameState } from "$content/stores";

export type ConnectionType = "None" | "Colyseus" | "Blueboat";

interface LoadCallback {
    callback: (type: ConnectionType, gamemode: string) => void;
    id: string;
    gamemodes: string[];
}

export interface RequesterOptions {
    url: string;
    method?: string;
    data?: any;
    cacheKey?: string;
    success?: (response: any, cached: boolean) => void;
    both?: () => void;
    error?: (error: any) => void;
}

type Requester = (options: RequesterOptions) => void;

interface RequestCallback {
    id: string | null;
    match: (url: string) => boolean;
    callback: (options: RequesterOptions) => any;
}

interface ResponseCallback {
    id: string | null;
    match: (url: string) => boolean;
    callback: (response: any, url: string) => any;
}

export default new class Net extends EventEmitter2 {
    type: ConnectionType = "None";
    room: any = null;
    loaded = false;
    loadCallbacks: LoadCallback[] = [];
    requestCallbacks: RequestCallback[] = [];
    responseCallbacks: ResponseCallback[] = [];
    gamemode: string | null = null;

    constructor() {
        super({
            wildcard: true,
            delimiter: ":"
        });
    }

    get isHost() {
        return location.pathname === "/host";
    }

    init() {
        Rewriter.exposeObjectBefore("index", "netClient", ".Client=", (mod) => {
            const proto = mod.Client.prototype;
            if(proto.joinById) {
                // Colyseus
                Patcher.after(null, proto, "create", (_, __, roomPromise) => {
                    roomPromise.then((room: any) => this.onColyseusRoom(room));
                });

                Patcher.after(null, proto, "joinById", (_, __, roomPromise) => {
                    roomPromise.then((room: any) => this.onColyseusRoom(room));
                });
            } else {
                // Blueboat
                Patcher.after(null, proto, "createRoom", (_, __, room) => {
                    this.onBlueboatRoom(room);
                });

                Patcher.after(null, proto, "joinRoom", (_, __, room) => {
                    this.onBlueboatRoom(room);
                });
            }
        });

        const wrapRequester = Rewriter.createShared(null, "wrapRequester", (requester: Requester) => {
            const requestCallbacks = this.requestCallbacks;
            const responseCallbacks = this.responseCallbacks;

            return (options: RequesterOptions) => {
                for(const callback of requestCallbacks) {
                    if(!callback.match(options.url)) continue;
                    const result = callback.callback(options);

                    if(result === null) return;
                    if(result) options = result;
                }

                const originalSuccess = options.success;
                options.success = (data: any, cached: boolean) => {
                    for(const callback of responseCallbacks) {
                        if(!callback.match(options.url)) continue;

                        const result = callback.callback(data, options.url);
                        if(result !== undefined) data = result;
                    }

                    originalSuccess?.(data, cached);
                };

                return requester(options);
            };
        });

        Rewriter.addParseHook(null, true, (code) => {
            const index = code.indexOf("JSON.stringify({url");
            if(index === -1) return code;

            const start = code.indexOf("=", code.lastIndexOf(",", index)) + 1;
            const end = code.indexOf("})}})}", index) + 6;
            const func = code.slice(start, end);

            code = code.slice(0, start) + `${wrapRequester}(${func});` + code.slice(end);
            return code;
        });

        Internals.events.once("stores", () => {
            this.waitForColyseusLoad();
        });
    }

    modifyFetchRequest(id: string | null, path: string, callback: RequestCallback["callback"]) {
        return splicer(this.requestCallbacks, {
            id,
            match: wildcardMatch(path),
            callback
        });
    }

    modifyFetchResponse(id: string | null, path: string, callback: ResponseCallback["callback"]) {
        return splicer(this.responseCallbacks, {
            id,
            match: wildcardMatch(path),
            callback
        });
    }

    onColyseusRoom(room: any) {
        if(this.room) return;
        log("Colyseus room intercepted", room);

        this.type = "Colyseus";
        this.room = room;
        gameState.inGame = true;

        // intercept outgoing messages
        Patcher.before(null, room, "send", (_, args) => {
            const [channel, data] = args;
            this.emit(["send", channel], data, (newData: any) => {
                args[1] = newData;
            });

            if(args[1] === null) return true;
        });

        // intercept incoming messages
        Patcher.before(null, room, "dispatchMessage", (_, args) => {
            const [channel, data] = args;
            this.emit(channel, data, (newData: any) => {
                args[1] = newData;
            });

            if(args[1] === null) return true;
        });
    }

    onBlueboatRoom(room: any) {
        if(this.room) return;
        log("Blueboat room intercepted", room);

        this.room = room;
        this.type = "Blueboat";
        gameState.inGame = true;

        // intercept incoming messages
        Patcher.before(null, room.onMessage, "call", (_, args) => {
            const [channel, data] = args;
            this.emit(channel, data, (newData: any) => {
                args[1] = newData;
            });

            // Check if the message is the message with the gamemode type
            if(channel === "HOST_STATIC_STATE" || channel === "PLAYER_JOINS_STATIC_STATE") {
                let gamemodeId = "unknown";
                if(channel === "HOST_STATIC_STATE") gamemodeId = data?.options?.specialGameType?.[0];
                else gamemodeId = data?.gameOptions?.specialGameType?.[0];

                this.emit("load:blueboat");
                this.onLoad("Blueboat", gamemodeId ?? "unknown", "1d", "official");
            }

            if(args[1] === null) return true;
        });

        // intercept outgoing messages
        Patcher.before(null, room, "send", (_, args) => {
            const [channel, data] = args;
            this.emit(["send", channel], data, (newData: any) => {
                args[1] = newData;
            });

            if(args[1] === null) return true;
        });
    }

    waitForColyseusLoad() {
        const message = Internals.stores.me.nonDismissMessage;
        const loading = Internals.stores.loading;
        const me = Internals.stores.me;

        const mobxMsg = message[Object.getOwnPropertySymbols(message)[0]];
        const mobxLoading = loading[Object.getOwnPropertySymbols(loading)[0]];
        const mobxMe = me[Object.getOwnPropertySymbols(me)[0]];

        let title: string = message.title,
            description: string = message.description,
            initial: boolean = loading.completedInitialLoad,
            terrain: boolean = loading.loadedInitialTerrain,
            devices: boolean = loading.loadedInitialDevices,
            placement: boolean = me.completedInitialPlacement;

        const stopObservers: (() => void)[] = [];
        const check = () => {
            if(title || description || !initial || !terrain || !devices || !placement) return;
            for(const stop of stopObservers) stop();

            // Get the current gamemode
            let gamemodeId = "unknown";
            let officialGamemode = false;
            try {
                const options = JSON.parse(Internals.stores.world.mapOptionsJSON);
                const gamemode = this.gamemodeFromUrl(options.musicUrl);

                if(gamemode) {
                    gamemodeId = gamemode;
                    officialGamemode = true;
                } else if(Internals.stores.session.version === "saved") {
                    gamemodeId = "creative";
                }
            } catch (e) {
                error("Failed to determine gamemode from map options", e);
            }

            // Emit load events
            this.emit("load:colyseus");
            this.onLoad("Colyseus", gamemodeId, "2d", ...(officialGamemode ? ["official", "official-2d"] : []));
        };

        // observe the values and re-check if they change
        stopObservers.push(
            mobxMsg.values_.get("title").observe_((a: any) => {
                title = a.newValue;
                check();
            }),
            mobxMsg.values_.get("description").observe_((a: any) => {
                description = a.newValue;
                check();
            }),
            mobxLoading.values_.get("completedInitialLoad").observe_((a: any) => {
                initial = a.newValue;
                check();
            }),
            mobxLoading.values_.get("loadedInitialTerrain").observe_((a: any) => {
                terrain = a.newValue;
                check();
            }),
            mobxLoading.values_.get("loadedInitialDevices").observe_((a: any) => {
                devices = a.newValue;
                check();
            }),
            mobxMe.values_.get("completedInitialPlacement").observe_((a: any) => {
                placement = a.newValue;
                check();
            })
        );

        check();
    }

    gamemodeFromUrl(url: string) {
        const parts = url.split("/");
        for(let i = parts.length - 1; i >= 0; i--) {
            const part = parts[i].toLowerCase();
            if(part.includes(".") || part.includes("sound") || part.includes("music")) continue;
            return part;
        }
    }

    send(channel: string, message?: any) {
        this.room?.send(channel, message);
    }

    onLoad(type: ConnectionType, gamemode: string, ...otherTriggers: string[]) {
        this.loaded = true;
        this.gamemode = gamemode.toLowerCase();

        log(`Gamemode detected: ${this.gamemode}`);

        const triggers = [this.gamemode, ...otherTriggers, "*"];
        for(const { callback, gamemodes } of this.loadCallbacks) {
            // Check if the callback isn't for this gamemode
            if(gamemodes.length > 0 && !gamemodes.some(g => triggers.includes(g))) continue;

            try {
                callback(type, this.gamemode);
            } catch (e) {
                console.error(e);
            }
        }
    }

    pluginOnLoad(id: string, callback: (type: ConnectionType, gamemode: string) => void, gamemode: string | ReadonlyArray<string> = []) {
        if(typeof gamemode === "string") gamemode = [gamemode];

        if(this.loaded) {
            callback(this.type, this.gamemode);
            return nop;
        }

        const obj = {
            callback,
            id,
            gamemodes: gamemode.map(g => g.toLowerCase())
        };

        return splicer(this.loadCallbacks, obj);
    }

    pluginOffLoad(id: string) {
        clearId(this.loadCallbacks, id);
    }
    stopModifyRequest(id: string) {
        clearId(this.requestCallbacks, id);
    }
    stopModifyResponse(id: string) {
        clearId(this.responseCallbacks, id);
    }
}();
