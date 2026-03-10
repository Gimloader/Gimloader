type BaseFunction = (...args: any[]) => any;

export type FunctionKeys<T> = keyof {
    [K in keyof T as T[K] extends BaseFunction ? K : never]: T[K];
};

/** @inline */
export type PatcherAfterCallback<T> = (
    thisVal: any,
    args: T extends BaseFunction ? Parameters<T> : any[],
    returnVal: T extends BaseFunction ? ReturnType<T> : any
) => any;

/** @inline */
export type PatcherBeforeCallback<T> = (
    thisVal: any,
    args: T extends BaseFunction ? Parameters<T> : any[]
) => boolean | void;

/** @inline */
export type PatcherInsteadCallback<T> = (
    thisVal: any,
    args: T extends BaseFunction ? Parameters<T> : any[]
) => any;

/** @inline */
export type PatcherSwapCallback<T> = (...args: T extends BaseFunction ? Parameters<T> : any[]) => any;
