import { AutoFormSyncOptions, FormFieldType } from "../types";
import { generateFormKey, getStorage, JSONDeserializer } from "../utils/helper";

export async function restoreForm(form: HTMLFormElement, options: AutoFormSyncOptions): Promise<void>{
    const storage = getStorage(options);

    const deserializer = options?.deserializer || JSONDeserializer

    const storageKey = generateFormKey(form, options);

    const serializedData = await storage.load(storageKey);
    
    if(!serializedData || !deserializer){
        console.warn(`[auto-form-sync] Unable to load serialized data for this form: ${form}`)
        return;
    }

    const data = deserializer(serializedData)
    
    if(data){
        data?.forEach(formData => {
            const formElem: FormFieldType|null = form.querySelector(`[name="${formData.name}"]`) ?? (formData.id ? form.querySelector(`#${formData.id}`) : null);
    
            if(formElem){
                formElem.value = formData.value.toString()
            }

            if(formElem?.type == "checkbox"){
                (formElem as HTMLInputElement).checked = formData?.value === "true"
            }
        })
        
        options?.onRestore?.(data)
    }
}