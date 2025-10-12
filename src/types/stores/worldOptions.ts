interface CodeGrids {
    blockCategories: string;
    customBlocks: string;
    customBlocksParsed: any[];
}

interface CodeGridSchema {
    allowChannelGrids: boolean;
    customBlocks: any[];
    triggers: any[];
}

interface OptionSchema {
    options: any[];
}

interface DeviceOption {
    codeGridSchema: CodeGridSchema;
    defaultState: any;
    id: string;
    optionSchema: OptionSchema;
    wireConfig: any;
}

interface Item {
    description: string;
    editorName: string;
    id: string;
    name: string;
    previewImage: string;
    type: string;
}

export default interface WorldOptions {
    codeGrids: CodeGrids;
    customAssetsOptions: any[];
    deviceOptions: DeviceOption[];
    hasAllProps: boolean;
    terrainOptions: Item[];
}