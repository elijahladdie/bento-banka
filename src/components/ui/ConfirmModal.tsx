"use client";

import GlassButton from "./GlassButton";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  variant?: "danger" | "primary";
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading,
  variant = "danger",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="glass-modal-overlay" onClick={onCancel}>
      <div className="glass-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
        <h3 id="confirm-modal-title" className="mb-3 text-xl font-bold text-[var(--text-primary)]">
          {title}
        </h3>
        <p className="mb-7 leading-relaxed text-[var(--text-secondary)]">{message}</p>
        <div className="flex justify-end gap-3">
          <GlassButton variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </GlassButton>
          <GlassButton variant={variant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </GlassButton>
        </div>
      </div>
    </div>
  );
}
