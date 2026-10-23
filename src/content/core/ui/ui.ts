import type * as React from "react";
import type * as ReactDOM from "react-dom/client";
import styles from "$content/css/styles.css";
import tailwindStyles from "$content/css/tailwind.css";
import { domLoaded } from "$content/utils";
import Rewriter from "../rewriter";
import Cleanup from "$core/scripts/cleanup";
import { log } from "$shared/utils";

export default class UI {
    static React: typeof React;
    static ReactDOM: typeof ReactDOM;
    static isForcingUpdate = false;

    static init() {
        Rewriter.exposeExports("react-", "React", ".version=", (react: typeof React) => {
            this.React = react;
        });

        Rewriter.exposeExports("assertThisInitialized-", "ReactDOM", "HOOK__.checkDCE", (reactDOM: typeof ReactDOM) => {
            this.ReactDOM = reactDOM;
        });

        let stopForceTimeoutSet = false;
        const isForcingUpdate = Rewriter.createShared(null, "isForcingUpdate", () => {
            if(!this.isForcingUpdate) return false;
            if(stopForceTimeoutSet) return true;

            stopForceTimeoutSet = true;
            setTimeout(() => {
                stopForceTimeoutSet = false;
                this.isForcingUpdate = false;
            }, 0);

            return true;
        });

        // Make react treat [function].__overrideReact as the component
        Rewriter.addParseHook(null, "assertThisInitialized-", (code) => {
            const index = code.indexOf("(301));");
            if(index === -1) return code;

            code = code.replace(/(.!==null&&!.)(\?\(.\.updateQueue=.\.updateQueue)/g, `$1&&!${isForcingUpdate}()$2`);

            const startIndex = code.indexOf("=", code.lastIndexOf(":", index)) + 1;
            const endIndex = code.indexOf("(", startIndex);
            const funcName = code.slice(startIndex, endIndex);

            return code.slice(0, startIndex) + `(${funcName}.__overrideReact??${funcName})` + code.slice(endIndex);
        });

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

    static rootFiber: any = null;
    static rootStateNode: any = null;
    static seenNodes = new Set<any>();
    static runForceReactUpdate() {
        if(!this.rootFiber || !this.rootStateNode) {
            this.rootFiber ??= this.findRootFiber();
            this.rootStateNode ??= this.findStateNode(this.rootFiber);
        }

        if(!this.rootStateNode || !this.rootFiber) throw new Error("forceReactUpdate called before DOM has loaded");

        this.isForcingUpdate = true;
        this.seenNodes.clear();
        this.markPaths(this.rootFiber);
        this.seenNodes.clear();

        // @ts-expect-error missing for some reason
        this.ReactDOM.flushSync(() => this.rootStateNode.forceUpdate());
        log("Forced React update");
    }

    static markPaths(fiber: any) {
        if(!fiber || this.seenNodes.has(fiber)) return;
        this.seenNodes.add(fiber);

        fiber.lanes |= 2;
        fiber.childLanes |= 2;

        this.markPaths(fiber.alternate);
        this.markPaths(fiber.child);
        this.markPaths(fiber.sibling);
        this.markPaths(fiber.return);
    }

    static findRootFiber() {
        const root = document.getElementById("root");
        if(!root) return;

        const child = root.firstChild as any;
        if(!child) return;

        const key = Object.keys(child).find(k => k.startsWith("__reactFiber$"));
        if(!key) return;

        return child[key];
    }

    static findStateNode(fiber: any) {
        let current = fiber;
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
