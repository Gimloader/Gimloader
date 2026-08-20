import type * as React from "react";
import type * as ReactDOM from "react-dom/client";
import styles from "$content/css/styles.css";
import tailwindStyles from "$content/css/tailwind.css";
import { domLoaded } from "$content/utils";
import Rewriter from "../rewriter";
import fixCanvasCrash from "./fixCanvasCrash";
import Cleanup from "$core/scripts/cleanup";

export default class UI {
    static React: typeof React;
    static ReactDOM: typeof ReactDOM;

    static init() {
        Rewriter.exposeObjectBefore(true, "React", ".useDebugValue=", (react) => {
            this.React = react;
        });

        Rewriter.exposeObjectBefore(true, "ReactDOM", ".findDOMNode=", (reactDOM) => {
            this.ReactDOM = reactDOM;
        });

        fixCanvasCrash();
        this.addCoreStyles();
    }

    static addStyles(id: string | null, styleString: string) {
        const style = document.createElement("style");
        style.innerHTML = styleString;

        // wait for document to be ready
        domLoaded.then(() => document.head.appendChild(style));

        return Cleanup.manualOrAutoCleanup(id, () => style.remove());
    }

    static addCoreStyles() {
        this.addStyles(null, styles);
        this.addStyles(null, tailwindStyles);
    }

    static updatingReact = false;
    static forceReactUpdate() {
        if(this.updatingReact) return;
        this.updatingReact = true;

        setTimeout(() => {
            this.runForceReactUpdate();
            this.updatingReact = false;
        }, 0);
    }

    static rootStateNode: any = null;
    static runForceReactUpdate() {
        const stateNode = this.rootStateNode ?? this.findStateNode();
        if(!stateNode) throw new Error("forceReactUpdate called before DOM has loaded");

        const render = stateNode.render;
        stateNode.render = () => {
            stateNode.render = render;
        };

        stateNode.forceUpdate(() => stateNode.forceUpdate());
    }

    static findStateNode() {
        const root = document.getElementById("root");
        if(!root) return;

        const child = root.firstChild as any;
        if(!child) return;

        const key = Object.keys(child).find(k => k.startsWith("__reactFiber$"));
        if(!key) return;

        let current = child[key];
        while(current?.return) {
            current = current.return;
            const stateNode = current.stateNode;
            if(stateNode && typeof stateNode.forceUpdate === "function") {
                this.rootStateNode = stateNode;
                return stateNode;
            }
        }
    }
}
