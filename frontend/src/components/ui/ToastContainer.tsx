"use client";

import { useToast } from "@/hooks/useToast";
import ToastItem from "./ToastItem";

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="glass-toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}
