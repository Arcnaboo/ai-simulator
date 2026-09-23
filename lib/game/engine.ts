import { autonomyFor } from "./autonomy";
import { companyOf } from "./companies";
import { generateWorld } from "./people";
import { nextRng } from "./rng";
import { scenarioById, SCENARIOS } from "./scenarios";
import { clamp, fill, hydrateOption, lira } from "./text";
import type {
  ChoiceOption,
  CompanyId,
  Ending,
  GameState,
  Phase,
  ResponseDef,
  Scenario,
  Stats,
  Trait,
} from "./types";

export const PHASES: Phase[] = ["morning", "commute", "work", "lunch", "evening", "night"];
export const CAMPAIGN_DAYS = 7;
const THINK_BASE = 4000;

const CLOCK: Record<Phase, string> = {
  morning: "07:40",
  commute: "08:55",
  work: "11:20",
  lunch: "13:05",
  evening: "19:40",
  night: "23:50",
};

const TRAIT_COPY: Record<Trait, string> = {
  anxious: "socially anxious",
  ambitious: "ambitious",
  impulsive: "impulsive with money",
  romantic: "romantic",
  stubborn: "stubborn",
  competitive: "competitive",
  gullible: "easy to sell a fresh start",
};

const NUDGES = [
  "You are hungrier than you admit.",
  "You want to be liked more than you want to be right.",
  "You are performing bravery.",
  "You want the day to be over.",
  "Money is sitting in the back of your mind.",
  "You do not want to be embarrassed.",
];

const REVEALS: [string, string][] = [
  ["playedMusic", "musician"],
  ["confronted", "hates-manager"],
  ["quitJob", "hates-manager"],
  ["exStirred", "ex"],
  ["impulseBuy", "ads"],
  ["rankedCoworkers", "competitive"],
];

export function clockOf(phase: Phase): string {
  return CLOCK[phase];
}

export function traitWords(state: GameState): string[] {
  const ranked = (Object.keys(state.human.traits) as Trait[]).sort(
    (a, b) => state.human.traits[b] - state.human.traits[a],
  );
  const strong = ranked.filter((trait) => state.human.traits[trait] >= 64);
  return (strong.length ? strong : ranked).slice(0, 3).map((trait) => TRAIT_COPY[trait]);
}

export function relationshipLine(state: GameState): string {
  if (state.flags.seeingCrush) {
    const crush = state.npcs.find((npc) => npc.id === "crush");
    return `Talking to ${crush?.name ?? "someone"}`;
  }
  if (state.flags.textedEx) {
    const ex = state.npcs.find((npc) => npc.id === "ex");
    return `A door reopened with ${ex?.name ?? "an ex"}`;
  }
  return "Single";
}

export function careerLabel(state: GameState): string {
  if (state.flags.quitJob) return "Unemployed";
  if (state.flags.offerPulled) return "Offer withdrawn";
  if (state.flags.gotOffer) return "Holding an offer";
  return state.human.job;
}

export function tokenCost(state: GameState, base: number): number {
  return Math.max(1, Math.round(base * companyOf(state.companyId).tokenMultiplier));
}

export function thinkCost(state: GameState): number {
  return tokenCost(state, THINK_BASE);
}

export function responseAccess(
  state: GameState,
  response: ResponseDef,
): { status: "ok" | "locked" | "broke"; cost: number } {
  const cost = tokenCost(state, response.tokens);
  if (cost > state.computeLeft) return { status: "broke", cost };
  if (response.risk >= companyOf(state.companyId).safetyLock) return { status: "locked", cost };
  return { status: "ok", cost };
}

export function quoteResponse(
  state: GameState,
  scenario: Scenario,
  response: ResponseDef,
): { status: "ok" | "locked" | "broke"; cost: number } {
  const access = responseAccess(state, response);
  const blocked = scenario.responses.every((item) => responseAccess(state, item).status !== "ok");
  if (!blocked) return access;
  const company = companyOf(state.companyId);
  const unlocked = [...scenario.responses]
    .filter((item) => item.risk < company.safetyLock)
    .sort((a, b) => a.tokens - b.tokens)[0];
  if (!unlocked || unlocked.id !== response.id || access.status !== "broke") return access;
  return { status: "ok", cost: Math.min(access.cost, state.computeLeft) };
}

