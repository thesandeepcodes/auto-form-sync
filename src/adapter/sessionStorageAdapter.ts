import { StorageAdapter } from "../types";

export const sessionStorageAdapter: StorageAdapter = {
    save(key: string, value: string): void {
        try {
            sessionStorage.setItem(key, value);
        } catch (error) {
            console.error(`[auto-form-sync] Failed to save to sessionStorage:`, error);
        }
    },

    load(key: string): string | null {
        try {
            return sessionStorage.getItem(key);
        } catch (error) {
            console.error(`[auto-form-sync] Failed to load from sessionStorage:`, error);
            return null;
        }
    },

    remove(key: string): void {
        try {
            sessionStorage.removeItem(key);
        } catch (error) {
            console.error(`[auto-form-sync] Failed to remove from sessionStorage:`, error);
        }
    }
}