import type { Settings } from "$types/net/state";

export const isFirefox = navigator.userAgent.includes("Firefox");

export const officialUrlBase = "https://github.com/Gimloader/client-plugins/tree/main";

export const portCryptoAlgorithm: HmacKeyGenParams = {
    name: "HMAC",
    hash: { name: "SHA-512" }
};

export const signaturePublicKey = /** @__PURE__ */ crypto.subtle.importKey(
    "jwk",
    {
        alg: "Ed25519",
        crv: "Ed25519",
        ext: true,
        key_ops: [
            "verify"
        ],
        kty: "OKP",
        x: "GEnOcU0w06sf9cvel4XyYZUjOSO3piaWYhXUjC9k7hg"
    },
    { name: "Ed25519" },
    false,
    ["verify"]
);

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
