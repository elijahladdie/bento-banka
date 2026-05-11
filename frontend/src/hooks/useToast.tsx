"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

export type ToastPayload = {
  type: ToastType;
  title?: string;
  message: string;
};

interface ToastContextType {
  toasts: Toast[];
  showToast: ((payload: ToastPayload) => void) & ((type: ToastType, title: string, message?: string) => void);
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((arg1: ToastPayload | ToastType, arg2?: string, arg3?: string) => {
    const payload =
      typeof arg1 === "string"
        ? { type: arg1, title: arg2 ?? "", message: arg3 }
        : { type: arg1.type, title: arg1.title ?? arg1.message, message: arg1.title ? arg1.message : undefined };

    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type: payload.type, title: payload.title, message: payload.message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(() => ({ toasts, showToast, removeToast }), [toasts, showToast, removeToast]);
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
