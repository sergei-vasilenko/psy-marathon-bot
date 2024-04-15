import { writable } from "svelte/store";

export const isAuth = writable(false);

export const filesToSend = writable([]);

export const filesToDelete = writable([]);
