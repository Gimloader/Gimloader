import { writable } from "svelte/store";

export const focusTrapEnabled = writable(true);
export const gameState = { inGame: false };
