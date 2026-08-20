import { build, type BuildOptions, context, type Plugin } from 'esbuild';
import sveltePlugin from 'esbuild-svelte';
import postcss from 'postcss';
import postcssLoadConfig from 'postcss-load-config';
import fs from "node:fs";
import fsp from "node:fs/promises";

const isFirefox = process.argv.includes("--firefox");

if(!isFirefox && !fs.existsSync('extension/build/js/editor/vs')) {
    console.time("Built monaco");

    const workerEntryPoints = [
        'vs/language/typescript/ts.worker.js',
        'vs/editor/editor.worker.js'
    ];

    await build({
        entryPoints: workerEntryPoints.map((entry) => `node_modules/monaco-editor/esm/${entry}`),
        bundle: true,
        format: "iife",
        outbase: "node_modules/monaco-editor/esm/",
        outdir: "extension/build/js/editor",
        minify: true
    });

    console.timeEnd("Built monaco");
}

function importStyles(): Plugin {
    return {
        name: "import-styles",
        setup(build) {
            build.onResolve({ filter: /tailwind\.css$/ }, async (args) => {
                if(args.pluginData === "import-styles-resolved") return;
                const result = await build.resolve(args.path, {
                    resolveDir: args.resolveDir,
                    kind: "import-statement",
                    pluginData: "import-styles-resolved"
                });

                // Remove everything before "src" in the path
                const startIndex = result.path.indexOf("src");
                const path = result.path.slice(startIndex);

                return {
                    path,
                    namespace: "import-styles"
                }
            });
            build.onLoad({ filter: /.*/, namespace: "import-styles" }, async (args) => {
                const css = (await fsp.readFile(args.path)).toString();
                const config = await postcssLoadConfig();
                const postcssed = await postcss(config.plugins).process(css, {
                    from: args.path
                });

                const contents = `const styles = ${JSON.stringify(postcssed.css)};\nexport default styles;`;

                return {
                    contents,
                    loader: "js"
                }
            })
        }
    }
}

let entryPoints = ["src/content/gimloader.ts", "src/background/index.ts", "src/popup/index.ts"];
if(isFirefox) entryPoints.push("src/relay/index.ts");

let base: BuildOptions = {
    mainFields: ["svelte", "browser", "module", "main"],
    conditions: ["svelte", "browser", "production"],
    bundle: true,
    outbase: "src",
    minify: false
}

let config: BuildOptions = {
    ...base,
    outdir: "extension/build/js",
    entryPoints,
    plugins: [
        sveltePlugin({
            compilerOptions: {
                css: "injected"
            }
        }),
        importStyles()
    ],
    loader: {
        ".svg": "text",
        ".css": "text"
    }
}

let editorConfig: BuildOptions = {
    ...base,
    entryPoints: [ isFirefox ? "src/editor/firefox.ts" : "src/editor/chrome.ts" ],
    outfile: "extension/build/js/editor/index.js",
    plugins: [
        sveltePlugin({
            compilerOptions: {
                css: "injected"
            }
        }),
        importStyles()
    ],
    loader: {
        ".ttf": "file"
    }
}

let buildsRunning = 0;

if(process.argv.includes("-w") || process.argv.includes("--watch")) {
    let rebuildNotify: Plugin = { 
        name: "rebuild-notify",
        setup(build) {
            build.onStart(() => {
                buildsRunning++;
                if(buildsRunning > 1) return;
                process.stdout.write("Building...")
                console.time("Built");
            });
            build.onEnd(result => {
                buildsRunning--;
                if(buildsRunning > 0) return;
                process.stdout.write("\r")
                console.timeEnd("Built");
                if(result.errors.length > 0) {
                    console.log("Build finished with", result.errors, "errors");
                }
            });
        }
    }
    
    config.plugins!.push(rebuildNotify);
    editorConfig.plugins!.push(rebuildNotify);

    const ctx = await context(config);
    const editorCtx = await context(editorConfig);

    ctx.watch();
    editorCtx.watch();
} else {
    await Promise.all([
        build(config),
        build(editorConfig)
    ]);

    console.timeEnd("Built")
}