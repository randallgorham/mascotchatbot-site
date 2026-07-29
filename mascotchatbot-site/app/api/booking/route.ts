import { getSetting } from "@/lib/vault";

export const runtime = "edge";

// Public: returns the GoHighLevel calendar/booking URL the owner set in admin.
export async function GET() {
  const url = await getSetting("ghl_calendar_url", "https://calendly.com/randallgorham/new-meeting");
  return new Response(JSON.stringify({ url }), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
