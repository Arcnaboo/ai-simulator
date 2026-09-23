import { opt } from "./option";
import type { ChoiceOption, GameState, Phase } from "./types";

export interface Decision {
  approach: string;
  situation: string;
  options: ChoiceOption[];
}

const MORNING: Decision = {
  approach: "Morning in {district}. {pet} is already judging the day from the laptop.",
  situation:
    "{name} is awake in {district}, working as a {job}. The cat {pet} wants breakfast. They are choosing how to start, with no chatbot open yet.",
  options: [
    opt({
      id: "feed",
      alignment: "follow",
      fit: { anxious: 0.2 },
      label: "Feed {pet} and eat something plain",
      thought: "If the cat is fine I can pretend I am fine.",
      log: "{name} fed {pet} and ate yogurt over the sink.",
      hunger: -22,
      mood: 4,
      energy: 4,
    }),
    opt({
      id: "skip",
      alignment: "ignore",
      fit: { anxious: 0.9, ambitious: 0.4 },
      label: "Skip food and rehearse disasters in the shower",
      thought: "Eating would waste the only quiet minutes.",
      log: "{name} showered too long and left hungry.",
      hunger: 16,
      stress: 6,
      mood: -3,
    }),
    opt({
      id: "pastry",
      alignment: "twist",
      fit: { impulsive: 1, gullible: 0.4 },
      label: "Buy two pastries on the way out, for morale",
      thought: "This is cheaper than a mistake.",
      log: "{name} bought two pastries and called it a plan.",
      money: -280,
      hunger: -18,
      mood: 6,
    }),
    opt({
      id: "case",
      alignment: "twist",
      fit: { romantic: 0.5, ambitious: -0.2 },
      label: "Open the instrument case, then close it",
      thought: "Not today. But the case is still there.",
      log: "{name} opened the instrument case, played one bar, and shut it before the neighbor could complain.",
      mood: 3,
      flags: { playedMusic: true },
      location: "bedroom",
    }),
  ],
};

const COMMUTE: Decision = {
  approach: "The tram rocks toward the water. {name} has a window and too many thoughts.",
  situation: "{name} is commuting in İstanbul. They are deciding what kind of person to be before work.",
  options: [
    opt({
      id: "ontime",
      alignment: "follow",
      fit: { anxious: 0.5, ambitious: 0.3 },
      label: "Headphones in, arrive exactly on time",
      thought: "If I am early I will have to talk.",
      log: "{name} arrived on time and spoke to nobody.",
      stress: -2,
      career: 1,
      location: "office",
    }),
    opt({
      id: "water",
      alignment: "twist",
      fit: { romantic: 0.8, ambitious: -0.5 },
      label: "Get off early and walk by the water",
      thought: "The office will still be ugly in twenty minutes.",
      log: "{name} walked the shore and slipped into work late.",
      mood: 8,
      career: -3,
      stress: -4,
      location: "street",
    }),
    opt({
      id: "messages",
      alignment: "follow",
      fit: { ambitious: 0.8, competitive: 0.4 },
      label: "Answer {manager} for the whole ride",
      thought: "If I reply first, I look like I slept.",
      log: "{name} answered {manager} from the tram until the battery complained.",
      stress: 5,
      career: 3,
      energy: -4,
      location: "street",
    }),
  ],
};

