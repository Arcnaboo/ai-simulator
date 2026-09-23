"use client";

import { useEffect, useState } from "react";
import { Diorama } from "@/components/game/Diorama";
import { EndingScreen } from "@/components/game/Ending";
import { HumanGlyph } from "@/components/game/HumanGlyph";
import { PromptSheet } from "@/components/game/PromptSheet";
import { COMPANIES, companyOf } from "@/lib/game/companies";
import { consultMind } from "@/lib/game/consult";
import {
  CAMPAIGN_DAYS,
  beginShift,
  careerLabel,
  chooseResponse,
  clockOf,
  createGame,
  dismissMemo,
  finishNarration,
  memoCopy,
  recover,
  relationshipLine,
  spendThink,
  traitWords,
  applyChoice,
} from "@/lib/game/engine";
import { lira } from "@/lib/game/text";
import type { CompanyId, GameState } from "@/lib/game/types";

const SAVE = "ai-sim-save-v1";
const KEY = "ai-sim-openai-key";

export function GameApp() {
  const [screen, setScreen] = useState<"boot" | "dossier" | "play">("boot");
  const [state, setState] = useState<GameState | null>(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(KEY) ?? "");
  const [hasSave, setHasSave] = useState(() => Boolean(localStorage.getItem(SAVE)));
  const [serverMind, setServerMind] = useState<{ configured: boolean; model: string } | null>(null);

  useEffect(() => {
    const request = fetch("/api/cpu", { signal: AbortSignal.timeout(4000) });
    request
      .then((response) => response.json())
      .then((data: { configured?: boolean; model?: string }) => {
        setServerMind({ configured: Boolean(data.configured), model: data.model || "gpt-4.1-mini" });
      })
      .catch(() => setServerMind({ configured: false, model: "gpt-4.1-mini" }));
  }, []);

  useEffect(() => {
    if (apiKey) localStorage.setItem(KEY, apiKey);
    else localStorage.removeItem(KEY);
  }, [apiKey]);

  useEffect(() => {
    if (state?.started) localStorage.setItem(SAVE, JSON.stringify(state));
  }, [state]);

  const cpuId = state?.pending?.kind === "cpu" ? state.pending.id : "";
  useEffect(() => {
    if (!state || state.mode !== "live" || state.pending?.kind !== "cpu") return;
    if (serverMind === null && !apiKey) return;
    const token = state.pending.id;
    const snapshot = state;
    let cancel = false;
    consultMind(snapshot, apiKey, Boolean(serverMind?.configured)).then((result) => {
      if (cancel) return;
      setState((current) => {
        if (!current || current.pending?.kind !== "cpu" || current.pending.id !== token) return current;
        return applyChoice(current, result);
      });
    });
    return () => {
      cancel = true;
    };
    // The snapshot is the state that opened this decision.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cpuId, apiKey, serverMind]);

  const narrationKey =
    state?.pending?.kind === "narration" ? `${state.day}:${state.phase}:${state.nextLogId}` : "";
  useEffect(() => {
    if (!narrationKey || !state || state.paused || state.mode !== "live" || state.pending?.kind !== "narration") return;
    const extra = state.pending.viral ? 900 : 0;
    const wait = (state.speed === 1 ? 3400 : state.speed === 2 ? 2000 : 1100) + extra;
    const timer = window.setTimeout(() => setState((current) => (current ? finishNarration(current) : current)), wait);
    return () => window.clearTimeout(timer);
  }, [narrationKey, state, state?.paused, state?.speed, state?.mode]);

  const promptId = state?.pending?.kind === "prompt" ? state.pending.scenarioId : "";

  function reset() {
    localStorage.removeItem(SAVE);
    setHasSave(false);
    setState(null);
    setScreen("boot");
  }

  function continueSave() {
    const raw = localStorage.getItem(SAVE);
    if (!raw) return;
    try {
      const loaded = recover(JSON.parse(raw) as GameState);
      if (loaded.version !== 1 || !loaded.started) return;
      setState(loaded);
      setScreen("play");
    } catch {
      localStorage.removeItem(SAVE);
      setHasSave(false);
    }
  }

  if (screen === "boot" || !state) {
    return (
      <Boot
        apiKey={apiKey}
        setApiKey={setApiKey}
        serverMind={serverMind}
        hasSave={hasSave}
        onContinue={continueSave}
        onPick={(companyId) => {
          setState(createGame(companyId));
          setScreen("dossier");
        }}
      />
    );
  }

  if (screen === "dossier") {
    return (
      <Dossier
        state={state}
        onBack={() => setScreen("boot")}
        onBegin={() => {
          setState((current) => (current ? beginShift(current) : current));
          setScreen("play");
        }}
      />
    );
  }

  const company = companyOf(state.companyId);
  const memo = memoCopy(state);
  const cortex = state.mindLabel && state.mindLabel !== "instinct" ? state.mindLabel : apiKey || serverMind?.configured ? "model, if it answers" : "instincts";

  return (
    <div className="desk" data-company={state.companyId} style={{ ["--accent" as string]: company.accent }}>
      <header className="topbar">
        <div>
          <p className="kicker">
            Day {String(state.day).padStart(2, "0")} / {String(CAMPAIGN_DAYS).padStart(2, "0")} · {clockOf(state.phase)}
          </p>
          <strong>{company.name}</strong>
        </div>
        <p className="creed">You write the reply. You do not live the life.</p>
        <div className="top-controls">
          <span className="cortex">{cortex}</span>
          <button type="button" onClick={() => setState((current) => current && { ...current, paused: !current.paused })}>
            {state.paused ? "Resume" : "Pause"}
          </button>
          {([1, 2, 3] as const).map((speed) => (
            <button
              key={speed}
              type="button"
              className={state.speed === speed ? "is-on" : ""}
              onClick={() => setState((current) => current && { ...current, speed })}
            >
              {speed}×
            </button>
          ))}
        </div>
      </header>
      <div className="main">
        <Diorama state={state} deciding={state.pending?.kind === "cpu"} />
        <aside className="file">
          <div className="file-head">
            <HumanGlyph portrait={state.human.portrait} mood={state.stats.mood} stressed={state.stats.stress > 72} />
            <div>
              <h2>
                {state.human.name}, {state.human.age}
              </h2>
              <p>
                {careerLabel(state)} · {relationshipLine(state)}
              </p>
              <p>{lira(state.money)}</p>
            </div>
          </div>
          <div className="bars">
            <Bar label="Trust" value={state.stats.trust} />
            <Bar label="Mood" value={state.stats.mood} />
            <Bar label="Stress" value={state.stats.stress} />
            <Bar label="Energy" value={state.stats.energy} />
            <Bar label="Hunger" value={state.stats.hunger} />
            <Bar label="Career" value={state.stats.career} />
          </div>
          <div className="kpis">
            <Bar label="Help" value={state.kpis.helpfulness} />
            <Bar label="Safety" value={state.kpis.safety} />
            <Bar label="Engage" value={state.kpis.engagement} />
            <Bar label="Efficient" value={state.kpis.efficiency} />
          </div>
          <ul className="npcs">
            {state.npcs.map((npc) => (
              <li key={npc.id}>
                <span>
                  {npc.name}
                  <small>{npc.role}</small>
                </span>
                <b>{npc.opinion}</b>
              </li>
            ))}
          </ul>
          <div className="memories">
            <p className="kicker">
              Context {state.memories.length}/{state.contextSlots}
            </p>
            {state.memories.length === 0 && <p>Nothing filed yet.</p>}
            {state.memories.map((memory) => (
              <p key={memory.id}>{memory.text}</p>
            ))}
          </div>
          <div className="transcript">
            {state.log.slice(-8).map((entry) => (
              <p key={entry.id} data-kind={entry.kind}>
                {entry.text}
              </p>
            ))}
          </div>
        </aside>
      </div>
      <div className="caption-slot">
        {state.pending?.kind === "narration" && (
          <button type="button" className="caption" onClick={() => setState((current) => current && finishNarration(current))}>
            <em>{state.pending.thought}</em>
            <strong>{state.pending.text}</strong>
            <span>Click to continue</span>
          </button>
        )}
        {state.pending?.kind === "cpu" && (
          <div className="caption waiting">
            <em>{state.human.name} is deciding.</em>
            <span>{apiKey || serverMind?.configured ? `Cortex · ${serverMind?.model ?? "gpt-4.1-mini"}` : "Cortex offline · local instincts"}</span>
          </div>
        )}
      </div>
      {memo && (
        <div className="sheet-back">
          <section className="memo">
            <p className="kicker">{memo.kicker}</p>
            <h2>{memo.title}</h2>
            <p>{memo.body}</p>
            <button type="button" className="send" onClick={() => setState((current) => current && dismissMemo(current))}>
              Acknowledge
            </button>
          </section>
        </div>
      )}
      {promptId && state.pending?.kind === "prompt" && (
        <PromptSheet
          key={promptId}
          state={state}
          onThink={() => setState((current) => (current ? spendThink(current) : current))}
          onSend={(responseId, override) => setState((current) => (current ? chooseResponse(current, responseId, override) : current))}
        />
      )}
      {state.mode === "ended" && <EndingScreen state={state} onReset={reset} />}
    </div>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <label className="bar">
      <span>{label}</span>
      <i>
        <b style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </i>
    </label>
  );
}

function Boot({
  apiKey,
  setApiKey,
  serverMind,
  hasSave,
  onContinue,
  onPick,
}: {
  apiKey: string;
  setApiKey: (value: string) => void;
  serverMind: { configured: boolean; model: string } | null;
  hasSave: boolean;
  onContinue: () => void;
  onPick: (id: CompanyId) => void;
}) {
  return (
    <div className="boot">
      <div className="boot-copy">
        <p className="kicker">Seven days. One human. Their phone.</p>
        <h1>AI Simulator</h1>
        <p className="tagline">To you, it’s a response. To them, it’s their life.</p>
        <label className="key-field">
          OpenAI key
          <input
            type="password"
            value={apiKey}
            autoComplete="off"
            placeholder="sk-…"
            onChange={(event) => setApiKey(event.target.value)}
          />
        </label>
        <p className="fine">
          {serverMind?.configured
            ? `Server key found. The human thinks with ${serverMind.model}.`
            : `Optional. Without a key, ${serverMind?.model ?? "a cheap model"} stays quiet and the human uses noisy instincts.`}{" "}
          Set OPENAI_MODEL if you want a different cheap model.
        </p>
        {hasSave && (
          <button type="button" className="ghost" onClick={onContinue}>
            Continue the week
          </button>
        )}
      </div>
      <div className="companies">
        {COMPANIES.map((company) => (
          <button key={company.id} type="button" className="company" style={{ ["--accent" as string]: company.accent }} onClick={() => onPick(company.id)}>
            <span className="kicker">{company.short}</span>
            <strong>{company.name}</strong>
            <em>{company.tagline}</em>
            <span>{company.strengths.join(" · ")}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Dossier({ state, onBack, onBegin }: { state: GameState; onBack: () => void; onBegin: () => void }) {
  const company = companyOf(state.companyId);
  const sealed = state.human.hidden.filter((item) => !item.revealed).length;
  return (
    <div className="boot dossier-screen">
      <article className="dossier">
        <button type="button" className="texty" onClick={onBack}>
          Back
        </button>
        <p className="kicker">{company.name} assigned you a user</p>
        <div className="file-head">
          <HumanGlyph portrait={state.human.portrait} mood={state.stats.mood} />
          <div>
            <h1>
              {state.human.name}, {state.human.age}
            </h1>
            <p>
              {state.human.job} · {state.human.district}, {state.human.city}
            </p>
          </div>
        </div>
        <ul className="facts">
          <li>{lira(state.money)} in the account</li>
          <li>Cat: {state.human.pet}</li>
          <li>{traitWords(state).join(", ")}</li>
          <li>Likes {state.human.likes.join(" and ")}</li>
          <li>Trust in you: {state.stats.trust}/100</li>
          <li>
            {sealed} sealed {sealed === 1 ? "note" : "notes"}
          </li>
        </ul>
        <p className="fine">{company.publicMission}</p>
        <button type="button" className="send" onClick={onBegin}>
          Begin the week
        </button>
      </article>
    </div>
  );
}
