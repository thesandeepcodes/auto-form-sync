import { useEffect, useMemo } from "react";
import autoFormSync from "../core/autoFormSync";
import { AutoFormSyncOptions } from "../types";

export default function useAutoFormSync(selector: string, options: AutoFormSyncOptions = {}): void {
  const stableOptions = useMemo(() => options, [
    options.key,
    options.storage,
    options.debounce,
    options.exclude,
    options.restoreOnLoad,
    options.clearOnSubmit,
    options.serializer,
    options.deserializer,
    options.onSave,
    options.onRestore,
    options.onClear,
  ]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        if (!cancelled) {
          await autoFormSync(selector, stableOptions);
        }
      } catch (error) {
        console.error(`[useAutoFormSync] Error initializing form sync:`, error);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [selector, stableOptions]);
}
