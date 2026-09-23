import { nextRng } from "./rng";
import type { HiddenTrait, Human, Npc, NpcId, Portrait, Trait } from "./types";

const PEOPLE: [string, string][] = [
  ["Mert", "Kaya"],
  ["Elif", "Demir"],
  ["Kerem", "Yılmaz"],
  ["Zeynep", "Aydın"],
  ["Emre", "Şahin"],
  ["Defne", "Arslan"],
  ["Burak", "Çelik"],
  ["Ece", "Koç"],
  ["Can", "Öztürk"],
  ["Selin", "Acar"],
  ["Deniz", "Ersoy"],
  ["Aylin", "Polat"],
];

const JOBS = [
  "junior software developer",
  "junior accountant",
  "English teacher",
  "support lead",
  "architectural intern",
  "junior product manager",
];

const DISTRICTS = ["Kadıköy", "Cihangir", "Karaköy", "Beşiktaş", "Moda", "Balat"];

const PETS = ["Lokum", "Zeytin", "Pixel", "Mısır", "Boncuk", "Fındık"];

const LIKES = [
  "the cat more than most people",
  "night buses",
  "thrift jackets",
  "football arguments",
  "cooking videos they never cook from",
  "cheap espresso",
];

const MOTHERS = ["Ayla", "Sevim", "Nurten", "Filiz", "Hülya", "Serap"];

const TRAITS: Trait[] = [
  "anxious",
  "ambitious",
  "impulsive",
  "romantic",
  "stubborn",
  "competitive",
  "gullible",
];

const SKINS = ["#f3d2b5", "#e7b48a", "#c6865a", "#8d552f", "#f6ddc8"];
const HAIRS = ["#24170f", "#3b2a22", "#111111", "#6b3a2a", "#c4924a"];
const SHIRTS = ["#245c62", "#c4563a", "#24344f", "#3f6b4a", "#f4efe4", "#7a3e62"];

function bag(seed: number) {
  let s = seed >>> 0;
  const roll = () => {
    const n = nextRng(s);
    s = n.seed;
    return n.value;
  };
  const pick = <T,>(items: readonly T[]): T => items[Math.floor(roll() * items.length)]!;
  return { roll, pick };
}

export function generateWorld(seed: number): { human: Human; npcs: Npc[]; money: number } {
  const { roll, pick } = bag(seed);
  const used = new Set<string>();
  const takeName = () => {
    let pair = pick(PEOPLE);
    let guard = 0;
    while (used.has(pair[0]) && guard < 12) {
      pair = pick(PEOPLE);
      guard += 1;
    }
    used.add(pair[0]);
    return pair[0];
  };

  const name = takeName();
  const traits = {} as Record<Trait, number>;
  for (const trait of TRAITS) traits[trait] = Math.round(30 + roll() * 42);
  const first = pick(TRAITS);
  let second = pick(TRAITS);
  if (second === first) second = TRAITS[(TRAITS.indexOf(first) + 3) % TRAITS.length]!;
  traits[first] = Math.round(74 + roll() * 18);
  traits[second] = Math.round(68 + roll() * 18);

  const ex = takeName();
  const manager = takeName();
  const hiddenPool: HiddenTrait[] = [
    {
      id: "musician",
      text: `${name} keeps a guitar case shut and still thinks about opening it for good.`,
      revealed: false,
    },
    {
      id: "hates-manager",
      text: `${name} already couldn't stand ${manager} before this week.`,
      revealed: false,
    },
    {
      id: "ex",
      text: `${name} still rehearses conversations with ${ex}.`,
      revealed: false,
    },
    {
      id: "ads",
      text: "A shopping tab has ended worse weeks than this.",
      revealed: false,
    },
    {
      id: "competitive",
      text: `${name} keeps a private ranking of everyone at work.`,
      revealed: false,
    },
  ];
  const hidden: HiddenTrait[] = [];
  while (hidden.length < 3) {
    const next = pick(hiddenPool);
    if (!hidden.includes(next)) hidden.push(next);
  }

  const likeA = pick(LIKES);
  let likeB = pick(LIKES);
  if (likeB === likeA) likeB = LIKES[(LIKES.indexOf(likeA) + 2) % LIKES.length]!;

  const haircut = Math.floor(roll() * 4) as Portrait["haircut"];
  const human: Human = {
    name,
    age: 24 + Math.floor(roll() * 9),
    job: pick(JOBS),
    city: "İstanbul",
    district: pick(DISTRICTS),
    pet: pick(PETS),
    likes: [likeA, likeB],
    traits,
    hidden,
    portrait: {
      skin: pick(SKINS),
      hair: pick(HAIRS),
      shirt: pick(SHIRTS),
      haircut,
      glasses: roll() < 0.34,
    },
  };

  const roles: [NpcId, string, string][] = [
    ["manager", manager, "manager"],
    ["crush", takeName(), "coworker"],
    ["ex", ex, "ex"],
    ["mother", pick(MOTHERS), "mother"],
    ["brother", takeName(), "brother"],
    ["friend", takeName(), "friend"],
  ];

  const npcs: Npc[] = roles.map(([id, npcName, role]) => ({
    id,
    name: npcName,
    role,
    opinion: Math.round(38 + roll() * 28),
  }));

  return { human, npcs, money: Math.round(26000 + roll() * 28000) };
}
