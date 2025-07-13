import { AutoFormSyncOptions, SerializedObject, StorageAdapter } from "../types";
export declare function generateFormKey(form: HTMLFormElement, options: AutoFormSyncOptions): string;
export declare function JSONDeserializer(serializedData: string): SerializedObject | null;
export declare function JSONSerializer(serializedData: SerializedObject): string;
export declare const getStorage: (options: AutoFormSyncOptions) => StorageAdapter;
export declare const isValidFormElement: (el: Element) => el is HTMLInputElement & HTMLSelectElement;
