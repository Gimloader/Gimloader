import type { EditorOptions } from "$types/editor";
import { mount } from "svelte";
import Editor from "./Editor.svelte";
import styles from "./tailwind.css";
import { javascript } from "@codemirror/lang-javascript";
import { basicSetup } from "codemirror";
import { EditorView, keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorState } from "@codemirror/state";
import { hyperLink } from "@uiw/codemirror-extensions-hyper-link";
import Port from "$shared/net/port.svelte";

Port.init();

const style = document.createElement("style");
style.innerHTML = styles;
document.head.appendChild(style);

mount(Editor, {
    props: {
        createEditor: (options: EditorOptions) => {
            const editor = new EditorView({
                state: EditorState.create({
                    doc: options.code,
                    extensions: [
                        basicSetup,
                        oneDark,
                        hyperLink,
                        keymap.of([indentWithTab]),
                        javascript(),
                        EditorView.updateListener.of((e) => {
                            if(e.docChanged) options.onChange();
                        })
                    ]
                }),
                parent: options.element
            });

            return {
                getValue: () => editor.state.doc.toString()
            };
        }
    },
    target: document.body
});
