import { StorageAdapter } from '../types';

export const localStorageAdapter: StorageAdapter = {
  save(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`[auto-form-sync] Failed to save to localStorage:`, error);
    }
  },

  load(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`[auto-form-sync] Failed to load from localStorage:`, error);
      return null;
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`[auto-form-sync] Failed to remove from localStorage:`, error);
    }
  }
};
