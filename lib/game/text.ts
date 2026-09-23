import type { ChoiceOption, GameState } from "./types";

export function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

export function lira(n: number): string {
  const sign = n < 0 ? "-" : "";
  return `${sign}${new Intl.NumberFormat("tr-TR").format(Math.abs(Math.round(n)))} ₺`;
}

export function fill(template: string, state: GameState): string {
  const npc = Object.fromEntries(state.npcs.map((n) => [n.id, n.name]));
  const dict: Record<string, string> = {
    name: state.human.name,
    job: state.human.job,
    pet: state.human.pet,
    city: state.human.city,
    district: state.human.district,
    money: lira(state.money),
    manager: String(npc.manager ?? "the manager"),
    crush: String(npc.crush ?? "a coworker"),
    ex: String(npc.ex ?? "the ex"),
    mother: String(npc.mother ?? "Mum"),
    brother: String(npc.brother ?? "my brother"),
    friend: String(npc.friend ?? "a friend"),
  };
  return template.replace(/\{(\w+)\}/g, (match, key: string) => dict[key] ?? match);
}

export function hydrateOption(option: ChoiceOption, state: GameState): ChoiceOption {
  return {
    ...option,
    label: fill(option.label, state),
    thought: fill(option.thought, state),
    log: fill(option.log, state),
    memory: option.memory ? fill(option.memory, state) : undefined,
    causal: option.causal ? fill(option.causal, state) : undefined,
    viral: option.viral ? fill(option.viral, state) : undefined,
    effects: { ...option.effects },
    fit: { ...option.fit },
    flags: option.flags ? { ...option.flags } : undefined,
    npc: option.npc ? { ...option.npc } : undefined,
  };
}
