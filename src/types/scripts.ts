export interface ScriptHeaders {
    /** The name of this script */
    name: string;
    /** A description of this script */
    description: string;
    /** The authors who created this script */
    author: string[];
    /** The current version of this script, ideally in the format `x.y.z` */
    version: string | null;
    /**
     * `true` if this script always requires a reload when enabled after startup.
     * `ingame` if this script requires a reload when enabled while in a game.
     */
    reloadRequired: string;
    /** Whether this script is a library */
    isLibrary: string;
    /** A URL which the raw code of this script can be downloaded from */
    downloadUrl: string | null;
    /** The URL of a webpage providing information about this script */
    webpage: string | null;
    /** Libraries which this script depends on */
    needsLib: string[];
    /** Libraries which this script may use, but does not require */
    optionalLib: string[];
    /** A message explaining why this script has been deprecated if it has been */
    deprecated: string | null;
    /** Gamemodes which this script's `net.onLoad` callbacks will fire when playing */
    gamemode: string[];
    /** Changes which have been made since the previous version */
    changelog: string[];
    /** Plugins which this script depends on. Only available to plugins. */
    needsPlugin: string[];
    /** Whether this script has a settings menu. Only available to plugins. */
    hasSettings: string;
    /** A signature included in official plugins to prove authenticity */
    signature: string | null;
}

export interface OfficialScriptInfo {
    title: string;
    description: string;
    downloadUrl: string;
    webpage: string;
}
