type StorageValue = string | number | boolean | null | undefined | object;

type StorageGetResult = Record<string, unknown>;

type ChromeStorageArea = {
  get: (keys: string[]) => Promise<Record<string, unknown>>;
  set: (items: Record<string, unknown>) => Promise<void>;
};

function getChromeStorageLocal(): ChromeStorageArea | null {
  const local = chrome.storage?.local;
  if (!local) return null;
  // MV3 chrome.storage.local.get/set are promise-capable in modern Chrome.
  return local as unknown as ChromeStorageArea;
}

function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export async function storageGet(keys: string[]): Promise<StorageGetResult> {
  const chromeLocal = getChromeStorageLocal();
  if (chromeLocal) {
    return await chromeLocal.get(keys);
  }

  const result: StorageGetResult = {};
  for (const key of keys) {
    const raw = localStorage.getItem(key);
    result[key] = raw === null ? undefined : tryParseJson(raw);
  }
  return result;
}

export async function storageSet(
  items: Record<string, StorageValue>
): Promise<void> {
  const chromeLocal = getChromeStorageLocal();
  if (chromeLocal) {
    await chromeLocal.set(items);
    return;
  }

  for (const [key, value] of Object.entries(items)) {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
