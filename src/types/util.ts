export type Untyped = any;

export type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

export type WithSymbols<T> = T & { [key: symbol]: any };

export type IsAny<T> = 0 extends (1 & T) ? true : false;

export type IsUnion<T, U extends T = T> = (T extends any ? (U extends T ? false : true)
    : never) extends false ? false : true;
