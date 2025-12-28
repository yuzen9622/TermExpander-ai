import { memo } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/shadcn/components/ui/accordion";
import { Button } from "@/shared/shadcn/components/ui/button";
import { Checkbox } from "@/shared/shadcn/components/ui/checkbox";
import { Input } from "@/shared/shadcn/components/ui/input";
import { Label } from "@/shared/shadcn/components/ui/label";

export type TermExpanderModel =
  | "gemini-2.5-flash"
  | "gemini-2.5-pro"
  | "gemini-2.0-flash-lite"
  | "gemini-2.5-flash-lite";

type Props = {
  enableWeb: boolean;
  apiKey: string;
  model: TermExpanderModel;
  onEnableWebChange: (value: boolean) => void;
  onApiKeyChange: (value: string) => void;
  onModelChange: (value: TermExpanderModel) => void;
  onSave: () => void;
  disabled?: boolean;
};

const MODEL_OPTIONS: Array<{ value: TermExpanderModel; label: string }> = [
  { value: "gemini-2.5-flash", label: "gemini-2.5-flash（預設）" },
  { value: "gemini-2.5-pro", label: "gemini-2.5-pro" },
  { value: "gemini-2.0-flash-lite", label: "gemini-2.0-flash-lite" },
  { value: "gemini-2.5-flash-lite", label: "gemini-2.5-flash-lite" },
];

export const TermExpanderSettings = memo(function TermExpanderSettings({
  enableWeb,
  apiKey,
  model,
  onEnableWebChange,
  onApiKeyChange,
  onModelChange,
  onSave,
  disabled,
}: Props) {
  return (
    <Accordion type="single" collapsible className="mt-2.5 border-t pt-2.5">
      <AccordionItem value="settings" className="border-b-0">
        <AccordionTrigger className="py-0 text-xs text-foreground/80">
          設定（LLM）
        </AccordionTrigger>
        <AccordionContent className="pb-0 pt-2.5">
          <div className="space-y-2.5">
            <div className="space-y-1">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="enableWeb"
                  checked={enableWeb}
                  onCheckedChange={(v) => onEnableWebChange(v === true)}
                  className="mt-0.5"
                  disabled={disabled}
                />
                <Label
                  htmlFor="enableWeb"
                  className="text-xs font-normal leading-snug"
                >
                  啟用網頁選字工具提示
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                開啟後：選取文字會出現提示框，點「轉換」才查詢。
              </p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="apiKey" className="text-xs text-foreground/80">
                API Key（儲存在本機）
              </Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                placeholder="例如：AIza..."
                autoComplete="off"
                className="h-10 rounded-[10px] text-[13px]"
                disabled={disabled}
                onChange={(e) => onApiKeyChange(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-foreground/80">模型</Label>
              <select
                id="model"
                value={model}
                onChange={(e) =>
                  onModelChange(e.target.value as TermExpanderModel)
                }
                disabled={disabled}
                className="h-10 w-full rounded-[10px] border border-input bg-background px-3 text-[13px] outline-none"
              >
                {MODEL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                預設使用 Google Gemini API（generateContent）。
              </p>
            </div>

            <div className="flex items-center">
              <Button
                type="button"
                variant="secondary"
                className="h-10 w-full rounded-[10px] text-[13px]"
                onClick={onSave}
                disabled={disabled}
              >
                儲存設定
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
});