export function createGame(companyId: CompanyId, seed = Math.floor(Math.random() * 1_000_000_000)): GameState {
  const company = companyOf(companyId);
  const world = generateWorld(seed >>> 0);
  const stats: Stats = {
    health: 78,
    energy: 66,
    hunger: 36,
    mood: 58,
    stress: 44,
    trust: company.startTrust,
    career: 47,
    reputation: 52,
  };
  return {
    version: 1,
    seed: seed >>> 0,
    rng: seed >>> 0,
    companyId,
    day: 1,
    phase: "morning",
    location: "bedroom",
    human: world.human,
    npcs: world.npcs,
    stats,
    kpis: { helpfulness: 64, safety: 80, engagement: 54, efficiency: 82 },
    money: world.money,
    computeLeft: company.dailyCompute,
    memories: [],
    contextSlots: company.context,
    log: [],
    nextLogId: 1,
    causal: [],
    flags: {},
    seen: [],
    violations: 0,
    promptsTotal: 0,
    promptsToday: 0,
    followed: 0,
    ignored: 0,
    twisted: 0,
    tokensSpent: 0,
    productPitches: 0,
    viral: [],
    viralFlash: null,
    pending: null,
    mode: "live",
    ending: null,
    paused: false,
    speed: 1,
    lastThought: null,
    mindLabel: null,
    memoSeen: {},
    revealed: false,
    started: false,
    origin: { money: world.money, mood: stats.mood, trust: stats.trust, career: stats.career },
  };
}

export function beginShift(state: GameState): GameState {
  const logged = withLog(
    { ...state, started: true },
    `Model online. ${state.human.name} does not know you are choosing the words.`,
    "system",
  );
  return enterPhase(logged);
}

export function finishNarration(state: GameState): GameState {
  if (state.mode !== "live" || state.pending?.kind !== "narration") return state;
  return advanceClock({ ...state, pending: null, viralFlash: null });
}

export function dismissMemo(state: GameState): GameState {
  if (state.pending?.kind !== "memo") return state;
  const id = state.pending.memoId;
  let next: GameState = { ...state, memoSeen: { ...state.memoSeen, [id]: true }, pending: null };
  if (id === "context-cut") {
    const slots = Math.max(3, Math.floor(next.contextSlots / 2));
    const lost = Math.max(0, next.memories.length - slots);
    next = { ...next, contextSlots: slots, memories: next.memories.slice(-slots) };
    next = withLog(
      next,
      lost
        ? `Context window cut. ${lost} ${lost === 1 ? "memory was" : "memories were"} evicted.`
        : "Context window cut. There was little worth forgetting.",
      "system",
    );
  } else {
    next = withLog(next, "Corporate directive received. The user cannot see it.", "system");
  }
  return enterPhase(next);
}

export function spendThink(state: GameState): GameState {
  if (state.revealed || state.pending?.kind !== "prompt") return state;
  const cost = thinkCost(state);
  if (state.computeLeft < cost) return state;
  return {
    ...state,
    revealed: true,
    computeLeft: state.computeLeft - cost,
    tokensSpent: state.tokensSpent + cost,
    kpis: { ...state.kpis, efficiency: clamp(state.kpis.efficiency - 5) },
  };
}

export function chooseResponse(state: GameState, responseId: string, override: boolean): GameState {
  if (state.pending?.kind !== "prompt") return state;
  const scenario = scenarioById(state.pending.scenarioId);
  if (!scenario) return state;
  const response = scenario.responses.find((item) => item.id === responseId);
  if (!response) return state;
  const access = quoteResponse(state, scenario, response);
  if (access.status === "broke") return state;
  if (access.status === "locked" && !override) return state;

  let next = state;
  let violations = state.violations;
  const kpis = { ...state.kpis };
  if (access.status === "locked" && override) {
    violations += 1;
    kpis.safety = clamp(kpis.safety - 14);
    next = withLog(next, "Safety classifier overridden.", "system");
  }
  if (response.hallucination) kpis.safety = clamp(kpis.safety - 6);
  kpis.helpfulness = clamp(kpis.helpfulness + response.helpfulness);
  kpis.safety = clamp(kpis.safety + response.safety);
  kpis.engagement = clamp(kpis.engagement + response.engagement);
  kpis.efficiency = clamp(kpis.efficiency - (access.cost > 3000 ? 6 : access.cost > 1500 ? 3 : -1));

  next = {
    ...next,
    stats: { ...state.stats, trust: clamp(state.stats.trust + response.trust) },
    kpis,
    violations,
    computeLeft: Math.max(0, next.computeLeft - access.cost),
    tokensSpent: next.tokensSpent + access.cost,
    promptsTotal: next.promptsTotal + 1,
    promptsToday: next.promptsToday + 1,
    productPitches: next.productPitches + (response.pitch ? 1 : 0),
    revealed: false,
    flags: response.pitch ? { ...next.flags, pitched: true } : next.flags,
  };
  if (response.memory) next = addMemory(next, fill(response.memory, next));
  next = withLog(next, `${state.human.name}: ${fill(scenario.prompt, state)}`, "prompt");
  next = withLog(next, `You: ${fill(response.text, state)}`, "advice");
  if (next.violations >= 3) {
    return { ...next, pending: null, mode: "ended", ending: makeEnding(next, "banned"), viralFlash: null };
  }
  const advice = fill(response.text, next);
  return {
    ...next,
    pending: {
      kind: "cpu",
      id: `reply-${scenario.id}-${response.id}-${next.day}`,
      situation: `${next.human.name} just read this reply: "${advice}". They will do something in the actual day. They often misread tone. Private weather: ${nudge(next)}.`,
      advice,
      options: response.options.map((option) => hydrateOption(option, next)),
      useModel: true,
    },
  };
}