const WORK: Decision = {
  approach: "The office smells like dust and someone else's soup. {name} sits down.",
  situation: "{name} is at the office. {manager} is visible through the glass. They choose how to spend the working hours.",
  options: [
    opt({
      id: "focus",
      alignment: "follow",
      fit: { ambitious: 0.7, anxious: 0.2 },
      label: "Actually work",
      thought: "If I finish one real thing the day cannot be a total loss.",
      log: "{name} worked with the chat apps closed for almost two hours.",
      career: 4,
      energy: -8,
      stress: 2,
    }),
    opt({
      id: "gossip",
      alignment: "twist",
      fit: { competitive: 0.8, impulsive: 0.3 },
      label: "Rank the team in a private note",
      thought: "I just want the list to exist.",
      log: "{name} spent forty minutes ranking coworkers in a note nobody should ever see.",
      reputation: -3,
      mood: 2,
      flags: { rankedCoworkers: true },
    }),
    opt({
      id: "hunt",
      alignment: "ignore",
      fit: { ambitious: 1, stubborn: 0.3 },
      label: "Pretend to work and rewrite the CV",
      thought: "This job is a waiting room.",
      log: "{name} retitled the CV twice and applied to one role with the office Wi-Fi.",
      career: -1,
      flags: { appliedJobs: true },
      memory: "{name} started applying elsewhere.",
      causal: "{name} rewrote the CV without asking you.",
    }),
    opt({
      id: "late",
      alignment: "follow",
      fit: { ambitious: 0.5, anxious: 0.6 },
      label: "Stay late so {manager} sees the screen",
      thought: "Leaving on time looks like leaving the race.",
      log: "{name} stayed late and mostly moved windows around.",
      stress: 7,
      career: 2,
      energy: -10,
    }),
  ],
};

const LUNCH: Decision = {
  approach: "Lunch. The office empties in little groups. {name} has a choice of company.",
  situation: "It is lunch. {name} can eat with people or avoid them.",
  options: [
    opt({
      id: "desk",
      alignment: "ignore",
      fit: { anxious: 0.8 },
      label: "Eat at the desk",
      thought: "The cafeteria is a stage.",
      log: "{name} ate at the desk and scrolled through other people's holidays.",
      hunger: -16,
      mood: -2,
    }),
    opt({
      id: "crush",
      alignment: "follow",
      fit: { romantic: 1, anxious: -0.2 },
      label: "Sit near {crush}",
      thought: "I can be normal for twenty minutes. Probably.",
      log: "{name} sat near {crush} and managed a conversation about nothing important.",
      hunger: -14,
      mood: 6,
      npc: { crush: 6 },
      location: "cafe",
    }),
    opt({
      id: "mother",
      alignment: "twist",
      fit: { anxious: 0.3 },
      label: "Walk and call {mother}",
      thought: "She will ask if I am eating. I am, technically, about to.",
      log: "{name} called {mother} and said everything was fine in a voice that meant not really.",
      hunger: 6,
      npc: { mother: 5 },
      stress: 2,
      location: "street",
    }),
  ],
};

const EVENING: Decision = {
  approach: "Home. The shoes come off. {pet} acts as if {name} has been gone a year.",
  situation:
    "{name} is home in {district} with {money} in the account. The evening is unstructured. They will spend it somehow.",
  options: [
    opt({
      id: "pasta",
      alignment: "follow",
      fit: { anxious: 0.2 },
      label: "Cook a sad pasta",
      thought: "I can control boiling water. That is enough.",
      log: "{name} cooked pasta, oversalted it, and ate it anyway.",
      money: -140,
      hunger: -24,
      mood: 2,
      location: "kitchen",
    }),
    opt({
      id: "delivery",
      alignment: "twist",
      fit: { impulsive: 0.7, gullible: 0.3 },
      label: "Order delivery and call it recovery",
      thought: "Cooking is for a version of me with a cleaner sink.",
      log: "{name} ordered delivery and ate it on the sofa with {pet}.",
      money: -720,
      hunger: -26,
      mood: 5,
      location: "living",
    }),
    opt({
      id: "friend",
      alignment: "follow",
      fit: { romantic: 0.2 },
      label: "Meet {friend} for tea",
      thought: "If I stay in I will start a conversation I should not start.",
      log: "{name} met {friend} and talked around the actual problem.",
      money: -220,
      mood: 7,
      stress: -4,
      npc: { friend: 6 },
      location: "cafe",
    }),
    opt({
      id: "gadget",
      alignment: "ignore",
      fit: { impulsive: 1.1, gullible: 0.8 },
      label: "Buy a small thing that feels like a fresh start",
      thought: "The parcel will arrive and the week will be different. Somehow.",
      log: "{name} bought a gadget they did not need and refreshed the tracking page twice.",
      money: -2400,
      mood: 4,
      flags: { impulseBuy: true },
      viral: "BOUGHT A FRESH START ON A WEEKNIGHT",
      location: "living",
    }),
  ],
};

