import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GlassTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(({ label, hint, className, id, ...props }, ref) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      {label ? (
        <label htmlFor={id} className="glass-label">
          {label}
        </label>
      ) : null}
      <textarea
        ref={ref}
        id={id}
        className={cn("glass-input", className)}
        style={{ resize: "vertical", minHeight: "100px" }}
        {...props}
      />
      {hint ? (
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>{hint}</span>
      ) : null}
    </div>
  );
});

GlassTextarea.displayName = "GlassTextarea";

export default GlassTextarea;
