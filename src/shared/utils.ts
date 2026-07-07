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

export function amountWithS(amount: number, word: string) {
    return `${amount} ${word}${amount === 1 ? "" : "s"}`;
}

export function downloadJson(json: any, name: string) {
    const blob = new Blob([JSON.stringify(json, null, 4)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = name;
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
}

export const nop = () => {};