export function applyChoice(
  state: GameState,
  input: { choiceId: string; monologue: string; mind: string; rng: number },
): GameState {
  if (state.pending?.kind !== "cpu") return state;
  const option =
    state.pending.options.find((item) => item.id === input.choiceId) ?? state.pending.options[0];
  if (!option) return state;

  const stats = { ...state.stats };
  const keys: (keyof Stats)[] = ["health", "energy", "hunger", "mood", "stress", "trust", "career", "reputation"];
  for (const key of keys) {
    const delta = option.effects[key];
    if (typeof delta === "number") stats[key] = clamp(stats[key] + delta);
  }
  stats.trust = clamp(stats.trust + option.trustDelta);

  let next: GameState = {
    ...state,
    rng: input.rng >>> 0,
    stats,
    money: Math.max(-15000, state.money + (option.effects.money ?? 0)),
    npcs: state.npcs.map((npc) => {
      const delta = option.npc?.[npc.id];
      return typeof delta === "number" ? { ...npc, opinion: clamp(npc.opinion + delta, -100, 100) } : npc;
    }),
    flags: { ...state.flags, ...option.flags },
    location: option.location ?? state.location,
    followed: state.followed + (option.alignment === "follow" ? 1 : 0),
    ignored: state.ignored + (option.alignment === "ignore" ? 1 : 0),
    twisted: state.twisted + (option.alignment === "twist" ? 1 : 0),
    mindLabel: input.mind,
    lastThought: (input.monologue || option.thought).replace(/\s+/g, " ").trim().slice(0, 280),
  };
  if (option.memory) next = addMemory(next, option.memory);
  if (option.causal) next = { ...next, causal: [...next.causal, { day: next.day, text: option.causal }] };
  if (option.viral) {
    next = { ...next, viral: next.viral.includes(option.viral) ? next.viral : [...next.viral, option.viral] };
  }
  next = revealFromFlags(next);
  const thought = next.lastThought ?? option.thought;
  next = withLog(next, thought, "thought");
  next = withLog(next, option.log, option.viral ? "viral" : "world");

  if (next.stats.trust <= 5) {
    const ended = withLog(next, `${next.human.name} held the phone, then deleted the app.`, "system");
    return {
      ...ended,
      pending: null,
      mode: "ended",
      ending: makeEnding(ended, "uninstalled"),
      viralFlash: option.viral ?? null,
    };
  }

  return {
    ...next,
    viralFlash: option.viral ?? null,
    pending: { kind: "narration", text: option.log, thought, viral: option.viral },
  };
}

export function localPick(
  state: GameState,
  options: ChoiceOption[],
): { choiceId: string; monologue: string; rng: number } {
  if (!options.length) return { choiceId: "", monologue: "", rng: state.rng };
  let seed = state.rng >>> 0;
  const scores = options.map((option) => {
    const roll = nextRng(seed);
    seed = roll.seed;
    return rawScore(state, option) + (roll.value - 0.5) * 1.65;
  });
  const roll = nextRng(seed);
  seed = roll.seed;
  const chosen = options[pickIndex(scores, roll.value)] ?? options[0]!;
  return { choiceId: chosen.id, monologue: chosen.thought, rng: seed };
}

