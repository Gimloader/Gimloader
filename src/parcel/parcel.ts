/*
    This method of intercepting modules was inspired by https://codeberg.org/gimhook/gimhook
*/

import type { Gimloader } from "../gimloader";
import type { Intercept } from "../types";
import { getUnsafeWindow, log } from "../util";

// the code below is copied from https://codeberg.org/gimhook/gimhook/src/branch/master/modloader/src/parcel.ts,
// who in turn copied it from the parcel source code.

const scriptSelector = 'script[src*="index"]:not([nomodule])'

export default class Parcel extends EventTarget {
    gimloader: Gimloader;

    _parcelModuleCache = {};
    _parcelModules = {};
    reqIntercepts: Intercept[] = [];
    readyToIntercept = true;

    constructor(loader: Gimloader) {
        super();

        this.gimloader = loader;

        // When the page would navigate to /host (which can't be reloaded or it breaks)
        // just redirect to /gimloaderHostRedirect, from where we'll do our thing
        this.interceptRequire(null, exports => exports?.AsyncNewTab, exports => {
            GL.patcher.after(null, exports, "AsyncNewTab", (_, __, returnVal) => {
                GL.patcher.before(null, returnVal, "openTab", (_, args) => {
                    args[0] = args[0].replace("/host", "/gimloaderHostRedirect");
                })
            })
        })

        if(location.href.includes('/gimloaderHostRedirect')) {
            this.hostRedirect();
        } else {
            let existingScripts = document.querySelectorAll(scriptSelector) as NodeListOf<HTMLScriptElement>;
            if(existingScripts.length > 0) {
                this.readyToIntercept = false;
                window.addEventListener('load', () => {
                    this.setup();
                    this.reloadExistingScripts(existingScripts);
                })
            }
            else this.setup();
        }
    }

    async hostRedirect() {
        let hostUrl = location.href.replace('/gimloaderHostRedirect', '/host');
        let res = await fetch(hostUrl);
        let text = await res.text();

        let parser = new DOMParser();
        let doc = parser.parseFromString(text, 'text/html');

        if(document.readyState !== "complete") {
            await new Promise(resolve => window.addEventListener('load', resolve));
        }

        // redo the DOM
        this.setup();
        this.nukeDom();
        
        document.documentElement.innerHTML = doc.documentElement.innerHTML;

        GL.addStyleSheets();

        // change url back to /host
        history.replaceState(null, '', hostUrl);

        // re-import the scripts
        let existingScripts = document.querySelectorAll(scriptSelector) as NodeListOf<HTMLScriptElement>;

        this.reloadExistingScripts(existingScripts);
    }

    emptyModules() {
        this._parcelModuleCache = {};
        this._parcelModules = {};
    }

    onModuleRequired(id: string | null, callback: (module: any) => void) {
        let intercept: Intercept = { type: 'moduleRequired', callback };
        if(id) intercept.id = id;
        this.reqIntercepts.push(intercept);

        // return a cancel function
        return () => {
            let index = this.reqIntercepts.indexOf(intercept);
            if(index !== -1) this.reqIntercepts.splice(index, 1);
        }
    }

    interceptRequire(id: string | null, match: (exports: any) => boolean, callback: (exports: any) => any, once: boolean = false) {
        if(!match || !callback) throw new Error('match and callback are required');
        let intercept: Intercept = { type: 'interceptRequire', match, callback, once };
        if(id) intercept.id = id;
        this.reqIntercepts.push(intercept);

        // return a cancel function
        return () => {
            let index = this.reqIntercepts.indexOf(intercept);
            if(index !== -1) this.reqIntercepts.splice(index, 1);
        }
    }

    stopIntercepts(id: string) {
        this.reqIntercepts = this.reqIntercepts.filter(intercept => intercept.id !== id);
    }

    async decachedImport(url: string) {
        let src = new URL(url, location.origin).href;

        let res = await fetch(src);
        let text = await res.text();

        // nasty hack to prevent the browser from caching other scripts
        text = text.replaceAll('import(', 'window.GL.parcel.decachedImport(');
        text = text.replaceAll('import.meta.url', `'${src}'`)

        let blob = new Blob([text], { type: 'application/javascript' });
        let blobUrl = URL.createObjectURL(blob);

        return import(blobUrl);
    }

    async reloadExistingScripts(existingScripts: NodeListOf<HTMLScriptElement>) {
        // nuke the dom
        this.nukeDom();

        this.readyToIntercept = true;
        this.emptyModules();

        for(let existingScript of existingScripts) {
            // re-import the script since it's already loaded
            log(existingScript, 'has already loaded, re-importing...')
            
            this.decachedImport(existingScript.src);

            existingScript.remove();
        }
    }

    nukeDom() {
        document.querySelector("#root")?.remove();
        let newRoot = document.createElement('div');
        newRoot.id = 'root';
        document.body.appendChild(newRoot);
        
        // remove all global variables
        let vars = ["__mobxGlobals", "__mobxInstanceCount"]
        for(let v of vars) {
            if(v in window) delete window[v];
        }
    }

    setup() {
        this.gimloader.pluginManager.init();

        let requireHook: (moduleName: string) => void;
        let nativeParcelRequire = getUnsafeWindow()["parcelRequire388b"];
    
        ((requireHook = (moduleName) => {
            if (moduleName in this._parcelModuleCache) {
                return this._parcelModuleCache[moduleName].exports;
            }
    
            if (moduleName in this._parcelModules) {
                let moduleCallback = this._parcelModules[moduleName];
                delete this._parcelModules[moduleName];
    
                let moduleObject = {
                    id: moduleName,
                    exports: {} as any
                };
    
                this._parcelModuleCache[moduleName] = moduleObject;
    
                moduleCallback.call(moduleObject.exports, moduleObject, moduleObject.exports);

                // run intercepts
                if(this.readyToIntercept) {
                    for (let intercept of this.reqIntercepts) {
                        if(intercept.type === 'interceptRequire') {
                            // check for matches for the moduleRequired intercepts
                            if (intercept.match(moduleObject.exports)) {
                                let returned = intercept.callback?.(moduleObject.exports);
                                if(returned) moduleObject.exports = returned;
        
                                if(intercept.once) {
                                    this.reqIntercepts.splice(this.reqIntercepts.indexOf(intercept), 1);
                                }
                            }
                        } else {
                            intercept.callback(moduleObject);
                        }
                    }
                }
    
                return moduleObject.exports;
            }
    
            if(nativeParcelRequire) {
                return nativeParcelRequire(moduleName);
            }

            throw new Error(`Cannot find module '${moduleName}'`);
        }
        // @ts-ignore
        ).register = (moduleName, moduleCallback) => {
            this._parcelModules[moduleName] = moduleCallback;
            nativeParcelRequire?.register(moduleName, moduleCallback);
        });

        Object.defineProperty(getUnsafeWindow(), "parcelRequire388b", {
            value: requireHook,
            writable: false,
            enumerable: true,
            configurable: false
        });
    }
}