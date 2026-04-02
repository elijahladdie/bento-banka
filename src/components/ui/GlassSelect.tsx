import { type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GlassSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export default function GlassSelect({ label, error, options, placeholder, className, id, ...props }: GlassSelectProps) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      {label ? (
        <label htmlFor={id} className="glass-label">
          {label}
        </label>
      ) : null}
      <select
        id={id}
        className={cn(
          "glass-input appearance-none bg-[length:12px_8px] bg-[position:right_16px_center] bg-no-repeat pr-12",
          error && "error",
          className
        )}
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23D4AF37' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E')",
        }}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <span className="mt-1 text-xs text-[var(--error-text)]" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
