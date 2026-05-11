import GlassCard from "./GlassCard";
import { useCountUp } from "../../hooks/useCountUp";

export default function StatCard({ value, label, suffix }: any) {
  const { count, ref } = useCountUp(value);

  return (
    <div ref={ref}>
      <GlassCard className="p-4 text-center">
        <div className="text-xl font-bold text-foreground">
          {value === 99.9 ? "99.9" : count.toLocaleString()}
          {suffix}
        </div>

        <p className="text-xs text-muted-foreground mt-1">
          {label}
        </p>
      </GlassCard>
    </div>
  );
}