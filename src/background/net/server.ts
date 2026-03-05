import type { Messages, OnceMessages, OnceResponses } from "$types/net/messages";
import type { State } from "$types/net/state";
import HotkeysHandler from "$bg/messageHandlers/hotkeys";
import JsCacheHandler from "$bg/messageHandlers/jsCache";
import LibrariesHandler from "$bg/messageHandlers/library";
import PluginsHandler from "$bg/messageHandlers/plugin";
import SettingsHandler from "$bg/messageHandlers/settings";
import StorageHandler from "$bg/messageHandlers/storage";
import MiscHandler from "$bg/messageHandlers/misc";
import { statePromise } from "$bg/state";
import { nop } from "$shared/utils";

type Port = chrome.runtime.Port;

interface Message {
    type: keyof Messages | keyof OnceMessages;
    message: any;
    returnId?: string;
}

type UpdateCallback<Channel extends keyof Messages> = (state: State, message: Messages[Channel]) => true | void | Promise<true | void>;
type MessageCallback<Channel extends keyof OnceMessages> = (state: State, message: OnceMessages[Channel], respond: (response?: OnceResponses[Channel]) => void) => void | Promise<void>;

export default new class Server {
    open = new Set<Port>();
    listeners = new Map<string, UpdateCallback<any>>();
    messageListeners = new Map<string, MessageCallback<any>>();

    init() {
        chrome.runtime.onConnectExternal.addListener(this.onConnect.bind(this));
        chrome.runtime.onConnect.addListener(this.onConnect.bind(this));

        // these are only used to keep the worker alive
        chrome.runtime.onMessageExternal.addListener(nop);
        chrome.runtime.onMessage.addListener(nop);

        HotkeysHandler.init();
        LibrariesHandler.init();
        PluginsHandler.init();
        StorageHandler.init();
        SettingsHandler.init();
        JsCacheHandler.init();
        MiscHandler.init();
    }

    onConnect(port: Port) {
        this.open.add(port);
        port.onDisconnect.addListener(() => {
            chrome.runtime.lastError; // suppress error messages
            this.open.delete(port);
        });

        statePromise.then((state) => port.postMessage(state));

        port.onMessage.addListener((message) => {
            this.onPortMessage(port, message);
        });
    }

    async onPortMessage(port: Port, msg: Message) {
        const { type, message, returnId } = msg;

        if(returnId) {
            // message with a response (not done with .sendMessage to avoid race conditions)
            const callback = this.messageListeners.get(type);
            if(!callback) return;

            callback(await statePromise, message, (response?: void) => {
                port.postMessage({ returnId, response });
            });
        } else {
            // no reply expected, just a state update
            const callback = this.listeners.get(type);
            if(!callback) return;

            const cancelled = await callback(await statePromise, message);
            if(cancelled === true) return;

            // send the message to other connected ports
            for(const openPort of this.open) {
                if(openPort === port) continue;
                openPort.postMessage(msg);
            }
        }
    }

    on<Channel extends keyof Messages>(type: Channel, callback: UpdateCallback<Channel>) {
        this.listeners.set(type, callback);
    }

    onMessage<Channel extends keyof OnceMessages>(type: Channel, callback: MessageCallback<Channel>) {
        this.messageListeners.set(type, callback);
    }

    send<Channel extends keyof Messages>(type: Channel, message: Messages[Channel]) {
        for(const port of this.open) {
            port.postMessage({ type, message });
        }
    }

    async executeAndSend<Channel extends keyof Messages>(type: Channel, message: Messages[Channel]) {
        const callback = this.listeners.get(type);
        if(!callback) return;

        const cancelled = await callback(await statePromise, message);
        if(cancelled === true) return;

        for(const port of this.open) {
            port.postMessage({ type, message });
        }
    }

    async trigger<Channel extends keyof OnceMessages>(type: Channel, message: OnceMessages[Channel]) {
        const listener = this.messageListeners.get(type);
        if(!listener) return;

        await listener(await statePromise, message, nop);
    }
}();
