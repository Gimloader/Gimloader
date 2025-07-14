import type * as React from 'react';
import type * as ReactDOM from 'react-dom/client';
import { addPluginButtons } from './addPluginButtons';
import styles from "../../css/styles.scss";
import { domLoaded } from '$content/utils';
import Rewriter from '../rewriter';

export default class UI {
    static React: typeof React;
    static ReactDOM: typeof ReactDOM;
    static styles: Map<string, HTMLStyleElement[]> = new Map();

    static init() {
        Rewriter.exposeObjectByAssignment(true, "React", ".useDebugValue=", (react) => {
            this.React = react;
        });

        Rewriter.exposeObjectByAssignment(true, "ReactDOM", ".findDOMNode=", (reactDOM) => {
            this.ReactDOM = reactDOM;
        });

        addPluginButtons();
        this.addCoreStyles();
    }

    static addStyles(id: string | null, styleString: string) {
        let style = document.createElement('style');
        style.innerHTML = styleString;

        const add = () => document.head.appendChild(style);

        // wait for document to be ready
        domLoaded().then(add);

        if(id === null) return () => {};

        // add to map
        if(!this.styles.has(id)) this.styles.set(id, []);
        this.styles.get(id)?.push(style);

        return () => {
            let styles = this.styles.get(id);
            if(styles) {
                let index = styles.indexOf(style);
                if(index !== -1) {
                    styles.splice(index, 1);
                    style.remove();
                }
            }
        }
    }

    static removeStyles(id: string) {
        if(!this.styles.has(id)) return;

        for(let style of this.styles.get(id)!) {
            style.remove();
        }

        this.styles.delete(id);
    }

    static addCoreStyles() {
        this.addStyles(null, styles);
    }
}