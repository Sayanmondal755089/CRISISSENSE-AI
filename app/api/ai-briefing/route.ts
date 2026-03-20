import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ text: null, error: "No API key" }, { status: 200 });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 900,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Anthropic API error:", err);
      return NextResponse.json({ text: null, error: err }, { status: 200 });
    }

    const data = await res.json();
    const text = data.content?.map((b: { text?: string }) => b.text ?? "").join("") ?? "";
    return NextResponse.json({ text });
  } catch (e) {
    console.error("AI briefing error:", e);
    return NextResponse.json({ text: null, error: String(e) }, { status: 200 });
  }
}
