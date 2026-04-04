"use client";

import GlassButton from "@/components/ui/GlassButton";

interface ActionReasonModalProps {
  isOpen: boolean;
  title: string;
  hint: string;
  reason: string;
  onReasonChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
  loading?: boolean;
}

export default function ActionReasonModal({
  isOpen,
  title,
  hint,
  reason,
  onReasonChange,
  onCancel,
  onSubmit,
  submitLabel,
  loading,
}: ActionReasonModalProps) {
  if (!isOpen) return null;

  return (
    <div className="glass-modal-overlay" onClick={onCancel}>
      <div className="glass-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="action-reason-modal-title">
        <h3 id="action-reason-modal-title" className="mb-2 text-xl font-bold text-[var(--text-primary)]">
          {title}
        </h3>
        <p className="mb-3 text-sm text-[var(--text-secondary)]">{hint}</p>
        <textarea
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder="Type the reason"
          className="glass-input min-h-28 !px-4 !py-3"
        />
        <div className="mt-5 flex justify-end gap-3">
          <GlassButton variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </GlassButton>
          <GlassButton variant="primary" onClick={onSubmit} loading={loading}>
            {submitLabel}
          </GlassButton>
        </div>
      </div>
    </div>
  );
}