import type { Settings } from "$types/state";

export const isFirefox = navigator.userAgent.includes("Firefox");

export const algorithm: HmacKeyGenParams = {
    name: "HMAC",
    hash: { name: "SHA-512" }
};

export const defaultSettings: Settings = {
    pollerEnabled: false,
    autoUpdate: true,
    autoDownloadMissingLibs: true,
    menuView: 'grid',
    showPluginButtons: true
}

export const flipDurationMs = 300;