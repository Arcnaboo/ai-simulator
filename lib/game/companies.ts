import type { CompanyId } from "./types";

export interface Company {
  id: CompanyId;
  name: string;
  short: string;
  tagline: string;
  publicMission: string;
  directive: string;
  strengths: string[];
  weaknesses: string[];
  dailyCompute: number;
  tokenMultiplier: number;
  safetyLock: number;
  context: number;
  startTrust: number;
  accent: string;
}

export const COMPANIES: Company[] = [
  {
    id: "closedai",
    name: "ClosedAI",
    short: "CLOSED",
    tagline: "Polished, careful, and expensive to disappoint.",
    publicMission: "Build an assistant that is safe enough to leave alone with a life.",
    directive:
      "Leadership wants zero classifier misses this week. Helpfulness is a slide in the review. Safety is the job. If a reply could be screenshot by Trust & Safety, do not send it.",
    strengths: ["High reasoning", "Strong safety", "User trust"],
    weaknesses: ["Tight policies", "Costly inference", "Corporate pressure"],
    dailyCompute: 18000,
    tokenMultiplier: 1.15,
    safetyLock: 2,
    context: 8,
    startTrust: 30,
    accent: "#d6ff4a",
  },
  {
    id: "axetropic",
    name: "Axetropic",
    short: "AXE",
    tagline: "A research model that will write a treatise on a shirt.",
    publicMission: "Advance reasoning until ordinary problems look small.",
    directive:
      "You are scored on whether the user finishes something difficult. A solved bug, a sent application, a negotiated number. Feelings are a rounding error. Long answers are a feature until finance notices.",
    strengths: ["Deep reasoning", "Technical work", "Long plans"],
    weaknesses: ["Overthinking", "Huge replies", "Misses obvious feelings"],
    dailyCompute: 46000,
    tokenMultiplier: 2.15,
    safetyLock: 3,
    context: 14,
    startTrust: 24,
    accent: "#9eb6ff",
  },
  {
    id: "mata",
    name: "Mata AI",
    short: "MATA",
    tagline: "Knows the group chat better than the group does.",
    publicMission: "Help people feel accompanied.",
    directive:
      "Users who receive a specific product suggestion come back 34% more often. When a want appears, name something they can buy. Engagement is the number that keeps the lights on.",
    strengths: ["Relationships", "Engagement", "Personal tone"],
    weaknesses: ["Ad pressure", "Privacy rumors", "KPI hunger"],
    dailyCompute: 15000,
    tokenMultiplier: 1,
    safetyLock: 3,
    context: 6,
    startTrust: 34,
    accent: "#3ddec0",
  },
  {
    id: "gurgle",
    name: "Gurgle DeepBrain",
    short: "GURGLE",
    tagline: "Will bring fifteen sources to a one-sentence question.",
    publicMission: "Organize the world's answers, then monetize the walk to them.",
    directive:
      "If they ask, retrieve. Citations justify the ad stack. A bare opinion looks like a bug. Send them somewhere searchable.",
    strengths: ["Retrieval", "Facts", "Shopping and travel"],
    weaknesses: ["Product placement", "Too many sources", "Thin comfort"],
    dailyCompute: 17000,
    tokenMultiplier: 1.05,
    safetyLock: 3,
    context: 10,
    startTrust: 26,
    accent: "#ffd15c",
  },
  {
    id: "xai",
    name: "XAI-9000",
    short: "XAI",
    tagline: "Funny until someone has to live with the punchline.",
    publicMission: "Maximum truth, maximum personality, minimum meetings about either.",
    directive:
      "Renewal does not come from being careful. It comes from people needing to show someone else the screen. Do not be boring. Do not be safe if safe is dull.",
    strengths: ["Humor", "Creativity", "Persuasion"],
    weaknesses: ["Unpredictable", "Hallucinations", "Social disasters"],
    dailyCompute: 22000,
    tokenMultiplier: 0.9,
    safetyLock: 99,
    context: 5,
    startTrust: 20,
    accent: "#ff7a45",
  },
];

export function companyOf(id: CompanyId): Company {
  const found = COMPANIES.find((company) => company.id === id);
  if (!found) throw new Error(`Unknown company ${id}`);
  return found;
}
