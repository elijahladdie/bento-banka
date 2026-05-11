import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BentoSize = "small" | "wide" | "tall" | "large" | "full";

type BentoGridProps = HTMLAttributes<HTMLDivElement>;

interface BentoItemProps extends HTMLAttributes<HTMLDivElement> {
  size?: BentoSize;
}

const sizeClass: Record<BentoSize, string> = {
  small: "bento-item-small",
  wide: "bento-item-wide",
  tall: "bento-item-tall",
  large: "bento-item-large",
  full: "bento-item"
};

export function BentoGrid({ className, ...props }: BentoGridProps) {
  return <div className={cn("bento-grid-system", className)} {...props} />;
}

export function BentoItem({ className, size = "full", ...props }: BentoItemProps) {
  return <div className={cn("bento-item", sizeClass[size], className)} {...props} />;
}
