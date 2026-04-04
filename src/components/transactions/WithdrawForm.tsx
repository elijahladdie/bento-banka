"use client";

import type { ReactNode } from "react";
import GlassInput from "@/components/ui/GlassInput";

type WithdrawFormProps = {
  accountField?: ReactNode;
  amount: string;
  description: string;
  onAmountChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  amountLabel?: string;
  descriptionLabel?: string;
  amountPlaceholder?: string;
  descriptionPlaceholder?: string;
  hint?: string;
};

export default function WithdrawForm({
  accountField,
  amount,
  description,
  onAmountChange,
  onDescriptionChange,
  amountLabel,
  descriptionLabel,
  amountPlaceholder,
  descriptionPlaceholder,
  hint
}: WithdrawFormProps) {
  return (
    <div className="space-y-3 text-left">
      {accountField}
      <GlassInput
        type="number"
        min={100}
        value={amount}
        onChange={(event) => onAmountChange(event.target.value)}
        placeholder={amountPlaceholder ?? "Enter amount"}
        label={amountLabel}
      />
      <GlassInput
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
        placeholder={descriptionPlaceholder ?? "Reason for withdrawal"}
        label={descriptionLabel}
      />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
