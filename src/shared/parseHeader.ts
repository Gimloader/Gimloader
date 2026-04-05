import type { ScriptHeaders } from "$types/scripts";

export function parseScriptHeaders(code: string): ScriptHeaders {
    const baseHeaders: ScriptHeaders = {
        name: "Unnamed Plugin",
        description: "No description provided",
        author: [],
        version: null,
        reloadRequired: "false",
        isLibrary: "false",
        downloadUrl: null,
        needsLib: [],
        optionalLib: [],
        hasSettings: "false",
        webpage: null,
        deprecated: null,
        signature: null,
        gamemode: [],
        changelog: [],
        needsPlugin: []
    };

    return parseHeader<ScriptHeaders>(code, baseHeaders);
}

export function parseHeader<T>(code: string, headers: T): T {
    // parse the JSDoc header at the start (if it exists)
    const closingIndex = code.indexOf("*/");
    if(!(code.trimStart().startsWith("/**")) || closingIndex === -1) {
        return headers;
    }

    let header = code.slice(0, closingIndex + 2);

    header = header.slice(3, -2).trim();
    let lines = header.split("\n");

    // remove the leading asterisks and trim the lines
    lines = lines.map(line => {
        let newLine = line.trimStart();
        if(newLine.startsWith("*")) {
            newLine = newLine.slice(1).trim();
        }
        return newLine;
    });

    const text = lines.join(" ");

    // go through and find all at symbols followed by non-whitespace
    // and that don't have a bracket before them if they are a link
    const validAtIndexes: number[] = [];

    let index: number = -1;
    while((index = text.indexOf("@", index + 1)) !== -1) {
        if(text[index + 1] === " ") continue;
        if(index !== 0 && text[index - 1] === "{") {
            if(text.slice(index + 1, index + 5) === "link") {
                continue;
            }
        }

        validAtIndexes.push(index);
    }

    for(let i = 0; i < validAtIndexes.length; i++) {
        const chunk = text.slice(validAtIndexes[i] + 1, validAtIndexes[i + 1] ?? text.length);
        const spaceIndex = chunk.indexOf(" ");
        const key = chunk.slice(0, spaceIndex !== -1 ? spaceIndex : chunk.length);
        const value = chunk.slice(key.length).trim();

        if(Array.isArray(headers[key])) {
            headers[key].push(value);
        } else {
            headers[key] = value;
        }
    }

    return headers;
}

export function getDepName(dependency: string) {
    const index = dependency.indexOf("|");
    if(index === -1) return dependency.trim();
    return dependency.slice(0, index).trim();
}

export function parseDep(dependency: string) {
    const index = dependency.indexOf("|");
    if(index === -1) return [dependency.trim()];

    const name = dependency.slice(0, index).trim();
    const url = dependency.slice(index + 1).trim();
    return [name, url];
}
