import { portCryptoAlgorithm } from "$shared/consts";

let port: chrome.runtime.Port;
let disconnected = false;
let ready = false;
let messageQueue: any[] = [];

const keyPromise = crypto.subtle.generateKey(portCryptoAlgorithm, true, ["sign", "verify"]);

window.addEventListener("message", async (e) => {
    if(!e.data?.json || e.data?.source !== "gimloader-out") return;

    const data = JSON.parse(e.data.json);
    if(!data.type) return;

    const key = await keyPromise;
    if(data.type === "ready") {
        const json = await crypto.subtle.exportKey("jwk", key);
        messageQueue.unshift({ source: "gimloader-in", type: "key", key: json });

        ready = true;
        for(const message of messageQueue) {
            window.postMessage(message);
        }
        messageQueue = [];
        return;
    }

    if(disconnected) return;

    // verify that the signature checks out
    const signatureArr: number[] = e.data.signature;
    if(!signatureArr) return;
    const arr = new TextEncoder().encode(e.data.json);
    const signature = new Uint8Array(signatureArr).buffer;
    const matches = await crypto.subtle.verify(portCryptoAlgorithm, key, signature, arr);
    if(!matches) return;

    port.postMessage(data);
});

// remind firefox that we're still alive every 20 seconds so it doesn't kill the background script
setInterval(() => {
    chrome.runtime.sendMessage("ping");
}, 20000);

connect();

function connect() {
    port = chrome.runtime.connect();

    port.onDisconnect.addListener(() => {
        disconnected = true;
        window.postMessage({ source: "gimloader-in", type: "portDisconnected" });

        if(chrome.runtime.lastError) {
            // this probably will never come up since I think firefox
            // straight up nukes the content script when the extension is disabled/reloaded
            // but hey better safe than sorry
            setTimeout(() => connect(), 1000);
        } else {
            connect();
        }
    });

    port.onMessage.addListener((e) => {
        disconnected = false;
        const message = { ...e, source: "gimloader-in" };
        if(ready) {
            window.postMessage(message);
        } else {
            messageQueue.push(message);
        }
    });
}
