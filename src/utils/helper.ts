import { localStorageAdapter } from "../adapter/localStorageAdapter";
import { sessionStorageAdapter } from "../adapter/sessionStorageAdapter";
import { AutoFormSyncOptions, SerializedObject, StorageAdapter, StorageType } from "../types";

export function generateFormKey(form: HTMLFormElement, options: AutoFormSyncOptions): string{
    const id = form.id || form.classList[0]
    
    const generatedId = (options?.key || id).trim();
    

    if(generatedId == ""){
        throw new Error(`[auto-form-sync] Unable to find the storage key for this form: ${form}`)
    }

    const forms = document.querySelectorAll("form");

    if(Array.from(forms).some(it => it.dataset.key === generatedId)){
        throw new Error("[auto-form-sync] The key already exists. Please use different key or id name.")
    }

    return generatedId;
}


export function JSONDeserializer(serializedData: string): SerializedObject | null{
    try{
        const deserialized = JSON.parse(serializedData);
        
        return deserialized;
    }catch(e){
        return null;
    }
}

export function JSONSerializer(serializedData: SerializedObject): string{
    return JSON.stringify(serializedData)
}

export const getStorage = (options: AutoFormSyncOptions): StorageAdapter => {
  const { storage } = options;

  if (!storage || storage === StorageType.SessionStorage) {
    return sessionStorageAdapter;
  }

  if (storage === StorageType.LocalStorage) {
    return localStorageAdapter;
  }

  if (typeof storage === "object") {
    return storage;
  }

  throw new Error(`[auto-form-sync] Invalid storage option: ${storage}`);
};

    
export const isValidFormElement = (el: Element) => el instanceof HTMLInputElement && el instanceof HTMLSelectElement;
