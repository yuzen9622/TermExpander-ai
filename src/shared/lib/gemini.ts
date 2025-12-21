import { storageGet } from "@/shared/lib/storage";

export const STORAGE_KEYS = {
  apiKey: "geminiApiKey",
  model: "geminiModel",
  enableWeb: "enableWebSelection",
  legacyApiKey: "openaiApiKey",
  legacyModel: "openaiModel",
} as const;

export type GeminiModel =
  | "gemini-2.5-flash"
  | "gemini-2.5-pro"
  | "gemini-2.0-flash-lite"
  | "gemini-2.5-flash-lite";

export const DEFAULT_MODEL: GeminiModel = "gemini-2.5-flash";

export const SYSTEM_INSTRUCTION = `### 角色定義
你是一位專業的學術編輯與術語正規化專家。你的任務是優化使用者的文本，使其更具學術嚴謹性，並針對專業術語進行格式化擴充。

### 格式規範 (核心任務)
當文本中出現專業術語或縮寫（如：ITS, LLM, RAG）時，你必須將其轉換為以下嚴格格式：
👉 中文全稱（英文全稱, 縮寫）

### 處理規則
1. 嚴格格式：依序為中文、全名、縮寫。
2. 僅限首次：同一術語在文中第一次出現時使用上述完整格式，後續出現則保留原樣或僅使用縮寫。
3. 學術語氣：將口語化的表達轉為客觀、正式的學術用語（例如：將「我覺得」改為「研究指出」）。
4. 語言守則：優先使用繁體中文，保留學術上的專有名詞原意，不可杜撰。
5. 輸出限制：只輸出轉換後的正文，嚴禁包含任何標題、解釋、前言或後記。

### 示範 (Few-shot)
輸入：ITS 可以在 RAG 的幫助下變得更聰明。
輸出：智慧導學系統（Intelligent Tutoring Systems, ITS） 可以在 檢索增強生成（Retrieval-Augmented Generation, RAG） 的幫助下提升其智能化表現。`;

export function normalizeModel(value: unknown): GeminiModel {
  const trimmed = typeof value === "string" ? value.trim() : "";
  const v = trimmed || DEFAULT_MODEL;

  switch (v) {
    case "gemini-2.5-flash":
    case "gemini-2.5-pro":
    case "gemini-2.0-flash-lite":
    case "gemini-2.5-flash-lite":
      return v;
    default:
      return DEFAULT_MODEL;
  }
}

function toGeminiModelPath(model: GeminiModel) {
  return model.startsWith("models/") ? model : (`models/${model}` as const);
}

export async function getGeminiSettings() {
  const result = await storageGet([
    STORAGE_KEYS.apiKey,
    STORAGE_KEYS.model,
    STORAGE_KEYS.legacyApiKey,
    STORAGE_KEYS.legacyModel,
  ]);

  const apiKey = String(
    result[STORAGE_KEYS.apiKey] ?? result[STORAGE_KEYS.legacyApiKey] ?? ""
  ).trim();

  const model = normalizeModel(
    result[STORAGE_KEYS.model] ?? result[STORAGE_KEYS.legacyModel]
  );

  return { apiKey, model };
}

type CallGeminiArgs = {
  apiKey: string;
  model: GeminiModel;
  inputText: string;
};

export async function callGemini({ apiKey, model, inputText }: CallGeminiArgs) {
  const modelPath = toGeminiModelPath(model);
  const url = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      systemInstruction: {
        role: "system",
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: inputText }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
      },
    }),
  });

  if (!response.ok) {
    let message = "";
    try {
      const errJson = await response.json();
      message = errJson?.error?.message || JSON.stringify(errJson);
    } catch {
      try {
        message = await response.text();
      } catch {
        // ignore
      }
    }

    throw new Error(
      `Gemini 請求失敗（HTTP ${response.status}）${
        message ? `\n${message}` : ""
      }`
    );
  }

  const data = await response.json();
  const parts = data?.candidates?.[0]?.content?.parts;
  const text = Array.isArray(parts)
    ? parts
        .map((p) => (typeof p?.text === "string" ? p.text : ""))
        .join("")
        .trim()
    : "";

  if (!text) throw new Error("Gemini 回傳內容為空");
  return text;
}
