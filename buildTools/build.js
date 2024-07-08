import fs from 'fs';
import { rollup } from 'rollup';
import { pathToFileURL } from 'url';
import { join } from 'path';

function addMeta(config) {
    let meta = `/**
 * @name ${config.name}
 * @description ${config.description}
 * @author ${config.author}`;

    if(config.version) {
        meta += `\n * @version ${config.version}`;
    }

    if(config.reloadRequired === true) {
        meta += '\n * @reloadRequired true';
    } else if(config.reloadRequired === "ingame") {
        meta += '\n * @reloadRequired ingame';
    }

    if(config.downloadUrl) {
        meta += `\n * @downloadUrl ${config.downloadUrl}`;
    }

    if(config.libs) {
        for(let lib of config.libs) {
            meta += `\n * @needsLib ${lib}`;
        }
    }

    if(config.optionalLibs) {
        for(let lib of config.optionalLibs) {
            meta += `\n * @optionalLib ${lib}`;
        }
    }

    meta += '\n */\n';

    return {
        name: 'addMeta',
        renderChunk(code) {
            return meta + code;
        }
    }
}

export default async function build() {
    // check that the config file exists
    const configPath = join(process.cwd(), 'GL.config.js');
    if (!fs.existsSync(configPath)) {
        console.error('GL.config.js not found! Run gl init to create one.');
        return;
    }

    // load the config file
    const config = await import(pathToFileURL(configPath));

    // do some checks
    if(!config.default) {
        console.error("GL.config.js doesn't export a default value!");
        return;
    }

    let mandatoryStrings = ['input', 'name', 'description', 'author'];
    for(let str of mandatoryStrings) {
        let type = typeof config.default[str];
        if(type === 'undefined') {
            console.error(`GL.config.js is missing the ${str} field!`);
            return;
        }

        if(type !== 'string') {
            console.error(`GL.config.js ${str} field is not a string!`);
            return;
        }
    }

    let optionalArrays = ['libs', 'optionalLibs', 'plugins'];

    for(let arr of optionalArrays) {
        if(config.default[arr]) {
            if(!Array.isArray(config.default[arr])) {
                console.error(`GL.config.js ${arr} field is not an array!`);
                return;
            }
        }
    }

    let plugins = config.default.plugins ?? [];
    plugins.push(addMeta(config.default));

    // build the plugin
    const bundle = await rollup({
        input: config.default.input,
        plugins,
        ...config.default.rollupOptions
    });

    await bundle.write({
        file: `build/${config.default.name}.js`,
        format: 'esm',
        ...config.default.outputOptions
    });

    console.log('Build complete!');
    process.exit(0);
}