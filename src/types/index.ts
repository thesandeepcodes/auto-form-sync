export enum StorageType {
  LocalStorage = "LocalStorage",
  SessionStorage = "SessionStorage",
  Custom = "Custom"
}

export interface StorageAdapter {
  save(key: string, value: string): void | Promise<void|null>;
  load(key: string): string | Promise<string|null> | null;
  remove(key: string): Promise<void|null> | void;
}


export type FormFieldType = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLButtonElement;

export type ExcludeRule = string | ((input: FormFieldType) => boolean);

export interface SerializedField {
  name: string;
  id: string;
  value: string;
}

export type SerializedObject = SerializedField[];


export type Serializer = (data: SerializedObject) => string
export type Deserializer = (data: string) => SerializedObject 

export interface AutoFormSyncOptions {
  key?: string;
  storage?: StorageType | StorageAdapter;
  debounce?: number;
  exclude?: ExcludeRule[];
  restoreOnLoad?: boolean;
  clearOnSubmit?: boolean;
  serializer?: Serializer;
  deserializer?: Deserializer;
  onSave?: (data: object) => void;
  onRestore?: (data: object) => void;
  onClear?: () => void;
}