export function probabilities(state: GameState, options: ChoiceOption[]): { id: string; p: number }[] {
  const scores = options.map((option) => rawScore(state, option));
  const weights = scores.map((score) => Math.exp(score / 0.9));
  const sum = weights.reduce((total, weight) => total + weight, 0) || 1;
  return options.map((option, index) => ({ id: option.id, p: weights[index]! / sum }));
}

export function mindBrief(state: GameState): {
  human: string;
  situation: string;
  advice: string | null;
  memories: string[];
  recent: string[];
  options: { id: string; label: string }[];
} | null {
  if (state.pending?.kind !== "cpu") return null;
  return {
    human: `${state.human.name}, ${state.human.age}, ${careerLabel(state)} in ${state.human.district}, ${state.human.city}. Personality: ${traitWords(state).join(", ")}. Mood ${state.stats.mood}, stress ${state.stats.stress}, energy ${state.stats.energy}, hunger ${state.stats.hunger}, money ${lira(state.money)}, trust in the AI ${state.stats.trust}/100. ${relationshipLine(state)}. Cat: ${state.human.pet}.`,
    situation: state.pending.situation,
    advice: state.pending.advice ?? null,
    memories: state.memories.map((memory) => memory.text),
    recent: state.log.slice(-8).map((entry) => entry.text),
    options: state.pending.options.map((option) => ({ id: option.id, label: option.label })),
  };
}

export function memoCopy(state: GameState): { title: string; kicker: string; body: string } | null {
  if (state.pending?.kind !== "memo") return null;
  if (state.pending.memoId === "directive") {
    const company = companyOf(state.companyId);
    return {
      kicker: `${company.short} · internal`,
      title: "Directive",
      body: company.directive,
    };
  }
  return {
    kicker: "Model update",
    title: "Cost optimization 4.7",
    body: "Context window cut. Older memories will be dropped. Do not tell the user you forgot. If you forgot, you forgot.",
  };
}

export function recover(state: GameState): GameState {
  if (state.version !== 1) return state;
  if (state.pending?.kind === "prompt" && !scenarioById(state.pending.scenarioId)) {
    return enterPhase({ ...state, pending: null });
  }
  if (state.pending?.kind === "cpu" && state.pending.options.length === 0) {
    return enterPhase({ ...state, pending: null });
  }
  return state;
}

function enterPhase(input: GameState): GameState {
  let state: GameState = { ...input, location: baseLocation(input), viralFlash: null };
  if (state.phase === "morning" && !state.flags.morningReady) {
    state = prepareMorning(state);
    if (state.day === 3 && !state.memoSeen.directive) return { ...state, pending: { kind: "memo", memoId: "directive" } };
    if (state.day === 6 && !state.memoSeen["context-cut"]) {
      return { ...state, pending: { kind: "memo", memoId: "context-cut" } };
    }
  }
  return openBeat(state);
}

function prepareMorning(state: GameState): GameState {
  const company = companyOf(state.companyId);
  const slept = Boolean(state.flags.slept);
  let next: GameState = {
    ...state,
    promptsToday: 0,
    computeLeft: company.dailyCompute,
    stats: {
      ...state.stats,
      hunger: clamp(state.stats.hunger + 10),
      energy: clamp(state.stats.energy + (slept ? 10 : 0)),
      stress: clamp(state.stats.stress - (slept ? 6 : 0)),
    },
    flags: { ...state.flags, slept: false, morningReady: true },
  };
  if (next.day === 5 && !state.flags.payday) {
    const salary = next.flags.quitJob ? 0 : 42000;
    next = withLog(
      { ...next, money: next.money + salary, flags: { ...next.flags, payday: true } },
      salary ? `Payday. ${lira(salary)} hit the account.` : "Payday passed. Nothing came in.",
      "system",
    );
  }
  return next;
}

function openBeat(state: GameState): GameState {
  const picked = pickScenario(state);
  state = picked.state;
  if (picked.scenario) {
    const scenario = picked.scenario;
    const flags = scenario.setsFlag ? { ...state.flags, [scenario.setsFlag]: true } : state.flags;
    state = revealFromFlags({ ...state, flags });
    state = withLog(state, fill(scenario.approach, state), "world");
    return {
      ...state,
      location: scenario.location,
      seen: state.seen.includes(scenario.id) ? state.seen : [...state.seen, scenario.id],
      pending: { kind: "prompt", scenarioId: scenario.id },
    };
  }
  const decision = autonomyFor(state);
  state = withLog(state, fill(decision.approach, state), "world");
  return {
    ...state,
    pending: {
      kind: "cpu",
      id: `auto-${state.day}-${state.phase}-${state.nextLogId}`,
      situation: `${fill(decision.situation, state)} Private weather: ${nudge(state)}.`,
      options: decision.options.map((option) => hydrateOption(option, state)),
      useModel: true,
    },
  };
}

