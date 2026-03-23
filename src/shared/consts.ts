import type { Settings } from "$types/net/state";

export const isFirefox = navigator.userAgent.includes("Firefox");

export const algorithm: HmacKeyGenParams = {
    name: "HMAC",
    hash: { name: "SHA-512" }
};

export const defaultSettings: Settings = {
    pollerEnabled: false,
    autoUpdate: true,
    autoDownloadMissingLibs: true,
    autoDownloadMissingPlugins: false,
    menuView: "grid",
    showPluginButtons: true
};

export const flipDurationMs = 300;

export const glslTypes = [
    "bool",
    "int",
    "float",
    "bvec2",
    "bvec3",
    "bvec4",
    "ivec2",
    "ivec3",
    "ivec4",
    "vec2",
    "vec3",
    "vec4",
    "mat2",
    "mat3",
    "mat4",
    "sampler2D",
    "samplerCube"
];
