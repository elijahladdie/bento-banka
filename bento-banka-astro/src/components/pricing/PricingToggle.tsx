import * as Switch from "@radix-ui/react-switch";
import type { PricingInterval } from "./types";

type PricingToggleProps = {
  interval: PricingInterval;
  onChange: (interval: PricingInterval) => void;
};

export default function PricingToggle({
  interval,
  onChange,
}: PricingToggleProps) {
  const checked = interval === "year";

  return (

    <div className="flex items-center gap-3 mx-auto my-auto">
      <span
        className={!checked
          ? "text-white font-medium"
          : "text-white/50"}
      >
        Monthly
      </span>

      <Switch.Root
        checked={checked}
        onCheckedChange={(value) =>
          onChange(value ? "year" : "month")
        }
        className="relative h-7 w-12 cursor-pointer rounded-full bg-white/10 transition-colors data-[state=checked]:bg-yellow-500 outline-none"
        aria-label="Toggle pricing interval"
      >
        <Switch.Thumb className="block h-5 w-5 translate-x-1 rounded-full bg-white transition-transform duration-200 will-change-transform data-[state=checked]:translate-x-6" />
      </Switch.Root><span
        className={checked
          ? "text-white font-medium"
          : "text-white/50"}
      >
        Yearly
      </span>
    </div >
  );
}