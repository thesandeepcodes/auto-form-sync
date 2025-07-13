import { debounce } from "../utils/debounce";
import { AutoFormSyncOptions, SerializedObject, FormFieldType, ExcludeRule, StorageAdapter, StorageType } from "../types";
import { generateFormKey, getStorage, JSONSerializer } from "../utils/helper";

const getSerializer = (options: AutoFormSyncOptions) =>
  options.serializer ?? JSONSerializer;

const getDebounceDelay = (options: AutoFormSyncOptions) =>
  options.debounce ?? 300;

const isExcluded = (el: FormFieldType, rules: ExcludeRule[] = []) =>
  rules.some(rule =>
    typeof rule === "string"
      ? rule === el.id || rule === el.name
      : rule(el)
  );

const canSyncField = (el: Element, options: AutoFormSyncOptions): el is FormFieldType => {
  if((el as HTMLButtonElement | HTMLInputElement).type === "submit" || el instanceof HTMLButtonElement) return false;

  return !(el as HTMLInputElement).disabled &&
  !(el as HTMLElement).dataset?.nosync &&
  !isExcluded(el as FormFieldType, options.exclude);
}

const serializeForm = (form: HTMLFormElement, options: AutoFormSyncOptions): SerializedObject =>
  Array.from(form.elements)
    .filter(el => canSyncField(el, options))
    .map(el => ({
      name: (el as FormFieldType).name,
      id: (el as FormFieldType).id,
      value: el.type == "checkbox" ? ((el as HTMLInputElement).checked ? "true" : "false") : (el as FormFieldType).value,
    }))

export async function addFormListeners(form: HTMLFormElement, options: AutoFormSyncOptions = {}): Promise<() => void> {
  const storage = getStorage(options);
  const serializer = getSerializer(options);
  const delay = getDebounceDelay(options);
  const key = generateFormKey(form, options);

  if (!key) {
    console.warn("[auto-form-sync] Unable to attach listeners: no storage key.");
    return () => {};
  }
  
  const persist = debounce(() => {
    const data = serializeForm(form, options);
    
    const json = serializer(data);
    storage.save(key, json);
    options.onSave?.(data);
  }, delay);

  const cleanups: Array<() => void> = [];

  for (const el of form.elements) {
    if (!canSyncField(el, options)) continue;
    
    const type = (el as HTMLInputElement).type;
    
    const event = type === "checkbox" || type === "radio" || el.tagName === "SELECT" ? "change" : "input";
    
    el.addEventListener(event, () => persist());

    cleanups.push(() => el.removeEventListener(event, () => persist()));
  }

  const onSubmit = async (e: SubmitEvent) => {
    if (typeof form.onsubmit === "function") {
      const result = form.onsubmit.call(form, e);
      
      if (result instanceof Promise) await result;
    }

    if (options.clearOnSubmit) {
      await storage.remove(key);
      options.onClear?.();
    }
  };

  form.addEventListener("submit", onSubmit);
  cleanups.push(() => form.removeEventListener("submit", onSubmit));

  return () => cleanups.forEach(remove => remove());
}
