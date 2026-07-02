import type { Script } from "./script.svelte";

// Scripts must have globally unique name
export const scripts = new Map<string, Script>();
export const folderLocations = new Map<string, string>();
export const getItemFolder = (id: string) => folderLocations.get(id) ?? "root";
