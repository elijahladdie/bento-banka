import { forwardRef, type InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  icon?: ReactNode;               // optional icon
  iconPosition?: "left" | "right"; // default: left
}

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, hint, className, id, icon, iconPosition = "left", ...props }, ref) => {
    const hasIcon = !!icon;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="glass-label">
            {label}
          </label>
        )}

        <div
          className={cn(
            "relative w-full",
            "flex items-center",
            hasIcon ? (iconPosition === "left" ? "flex-row" : "flex-row-reverse") : "flex-row"
          )}
        >
          {hasIcon && (
            <span className="absolute left-3 pointer-events-none text-muted-foreground">
              {iconPosition === "left" ? icon : null}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            className={cn(
              "glass-input w-full",
              hasIcon ? "pl-10" : "",
              className
            )}
            {...props}
          />

          {hasIcon && iconPosition === "right" && (
            <span className="absolute right-3 pointer-events-none text-muted-foreground">
              {icon}
            </span>
          )}
        </div>

        {hint ? (
          <span className="mt-1 text-xs text-[var(--text-muted)]">{hint}</span>
        ) : null}
      </div>
    );
  }
);

GlassInput.displayName = "GlassInput";

export default GlassInput;