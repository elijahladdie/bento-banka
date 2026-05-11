// "use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import PricingCard from "./PricingCard";
import PricingSkeleton from "./PricingSkeleton";
import PricingToggle from "./PricingToggle";
import { transformPricingResponse } from "./format";
import type { PricingInterval, PricingPlan } from "./types";

type PricingIslandProps = {
  locale: string;
  monthlyLabel: string;
  yearlyLabel: string;
  toggleLabel: string;
  popularLabel: string;
  trialLabel: string;
  ctaLabel: string;
  loadingTitle: string;
  loadingBody: string;
  errorTitle: string;
  errorBody: string;
  retryLabel: string;
  freeLabel: string;
  billedLabel: string;
  billingMonthLabel: string;
  billingYearLabel: string;
};

export default function PricingIsland(props: PricingIslandProps) {
  const [interval, setInterval] = useState<PricingInterval>("year");
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  const currentLoadingLabel = useMemo(
    () => `${props.loadingTitle}: ${interval === "month" ? props.monthlyLabel : props.yearlyLabel}`,
    [interval, props.loadingTitle, props.monthlyLabel, props.yearlyLabel]
  );

  useEffect(() => {
    const controller = new AbortController();
    let alive = true;

    async function loadPricing() {
      setLoading(true);
      setError(null);

      try {
        const resp = await fetch(`/api/pricing?interval=${encodeURIComponent(interval)}`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!resp.ok) {
          throw new Error(`Pricing request failed with status ${resp.status}`);
        }

        const payload = (await resp.json()) as any;

        if (!alive) return;

        setPlans(transformPricingResponse(payload, interval));
      } catch (requestError) {
        if (!alive || controller.signal.aborted) {
          return;
        }

        setError(requestError instanceof Error ? requestError.message : props.errorBody);
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    void loadPricing();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [interval, retryToken, props.errorBody]);

  return (
    <div className="mx-auto max-w-7xl">
      {/* <PricingToggle
        interval={interval}
        onChange={setInterval}
      /> */}
      {loading ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
            <RefreshCcw className="h-4 w-4 animate-spin" />
            <span>{currentLoadingLabel}</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">{props.loadingBody}</p>
          <PricingSkeleton />
        </div>
      ) : error ? (
        <GlassCard padding="lg" className="mx-auto max-w-2xl text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.12)] text-[var(--error-text)]">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-[var(--text-primary)]">
                {props.errorTitle}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                {props.errorBody}
              </p>
              <p className="mt-3 text-xs text-[var(--text-muted)]">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setRetryToken((value) => value + 1)}
              className="btn-primary glass-surface-lift inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
              aria-label={props.retryLabel}
            >
              <RefreshCcw className="h-4 w-4" />
              {props.retryLabel}
            </button>
          </div>
        </GlassCard>
      ) : (
        <div className="pricing-grid">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              locale={props.locale}
              freeLabel={props.freeLabel}
              billedLabel={props.billedLabel}
              billingMonthLabel={props.billingMonthLabel}
              billingYearLabel={props.billingYearLabel}
              popularLabel={props.popularLabel}
              trialLabel={props.trialLabel}
              ctaLabel={props.ctaLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
}