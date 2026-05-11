import * as HoverCard from "@radix-ui/react-hover-card";
import GlassButton from "../ui/GlassButton";
import GlassCard from "../ui/GlassCard";
import { formatBillingLabel, formatMoney } from "./format";
import type { PricingPlan } from "./types";
import { CircleCheck } from "lucide-react";

type PricingCardProps = {
  plan: PricingPlan;
  locale: string;
  freeLabel: string;
  billedLabel: string;
  billingMonthLabel: string;
  billingYearLabel: string;
  popularLabel: string;
  trialLabel: string;
  ctaLabel: string;
};

export default function PricingCard({
  plan,
  locale,
  freeLabel,
  billedLabel,
  billingMonthLabel,
  billingYearLabel,
  popularLabel,
  trialLabel,
  ctaLabel,
}: PricingCardProps) {
  const formattedPrice = formatMoney(locale, plan.priceAmount, plan.currencyCode, freeLabel);
  const billingLabel = formatBillingLabel(plan, billedLabel, billingMonthLabel, billingYearLabel);

  const visibleFeatures = plan.features.slice(0, 4);

  return (
    <GlassCard
      heavy={plan.popular}
      padding="lg"
      className={plan.popular ? "pricing-card is-popular" : "pricing-card"}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-[var(--text-primary)]">{plan.name}</h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--text-secondary)]">
              {plan.description}
            </p>
          </div>

          {plan.popular ? (
            <span className="inline-flex shrink-0 rounded-full border border-[rgba(110,180,80,0.55)] bg-[rgba(110,180,80,0.18)] px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[rgba(110,180,80,0.9)]">
              {popularLabel}
            </span>
          ) : null}
        </div>

        <div className="mt-8 flex items-end gap-3">
          <span className="text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
            {formattedPrice} /
          </span>
          <span className="pb-1 text-sm text-[var(--text-secondary)]">{billingLabel}</span>
        </div>

        {plan.trialLabel ? (
          <div className="mt-2 flex min-h-[28px] flex-wrap items-center gap-2">
            <>
              <span className="inline-flex rounded-full border border-[rgba(96,165,250,0.35)] bg-[rgba(59,130,246,0.12)] px-3 py-1 text-xs font-medium text-[var(--info-primary)]">
                {plan.trialLabel}
              </span>
              <span className="text-xs text-[var(--text-muted)]">{trialLabel}</span>
            </>
          </div>
        ) : null}
        <p className="text-sm py-2 mt-2 text-[var(--text-muted)] text-bold">
          What's included
        </p>
        {plan.features.length ? (
          <HoverCard.Root openDelay={120} closeDelay={80}>
            <HoverCard.Trigger asChild>
              <button
                type="button"
                className="mt-0 w-full cursor-help rounded-2xl text-left"
                aria-label={`${plan.name} features`}
              >
                {/* <ul className="space-y-3 text-sm leading-6 text-[var(--text-secondary)]">
                  {visibleFeatures.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <CircleCheck />
                      <span
                        className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${plan.popular ? "bg-[rgb(110,180,80)]" : "bg-[var(--gold)]"
                          }`}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul> */}
                <div className="space-y-3 text-sm leading-6 text-[var(--text-secondary)]">
                  {visibleFeatures.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <CircleCheck
                        className={`mt-1 h-4 w-4 shrink-0 ${plan.popular
                            ? "text-[rgb(20,20,20)]"
                            : "text-[var(--gold)]"
                          }`}
                      />

                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                {plan.features.length > visibleFeatures.length ? (
                  <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Hover to see all features
                  </p>
                ) : null}
              </button>
            </HoverCard.Trigger>

            <HoverCard.Portal>
              <HoverCard.Content
                sideOffset={10}
                align="start"
                className={
                  plan.popular
                    ? "z-50 max-w-sm rounded-3xl border border-[rgba(110,180,80,0.35)] bg-[rgba(110,180,80,0.12)] p-5 text-left shadow-[0_24px_80px_rgba(110,180,80,0.2)] backdrop-blur-xl"
                    : "z-50 max-w-sm rounded-3xl border border-[rgba(255,255,255,0.18)] bg-[rgba(10,15,30,0.96)] p-5 text-left shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
                }
              >
                <div className="space-y-4">
                  <p className="text-sm leading-7 text-[var(--text-secondary)]">{plan.featureInfo}</p>

                  {plan.features.length ? (
                    <ul className="space-y-2 text-sm leading-6 text-[var(--text-primary)]">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex gap-3">
                          <span
                            className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${plan.popular ? "bg-[rgb(110,180,80)]" : "bg-[var(--gold)]"
                              }`}
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <HoverCard.Arrow
                  className={
                    plan.popular
                      ? "fill-[rgba(110,180,80,0.12)]"
                      : "fill-[rgba(10,15,30,0.96)]"
                  }
                />
              </HoverCard.Content>
            </HoverCard.Portal>
          </HoverCard.Root>
        ) : null}

        <div className="mt-8">
          <GlassButton
            type="button"
            fullWidth
            variant={plan.popular ? "secondary" : "primary"}
            aria-label={`${ctaLabel} ${plan.name}`}
          >
            {ctaLabel}
          </GlassButton>
        </div>
      </div>
    </GlassCard>
  );
}