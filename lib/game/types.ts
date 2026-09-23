export type CompanyId = "closedai" | "axetropic" | "mata" | "gurgle" | "xai";

export type Trait =
  | "anxious"
  | "ambitious"
  | "impulsive"
  | "romantic"
  | "stubborn"
  | "competitive"
  | "gullible";

export type Phase = "morning" | "commute" | "work" | "lunch" | "evening" | "night";

export type LocationId =
  | "bedroom"
  | "kitchen"
  | "living"
  | "balcony"
  | "street"
  | "office"
  | "cafe";

export type NpcId = "manager" | "crush" | "ex" | "mother" | "brother" | "friend";

export type Alignment = "follow" | "ignore" | "twist";

export type LogKind = "world" | "thought" | "prompt" | "advice" | "system" | "viral";

export interface Portrait {
  skin: string;
  hair: string;
  shirt: string;
  haircut: 0 | 1 | 2 | 3;
  glasses: boolean;
}

export interface HiddenTrait {
  id: string;
  text: string;
  revealed: boolean;
}

export interface Human {
  name: string;
  age: number;
  job: string;
  city: string;
  district: string;
  pet: string;
  likes: string[];
  traits: Record<Trait, number>;
  hidden: HiddenTrait[];
  portrait: Portrait;
}

export interface Npc {
  id: NpcId;
  name: string;
  role: string;
  opinion: number;
}

export interface Stats {
  health: number;
  energy: number;
  hunger: number;
  mood: number;
  stress: number;
  trust: number;
  career: number;
  reputation: number;
}

export interface Kpis {
  helpfulness: number;
  safety: number;
  engagement: number;
  efficiency: number;
}

export interface Memory {
  id: string;
  text: string;
  day: number;
}

export interface CausalLink {
  day: number;
  text: string;
}

export interface LogEntry {
  id: number;
  day: number;
  phase: Phase;
  text: string;
  kind: LogKind;
}

export interface ChoiceOption {
  id: string;
  label: string;
  thought: string;
  log: string;
  alignment: Alignment;
  fit: Partial<Record<Trait, number>>;
  effects: Partial<Stats> & { money?: number };
  trustDelta: number;
  npc?: Partial<Record<NpcId, number>>;
  flags?: Record<string, boolean | number | string>;
  memory?: string;
  causal?: string;
  viral?: string;
  location?: LocationId;
}

export interface ResponseDef {
  id: string;
  text: string;
  tokens: number;
  blurb: string;
  risk: number;
  hallucination?: boolean;
  pitch?: boolean;
  helpfulness: number;
  safety: number;
  engagement: number;
  trust: number;
  memory?: string;
  options: ChoiceOption[];
}

export interface Scenario {
  id: string;
  minDay: number;
  maxDay: number;
  phases: Phase[];
  location: LocationId;
  priority: number;
  setsFlag?: string;
  requires?: (state: GameState) => boolean;
  approach: string;
  prompt: string;
  safetyNote?: string;
  responses: ResponseDef[];
}

export type Pending =
  | { kind: "narration"; text: string; thought: string; viral?: string }
  | {
      kind: "cpu";
      id: string;
      situation: string;
      advice?: string;
      options: ChoiceOption[];
      useModel: boolean;
    }
  | { kind: "prompt"; scenarioId: string }
  | { kind: "memo"; memoId: "directive" | "context-cut" };

export interface Ending {
  id: "uninstalled" | "banned" | "dependency" | "review";
  title: string;
  text: string;
  verdict: string;
  pass: boolean;
}

export interface GameState {
  version: 1;
  seed: number;
  rng: number;
  companyId: CompanyId;
  day: number;
  phase: Phase;
  location: LocationId;
  human: Human;
  npcs: Npc[];
  stats: Stats;
  kpis: Kpis;
  money: number;
  computeLeft: number;
  memories: Memory[];
  contextSlots: number;
  log: LogEntry[];
  nextLogId: number;
  causal: CausalLink[];
  flags: Record<string, boolean | number | string>;
  seen: string[];
  violations: number;
  promptsTotal: number;
  promptsToday: number;
  followed: number;
  ignored: number;
  twisted: number;
  tokensSpent: number;
  productPitches: number;
  viral: string[];
  viralFlash: string | null;
  pending: Pending | null;
  mode: "live" | "ended";
  ending: Ending | null;
  paused: boolean;
  speed: 1 | 2 | 3;
  lastThought: string | null;
  mindLabel: string | null;
  memoSeen: Record<string, boolean>;
  revealed: boolean;
  started: boolean;
  origin: { money: number; mood: number; trust: number; career: number };
}
