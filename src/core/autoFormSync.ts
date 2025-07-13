import { AutoFormSyncOptions } from "../types";
import { addFormListeners } from "./addFormListeners";
import { restoreForm } from "./restoreForm";


export default async function autoFormSync(selector: string, options: AutoFormSyncOptions = {}): Promise<void> {
  const form = document.querySelector<HTMLFormElement>(selector);

  if (!form) {
    console.warn(`[auto-form-sync] Form not found: ${selector}`);
    throw new Error(`[auto-form-sync] Form not found: ${selector}`);
  }

  const restoreOnLoad = options?.restoreOnLoad !== undefined ? options.restoreOnLoad : true;

  if(restoreOnLoad){ 
    await restoreForm(form, options)
  }

  await addFormListeners(form, options)

  console.warn(`[auto-form-sync] Initialized on form:`, form);
}