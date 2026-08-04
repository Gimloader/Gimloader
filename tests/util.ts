interface ScriptCodeOptions {
    name?: string;
    library?: boolean;
    needsPlugin?: string[];
    needsLib?: string[];
}

function createScriptCode(name: string, options: ScriptCodeOptions = {}) {
    let code = `/**\n * @name ${options.name ?? name}\n`;

    if(options.needsPlugin) {
        for(const plugin of options.needsPlugin) {
            code += ` * @needsPlugin ${plugin} | ${plugin}\n`;
        }
    }

    if(options.needsLib) {
        for(const plugin of options.needsLib) {
            code += ` * @needsLib ${plugin} | ${plugin}\n`;
        }
    }

    if(options.library) code += " * @isLibrary true\n";

    code += " */";

    return code;
}

const fakeScripts = {
    basic: {},
    basic2: {},
    basicWithDeps: {
        name: "basic",
        needsPlugin: ["inner"]
    },
    inner: {},
    hasDeps: {
        needsPlugin: ["basic"]
    },
    hasNoDeps: {
        name: "hasDeps"
    },
    hasLibrary: {
        needsLib: ["lib"]
    },
    lib: {
        library: true
    },
    libNeedsLib: {
        name: "lib",
        library: true,
        needsLib: ["sublib"]
    },
    sublib: {
        library: true
    }
} satisfies Record<string, ScriptCodeOptions>;

export function getScriptCode(name: keyof typeof fakeScripts) {
    return createScriptCode(name, fakeScripts[name]);
}
