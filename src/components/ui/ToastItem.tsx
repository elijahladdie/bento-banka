"use client";

import { AlertTriangle, CheckCircle, Info, X, XCircle } from "lucide-react";
import { useEffect } from "react";
import type { Toast } from "@/hooks/useToast";

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export default function ToastItem({ toast, onRemove }: ToastItemProps) {
  useEffect(() => {
    const timeout = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(timeout);
  }, [toast.id, onRemove]);

  const Icon = iconMap[toast.type];

  return (
    <div className={`toast ${toast.type}`}>
      <Icon size={18} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700 }}>{toast.title}</div>
        {toast.message ? <div style={{ color: "var(--text-secondary)", marginTop: 4 }}>{toast.message}</div> : null}
      </div>
      <button className="btn-icon" style={{ padding: 4 }} onClick={() => onRemove(toast.id)}>
        <X size={14} />
      </button>
    </div>
  );
}