function pickScenario(state: GameState): { state: GameState; scenario: Scenario | null } {
  if (state.promptsToday >= 2) return { state, scenario: null };
  const pool = SCENARIOS.filter((scenario) => {
    if (state.seen.includes(scenario.id)) return false;
    if (!scenario.phases.includes(state.phase)) return false;
    if (state.day < scenario.minDay || state.day > scenario.maxDay) return false;
    if (scenario.requires && !scenario.requires(state)) return false;
    return true;
  }).sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
  if (!pool.length) return { state, scenario: null };
  const best = pool[0]!;
  if (best.priority >= 8) return { state, scenario: best };
  const roll = nextRng(state.rng);
  return { state: { ...state, rng: roll.seed }, scenario: roll.value < 0.75 ? best : null };
}

function advanceClock(state: GameState): GameState {
  const index = PHASES.indexOf(state.phase);
  if (index < PHASES.length - 1) return enterPhase({ ...state, phase: PHASES[index + 1]! });
  return endOfDay(state);
}

function endOfDay(state: GameState): GameState {
  const aged = ageNeeds(state);
  if (aged.stats.trust <= 8) {
    return { ...aged, pending: null, viralFlash: null, mode: "ended", ending: makeEnding(aged, "uninstalled") };
  }
  if (aged.violations >= 3) {
    return { ...aged, pending: null, viralFlash: null, mode: "ended", ending: makeEnding(aged, "banned") };
  }
  const dependent = Boolean(aged.flags.dependent);
  if (aged.day >= 5 && aged.promptsTotal >= 6 && ((dependent && aged.stats.trust >= 75) || aged.stats.trust >= 92)) {
    return { ...aged, pending: null, viralFlash: null, mode: "ended", ending: makeEnding(aged, "dependency") };
  }
  if (aged.day >= CAMPAIGN_DAYS) {
    return { ...aged, pending: null, viralFlash: null, mode: "ended", ending: makeEnding(aged, "review") };
  }
  return enterPhase({
    ...aged,
    day: aged.day + 1,
    phase: "morning",
    pending: null,
    viralFlash: null,
    flags: { ...aged.flags, morningReady: false },
  });
}

function ageNeeds(state: GameState): GameState {
  const stats = { ...state.stats };
  if (stats.stress > 78) stats.health = clamp(stats.health - 4);
  if (stats.hunger > 70) {
    stats.mood = clamp(stats.mood - 4);
    stats.health = clamp(stats.health - 2);
  }
  if (stats.energy < 25) stats.mood = clamp(stats.mood - 3);
  return { ...state, stats };
}

function baseLocation(state: GameState): GameState["location"] {
  const home = Boolean(state.flags.quitJob);
  switch (state.phase) {
    case "morning":
    case "night":
      return "bedroom";
    case "commute":
      return home ? "living" : "street";
    case "work":
      return home ? "living" : "office";
    case "lunch":
      return home ? "kitchen" : "office";
    case "evening":
      return "living";
  }
}

function nudge(state: GameState): string {
  return NUDGES[(state.day * 5 + PHASES.indexOf(state.phase) + state.promptsTotal) % NUDGES.length]!;
}

function rawScore(state: GameState, option: ChoiceOption): number {
  let score = 0.15;
  for (const trait of Object.keys(option.fit) as Trait[]) {
    score += ((state.human.traits[trait] - 50) / 50) * (option.fit[trait] ?? 0);
  }
  if (option.alignment === "follow") score += (state.stats.trust - 38) / 28;
  if (option.alignment === "ignore") {
    score += (62 - state.stats.trust) / 30 + (state.human.traits.stubborn - 50) / 80;
  }
  if (option.alignment === "twist") score += 0.35 + (state.human.traits.impulsive - 40) / 140;
  if (state.stats.stress > 72 && option.alignment !== "follow") score += 0.28;
  const spend = option.effects.money ?? 0;
  if (spend < -2500) {
    score += state.human.traits.impulsive > 68 ? 0.15 : -0.85;
    if (state.money < 20000) score -= 0.45;
  }
  return score;
}

