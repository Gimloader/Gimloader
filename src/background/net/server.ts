import type { Messages, OnceMessageProps, OnceMessages, OnceResponder } from "$types/net/messages";
import { log, nop } from "$shared/utils";
import StateManager from "$shared/state";

type Port = chrome.runtime.Port;

interface Message {
    type: keyof Messages | keyof OnceMessages;
    message: any;
    returnId?: string;
}

type MessageCallback<Channel extends OnceMessages["channel"]> = (
    message: OnceMessageProps<Channel>,
    respond: OnceResponder<Channel>
) => void | Promise<void>;

export default new class Server {
    open = new Set<Port>();
    messageListeners = new Map<string, MessageCallback<any>>();

    init() {
        chrome.runtime.onConnectExternal.addListener(this.onConnect.bind(this));
        chrome.runtime.onConnect.addListener(this.onConnect.bind(this));

        // these are only used to keep the worker alive
        chrome.runtime.onMessageExternal.addListener(nop);
        chrome.runtime.onMessage.addListener(nop);
    }

    onConnect(port: Port) {
        this.open.add(port);
        port.onDisconnect.addListener(() => {
            chrome.runtime.lastError; // suppress error messages
            this.open.delete(port);
        });

        port.postMessage(StateManager.getState());

        port.onMessage.addListener((message) => {
            this.onPortMessage(port, message);
        });
    }

    onPortMessage(port: Port, msg: Message) {
        log("Recieved message", msg);
        const { type, message, returnId } = msg;

        if(returnId) {
            // message with a response (not done with .sendMessage to avoid race conditions)
            const callback = this.messageListeners.get(type);
            if(!callback) return;

            callback(message, (response: any) => {
                port.postMessage({ returnId, response });
            });
        } else {
            // no reply expected, just a state update
            StateManager.handle(type, message, true);

            // send the message to other connected ports
            for(const openPort of this.open) {
                if(openPort === port) continue;
                openPort.postMessage(msg);
            }
        }
    }

    onMessage<Channel extends OnceMessages["channel"]>(type: Channel, callback: MessageCallback<Channel>) {
        this.messageListeners.set(type, callback);
    }

    send<Channel extends Messages["type"]>(type: Channel, message: Extract<Messages, { type: Channel }>["props"]) {
        for(const port of this.open) {
            port.postMessage({ type, message });
        }
    }
}();
