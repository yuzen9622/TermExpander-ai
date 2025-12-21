import { memo } from "react";

type Props = {
  text: string;
};

export const TermExpanderStatus = memo(function TermExpanderStatus({
  text,
}: Props) {
  return (
    <div
      className="my-1.5 min-h-4 whitespace-pre-wrap text-xs text-muted-foreground"
      aria-live="polite"
    >
      {text}
    </div>
  );
});
