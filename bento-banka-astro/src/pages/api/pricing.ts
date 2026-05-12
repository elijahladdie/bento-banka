import { getPricing } from "../../lib/pricing";

export async function GET({ request }: { request: Request }) {
  try {
    const url = new URL(request.url);

    const interval =
      url.searchParams.get("interval") ?? "month";

    const payload = await getPricing(interval);

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: String(err),
      }),
      {
        status: 500,
        headers: {
          "content-type": "application/json",
        },
      }
    );
  }
}