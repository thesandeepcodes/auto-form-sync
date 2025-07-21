> Automatically **save**, **restore**, and **sync form data** in the browser - with zero dependencies.
> Ideal for autosaving drafts, restoring lost input, and improving UX - all with one line of code.

---

## 🚀 What is it?

`auto-form-sync` is a tiny utility that adds autosave + restore behavior to any HTML form. It listens for input changes and persistently stores values in `localStorage`, `sessionStorage`, or any custom storage backend. If the page refreshes, crashes, or navigates away - the form data is restored automatically.

---

## 📦 Installation

```bash
npm install auto-form-sync
```

Or include via `<script>` tag:

```html
<script src="dist/index.min.js"></script>
```

---

## ✍️ Example (Plain HTML)

```html
<form id="loginForm">
  <input name="username" placeholder="Username" />
  <select name="role">
    <option value="admin">Admin</option>
    <option value="user">User</option>
  </select>
  <input type="password" name="password" />
  <button>Submit</button>
</form>

<script type="module">
  import { autoFormSync } from "auto-form-sync";

  autoFormSync("#loginForm", {
    key: "login-draft",
    storage: "LocalStorage", // or "SessionStorage"
    debounce: 500, // in ms
    exclude: ["password"],
    restoreOnLoad: true,
    clearOnSubmit: true,
  });
</script>
```

---

## ⚛️ React Usage

You can directly use `autoFormSync` inside useEffect hook for simplicity.

```js
import { useEffect, useState } from "react";
import { autoFormSync } from "auto-form-sync";

function LoginForm() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  useEffect(() => {
    autoFormSync("#loginForm", {
      key: "login-draft",
      exclude: ["password"],
      onRestore: (restored) => {
        const restoredMap = Object.fromEntries(
          restored.map((field) => [field.name, field.value])
        );

        setFormData((prev) => ({
          ...prev,
          ...restoredMap,
        }));
      },
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form id="loginForm">
      <input
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
      />
      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
      />
      <button type="submit">Submit</button>
    </form>
  );
}

export default LoginForm;
```

Or use the built-in React hook `useAutoFormSync` to integrate with your forms inside React components.

```js
import { useMemo, useState } from "react";
import { useAutoFormSync } from "auto-form-sync";

function LoginForm() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const options = useMemo(
    () => ({
      key: "login-draft",
      exclude: ["password"],
      onRestore: (restored) => {
        const restoredMap = Object.fromEntries(
          restored.map((field) => [field.name, field.value])
        );

        setFormData((prev) => ({
          ...prev,
          ...restoredMap,
        }));
      },
    }),
    []
  );

  useAutoFormSync("#loginForm", options);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form id="loginForm">
      <input
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
      />
      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
      />
      <button type="submit">Submit</button>
    </form>
  );
}

export default LoginForm;
```

✅ Works with all React versions >=17. No provider or setup needed.

> ℹ️ Always wrap the options in the useMemo hook when passing them to autoFormSync.

---

## ⚙️ Options

| Option          | Type                                                                      | Default                               | Description                                                                |
| --------------- | ------------------------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------- |
| `key`           | `string`                                                                  | `generated based on form id or class` | Unique key to store form data under.                                       |
| `storage`       | `"LocalStorage"` \| `"SessionStorage"` \| customStorage: `StorageAdapter` |                                       | Where to store data (`localStorage`, `sessionStorage`, or custom adapter). |
| `debounce`      | `number`                                                                  | `300`                                 | Delay (ms) to wait before saving after input.                              |
| `exclude`       | `string[]` \| `function[]`                                                | `[]`                                  | Field names, selectors, or functions to exclude.                           |
| `restoreOnLoad` | `boolean`                                                                 | `true`                                | Auto-restore saved values on page load.                                    |
| `clearOnSubmit` | `boolean`                                                                 | `true`                                | Clear saved data when form is submitted.                                   |
| `serializer`    | `(data) => string`                                                        | `JSON.stringify`                      | Custom serialization (e.g. encrypt).                                       |
| `deserializer`  | `(string) => data`                                                        | `JSON.parse`                          | Custom deserialization (e.g. decrypt).                                     |
| `onSave`        | `(data) => void`                                                          | -                                     | Callback when form is saved.                                               |
| `onRestore`     | `(data) => void`                                                          | -                                     | Callback when data is restored.                                            |
| `onClear`       | `() => void`                                                              | -                                     | Callback when data is cleared.                                             |

---

### StorageAdapter

StorageAdapter can be used for customized setup.

```
StorageAdapter {
  save(key: string, value: string): void | Promise<void|null>;
  load(key: string): string | Promise<string|null> | null;
  remove(key: string): Promise<void|null> | void;
}
```

`Example`

```js
options:{
  ....,
  storage: {
    save: (key, value) => {},
    load: async (key) => {},
    remove: async (key) => {},
  }
}
```

## 🧪 Live Example

```html
<form id="myform">
  <input type="text" name="username" placeholder="Enter Username" />
  <select name="userRole">
    <option value="admin">Admin</option>
    <option value="manager">Manager</option>
  </select>
  <input type="password" name="password" placeholder="Password" />
  <input type="checkbox" name="keepMeLoggedIn" />
  <label for="keepMeLoggedIn">Keep me logged in</label>
  <button type="submit">Login</button>
</form>

<script type="module">
  import { autoFormSync } from "../dist/index.esm.min.js";

  autoFormSync("#myform", {
    key: "my-custom-key", // should be unique for each form
    storage: "SessionStorage", // SessionStorage | LocalStorage | object: StorageAdapter
    debounce: 400, // in ms
    exclude: ["password", (field) => field.name === "secret"],
    restoreOnLoad: true,
    clearOnSubmit: true,
    serializer: JSON.stringify,
    deserializer: JSON.parse,
    onSave: (data) => console.log("Saved!", data),
    onRestore: (data) => console.log("Restored!", data),
    onClear: () => console.log("Storage cleared!"),
  });
</script>
```

---

## 🧰 Custom Storage Adapter

Use your own storage system (e.g. IndexedDB, cloud sync):

```js
const customStorage = {
  get: async (key) => fetch(`/storage/${key}`).then((res) => res.text()),
  set: async (key, value) =>
    fetch(`/storage/${key}`, { method: "POST", body: value }),
  remove: async (key) => fetch(`/storage/${key}`, { method: "DELETE" }),
};

autoFormSync("#form", {
  key: "custom-key",
  storage: customStorage,
});
```

---

## 🧼 Exclude Fields from Sync

You can skip sensitive or unnecessary inputs:

```js
exclude: [
  "password", // by name
  (field) => field.type === "file", // custom logic
];
```

---

## 🤝 Contributing

Contributions, suggestions, and PRs are welcome! Feel free to open issues for bugs, ideas, or enhancements.

---

## 📜 License

MIT - free to use, modify, and distribute.
