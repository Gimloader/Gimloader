import { writable } from 'svelte/store';

export let focusTrapEnabled = writable(true);
export let officialPluginsOpen = writable(false);