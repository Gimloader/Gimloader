import type { State } from "$types/net/state";
import StateManager from "$shared/state";
import { defaultSettings } from "$shared/consts";
import { describe, expect, test } from "bun:test";
import { getScriptCode } from "./util";

const defaultState: State = {
    availableUpdates: [],
    cacheInvalid: false,
    hotkeys: {},
    libraries: [],
    plugins: [],
    pluginLayout: { root: { contents: [] } },
    libraryLayout: { root: { contents: [] } },
    pluginSettings: {},
    settings: defaultSettings,
    pluginStorage: {}
};

StateManager.init(defaultState, {
    broadcast: () => {},
    downloadDependencies: async (deps) => {
        for(const dep of deps) {
            const name = dep.name as any;
            await StateManager.allScripts.editOrCreate(getScriptCode(name), name);
        }

        return [];
    }
});

describe("StateManager", () => {
    const plugins = () => StateManager.plugin.scripts.value;
    const pluginItems = () => StateManager.plugin.layout.value.root.contents;
    const plugin = (name: string) => plugins().find(s => s.name === name)!;
    const libraries = () => StateManager.library.scripts.value;

    test("Create plugin", () => {
        const name = "basic";
        const code = getScriptCode(name);
        StateManager.plugin.create(code, "root");

        const script = plugins()[0];
        expect(script.name).toBe(name);
        expect(script.code).toBe(code);

        const item = pluginItems()[0];
        expect(item.id).toBe(name);
        expect(item.type).toBe("script");
    });

    test("Delete plugin", () => {
        const result = StateManager.plugin.tryDelete("basic");

        expect(result.status).toBe("success");
        expect(plugins()).toBeEmpty();
        expect(pluginItems()).toBeEmpty();
    });

    test("Create plugin with missing deps", () => {
        StateManager.plugin.create(getScriptCode("hasDeps"), "root");

        expect(plugins()).toHaveLength(1);
        expect(pluginItems()).toHaveLength(1);
        expect(plugins()[0].enabled).toBeFalse();
    });

    test("Enable plugin with missing dependency", async () => {
        const result = await StateManager.plugin.tryTogglePlugin("hasDeps", true);
        expect(result.status).toBe("confirm");

        const newResult = await StateManager.plugin.tryTogglePlugin("hasDeps", true, true);
        expect(newResult.status).toBe("success");

        expect(plugins()).toHaveLength(2);
        expect(plugins()[1].name).toBe("basic");
        expect(pluginItems()[1].id).toBe("basic");
    });

    test("Disable depended on plugin", async () => {
        const result = await StateManager.plugin.tryTogglePlugin("basic", false);
        expect(result.status).toBe("confirm");

        const newResult = await StateManager.plugin.tryTogglePlugin("basic", false, true);
        expect(newResult.status).toBe("success");

        expect(plugins()).toHaveLength(2);
        expect(plugin("hasDeps").enabled).toBeFalse();
        expect(plugin("basic").enabled).toBeFalse();
    });

    test("Enable plugin with present dependency", async () => {
        const result = await StateManager.plugin.tryTogglePlugin("hasDeps", true);
        expect(result.status).toBe("confirm");

        const newResult = await StateManager.plugin.tryTogglePlugin("hasDeps", true, true);
        expect(newResult.status).toBe("success");

        expect(plugin("hasDeps").enabled).toBeTrue();
        expect(plugin("basic").enabled).toBeTrue();
    });

    test("Edit to remove dependency", async () => {
        StateManager.apply("pluginEdit", {
            name: "hasDeps",
            newName: "hasDeps",
            code: getScriptCode("hasNoDeps")
        });

        const result = await StateManager.plugin.tryTogglePlugin("basic", false);
        expect(result.status).toBe("success");

        expect(plugin("hasDeps").enabled).toBeTrue();
        expect(plugin("basic").enabled).toBeFalse();
    });

    test("Edit to add dependency", async () => {
        StateManager.plugin.edit("hasDeps", "hasDeps", getScriptCode("hasDeps"));
        expect(plugin("hasDeps").enabled).toBeFalse();

        await StateManager.plugin.tryTogglePlugin("hasDeps", true, true);
        expect(plugin("basic").enabled).toBeTrue();
        expect(plugin("hasDeps").enabled).toBeTrue();

        StateManager.plugin.edit("basic", "basic", getScriptCode("basicWithDeps"));
        expect(plugin("basic").enabled).toBeFalse();
        expect(plugin("hasDeps").enabled).toBeFalse();
    });

    test("Recursive dependency enabling", async () => {
        await StateManager.plugin.tryTogglePlugin("hasDeps", true, true);

        expect(plugins()).toHaveLength(3);
        expect(plugin("inner").enabled).toBeTrue();
        expect(plugin("basic").enabled).toBeTrue();
        expect(plugin("hasDeps").enabled).toBeTrue();
    });

    test("Changing name", async () => {
        await StateManager.plugin.edit("basic", "basic2", getScriptCode("basic2"));

        expect(plugin("inner").enabled).toBeTrue();
        expect(plugin("basic2").enabled).toBeTrue();
        expect(plugin("hasDeps").enabled).toBeFalse();
    });

    test("Deleting all", () => {
        StateManager.apply("pluginDeleteAll", undefined);

        expect(plugins()).toHaveLength(0);
    });

    test("Creating library", async () => {
        StateManager.plugin.create(getScriptCode("hasLibrary"), "root");
        expect(plugin("hasLibrary").enabled).toBeFalse();

        await StateManager.plugin.tryTogglePlugin("hasLibrary", true, true);
        expect(plugin("hasLibrary").enabled).toBeTrue();
        expect(libraries()).toHaveLength(1);
    });

    test("Editing library", async () => {
        await StateManager.library.edit("lib", "lib", getScriptCode("libNeedsLib"));
        expect(plugin("hasLibrary").enabled).toBeTrue();
        expect(libraries()).toHaveLength(2);
    });

    test("Deleting sublibrary", () => {
        const result = StateManager.library.tryDelete("sublib");
        expect(result.status).toBe("confirm");

        const newResult = StateManager.library.tryDelete("sublib", true);
        expect(newResult.status).toBe("success");

        expect(plugin("hasLibrary").enabled).toBeFalse();
    });
});
