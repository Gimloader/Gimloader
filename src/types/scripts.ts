export interface ScriptHeaders {
    name: string;
    description: string;
    author: string[];
    version: string | null;
    reloadRequired: string;
    isLibrary: string;
    downloadUrl: string | null;
    webpage: string | null;
    needsLib: string[];
    optionalLib: string[];
    deprecated: string | null;
    gamemode: string[];
    changelog: string[];
    signature: string | null;
    /** Only available for plugins */
    needsPlugin: string[];
    hasSettings: string;
}

export interface OfficialScriptInfo {
    title: string;
    description: string;
    downloadUrl: string;
    webpage: string;
}
