import type { LayoutItem, LibraryInfo, PluginInfo, ScriptInfo, ScriptInfoTypes, ScriptLayout } from "$types/net/state";
import type { DeleteResult, FolderExport, ImportResults, ScriptType, StateMessageProps } from "$types/net/messages";
import type { Dependency } from "$types/net/downloads";
import type { ScriptHeaders } from "$types/scripts";
import { englishList, TypedEventEmitter } from "$shared/utils";
import StateProperty from "./property";
import { apply, handle, stateEvents, stateMessageEvents } from "./events";
import { parseDep, parseScriptHeaders } from "$shared/parseHeader";
import type StateManager from ".";

interface BaseData {
    folder: string;
    dependencies: Dependency[];
}

interface GenericData extends BaseData {
    type: ScriptType;
    info: ScriptInfo;
}

export interface PluginData extends BaseData {
    type: "plugin";
    info: PluginInfo;
}

export interface LibraryData extends BaseData {
    type: "plugin";
    info: LibraryInfo;
}

export const scriptMap = new Map<string, GenericData>();
export const dependents: Record<string, string[]> = {};

interface ScriptEvents<I extends ScriptInfo> {
    scriptCreate: [info: I, initial: boolean];
    scriptDelete: [name: string];
    scriptEdit: [name: string, newName: string, code: string, updated?: boolean];
    stateUpdate: [];

    scriptUpdate: [];
    layoutUpdate: [];

    // I would love to pass this through a generic from the plugin class
    // But I cannot find a way to do this that does not cause EventEmitter to explode
    pluginToggled: [name: string, enabled: boolean];
}

export default abstract class ScriptState<
    T extends ScriptType,
    I extends ScriptInfoTypes[T] = ScriptInfoTypes[T]
