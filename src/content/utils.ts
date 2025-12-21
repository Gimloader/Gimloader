import Port from "$shared/net/port.svelte";
import { nop } from "$shared/utils";
import type { ScriptType } from "$types/messages";
import * as z from "zod";
import rawChangelog from "../../../release-notes.txt";

export function validate(fnName: string, args: IArguments, ...schema: [string, string | z.ZodType][]) {
    for(let i = 0; i < schema.length; i++) {
        let [name, type] = schema[i];
        if(name.endsWith("?")) {
            name = name.slice(0, -1);
            if(args[i] === undefined) continue;
        }

        // check whether the key argument is present
        if(args[i] === undefined) {
            throw new Error(`${fnName} called without argument ${name}`);
        }

        if(type === "any") continue;
        if(type instanceof z.ZodType) {
            const parsed = type.safeParse(args[i]);
            if(!parsed.success) {
                throw new Error(`Failed to parse ${fnName} argument ${name}:\n${z.prettifyError(parsed.error)}`);
            }
        } else {
            if(!type.split("|").includes(typeof args[i])) {
                throw new Error(`${fnName} received ${args[i]} for argument ${name}, expected type ${type}`);
            }
        }
    }
}

export function splicer<T>(array: T[], obj: T) {
    array.push(obj);
    return () => {
        const index = array.indexOf(obj);
        if(index !== -1) array.splice(index, 1);
    };
}

export function clearId<T extends { id?: string }>(array: T[], id: string) {
    for(let i = 0; i < array.length; i++) {
        if(array[i].id === id) {
            array.splice(i, 1);
            i--;
        }
    }
}

export function readUserFile(accept: string, callback: (text: string) => void) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;

    input.addEventListener("change", () => {
        const file = input.files?.[0];
        if(!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            callback(reader.result as string);
        };

        reader.readAsText(file);
    });

    input.click();
}

export function showEditor(type: ScriptType, name?: string) {
    Port.sendAndRecieve("showEditor", { type, name });
}

// Because of some nonsense with the spec subclassing promises is wonky
export class Deferred<T = void> extends Promise<T> {
    resolve: (value?: T) => void;
    reject: (reason?: any) => void;

    constructor(callback: any) {
        let resolve: (value?: T) => void;
        let reject: (reason?: any) => void;

        super((res, rej) => {
            resolve = res;
            reject = rej;
            callback(res, rej);
        });

        this.resolve = resolve;
        this.reject = reject;
    }

    static create<T = void>() {
        return new Deferred<T>(nop);
    }
}

export const domLoaded = new Promise<void>((res) => {
    if(document.readyState !== "loading") {
        res();
        return;
    }

    document.addEventListener("readystatechange", () => res(), { once: true });
});

export const changelog = rawChangelog.split("\n").filter(line => line);