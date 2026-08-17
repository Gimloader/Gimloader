import type { Component } from "svelte";
import type { MouseEventHandler } from "svelte/elements";

type AnyComponent = Component<any, any, string>;
type PromiseT<Data = unknown> = Promise<Data> | (() => Promise<Data>);

interface ToastAction {
    label: string | AnyComponent;
    onClick: MouseEventHandler<HTMLButtonElement>;
    actionButtonStyle?: string;
}

interface ToastOptions {
    id?: number | string;
    icon?: AnyComponent | null;
    component?: AnyComponent;
    componentProps?: any;
    richColors?: boolean;
    invert?: boolean;
    closeButton?: boolean;
    dismissable?: boolean;
    description?: string | AnyComponent;
    duration?: number;
    delete?: boolean;
    action?: ToastAction | AnyComponent;
    cancel?: ToastAction | AnyComponent;
    onDismiss?: (toast: ToastT) => void;
    onAutoClose?: (toast: ToastT) => void;
    cancelButtonStyle?: string;
    actionButtonStyle?: string;
    style?: string;
    unstyled?: boolean;
    class?: string;
    classes?: string;
    descriptionClass?: string;
    position?: Position;
    dismiss?: boolean;
}

type ToastT = ToastOptions & {
    id: number | string;
    type: string;
    title?: string | AnyComponent;
    promise?: PromiseT;
};

type PromiseData<ToastData> = ToastOptions & {
    /**
     * The loading message or a function that returns the message or
     * a custom toast component.
     */
    loading?: string | (() => AnyComponent | string);
    /**
     * The success message or a function that returns the message or
     * a custom toast component.
     */
    success?: string | ((data: ToastData) => AnyComponent | string);
    /**
     * The error message or a function that returns the message or
     * a custom toast component.
     */
    error?: string | ((error: unknown) => AnyComponent | string);
    /**
     * A function that is called when the promise is finally resolved or rejected.
     */
    finally?: () => void | Promise<void>;
};

// Type needs to be reimplemented since Typescript doesn't like the way svelte-sonner exports it
export interface ToastType {
    (message: string | AnyComponent, data?: ToastOptions): string | number;
    success: (message: string | AnyComponent, data?: ToastOptions) => string | number;
    info: (message: string | AnyComponent, data?: ToastOptions) => string | number;
    warning: (message: string | AnyComponent, data?: ToastOptions) => string | number;
    error: (message: string | AnyComponent, data?: ToastOptions) => string | number;
    custom: (component: AnyComponent, data?: ToastOptions) => string | number;
    message: (message: string | AnyComponent, data?: ToastOptions) => string | number;
    promise: <ToastData>(promise: PromiseT<ToastData>, data?: PromiseData<ToastData>) => string | number | undefined;
    dismiss: (id?: number | string) => string | number | undefined;
    loading: (message: string | AnyComponent, data?: ToastOptions) => string | number;
    getActiveToasts: () => ToastT[];
}
