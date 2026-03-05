import type { State } from "$types/net/state";
import EventEmitter2 from "eventemitter2";
import { algorithm, isFirefox } from "../consts";
import type { Messages, OnceMessages, OnceResponses, StateMessages } from "$types/net/messages";
import { log } from "$shared/utils";

const extensionId = "ngbhofnofkggjbpkpnogcdfdgjkpmgka";
type StateCallback = (state: State) => void;

export default new class Port extends EventEmitter2 {
    port: chrome.runtime.Port;
    firstMessage = true;
    firstState = true;
    firstCallback: StateCallback;
    subsequentCallback?: StateCallback;
    disconnected = $state(false);
    pendingMessages = new Map<string, (response?: any) => void>();
    runtime: typeof chrome.runtime;
    signKeyRes: (key: CryptoKey) => void;
    signKey = new Promise<CryptoKey>((res) => this.signKeyRes = res);
    name?: string;

    init(callback: StateCallback, subsequentCallback?: StateCallback, name?: string) {
        this.firstCallback = callback;
        this.subsequentCallback = subsequentCallback;
        this.name = name;

        if(typeof chrome === "undefined") {
            window.addEventListener("message", (e) => {
                if(e.data?.source !== "gimloader-in") return;
                if(e.data?.type === "portDisconnected") {
                    this.firstMessage = true;
                    this.disconnected = true;
                    return;
                }

                this.onMessage(e.data);
            });

            window.postMessage({ source: "gimloader-out", json: '{"type": "ready"}' });
        } else {
            if(!isFirefox && !chrome.runtime) return;
            this.runtime = chrome.runtime;

            if(location.hostname === "www.gimkit.com") {
                // @ts-expect-error prevent scripts from using the apis
                chrome.runtime = {};
            }

            this.connectPort();
            this.keepBackgroundAlive();
        }
    }

    connectPort() {
        this.firstMessage = true;

        if(isFirefox) {
            this.port = this.runtime.connect({ name: this.name });
        } else {
            this.port = this.runtime.connect(extensionId, { name: this.name });
        }

        this.port.onMessage.addListener(this.onMessage.bind(this));

        this.port.onDisconnect.addListener(() => {
            log("Port disconnected, reconnecting...");
            this.disconnected = true;

            if(this.runtime.lastError) {
                // extension is likely removed entirely (if reinstalled we can reconnect)
                setTimeout(() => this.connectPort(), 1000);
            } else {
                this.connectPort();
            }
        });
    }

    async postMessage(type: string, message: any, returnId?: string) {
        // just discard messages sent while disconnected, we'll resynchronize to before they mattered
        if(this.disconnected) return;

        if(typeof chrome !== "undefined") {
            this.port.postMessage({ type, message, returnId, source: "gimloader-out" });
            return;
        }

        // disclaimer: I know nothing about cryptography
        const str = JSON.stringify({ type, message, returnId });

        // generate a signature for the json
        const arr = new TextEncoder().encode(str);
        const key = await this.signKey;
        const signed = await crypto.subtle.sign(algorithm, key, arr);
        const signature = Array.from(new Uint8Array(signed));

        window.postMessage({ json: str, signature, source: "gimloader-out" });
    }

    onMessage(data: any) {
        this.disconnected = false;

        if(data?.type === "key") {
            crypto.subtle.importKey("jwk", data.key, algorithm, true, ["sign", "verify"])
                .then((key) => this.signKeyRes(key));
            return;
        }

        // the first message will contain the state, others will contain updates to it
        if(this.firstMessage) {
            if(this.firstState) {
                this.firstState = false;
                this.firstCallback(data);
            } else {
                this.subsequentCallback?.(data);
            }

            this.firstMessage = false;
            return;
        }

        if(data.returnId) {
            const { response, returnId } = data;
            const callback = this.pendingMessages.get(returnId);
            if(!callback) return;

            callback(response);
            this.pendingMessages.delete(returnId);
        } else {
            this.emit(data.type, data.message);
        }
    }

    send<Channel extends keyof StateMessages>(type: Channel, message: StateMessages[Channel] = undefined) {
        this.postMessage(type, message);
    }

    sendAndRecieve<Channel extends keyof OnceMessages>(type: Channel, message: OnceMessages[Channel] = undefined) {
        return new Promise<OnceResponses[Channel]>((res) => {
            const returnId = crypto.randomUUID();
            this.pendingMessages.set(returnId, res);
            this.postMessage(type, message, returnId);
        });
    }

    keepBackgroundAlive() {
        // send a message every 20 seconds
        setInterval(() => {
            if(isFirefox) {
                this.runtime.sendMessage("ping");
            } else {
                this.runtime.sendMessage(extensionId, "ping");
            }
        }, 20000);
    }

    // add types for emit and on, the others aren't used
    emit<Channel extends keyof StateMessages>(channel: Channel, value: StateMessages[Channel]) {
        return super.emit(channel, value);
    }

    on<Channel extends keyof Messages>(channel: Channel, callback: (value: Messages[Channel]) => void) {
        return super.on(channel, callback);
    }
}();
