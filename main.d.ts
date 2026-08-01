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
    export const addReloadNeeded;
    export const addUpdated;
    export const showMenu;
}

declare namespace Gimloader {
    interface Plugins {
        [name: string]: any;
    }

    interface Libraries {
        [name: string]: any;
    }
}