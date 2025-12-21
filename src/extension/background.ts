import { callGemini, getGeminiSettings } from "@/shared/lib/gemini";

type GetExpansionRequest = {
  action: "getExpansion";
  text?: string;
};

type GetExpansionResponse =
  | { result: string; error?: never }
  | { error: string; result?: never };

chrome.runtime.onMessage.addListener(
  (request: unknown, _sender, sendResponse) => {
    const req = request as Partial<GetExpansionRequest> | null;
    if (req?.action !== "getExpansion") return;

    (async () => {
      const inputText = String(req?.text || "").trim();
      if (!inputText) {
        sendResponse({
          error: "沒有收到要轉換的文字。",
        } satisfies GetExpansionResponse);
        return;
      }

      const { apiKey, model } = await getGeminiSettings();
      if (!apiKey) {
        sendResponse({
          error:
            "尚未設定 Gemini API Key。請先在擴充功能 popup 的設定中填入並儲存。",
        } satisfies GetExpansionResponse);
        return;
      }

      const result = await callGemini({ apiKey, model, inputText });
      sendResponse({ result } satisfies GetExpansionResponse);
    })().catch((err) => {
      console.error("getExpansion failed", err);
      sendResponse({
        error: err instanceof Error ? err.message : String(err),
      } satisfies GetExpansionResponse);
    });

    return true;
  }
);
