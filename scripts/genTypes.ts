import { execSync } from 'child_process';
import fs from 'fs';

const isDT = process.argv.includes("--dt");

let flags = "--project declaration.tsconfig.json --no-check --no-banner";
if(!isDT) flags += " --external-inlines=eventemitter2 @dimforge/rapier2d-compat --";

// There's a warning when bundling eventemitter2, not much that can be done
execSync(`bunx dts-bundle-generator -o tmp/api.d.ts ${flags} src/types/entry/api.ts`);
execSync(`bunx dts-bundle-generator -o tmp/stores.d.ts ${flags} src/types/entry/stores.ts`);

const importRegex = /(?:^|\n)(import .+)\n/g;
function readTypes(path: string) {
    let types = fs.readFileSync(path, "utf-8");
    
    // Remove export/declare keywords
    types = types.replace(/(export )?declare /g, "");
    types = types.replaceAll("export {};", "");

    // Extract import statements
    const matches = types.matchAll(importRegex);
    const importText = Array.from(matches).map(m => m[1]).join("\n");

    types = types.replace(importRegex, "").trim();

    return { types, importText };
}

const apiTypes = readTypes("tmp/api.d.ts");
const storeTypes = readTypes("tmp/stores.d.ts");

let output = "export {};\n\n"

// Add imports
output += apiTypes.importText + "\n" + storeTypes.importText + "\n\n";

// Add the declaration
output += "declare global {\nnamespace Gimloader {\n";

// Add the stores type
output += "namespace Stores {\n" + storeTypes.types + "\n}\n\n";

// Add the API types
output += apiTypes.types + "\n";

// Add Plugins/Libraries interfaces
output += `
interface Plugins {
    [name: string]: any;
}

interface Libraries {
    [name: string]: any;
}
}\n`;

// Add the global declarations
output += `const api: Gimloader.Api;
const GL: typeof Gimloader.Api;
/** @deprecated Use GL.stores */
const stores: Gimloader.Stores.Stores;
/** @deprecated No longer supported */
const platformerPhysics: any;

interface Window {
    api: Gimloader.Api;
    GL: typeof Gimloader.Api;
    /** @deprecated Use GL.stores */
    stores: Gimloader.Stores.Stores;
    /** @deprecated No longer supported */
    platformerPhysics: any;
}
}\n`;

// Write the output
const path = isDT ? "tmp/gimloader.d.ts" : "src/editor/gimloaderTypes.txt";
fs.writeFileSync(path, output);