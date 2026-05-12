import type { APIRoute } from "astro";
import { renderToString } from "astro/runtime/server/render";
import PricingPlanCard from "../../components/pricing/PricingPlanCard.astro";

export const GET: APIRoute = async ({ url }) => {
  const interval = url.searchParams.get("interval") || "year";

  try {
    // Fetch pricing data from your pricing endpoint
    const pricingUrl = new URL("/api/pricing", url.origin);
    pricingUrl.searchParams.set("interval", interval);
    
    const pricingResponse = await fetch(pricingUrl);
    if (!pricingResponse.ok) {
      return new Response("Failed to fetch pricing data", { status: 500 });
    }

    const { plans } = await pricingResponse.json();
    if (!Array.isArray(plans)) {
      return new Response("Invalid pricing data", { status: 500 });
    }

    // Render each plan card as HTML
    const cardsHtml = await Promise.all(
      plans.map((plan) =>
        renderToString(PricingPlanCard, {
          name: plan.name,
          description: plan.description,
          priceAmount: plan.priceAmount,
          currencyCode: plan.currencyCode,
          billingInterval: plan.billingInterval,
          features: plan.features,
          popular: plan.popular,
          freeLabel: url.searchParams.get("freeLabel") || "Free",
          billingMonthLabel: url.searchParams.get("billingMonthLabel") || "per month",
          billingYearLabel: url.searchParams.get("billingYearLabel") || "per year",
          ctaLabel: url.searchParams.get("ctaLabel") || "Get Started",
          locale: url.searchParams.get("locale") || "en",
        })
      )
    );

    return new Response(cardsHtml.join(""), {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("Error rendering pricing cards:", error);
    return new Response("Error rendering cards", { status: 500 });
  }
};
