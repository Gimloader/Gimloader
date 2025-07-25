import Internals from "$core/internals";
import EventEmitter from "eventemitter2";
import { log, splicer } from "$content/utils";
import Patcher from "../patcher";
import LibManager from "$core/scripts/libManager.svelte";
import { formatDownloadUrl } from "$shared/net";
import Rewriter from "../rewriter";

interface BlueboatConnection {
    type: "Blueboat";
    room: any;
}

interface ColyseusConnection {
    type: "Colyseus";
    room: any;
}

interface NoConnection {
    type: "None";
    room: null;
}

export type Connection = BlueboatConnection | ColyseusConnection | NoConnection;

interface LoadCallback {
    callback: (type: Connection["type"]) => void;
    id: string;
}

export default new class Net extends EventEmitter {
    type: Connection["type"] = "None";
    room: Connection["room"] = null;
    loaded = false;
    loadCallbacks: LoadCallback[] = [];

    constructor() {
        super({
            wildcard: true,
            delimiter: ':'
        });
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

        Internals.events.once("stores", () => {
            this.waitForColyseusLoad();
        });
    }

    onColyseusRoom(room: any) {
        if(this.room) return;
        log("Colyseus room intercepted", room);

        this.type = 'Colyseus';
        this.room = room;
        
        // intercept outgoing messages
        Patcher.before(null, room, "send", (_, args) => {
            let [ channel, data ] = args;
            this.emit(['send', channel], data, (newData: any) => { args[1] = newData });

            if(args[1] === null) return true;
        });

        // intercept incoming messages
        Patcher.before(null, room, "dispatchMessage", (_, args) => {
            let [ channel, data ] = args;
            this.emit(channel, data, (newData: any) => { args[1] = newData });

            if(args[1] === null) return true;
        });
    }

    onBlueboatRoom(room: any) {
        if(this.room) return;
        log('Blueboat room intercepted', room);

        this.room = room;
        this.type = 'Blueboat';
        this.emit('load:blueboat');
        this.onLoad("Blueboat");

        // intercept incoming messages
        Patcher.before(null, room.onMessage, "call", (_, args) => {
            let [ channel, data ] = args;
            this.emit(channel, data, (newData: any) => { args[1] = newData });

            if(args[1] === null) return true;
        });

        // intercept outgoing messages
        Patcher.before(null, room, "send", (_, args) => {
            let [ channel, data ] = args;
            this.emit(['send', channel], data, (newData: any) => { args[1] = newData });

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

        let title: string = message.title, description: string = message.description,
            initial: boolean = loading.completedInitialLoad,
            terrain: boolean = loading.loadedInitialTerrain,
            devices: boolean = loading.loadedInitialDevices,
            placement: boolean = me.completedInitialPlacement;

        let stopObservers: (() => void)[] = [];
        const check = () => {
            if(title || description || !initial || !terrain || !devices || !placement) return;
            for(let stop of stopObservers) stop();

            this.emit('load:colyseus');
            this.onLoad("Colyseus");
        }

        // observe the values and re-check if they change
        stopObservers.push(
            mobxMsg.values_.get("title").observe_((a: any) => { title = a.newValue; check() }),
            mobxMsg.values_.get("description").observe_((a: any) => { description = a.newValue; check() }),
            mobxLoading.values_.get("completedInitialLoad").observe_((a: any) => { initial = a.newValue; check() }),
            mobxLoading.values_.get("loadedInitialTerrain").observe_((a: any) => { terrain = a.newValue; check() }),
            mobxLoading.values_.get("loadedInitialDevices").observe_((a: any) => { devices = a.newValue; check() }),
            mobxMe.values_.get("completedInitialPlacement").observe_((a: any) => { placement = a.newValue; check() })
        );

        check();
    }

    send(channel: string, message: any) {
        if(this.room.type !== "None") {
            this.room.send(channel, message);
        }
    }

    downloadLibrary(url: string) {
        return new Promise<void>(async (res, rej) => {
            let resp = await fetch(formatDownloadUrl(url))
                .catch(() => rej(`Failed to download library from ${url}`));
            if(!resp) return;
            
            if(resp.status !== 200) {
                rej(`Failed to download library from ${url}\nRecieved response status of ${resp.status}`);
                return;
            }

            let text = await resp.text();
            LibManager.createLib(text);
            res();
        })
    }

    onLoad(type: Connection["type"]) {
        this.loaded = true;

        for(let { callback } of this.loadCallbacks) {
            try {
                callback(type);
            } catch(e) {
                console.error(e);
            }
        }
    }

    pluginOnLoad(id: string, callback: (type: Connection["type"]) => void) {
        if(this.loaded) {
            callback(this.type);
            return () => {};
        }

        let obj = {
            callback,
            id
        };
        
        this.loadCallbacks.push(obj);
        return splicer(this.loadCallbacks, obj);
    }

    pluginOffLoad(id: string) {
        for(let i = 0; i < this.loadCallbacks.length; i++) {
            if(this.loadCallbacks[i].id === id) {
                this.loadCallbacks.splice(i, 1);
                i--;
            }
        }
    }

    get isHost() {
        return location.pathname === "/host";
    }
}