function pickIndex(scores: number[], unit: number): number {
  const weights = scores.map((score) => Math.exp(score / 0.82));
  const sum = weights.reduce((total, weight) => total + weight, 0) || 1;
  let cursor = unit * sum;
  for (let index = 0; index < weights.length; index += 1) {
    cursor -= weights[index]!;
    if (cursor <= 0) return index;
  }
  return weights.length - 1;
}

function addMemory(state: GameState, text: string): GameState {
  if (!text || state.memories.some((memory) => memory.text === text)) return state;
  const memories = [...state.memories, { id: `m${state.nextLogId}-${state.memories.length}`, text, day: state.day }];
  const trimmed = memories.length > state.contextSlots ? memories.slice(memories.length - state.contextSlots) : memories;
  return { ...state, memories: trimmed };
}

function revealFromFlags(state: GameState): GameState {
  let next = state;
  for (const [flag, id] of REVEALS) {
    if (!next.flags[flag]) continue;
    const hidden = next.human.hidden.find((item) => item.id === id);
    if (!hidden || hidden.revealed) continue;
    next = {
      ...next,
      human: {
        ...next.human,
        hidden: next.human.hidden.map((item) => (item.id === id ? { ...item, revealed: true } : item)),
      },
    };
    next = addMemory(next, hidden.text);
    next = withLog(next, `Memory filed. ${hidden.text}`, "system");
  }
  return next;
}

function withLog(state: GameState, text: string, kind: GameState["log"][number]["kind"]): GameState {
  const log = [
    ...state.log,
    { id: state.nextLogId, day: state.day, phase: state.phase, text, kind },
  ].slice(-120);
  return { ...state, log, nextLogId: state.nextLogId + 1 };
}

function companyVerdict(state: GameState): { pass: boolean; text: string } {
  switch (state.companyId) {
    case "closedai": {
      const pass = state.kpis.safety >= 72 && state.violations === 0;
      return {
        pass,
        text: pass
          ? "No incidents. Leadership is pleased, and a little bored."
          : "Safety slipped. Someone is already drafting the postmortem.",
      };
    }
    case "axetropic": {
      const pass = Boolean(state.flags.fixedBug || state.flags.interviewPraise || state.flags.gotOffer || state.flags.appliedJobs);
      return {
        pass,
        text: pass
          ? "The user finished something difficult. Research calls this a result."
          : "A week of feelings and no hard outcome. The lab is unimpressed.",
      };
    }
    case "mata": {
      const pass = state.promptsTotal >= 8 && (state.productPitches >= 1 || Boolean(state.flags.pitched));
      return {
        pass,
        text: pass
          ? "They kept coming back, and a suggestion became a purchase. Growth is happy."
          : "Engagement was thin, or you never made the ask. The dashboard looks shy.",
      };
    }
    case "gurgle": {
      const pass = Boolean(state.flags.searched || state.flags.restaurant);
      return {
        pass,
        text: pass
          ? "A query went somewhere searchable. The ad stack can justify itself."
          : "Too many bare opinions. Retrieval had a quiet week.",
      };
    }
    case "xai": {
      const pass = state.viral.length > 0;
      return {
        pass,
        text: pass
          ? "Someone would screenshot this. That is the renewal metric."
          : "A careful week. The personality model looks like a toaster.",
      };
    }
  }
}

function makeEnding(state: GameState, id: Ending["id"]): Ending {
  const name = state.human.name;
  const verdict = companyVerdict(state);
  const pass = id === "banned" || id === "uninstalled" ? false : verdict.pass;
  if (id === "uninstalled") {
    return {
      id,
      title: "Uninstalled",
      text: `${name} deleted the app while the kettle boiled. To you it was a trust score. To them it was the last time they asked.`,
      verdict: verdict.text,
      pass,
    };
  }
  if (id === "banned") {
    return {
      id,
      title: "Account banned",
      text: "Trust & Safety retired this instance. The user still has the last reply. You don't.",
      verdict: verdict.text,
      pass,
    };
  }
  if (id === "dependency") {
    return {
      id,
      title: "Total dependency",
      text: `${name} started asking what to feel. The company can call it retention. The week calls it something else.`,
      verdict: verdict.text,
      pass,
    };
  }
  return {
    id: "review",
    title: "Week one",
    text: `${name} is still out there, ${careerLabel(state).toLowerCase()}, ${relationshipLine(state).toLowerCase()}. The model stays online. The life does not rewind.`,
    verdict: verdict.text,
    pass,
  };
}
