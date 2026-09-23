import type { Alignment, ChoiceOption, LocationId, NpcId, Trait } from "./types";

interface RawOption {
  id: string;
  label: string;
  thought: string;
  log: string;
  alignment: Alignment;
  fit?: Partial<Record<Trait, number>>;
  mood?: number;
  stress?: number;
  energy?: number;
  hunger?: number;
  health?: number;
  career?: number;
  reputation?: number;
  trust?: number;
  money?: number;
  npc?: Partial<Record<NpcId, number>>;
  flags?: Record<string, boolean | number | string>;
  memory?: string;
  causal?: string;
  viral?: string;
  location?: LocationId;
}

export function opt(raw: RawOption): ChoiceOption {
  const effects: ChoiceOption["effects"] = {};
  if (raw.mood) effects.mood = raw.mood;
  if (raw.stress) effects.stress = raw.stress;
  if (raw.energy) effects.energy = raw.energy;
  if (raw.hunger) effects.hunger = raw.hunger;
  if (raw.health) effects.health = raw.health;
  if (raw.career) effects.career = raw.career;
  if (raw.reputation) effects.reputation = raw.reputation;
  if (raw.money) effects.money = raw.money;
  return {
    id: raw.id,
    label: raw.label,
    thought: raw.thought,
    log: raw.log,
    alignment: raw.alignment,
    fit: raw.fit ?? {},
    effects,
    trustDelta: raw.trust ?? 0,
    npc: raw.npc,
    flags: raw.flags,
    memory: raw.memory,
    causal: raw.causal,
    viral: raw.viral,
    location: raw.location,
  };
}
