import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  heavy?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  nohover?: boolean;
}

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function GlassCard({ children, heavy, padding = "md", nohover, className, ...props }: GlassCardProps) {
  return (
    <div
      data-nohover={nohover ? "true" : "false"}
      className={cn(heavy ? "glass-card-heavy" : "glass-card", paddings[padding], nohover && "hover:transform-none", className)}
      {...props}
    >
      {children}
    </div>
  );
}
