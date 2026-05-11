"use client";

import { type ButtonHTMLAttributes, useRef } from "react";
import { cn } from "@/lib/utils";
import Spinner from "./Spinner";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "icon";
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
}

export default function GlassButton({
  children,
  variant = "primary",
  loading,
  loadingText,
  fullWidth,
  className,
  disabled,
  ...props
}: GlassButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const variantClass = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    danger: "btn-danger",
    icon: "btn-icon",
  }[variant];

  return (
    <button
      ref={ref}
      className={cn(variantClass, "glass-surface-lift", fullWidth && "w-full", className)}
      disabled={disabled || loading}
      style={loading ? { minWidth: ref.current?.offsetWidth } : undefined}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size={16} />
          <span>{loadingText ?? "Loading..."}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
