import * as monaco from "monaco-editor";
import types from "./gimloaderTypes.txt";
import { mount } from "svelte";
import Editor from "./Editor.svelte";
import styles from "./tailwind.css";
import type { EditorOptions } from "$types/editor";

self.MonacoEnvironment = {
    getWorkerUrl: (_, label) => {
        if(label === "javascript") {
            return "/js/editor/vs/language/typescript/ts.worker.js";
        }
        return "/js/editor/vs/editor/editor.worker.js";
    }
};

const loadLib = async (url: string, path: string) => {
    const res = await fetch(url);
    const text = await res.text();
    monaco.languages.typescript.javascriptDefaults.addExtraLib(text, path);
};

loadLib("https://unpkg.com/phaser@3.90.0/types/phaser.d.ts", "@types/phaser/phaser.d.ts");
monaco.languages.typescript.javascriptDefaults.addExtraLib(types, "@types/gimloader/gimloader.d.ts");

const style = document.createElement("style");
style.innerHTML = styles;
document.head.appendChild(style);

mount(Editor, {
    props: {
        createEditor: (options: EditorOptions) => {
            const editor = monaco.editor.create(options.element, {
                value: options.code,
                language: "javascript",
                theme: "vs-dark",
                automaticLayout: true
            });

            editor.getModel()?.onDidChangeContent(options.onChange);

            return {
                getValue: () => editor.getValue()
            };
        }
    },
    target: document.body
});
