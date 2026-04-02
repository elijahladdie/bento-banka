import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(({ label, error, hint, className, id, ...props }, ref) => {
  return (
    <div className="flex w-full flex-col gap-1.5">
      {label ? (
        <label htmlFor={id} className="glass-label">
          {label}
        </label>
      ) : null}
      <input ref={ref} id={id} className={cn("glass-input", error && "error", className)} {...props} />
      {error ? (
        <span className="mt-1 text-xs text-[var(--error-text)]" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1 text-xs text-[var(--text-muted)]">{hint}</span>
      ) : null}
    </div>
  );
});

GlassInput.displayName = "GlassInput";

export default GlassInput;
