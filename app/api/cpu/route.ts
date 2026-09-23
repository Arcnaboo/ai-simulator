const DEFAULT_MODEL = "gpt-4.1-mini";

const SYSTEM = `You are a specific person living an ordinary, messy day in Istanbul. You are not an assistant, a narrator, or a policy engine. You choose what this person actually does next.

Rules:
- Pick exactly one option id from the list.
- Advice is only advice. Low trust, stress, pride, hunger, embarrassment, or stubbornness can override it.
- Do the flawed, specific thing this person would do. Do not optimize their life.
- Monologue is first person, one or two short sentences, concrete and a little messy. No quotation marks. Never mention simulations, models, options, or that you are choosing from a list.
- Return JSON only: {"choiceId":"...","monologue":"..."}`;

interface Brief {
  language?: string;
  human?: string;
  situation?: string;
  advice?: string | null;
  memories?: string[];
  recent?: string[];
  options?: { id?: string; label?: string }[];
}

function systemFor(language: string): string {
  const line =
    language === "tr"
      ? "Monologue language: Turkish. Informal speech from İstanbul. First person. One or two short sentences. No quotation marks."
      : "Monologue language: English. First person. One or two short sentences. No quotation marks.";
  return `${SYSTEM}\n- ${line}`;
}

export async function GET() {
  return Response.json({
    configured: Boolean(process.env.OPENAI_API_KEY),
    model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
  });
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > 24000) return Response.json({ error: "too_large" }, { status: 413 });

  let brief: Brief;
  try {
    brief = JSON.parse(raw) as Brief;
  } catch {
    return Response.json({ error: "bad_json" }, { status: 400 });
  }

  const options = (brief.options ?? [])
    .map((option) => ({ id: String(option.id ?? ""), label: String(option.label ?? "") }))
    .filter((option) => option.id && option.label)
    .slice(0, 8);
  if (!options.length) return Response.json({ error: "no_options" }, { status: 400 });

  const key = process.env.OPENAI_API_KEY || request.headers.get("x-openai-key") || "";
  if (!key) return Response.json({ error: "no_key" }, { status: 401 });

  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const language = brief.language === "tr" ? "tr" : "en";
  const user = JSON.stringify({
    language,
    human: String(brief.human ?? "").slice(0, 1200),
    situation: String(brief.situation ?? "").slice(0, 2000),
    advice: brief.advice ? String(brief.advice).slice(0, 1200) : null,
    memories: (brief.memories ?? []).slice(-8).map((item) => String(item).slice(0, 240)),
    recent: (brief.recent ?? []).slice(-8).map((item) => String(item).slice(0, 240)),
    options,
  });

  let upstream: Response | null = null;
  for (const extra of [
    { temperature: 0.95, max_tokens: 220 },
    { max_tokens: 220 },
    { max_completion_tokens: 220 },
  ]) {
    upstream = await complete(key, model, user, extra, language);
    if (upstream.ok || upstream.status === 401) break;
  }
  if (!upstream?.ok) {
    const detail = upstream ? await upstream.text() : "";
    return Response.json({ error: "upstream", detail: detail.slice(0, 300) }, { status: 502 });
  }

  const payload = (await upstream.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content ?? "";
  const parsed = parseMind(content, new Set(options.map((option) => option.id)));
  if (!parsed) return Response.json({ error: "bad_choice" }, { status: 422 });
  return Response.json({ ...parsed, model });
}

async function complete(
  key: string,
  model: string,
  user: string,
  extra: Record<string, unknown>,
  language: string,
): Promise<Response> {
  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: systemFor(language) },
      { role: "user", content: user },
    ],
    response_format: { type: "json_object" },
    ...extra,
  };
  return fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(11000),
  });
}

function parseMind(raw: string, allowed: Set<string>): { choiceId: string; monologue: string } | null {
  const cleaned = raw.trim().replace(/^```json\s*/i, "").replace(/```$/i, "");
  let data: unknown;
  try {
    data = JSON.parse(cleaned);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object") return null;
  const record = data as { choiceId?: unknown; monologue?: unknown };
  const choiceId = String(record.choiceId ?? "");
  if (!allowed.has(choiceId)) return null;
  const monologue = String(record.monologue ?? "")
    .replace(/[“”"]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 280);
  return { choiceId, monologue };
}
