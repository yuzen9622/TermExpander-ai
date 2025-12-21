import { memo } from "react";

export const TermExpanderHeader = memo(function TermExpanderHeader() {
  return (
    <header className="mb-3 flex items-center justify-center gap-1.25">
      <img
        src="/icons/icon-128.png"
        alt="TermExpander AI"
        width={48}
        height={48}
      />
      <div>
        <h1 className="text-base font-semibold leading-tight">
          TermExpander AI
        </h1>
        <p className="text-xs text-muted-foreground">
          貼上文字 → LLM 正規化/學術化用語
        </p>
      </div>
    </header>
  );
});
