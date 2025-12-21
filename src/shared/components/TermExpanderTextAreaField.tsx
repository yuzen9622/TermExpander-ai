import { memo } from "react";

import { Label } from "@/shared/shadcn/components/ui/label";
import { Textarea } from "@/shared/shadcn/components/ui/textarea";

type Props = {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
};

export const TermExpanderTextAreaField = memo(
  function TermExpanderTextAreaField({
    id,
    label,
    value,
    placeholder,
    readOnly,
    onChange,
  }: Props) {
    return (
      <div className="mb-2.5">
        <Label htmlFor={id} className="mb-1.5 block text-xs text-foreground/80">
          {label}
        </Label>
        <Textarea
          id={id}
          value={value}
          placeholder={placeholder}
          readOnly={readOnly}
          className="min-h-24 resize-y rounded-[10px] text-[13px] leading-[1.4]"
          onChange={(e) => onChange?.(e.target.value)}
        />
      </div>
    );
  }
);
