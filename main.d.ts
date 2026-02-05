/// <reference path="./src/types/stores/index.d.ts" />

declare module '*.css' {
    const content: string;
    export default content;
}

declare module '*.svg' {
    const content: string;
    export default content;
}

declare module '*.txt' {
    const content: string;
    export default content;
}

declare module '*.svelte' {
    const component: import('svelte').SvelteComponent;
    export default component;

    // To get typescript to shut up about some components
    export const buttonVariants;
    export const ButtonProps;
    export const ButtonVariant;
    export const ButtonSize;
}

declare const GL: typeof import('./src/content/api/api').default;
/** @deprecated Use GL.stores */
declare const stores: Stores.Stores;
/** @deprecated No longer supported */
declare const platformerPhysics: any;

interface Window {
    GL: typeof import('./src/content/api/api').default;
    /** @deprecated Use GL.stores */
    stores: Stores.Stores;
    /** @deprecated No longer supported */
    platformerPhysics: any;
}

declare namespace Gimloader {
    interface Plugins {
        [name: string]: any;
    }

    interface Libraries {
        [name: string]: any;
    }
}

// Evil hack to avoid dts-bundle-generator including the stores types in the main bundle
declare namespace Stores {
    type Stores = {
        [I in keyof import("./src/types/stores/stores").Stores]: import("./src/types/stores/stores").Stores[I];
    }
};