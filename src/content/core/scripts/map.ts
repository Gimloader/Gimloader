import type { Script } from "./script.svelte";
import { Deferred } from "$shared/utils";

export const scriptInstanceMap = new Map<string, Script>();
export const pluginsLoaded = Deferred.create();
