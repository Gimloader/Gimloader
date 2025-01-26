import { parseLibHeader } from '$src/parseHeader';
import { confirmLibReload } from '$src/utils';
import Storage from '$core/storage';
import Lib from './lib.svelte';
import debounce from 'debounce';

interface LibInfo {
    script: string;
    name: string;
}

export class LibManagerClass {
    libs: Lib[] = $state();
    destroyed = false;

    init() {
        let libInfo = Storage.getValue('libs', []);

        // convert from the old script-only version
        if(typeof libInfo[0] === "string") {
            libInfo = libInfo.map((s: string) => ({ script: s, name: "" }));
        }

        let libs = [];
    
        for(let info of libInfo) {
            let lib = new Lib(info.script);
    
            libs.push(lib);
        }
        this.libs = libs;

        GM_addValueChangeListener('libs', (_, __, newInfos: LibInfo[], remote) => {
            if(!remote) return;
    
            // check if any libraries were added
            for(let info of newInfos) {
                if(!this.getLib(info.name)) {
                    this.createLib(info.script);
                }
            }

            // check if any libraries were removed
            for(let lib of this.libs) {
                if(!newInfos.some(i => i.name === lib.headers.name)) {
                    this.deleteLib(lib);
                }
            }
    
            // check if any libraries were updated
            for(let info of newInfos) {
                let existing = this.getLib(info.name);
                if(existing.script !== info.script) {
                    this.editLib(existing, info.script);
                }
            }
    
            // move the libraries into the correct order
            let newOrder = [];
            for (let info of newInfos) {
                let setLib = this.getLib(info.name);
                if (setLib) newOrder.push(setLib);
            }
    
            this.libs = newOrder;
        });
    }

    get(libName: string) {
        let lib = this.libs.find(lib => lib.headers.name === libName);
        return lib?.library ?? null;
    }

    getLib(libName: string): Lib {
        return this.libs.find((lib: Lib) => lib.headers.name === libName);
    }

    saveFn() {
        if(this.destroyed) return;
        
        let libInfo: LibInfo[] = [];
        for(let lib of this.libs) {
            libInfo.push({ script: lib.script, name: lib.headers.name });
        }

        Storage.setValue('libs', libInfo);
    }

    saveDebounced?: () => void;
    save() {
        if(!this.saveDebounced) this.saveDebounced = debounce(this.saveFn, 100);

        this.saveDebounced();
    }

    createLib(script: string, headers?: Record<string, any>, ignoreDuplicates?: boolean) {
        headers = headers ?? parseLibHeader(script);
        
        if(headers.isLibrary === "false") {
            alert("That script doesn't appear to be a library! If it should be, please set the isLibrary header, and if not, please import it as a plugin.");
            return;
        }

        let existing = this.getLib(headers.name);
        if(existing && !ignoreDuplicates) {
            let conf = confirm(`A library named ${headers.name} already exists! Do you want to overwrite it?`);
            if(!conf) return;
        }

        if(existing) {
            this.deleteLib(existing);
        }

        let lib = new Lib(script, headers);
        this.libs.unshift(lib);

        this.save();

        return lib;
    }

    deleteLib(lib: Lib) {
        lib.disable();
        this.libs.splice(this.libs.indexOf(lib), 1);

        this.save();
    }

    async editLib(lib: Lib, code: string, headers?: Record<string, any>) {
        headers = headers ?? parseLibHeader(code);

        if(lib.headers.name === headers.name) {
            let newLib = this.createLib(code, headers, true);
            if(newLib) {
                newLib.usedBy = lib.usedBy;
                if(newLib.usedBy.size == 0) return;
                let needsReload = await newLib.enable();
                if(!needsReload) return;

                let reload = confirmLibReload([lib]);
                if(!reload) return;

                this.saveFn();
                location.reload();
            }
        } else {
            let wentThrough = this.createLib(code, headers);
            if(wentThrough) {
                this.deleteLib(lib);
            }
        }
    }

    wipe() {
        for(let lib of this.libs) {
            lib.disable();
        }

        this.libs = [];
        this.saveFn();
    }

    getLibHeaders(name: string) {
        let lib = this.getLib(name);
        if(!lib) return null;
        return $state.snapshot(lib.headers);
    }

    isEnabled(name: string) {
        let lib = this.getLib(name);
        if(!lib) return null;
        return lib.enabling;
    }

    getLibNames(): string[] {
        return this.libs.map(lib => lib.headers.name);
    }
}

const libManager = new LibManagerClass();
export default libManager;