"use client";

import GlassInput from "@/components/ui/GlassInput";

type ConfirmWithdrawalFormProps = {
  confirmationCode: string;
  onConfirmationCodeChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  hint?: string;
};

export default function ConfirmWithdrawalForm({
  confirmationCode,
  onConfirmationCodeChange,
  label,
  placeholder,
  hint
}: ConfirmWithdrawalFormProps) {
  return (
    <div className="space-y-3 text-left">
      <GlassInput
        value={confirmationCode}
        onChange={(event) => onConfirmationCodeChange(event.target.value.replace(/\D/g, "").slice(0, 4))}
        placeholder={placeholder ?? "1234"}
        inputMode="numeric"
        maxLength={4}
        label={label ?? "4-digit code"}
      />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
