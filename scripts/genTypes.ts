import tsconfig from "../tsconfig.json";
import { emitDts } from "svelte2tsx";
import { rollup } from "rollup";
import { dts } from "rollup-plugin-dts";
import { join } from "node:path";
import { ModuleResolutionKind } from "typescript";
import { readFile, writeFile, exists, rm } from "node:fs/promises";

const isNpmPackage = process.argv.includes("--npm");
const forceRegenerate = process.argv.includes("--force");

const declarationDir = "./dist/declarations";
const declarationsExist = await exists(declarationDir);

if(!declarationsExist || forceRegenerate) {
    if(declarationsExist) {
        await rm(declarationDir, { recursive: true, force: true });
    }

    console.log("Generating declaration files...");
    await emitDts({
        declarationDir,
        svelteShimsPath: require.resolve("svelte2tsx/svelte-shims-v4.d.ts")
    });
}

const paths = tsconfig.compilerOptions.paths;
for(const keyName in paths) {
    const key = keyName as keyof typeof paths;
    paths[key] = paths[key].map((path: string) => {
        if(path.startsWith("./node_modules/")) return path;
        return join("./dist/declarations", path)
    });
}

const includeExternal = [
    "bits-ui",
    "tailwind-variants",
    "svelte-toolbelt",
    "tailwind-merge",
    "eventemitter2"
];

if(!isNpmPackage) includeExternal.push("@dimforge/rapier2d-compat");

console.log("Creating type bundle...");
const bundle = await rollup({
    input: "./dist/declarations/src/content/api/api.d.ts",
    plugins: [
        dts({
            compilerOptions: {
                moduleResolution: ModuleResolutionKind.Bundler,
                paths
            },
            includeExternal
        })
    ]
});

// For some reason we can't put this in the dist folder or bun freaks out
await bundle.write({
    file: "./tmp/type-rollup.d.ts",
    format: "es"
});

await bundle.close();

let typeContent = await readFile("./tmp/type-rollup.d.ts", "utf-8");

// Remove export/declare keywords
typeContent = typeContent.replace(/\nexport .+/g, "");
typeContent = typeContent.replace(/\ndeclare\s+/g, "\n");

// Replace csstype with CSSStyleProperties
typeContent = typeContent.replace("\nimport * as csstype from 'csstype';", "");
typeContent = typeContent.replace("csstype.Properties", "CSSStyleProperties");

// Replace the phaser Scene import with BaseScene since rollup is stupid apparently
typeContent = typeContent.replace("Scene", "Scene as BaseScene");
typeContent = typeContent.replace("extends Scene", "extends BaseScene");

// Fix the weird aliasing stuff we did for rapier
if(isNpmPackage) {
    const rapierRegex = /\nimport { (.+) } from 'rapier.*';/g;
    const imports = typeContent.matchAll(rapierRegex).flatMap((match) => match[1].split(", "));
    const importString = `\nimport { ${[...imports].join(", ")} } from '@dimforge/rapier2d-compat';`;
    const index = typeContent.search(rapierRegex);
    typeContent = typeContent.replace(rapierRegex, "");
    typeContent = typeContent.slice(0, index) + importString + typeContent.slice(index);
}

// Wrap everything in a namespace
const insertAt = typeContent.indexOf("\n", typeContent.lastIndexOf("\nimport ") + 1);
typeContent = typeContent.slice(0, insertAt) + "\nexport {};\n\ndeclare global {\nnamespace Gimloader {" + typeContent.slice(insertAt + 1);

typeContent += `interface Plugins {
    [name: string]: any;
}

interface Libraries {
    [name: string]: any;
}
}

const api: Gimloader.Api;
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

if(isNpmPackage) await writeFile("./types/index.d.ts", typeContent);
else await writeFile("./src/editor/gimloaderTypes.txt", typeContent);