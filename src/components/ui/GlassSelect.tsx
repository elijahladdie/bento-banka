"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";

interface GlassSelectProps {
  label?: string;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  id?: string;
}

export default function GlassSelect({
  label,
  placeholder,
  options,
  value,
  onValueChange,
  disabled,
  id,
}: GlassSelectProps) {
  const { showToast } = useToast();

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="glass-label">
          {label}
        </label>
      )}
      <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectPrimitive.Trigger
          id={id}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-white/20 bg-white/10 backdrop-blur-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder || "Select..."} />
          <SelectPrimitive.Icon asChild>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className={cn(
              "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-white/20 bg-white/10 text-foreground shadow-lg backdrop-blur-md"
            )}
          >
            <SelectPrimitive.ScrollUpButton className="flex items-center justify-center py-1 text-foreground opacity-50 hover:opacity-80">
              <ChevronUp className="h-4 w-4" />
            </SelectPrimitive.ScrollUpButton>

            <SelectPrimitive.Viewport className="p-1">
              {options.map((opt) => (
                <SelectPrimitive.Item
                  key={opt.value}
                  value={opt.value}
                  className={cn(
                    "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-white/20 focus:bg-white/20 focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  )}
                  onPointerDown={() => {
                    if (!opt.value) {
                      showToast({ type: "error", message: "Invalid option selected" });
                    }
                  }}
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <SelectPrimitive.ItemIndicator>
                      <Check className="h-4 w-4" />
                    </SelectPrimitive.ItemIndicator>
                  </span>
                  <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>

            <SelectPrimitive.ScrollDownButton className="flex items-center justify-center py-1 text-foreground opacity-50 hover:opacity-80">
              <ChevronDown className="h-4 w-4" />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}