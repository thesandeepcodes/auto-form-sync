import { useEffect, useRef } from "react";
import autoFormSync from "../core/autoFormSync";
import { AutoFormSyncOptions } from "../types";

export default function useAutoFormSync(selector: string, options: AutoFormSyncOptions = {}): void {
  const cleanupAutoForm = useRef<(() => void) | null>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        if (!cancelled && cleanupAutoForm.current == null) {
          cleanupAutoForm.current = await autoFormSync(selector, options);
        }
      } catch (error) {
        console.error(`[useAutoFormSync] Error initializing form sync:`, error);
      }
    };

    init();

    return () => {
      cancelled = true;
      
      if (typeof cleanupAutoForm.current === "function") {
        cleanupAutoForm.current();
        cleanupAutoForm.current = null;
      }
    };
  }, [selector, options]);
}
