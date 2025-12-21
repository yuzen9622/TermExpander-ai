import { memo } from "react";

import { Button } from "@/shared/shadcn/components/ui/button";

type Props = {
  onConvert: () => void;
  onClear: () => void;
  onCopy: () => void;
  isWorking?: boolean;
};

export const TermExpanderActions = memo(function TermExpanderActions({
  onConvert,
  onClear,
  onCopy,
  isWorking,
}: Props) {
  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          className="h-10 flex-1 rounded-[10px] text-[13px]"
          disabled={isWorking}
          onClick={onConvert}
        >
          轉換
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="h-10 flex-1 rounded-[10px] text-[13px]"
          disabled={isWorking}
          onClick={onClear}
        >
          清除
        </Button>
      </div>

      <div className="mt-2 flex items-center">
        <Button
          type="button"
          variant="secondary"
          className="h-10 w-full rounded-[10px] text-[13px]"
          disabled={isWorking}
          onClick={onCopy}
        >
          複製結果
        </Button>
      </div>
    </>
  );
});
