import { localPick, mindBrief } from "./engine";
import type { GameState } from "./types";

export interface MindResult {
  choiceId: string;
  monologue: string;
  mind: string;
  rng: number;
}

export async function consultMind(state: GameState, apiKey: string, serverConfigured: boolean): Promise<MindResult> {
  const pending = state.pending;
  if (!pending || pending.kind !== "cpu") {
    return { choiceId: "", monologue: "", mind: "instinct", rng: state.rng };
  }
  const local = localPick(state, pending.options);
  if (!apiKey && !serverConfigured) return { ...local, mind: "instinct" };
  const brief = mindBrief(state);
  if (!brief) return { ...local, mind: "instinct" };

  try {
    const headers: Record<string, string> = { "content-type": "application/json" };
    if (apiKey) headers["x-openai-key"] = apiKey;
    const response = await fetch("/api/cpu", {
      method: "POST",
      headers,
      body: JSON.stringify(brief),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return { ...local, mind: "instinct" };
    const data = (await response.json()) as { choiceId?: string; monologue?: string; model?: string };
    const choiceId = String(data.choiceId ?? "");
    if (!pending.options.some((option) => option.id === choiceId)) return { ...local, mind: "instinct" };
    const monologue = String(data.monologue ?? "").trim() || local.monologue;
    return { choiceId, monologue, mind: String(data.model ?? "model"), rng: local.rng };
  } catch {
    return { ...local, mind: "instinct" };
  }
}