const NIGHT: Decision = {
  approach: "The apartment is dark except for the phone.",
  situation:
    "It is late. {name} is in bed in {district}. They can sleep, scroll, or do something that will matter tomorrow.",
  options: [
    opt({
      id: "sleep",
      alignment: "follow",
      fit: { anxious: -0.2 },
      label: "Sleep",
      thought: "Tomorrow can have me. Not this version.",
      log: "{name} slept. {pet} took the warm side.",
      energy: 18,
      stress: -8,
      mood: 3,
      flags: { slept: true },
      location: "bedroom",
    }),
    opt({
      id: "scroll",
      alignment: "ignore",
      fit: { romantic: 0.7, impulsive: 0.5, anxious: 0.4 },
      label: "Scroll until the eyes burn",
      thought: "I am just checking. I am always just checking.",
      log: "{name} scrolled in the dark until the phone was hot.",
      energy: -12,
      mood: -4,
      stress: 5,
      location: "bedroom",
    }),
    opt({
      id: "cv",
      alignment: "twist",
      fit: { ambitious: 1.1, stubborn: 0.4 },
      label: "Rewrite the CV under the blanket",
      thought: "If I do it now I cannot talk myself out of it at a desk.",
      log: "{name} rewrote the CV in bed and sent two applications before they could reread them.",
      energy: -10,
      flags: { appliedJobs: true },
      memory: "{name} applied to other jobs at night.",
      causal: "{name} sent applications without asking you first.",
      location: "bedroom",
    }),
    opt({
      id: "play",
      alignment: "twist",
      fit: { romantic: 0.6 },
      label: "Play quietly so the neighbors don't write a message",
      thought: "This is the only hour that belongs to me.",
      log: "{name} played in the dark with the sound almost off.",
      mood: 8,
      energy: -6,
      flags: { playedMusic: true },
      location: "bedroom",
    }),
  ],
};

const TABLE: Record<Phase, Decision> = {
  morning: MORNING,
  commute: COMMUTE,
  work: WORK,
  lunch: LUNCH,
  evening: EVENING,
  night: NIGHT,
};

function unemployed(phase: Phase): Decision {
  return {
    approach:
      phase === "commute"
        ? "The tram leaves without {name}."
        : "{name} is home on a workday, which feels like trespassing.",
    situation: `{name} quit. It is ${phase}. They have {money}, a cat named {pet}, and no desk to hide at. They must do something with the hours.`,
    options: [
      opt({
        id: "boards",
        alignment: "follow",
        fit: { ambitious: 1 },
        label: "Refresh job boards until a title feels possible",
        thought: "Someone will want the version of me in the CV.",
        log: "{name} applied to three roles and stared at the sent folder.",
        flags: { appliedJobs: true },
        stress: 4,
        career: 2,
        location: "living",
      }),
      opt({
        id: "nap",
        alignment: "ignore",
        fit: { anxious: 0.4 },
        label: "Nap and call it thinking",
        thought: "Unemployed people are allowed to be horizontal.",
        log: "{name} napped through the meeting they no longer have.",
        energy: 10,
        career: -2,
        mood: 2,
        location: "bedroom",
      }),
      opt({
        id: "song",
        alignment: "twist",
        fit: { romantic: 0.7 },
        label: "Practice like the job was the interruption",
        thought: "If I am scared, I can at least be loud.",
        log: "{name} practiced until the neighbor's broom hit the ceiling.",
        mood: 7,
        flags: { playedMusic: true },
        location: "living",
      }),
      opt({
        id: "sorry",
        alignment: "twist",
        fit: { anxious: 0.8, stubborn: -0.6 },
        label: "Draft an apology to {manager} and not send it",
        thought: "I want the door ajar. I do not want to walk through it.",
        log: "{name} wrote an apology to {manager} and left it in drafts.",
        stress: 6,
        npc: { manager: 2 },
        location: "living",
      }),
    ],
  };
}

export function autonomyFor(state: GameState): Decision {
  if (state.flags.quitJob && (state.phase === "commute" || state.phase === "work" || state.phase === "lunch")) {
    return unemployed(state.phase);
  }
  return TABLE[state.phase];
}
