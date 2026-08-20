import type { Options } from "svelte-dnd-action";
import { writable } from "svelte/store";
import { flipDurationMs } from "$shared/consts";

export const focusTrapEnabled = writable(true);
export const gameState = { inGame: false };
export const dndZoneSettings: Partial<Options> = $state({
    flipDurationMs,
    useCursorForDetection: true,
    morphDisabled: true,
    dropTargetStyle: {}
});