> extends TypedEventEmitter<ScriptEvents<I>> {
    stateManager: typeof StateManager;
    type: ScriptType;
    scripts = new StateProperty<I[]>([]);
    layout = new StateProperty<ScriptLayout>({ root: { contents: [] } });

    constructor(stateManager: typeof StateManager, type: T) {
        super();

        this.stateManager = stateManager;
        this.type = type;

        stateMessageEvents.on(`${type}Create`, this.onCreate.bind(this));
        stateMessageEvents.on(`${type}Delete`, this.onDelete.bind(this));
        stateMessageEvents.on(`${type}Edit`, this.onEdit.bind(this));
        stateMessageEvents.on(`${type}DeleteAll`, this.onDeleteAll.bind(this));
        stateMessageEvents.on(`${type}Arrange`, this.onArrange.bind(this));
        stateMessageEvents.on(`${type}FolderCreate`, this.onCreateFolder.bind(this));
        stateMessageEvents.on(`${type}FolderDelete`, this.onDeleteFolder.bind(this));
        stateMessageEvents.on(`${type}FolderEdit`, this.onEditFolder.bind(this));
        stateMessageEvents.on(`${type}ItemMove`, this.onMoveItem.bind(this));
    }

    abstract getInfo(info: ScriptInfo): I;

    init(scripts: I[], layout: ScriptLayout) {
        this.scripts.init(scripts);
        this.layout.init(layout);

        for(const folderId in layout) {
            for(const item of layout[folderId].contents) {
                if(item.type === "folder") continue;

                const script = scripts.find(s => s.name === item.id);
                if(script) this.createScript(script, folderId, true);
            }
        }
    }

    update(scripts: I[], layout: ScriptLayout) {
        for(const script of this.scripts.value) {
            if(scripts.some(s => s.name === script.name)) continue;
            this.deleteScript(script.name);
        }

        for(const script of scripts) {
            const existing = this.getScriptData(script.name);
            if(existing && existing.info.code !== script.code) {
                this.emit("scriptEdit", script.name, script.name, script.code);
            }
        }

        this.scripts.value = scripts;
        this.layout.value = layout;

        this.emit("stateUpdate");
        this.emit("scriptUpdate");
        this.emit("layoutUpdate");
    }

    afterUpdate() {
        // Create events need to be emitted after delete events on update in case
        // A script of one type was deleted and replaced with a script of another type with the same name
        // So there's no chance of one getting created while the other still exists
        for(const folderId in this.layout.value) {
            for(const item of this.layout.value[folderId].contents) {
                if(item.type === "folder" || scriptMap.has(item.id)) continue;

                const script = this.getScript(item.id);
                if(script) this.createScript(script, folderId);
            }
        }

        this.emit("scriptUpdate");
        this.emit("layoutUpdate");
    }

    getScriptData(name: string) {
        const item = scriptMap.get(name);
        return item ?? null;
    }

    getScript(name: string) {
        return this.scripts.value.find(s => s.name === name) ?? null;
    }

    initDependencies(headers: ScriptHeaders, includePlugins: boolean) {
        const dependencies: Dependency[] = [];

        for(const lib of headers.needsLib) {
            const [name, url] = parseDep(lib);
            dependencies.push({ name, type: "library", url });
        }

        // Libraries cannot depend on plugins
        if(includePlugins) {
            for(const plugin of headers.needsPlugin) {
                const [name, url] = parseDep(plugin);
                dependencies.push({ name, type: "plugin", url });
            }
        }

        // Set dependents for each dependency
        for(const dep of dependencies) {
            dependents[dep.name] ??= [];
            dependents[dep.name].push(headers.name);
        }

        return dependencies;
    }

    createScript(info: I, folder: string, initial = false) {
        const headers = parseScriptHeaders(info.code);
        const dependencies = this.initDependencies(headers, this.type === "plugin");

        scriptMap.set(info.name, {
            type: this.type,
            info,
            folder,
            dependencies
        });

        this.emit("scriptCreate", info, initial);
    }

    deleteScript(name: string) {
        scriptMap.delete(name);
        delete dependents[name];

        this.emit("scriptDelete", name);
        this.emit("scriptUpdate");
    }

    deleteIfExists(name: string) {
        const existing = scriptMap.get(name);
        if(!existing) return;

        handle(`${existing.type}Delete`, { name });
    }

    deleteExisting(name: string, data: GenericData) {
        const folder = this.layout.value[data.folder];
        if(!folder) return;

        this.scripts.value = this.scripts.value.filter(s => s.name !== name);
        folder.contents = folder.contents.filter(i => i.id !== name);
        this.deleteScript(name);
    }

    onCreate({ folder, info }: StateMessageProps<`${ScriptType}Create`>, _: boolean) {
        const layoutFolder = this.layout.value[folder];
        if(!layoutFolder) return;

        this.deleteIfExists(info.name);

        this.scripts.value.push(info as I);
        this.createScript(info as I, folder);

        layoutFolder.contents.push({ type: "script", id: info.name });

        this.emit("scriptUpdate");
        this.emit("layoutUpdate");
    }

    onDelete({ name }: StateMessageProps<`${ScriptType}Delete`>, _: boolean) {
        const script = this.getScriptData(name);
        if(!script) return;

        this.deleteExisting(name, script);
    }

    onEdit({ name, newName, code, updated }: StateMessageProps<`${ScriptType}Edit`>, _: boolean) {
        const script = this.getScriptData(name);
        if(!script) return;

        this.deleteIfExists(newName);

        script.info.code = code;
        script.info.name = newName;

        if(name !== newName) {
            scriptMap.delete(name);
            scriptMap.set(newName, script);

            const folder = this.layout.value[script.folder];
            if(folder) {
                const item = folder.contents.find(i => i.id === name);
                if(item) item.id = newName;
                this.emit("layoutUpdate");
            }
        }

        this.emit("scriptEdit", name, newName, code, updated);
        this.emit("scriptUpdate");
    }

    onDeleteAll() {
        for(const script of this.scripts.value) {
            this.deleteScript(script.name);
        }

        this.scripts.value = [];
        this.layout.value = { root: { contents: [] } };

        this.emit("scriptUpdate");
        this.emit("layoutUpdate");
    }

    onArrange({ folder, order }: StateMessageProps<`${ScriptType}Arrange`>, _: boolean) {
        const layoutFolder = this.layout.value[folder];
        if(!layoutFolder) return;

        const newContents: LayoutItem[] = [];
        for(const id of order) {
            const item = layoutFolder.contents.find(i => i.id === id);
            if(item) newContents.push(item);
        }

        layoutFolder.contents = newContents;
        this.emit("layoutUpdate");
    }

    onCreateFolder({ parent, name, id }: StateMessageProps<`${ScriptType}FolderCreate`>, _: boolean) {
        this.layout.value[id] = {
            parent,
            name,
            contents: []
        };

        this.layout.value[parent].contents.push({
            type: "folder",
            id
        });

        this.emit("layoutUpdate");
    }

    onDeleteFolder({ id }: StateMessageProps<`${ScriptType}FolderDelete`>, _: boolean) {
        const parent = this.layout.value[id].parent;
        if(!parent) return;

        const parentFolder = this.layout.value[parent];
        parentFolder.contents = parentFolder.contents.filter(i => i.id !== id);

        this.deleteFolderAndContents(id);

        this.emit("scriptUpdate");
        this.emit("layoutUpdate");
    }

    deleteFolderAndContents(id: string) {
        for(const item of this.layout.value[id].contents) {
            if(item.type === "script") {
                this.scripts.value = this.scripts.value.filter(s => s.name !== item.id);
                this.deleteScript(item.id);
            } else {
                this.deleteFolderAndContents(item.id);
            }
        }

        delete this.layout.value[id];
    }

    onEditFolder({ id, newName }: StateMessageProps<`${ScriptType}FolderEdit`>, _: boolean) {
        const folder = this.layout.value[id];
        if(!folder) return;

        folder.name = newName;

        this.emit("layoutUpdate");
    }

    onMoveItem({ item, folder }: StateMessageProps<`${ScriptType}ItemMove`>, _: boolean) {
        const parentId = item.type === "folder" ? this.layout.value[item.id]?.parent : this.getScriptData(item.id)?.folder;
        if(!parentId) return;

        const parent = this.layout.value[parentId];
        if(!parent) return;

        parent.contents = parent.contents.filter(i => i.id !== item.id);
        this.layout.value[folder]?.contents?.push(item);

        if(item.type === "script") {
            const script = this.getScriptData(item.id);
            if(script) script.folder = folder;
        } else {
            this.layout.value[item.id].parent = folder;
        }

        this.emit("layoutUpdate");
    }

    create(code: string, folder: string) {
        const headers = parseScriptHeaders(code);
        if((headers.isLibrary === "true") !== (this.type === "library")) {
            stateEvents.emit("error", `A ${this.type} must ${this.type === "library" ? "" : "not "}have @isLibrary set`);
            return headers.name;
        }

        const info = this.stateManager[this.type].getInfo({ name: headers.name, code });
        apply(`${this.type}Create`, { folder, info });

        return headers.name;
    }

    tryDelete(name: string, confirmed = false): DeleteResult {
        const willDisable = this.checkDependents(name);

        if(willDisable.size > 0 && !confirmed) {
            const names = englishList([...willDisable]);
            const msg = `Deleting ${name} will also disable ${names}. Continue?`;
            return { status: "confirm", message: msg };
        }

        // Disable dependents
        for(const name of willDisable) {
            apply("pluginToggled", { name, enabled: false });
        }

        apply(`${this.type}Delete`, { name });
        return { status: "success" };
    }

    tryDeleteFolder(id: string, confirmed = false): DeleteResult {
        const willDisable = this.getFolderWillDisable(id);

        // Confirm if necessary
        if(willDisable.size > 0 && !confirmed) {
            const names = englishList([...willDisable]);
            const folderName = this.stateManager[this.type].layout.value[id]?.name;
            const confirmMessage = `Deleting ${folderName} will also disable ${names}. Continue?`;
            return { status: "confirm", message: confirmMessage };
        }

        // Disable dependents
        for(const name of willDisable) {
            apply("pluginToggled", { name, enabled: false });
        }

        apply(`${this.type}FolderDelete`, { id });
        return { status: "success" };
    }

    importFolder(folder: string, exported: FolderExport) {
        const results: ImportResults = { folders: 0, scripts: 0 };

        // Recursively create folders and scripts
        const createItems = async (folderId: string, parent: string) => {
            const name = exported.layout[folderId]?.name;
            if(!name) return;

            const newId = crypto.randomUUID();
            apply(`${this.type}FolderCreate`, {
                id: newId,
                name,
                parent
            });

            for(const item of exported.layout[folderId].contents) {
                if(item.type === "folder") {
                    createItems(folderId, newId);
                    results.folders++;
                } else {
                    const info = exported.scripts.find(s => s.name === item.id);
                    if(!info) return;

                    this.create(info.code, newId);
                    results.scripts++;
                }
            }
        };

        createItems(exported.entryId, folder);
        return results;
    }

    getFolderWillDisable(id: string) {
        const allWillDisable = new Set<string>();
        const inFolder = this.getScriptsInFolder(id);

        for(const script of inFolder) this.checkDependents(script, allWillDisable);
        return allWillDisable.difference(inFolder);
    }

    getScriptsInFolder(id: string, scripts = new Set<string>()) {
        const folder = this.stateManager[this.type].layout.value[id];

        for(const item of folder.contents) {
            if(item.type === "folder") {
                this.getScriptsInFolder(item.id, scripts);
            } else {
                scripts.add(item.id);
            }
        }

        return scripts;
    }

    checkDependents(name: string, willDisable = new Set<string>()) {
        const script = scriptMap.get(name);
        if(!script || !dependents[name]) return willDisable;

        for(const dependent of dependents[name]) {
            const entry = scriptMap.get(dependent);
            if(!entry) continue;

            if(entry.type === "plugin" && (entry as PluginData).info.enabled) {
                willDisable.add(dependent);
            }

            this.checkDependents(dependent, willDisable);
        }

        return willDisable;
    }

    shouldWarnAbout(dependency: Dependency) {
        return (
            (dependency.type === "library" && !this.stateManager.settings.settings.value.autoDownloadMissingLibs)
            || (dependency.type === "plugin" && !this.stateManager.settings.settings.value.autoDownloadMissingPlugins)
        );
    }

    checkDependencies(name: string) {
        let error: string | null = null;
        const willDownload: Dependency[] = [];
        const willEnable: string[] = [];

        // Confirm there are no missing undownloadable scripts or circular dependencies
        const check = (checkName: string, stack: string[]) => {
            if(error) return;

            const script = scriptMap.get(checkName);
            if(!script) return;

            for(const dep of script.dependencies) {
                if(stack.includes(dep.name)) {
                    error = `Circular dependency found: ${[...stack, dep.name].join(" -> ")}`;
                    return;
                }

                const entry = scriptMap.get(dep.name);

                if(entry) {
                    if(entry.type === "plugin" && !(entry as PluginData).info.enabled) {
                        if(!willEnable.includes(dep.name)) {
                            willEnable.push(dep.name);
                        }
                    }

                    check(dep.name, [...stack, dep.name]);
                } else if(dep.url) {
                    if(!willDownload.some(d => d.name === dep.name)) {
                        willDownload.push(dep);
                    }
                } else {
                    error = `${name} requires ${dep.name}, which cannot be automatically downloaded`;
                    return;
                }
            }
        };
        check(name, [name]);

        return { error, willDownload, willEnable };
    }
}
