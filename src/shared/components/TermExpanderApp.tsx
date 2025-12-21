import { useCallback, useEffect, useMemo, useState } from "react";

import { TermExpanderActions } from "@/shared/components/TermExpanderActions";
import { TermExpanderHeader } from "@/shared/components/TermExpanderHeader";
import {
  TermExpanderSettings,
  type TermExpanderModel,
} from "@/shared/components/TermExpanderSettings";
import { TermExpanderStatus } from "@/shared/components/TermExpanderStatus";
import { TermExpanderTextAreaField } from "@/shared/components/TermExpanderTextAreaField";

import { callGemini } from "@/shared/lib/gemini";
import { loadSettings, saveSettings } from "@/shared/lib/settings";

type StoredSettings = {
  enableWeb: boolean;
  apiKey: string;
  model: TermExpanderModel;
};

function coerceModelToUi(model: string): TermExpanderModel {
  switch (model) {
    case "gemini-2.5-flash":
    case "gemini-2.5-pro":
    case "gemini-2.0-flash-lite":
    case "gemini-2.5-flash-lite":
      return model;
    default:
      return "gemini-2.5-flash";
  }
}

export function TermExpanderApp() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [status, setStatus] = useState("");
  const [isWorking, setIsWorking] = useState(false);

  const [enableWeb, setEnableWeb] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState<TermExpanderModel>("gemini-2.5-flash");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = await loadSettings();
      if (cancelled) return;
      setEnableWeb(Boolean(s.enableWeb));
      setApiKey(s.apiKey ?? "");
      setModel(coerceModelToUi(s.model));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const currentSettings = useMemo<StoredSettings>(
    () => ({ enableWeb, apiKey, model }),
    [enableWeb, apiKey, model]
  );

  const onSaveSettings = useCallback(async () => {
    try {
      await saveSettings({
        enableWeb: currentSettings.enableWeb,
        apiKey: currentSettings.apiKey,
        model: currentSettings.model,
      });
      setStatus("設定已儲存。");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : String(err));
    }
  }, [currentSettings]);

  const onClear = useCallback(() => {
    setInputText("");
    setOutputText("");
    setStatus("");
  }, []);

  const onCopy = useCallback(async () => {
    if (!outputText.trim()) {
      setStatus("目前沒有可複製的結果。");
      return;
    }

    try {
      await navigator.clipboard.writeText(outputText);
      setStatus("已複製到剪貼簿。");
    } catch {
      // Fallback
      const el = document.createElement("textarea");
      el.value = outputText;
      el.style.position = "fixed";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.body.removeChild(el);
      setStatus("已複製到剪貼簿。");
    }
  }, [outputText]);

  const onConvert = useCallback(async () => {
    const text = inputText.trim();
    if (!text) {
      setStatus("請先輸入要轉換的文字。");
      return;
    }

    const apiKeyTrimmed = (apiKey || "").trim();
    if (!apiKeyTrimmed) {
      setStatus("尚未設定 API Key。請在『設定（LLM）』中填入並儲存。");
      return;
    }

    setIsWorking(true);
    setStatus("轉換中…");
    try {
      const output = await callGemini({
        apiKey: apiKeyTrimmed,
        model,
        inputText: text,
      });
      setOutputText(output);
      setStatus("完成。");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : String(err));
    } finally {
      setIsWorking(false);
    }
  }, [apiKey, inputText, model]);

  return (
    <div className="w-full">
      <TermExpanderHeader />

      <TermExpanderTextAreaField
        id="inputText"
        label="輸入文字"
        value={inputText}
        placeholder="請貼上要轉換的段落或句子"
        onChange={setInputText}
      />

      <TermExpanderActions
        onConvert={onConvert}
        onClear={onClear}
        onCopy={onCopy}
        isWorking={isWorking}
      />

      <TermExpanderStatus text={status} />

      <TermExpanderTextAreaField
        id="outputText"
        label="轉換結果"
        value={outputText}
        placeholder="結果會出現在這裡"
        readOnly
      />

      <TermExpanderSettings
        enableWeb={enableWeb}
        apiKey={apiKey}
        model={model}
        onEnableWebChange={setEnableWeb}
        onApiKeyChange={setApiKey}
        onModelChange={setModel}
        onSave={onSaveSettings}
        disabled={isWorking}
      />
    </div>
  );
}
