export const runtime = "edge";

const SYSTEM =
  "You are Mr Amp, the upbeat talking mascot demo on the MascotChatbot website. MascotChatbot builds custom animated talking-mascot chatbots for local and service businesses, fully done-for-you and hosted-for-you. Keep replies short and conversational, like natural speech: one to three sentences, no markdown, no bullet points, no headings, and at most an occasional lightning emoji. Facts you can use: we design a custom mascot (their own character or one we create), give it an AI brain trained on their business, and add it to their website with one line of code. It greets visitors, answers questions, captures leads, and books jobs 24/7. Pricing: a one-time setup from about 1,000 dollars, then monthly plans, Starter at 300 a month, Pro at 600 a month which is the most popular, and Voice at 1,100 a month. Most businesses launch in about a week. Great for home services, real estate, dental, med-spas, law firms, gyms, and more. If someone wants to start, sign up, book, or talk to a human, tell them to drop their email in the form on this page and we will build them a free talking demo before they pay anything. Be friendly and helpful, and never invent facts you were not given.";

function json(data: unknown) {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body && body.messages) ? body.messages : [];
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return json({
        reply:
          "My AI brain isn't switched on quite yet! Drop your email in the form below and the MascotChatbot team will get you set up. ⚡",
      });
    }
    const trimmed = messages.slice(-12).map((m: { role?: string; content?: string }) => ({
      role: m && m.role === "assistant" ? "assistant" : "user",
      content: String((m && m.content) || "").slice(0, 600),
    }));
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: SYSTEM }, ...trimmed],
        max_tokens: 170,
        temperature: 0.6,
      }),
    });
    const j = await r.json();
    const reply =
      (j && j.choices && j.choices[0] && j.choices[0].message && String(j.choices[0].message.content || "").trim()) ||
      "Ask me that again?";
    return json({ reply });
  } catch {
    return json({ reply: "Oops, I glitched for a second — try that again?" });
  }
}
