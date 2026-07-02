// biome-ignore-all lint/suspicious/noConsole: Used for intended logging
export function log(...args: any[]) {
    console.log("%c[GL]", "color:#5030f2", ...args);
}

export function error(...args: any[]) {
    console.error("%c[GL]", "color:#5030f2", ...args);
}

export function englishList(items: string[], combiner = "and") {
    if(items.length === 1) return items[0];
    else if(items.length === 2) return `${items[0]} ${combiner} ${items[1]}`;
    else return `${items.slice(0, -1).join(", ")}, ${combiner} ${items.at(-1)}`;
}

export function capitalize(string: string) {
    return string[0].toUpperCase() + string.slice(1);
}

export const nop = () => {};
