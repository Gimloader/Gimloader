declare module '*.scss' {
    const content: string;
    export default content;
}

declare module '*.svg' {
    const content: string;
    export default content;
}

declare const GL: import('./src/index').Gimloader;
/** @deprecated Use GL.stores */
declare const stores: any;
/** @deprecated Use GL.platformerPhysics */
declare const platformerPhysics: any;
/** @deprecated Polyfills for Gimhook mods. Please use the built-in modding API */
declare const gimhook: any;

interface Window {
    GL: import('./src/index').Gimloader;
    /** @deprecated Use GL.stores */
    stores: any;
    /** @deprecated Use GL.platformerPhysics */
    platformerPhysics: any;
    /** @deprecated Polyfills for Gimhook mods. Please use the built-in modding API */
    gimhook: any;
}