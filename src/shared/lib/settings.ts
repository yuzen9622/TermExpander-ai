import { storageGet, storageSet } from "@/shared/lib/storage";
import {
  DEFAULT_MODEL,
  normalizeModel,
  STORAGE_KEYS,
} from "@/shared/lib/gemini";

export type LoadedSettings = {
  apiKey: string;
  model: ReturnType<typeof normalizeModel>;
  enableWeb: boolean;
};

export async function loadSettings(): Promise<LoadedSettings> {
  const result = await storageGet([
    STORAGE_KEYS.apiKey,
    STORAGE_KEYS.model,
    STORAGE_KEYS.enableWeb,
    STORAGE_KEYS.legacyApiKey,
    STORAGE_KEYS.legacyModel,
  ]);

  const apiKey = String(
    result[STORAGE_KEYS.apiKey] ?? result[STORAGE_KEYS.legacyApiKey] ?? ""
  );

  const model = normalizeModel(
    result[STORAGE_KEYS.model] ?? result[STORAGE_KEYS.legacyModel] ?? ""
  );

  const enableWebRaw = result[STORAGE_KEYS.enableWeb];
  const enableWeb = enableWebRaw !== false; // default true

  return { apiKey, model, enableWeb };
}

export async function saveSettings(args: LoadedSettings): Promise<void> {
  await storageSet({
    [STORAGE_KEYS.apiKey]: args.apiKey.trim(),
    [STORAGE_KEYS.model]: args.model || DEFAULT_MODEL,
    [STORAGE_KEYS.enableWeb]: Boolean(args.enableWeb),
  });
}
