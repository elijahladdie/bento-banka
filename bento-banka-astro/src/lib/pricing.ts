export async function getPricing(interval: string = "month") {
  const response = await fetch(
    `https://staging.api.hikrl.ink/api/paddle/products?interval=${encodeURIComponent(
      interval
    )}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(
      `Pricing upstream failed: ${response.status}`
    );
  }

  return payload;
}