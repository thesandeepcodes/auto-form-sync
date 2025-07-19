import { useMemo, useEffect } from 'react';

/**
 * Debounce function: delays execution of `fn` until after `delay` ms have passed
 * since the last time it was invoked.
 *
 * @param {TimerHandler} fn - The function to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {Function}
 */
function debounce(fn, delay = 300) {
    let timerId;
    return function (...args) {
        clearTimeout(timerId);
        timerId = setTimeout(fn, delay, ...args);
    };
}

const localStorageAdapter = {
    save(key, value) {
        try {
            localStorage.setItem(key, value);
        }
        catch (error) {
            console.error(`[auto-form-sync] Failed to save to localStorage:`, error);
        }
    },
    load(key) {
        try {
            return localStorage.getItem(key);
        }
        catch (error) {
            console.error(`[auto-form-sync] Failed to load from localStorage:`, error);
            return null;
        }
    },
    remove(key) {
        try {
            localStorage.removeItem(key);
        }
        catch (error) {
            console.error(`[auto-form-sync] Failed to remove from localStorage:`, error);
        }
    }
};

const sessionStorageAdapter = {
    save(key, value) {
        try {
            sessionStorage.setItem(key, value);
        }
        catch (error) {
            console.error(`[auto-form-sync] Failed to save to sessionStorage:`, error);
        }
    },
    load(key) {
        try {
            return sessionStorage.getItem(key);
        }
        catch (error) {
            console.error(`[auto-form-sync] Failed to load from sessionStorage:`, error);
            return null;
        }
    },
    remove(key) {
        try {
            sessionStorage.removeItem(key);
        }
        catch (error) {
            console.error(`[auto-form-sync] Failed to remove from sessionStorage:`, error);
        }
    }
};

var StorageType;
(function (StorageType) {
    StorageType["LocalStorage"] = "LocalStorage";
    StorageType["SessionStorage"] = "SessionStorage";
    StorageType["Custom"] = "Custom";
})(StorageType || (StorageType = {}));

function generateFormKey(form, options) {
    const id = form.id || form.classList[0];
    const generatedId = (options?.key || id).trim();
    if (generatedId == "") {
        throw new Error(`[auto-form-sync] Unable to find the storage key for this form: ${form}`);
    }
    const forms = document.querySelectorAll("form");
    if (Array.from(forms).some(it => it.dataset.key === generatedId)) {
        throw new Error("[auto-form-sync] The key already exists. Please use different key or id name.");
    }
    return generatedId;
}
function JSONDeserializer(serializedData) {
    try {
        const deserialized = JSON.parse(serializedData);
        return deserialized;
    }
    catch (e) {
        return null;
    }
}
function JSONSerializer(serializedData) {
    return JSON.stringify(serializedData);
}
const getStorage = (options) => {
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

const getSerializer = (options) => options.serializer ?? JSONSerializer;
const getDebounceDelay = (options) => options.debounce ?? 300;
const isExcluded = (el, rules = []) => rules.some(rule => typeof rule === "string"
    ? rule === el.id || rule === el.name
    : rule(el));
const canSyncField = (el, options) => {
    if (el.type === "submit" || el instanceof HTMLButtonElement)
        return false;
    return !el.disabled &&
        !el.dataset?.nosync &&
        !isExcluded(el, options.exclude);
};
const serializeForm = (form, options) => Array.from(form.elements)
    .filter(el => canSyncField(el, options))
    .map(el => ({
    name: el.name,
    id: el.id,
    value: el.type == "checkbox" ? (el.checked ? "true" : "false") : el.value,
}));
async function addFormListeners(form, options = {}) {
    const storage = getStorage(options);
    const serializer = getSerializer(options);
    const delay = getDebounceDelay(options);
    const key = generateFormKey(form, options);
    if (!key) {
        console.warn("[auto-form-sync] Unable to attach listeners: no storage key.");
        return () => { };
    }
    const persist = debounce(() => {
        const data = serializeForm(form, options);
        const json = serializer(data);
        storage.save(key, json);
        options.onSave?.(data);
    }, delay);
    const cleanups = [];
    for (const el of form.elements) {
        if (!canSyncField(el, options))
            continue;
        const type = el.type;
        const event = type === "checkbox" || type === "radio" || el.tagName === "SELECT" ? "change" : "input";
        el.addEventListener(event, () => persist());
        cleanups.push(() => el.removeEventListener(event, () => persist()));
    }
    const onSubmit = async (e) => {
        if (typeof form.onsubmit === "function") {
            const result = form.onsubmit.call(form, e);
            if (result instanceof Promise)
                await result;
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

async function restoreForm(form, options) {
    const storage = getStorage(options);
    const deserializer = options?.deserializer || JSONDeserializer;
    const storageKey = generateFormKey(form, options);
    const serializedData = await storage.load(storageKey);
    if (!serializedData || !deserializer) {
        console.warn(`[auto-form-sync] Unable to load serialized data for this form: ${form}`);
        return;
    }
    const data = deserializer(serializedData);
    if (data) {
        data?.forEach(formData => {
            const formElem = form.querySelector(`[name="${formData.name}"]`) ?? (formData.id ? form.querySelector(`#${formData.id}`) : null);
            if (formElem) {
                formElem.value = formData.value.toString();
            }
            if (formElem?.type == "checkbox") {
                formElem.checked = formData?.value === "true";
            }
        });
        options?.onRestore?.(data);
    }
}

async function autoFormSync(selector, options = {}) {
    const form = document.querySelector(selector);
    if (!form) {
        console.warn(`[auto-form-sync] Form not found: ${selector}`);
        throw new Error(`[auto-form-sync] Form not found: ${selector}`);
    }
    const restoreOnLoad = options?.restoreOnLoad !== undefined ? options.restoreOnLoad : true;
    if (restoreOnLoad) {
        await restoreForm(form, options);
    }
    console.warn(`[auto-form-sync] Initialized on form:`, form);
    return await addFormListeners(form, options);
}

function useAutoFormSync(selector, options = {}) {
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
            }
            catch (error) {
                console.error(`[useAutoFormSync] Error initializing form sync:`, error);
            }
        };
        init();
        return () => {
            cancelled = true;
        };
    }, [selector, stableOptions]);
}

export { autoFormSync, useAutoFormSync };
//# sourceMappingURL=index.esm.js.map
