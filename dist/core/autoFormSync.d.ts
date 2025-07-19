import { AutoFormSyncOptions } from "../types";
export default function autoFormSync(selector: string, options?: AutoFormSyncOptions): Promise<() => void>;
