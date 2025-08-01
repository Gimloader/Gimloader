import { build, BuildOptions, context, Plugin } from 'esbuild';
import sveltePlugin from 'esbuild-svelte';
import { sveltePreprocess } from 'svelte-preprocess';
import postcss from 'postcss';
import postcssLoadConfig from 'postcss-load-config';
import { compileAsync } from "sass";
import path from "path";
import fs from 'fs';

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

// unholy amalgamation of esbuild-postcss-inline-styles and esbuild-style-plugin
function importStyles(): Plugin {
    return {
        name: "import-styles",
        setup(build) {
            build.onResolve({ filter: /.\.scss$/ }, (args) => {
                return {
                    path: path.join(args.resolveDir, args.path),
                    namespace: "import-styles"
                }
            });
            build.onLoad({ filter: /.*/, namespace: "import-styles" }, async (args) => {
                const sassed = (await compileAsync(args.path)).css;
                const config = await postcssLoadConfig();
                const postcssed = await postcss(config.plugins).process(sassed, {
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

let entryPoints = ["src/content/index.ts", "src/background/index.ts", "src/popup/index.ts"];
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
            preprocess: sveltePreprocess(),
            compilerOptions: {
                css: "injected"
            }
        }),
        importStyles()
    ],
    loader: {
        ".svg": "text",
        ".css": "empty"
    }
}

let editorConfig: BuildOptions = {
    ...base,
    entryPoints: [ isFirefox ? "src/editor/firefox.ts" : "src/editor/chrome.ts" ],
    outfile: "extension/build/js/editor/index.js",
    plugins: [
        sveltePlugin({
            preprocess: sveltePreprocess(),
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