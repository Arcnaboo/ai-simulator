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
  applyChoice,
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
} from "@/lib/game/engine";
import { localize, setLang, t, useLang } from "@/lib/game/locale";
import { lira } from "@/lib/game/text";
import type { CompanyId, GameState } from "@/lib/game/types";

const SAVE = "ai-sim-save-v1";
const KEY = "ai-sim-openai-key";

type Screen = "menu" | "options" | "about" | "rules" | "companies" | "dossier" | "play";

export function GameApp() {
  const lang = useLang();
  const [screen, setScreen] = useState<Screen>("menu");
  const [optionsReturn, setOptionsReturn] = useState<Screen>("menu");
  const [panel, setPanel] = useState(false);
  const [state, setState] = useState<GameState | null>(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(KEY) ?? "");
  const [hasSave, setHasSave] = useState(() => Boolean(localStorage.getItem(SAVE)));
  const [serverMind, setServerMind] = useState<{ configured: boolean; model: string } | null>(null);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

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
    if (screen !== "play" || panel) return;
    if (!narrationKey || !state || state.paused || state.mode !== "live" || state.pending?.kind !== "narration") return;
    const extra = state.pending.viral ? 900 : 0;
    const wait = (state.speed === 1 ? 3400 : state.speed === 2 ? 2000 : 1100) + extra;
    const timer = window.setTimeout(() => setState((current) => (current ? finishNarration(current) : current)), wait);
    return () => window.clearTimeout(timer);
  }, [narrationKey, state, state?.paused, state?.speed, state?.mode, screen, panel]);

  const promptId = state?.pending?.kind === "prompt" ? state.pending.scenarioId : "";
  const canContinue = Boolean(state?.started) || hasSave;

  function reset() {
    localStorage.removeItem(SAVE);
    setHasSave(false);
    setState(null);
    setPanel(false);
    setScreen("menu");
  }

  function continueSave() {
    if (state?.started) {
      setScreen("play");
      return;
    }
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

  function openOptions(from: Screen) {
    setOptionsReturn(from);
    setPanel(false);
    setScreen("options");
  }

  if (screen === "menu") {
    return (
      <MainMenu
        canContinue={canContinue}
        onNew={() => setScreen("companies")}
        onContinue={continueSave}
        onOptions={() => openOptions("menu")}
        onAbout={() => setScreen("about")}
        onRules={() => setScreen("rules")}
      />
    );
  }

  if (screen === "about" || screen === "rules") {
    return <Info screen={screen} onBack={() => setScreen("menu")} />;
  }

  if (screen === "options") {
    return (
      <Options
        apiKey={apiKey}
        setApiKey={setApiKey}
        serverMind={serverMind}
        onBack={() => setScreen(optionsReturn)}
      />
    );
  }

  if (screen === "companies" || !state) {
    return (
      <Companies
        onBack={() => setScreen("menu")}
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
        onBack={() => setScreen("companies")}
        onBegin={() => {
          setState((current) => (current ? beginShift(current) : current));
          setHasSave(true);
          setScreen("play");
        }}
      />
    );
  }

  const company = companyOf(state.companyId);
  const memo = memoCopy(state);
  const cortex =
    state.mindLabel && state.mindLabel !== "instinct"
      ? state.mindLabel
      : apiKey || serverMind?.configured
        ? t("modelIfAnswers")
        : t("instincts");

  return (
    <div className="desk" data-company={state.companyId} style={{ ["--accent" as string]: company.accent }}>
      <header className="topbar">
        <div>
          <p className="kicker">
            {t("day")} {String(state.day).padStart(2, "0")} / {String(CAMPAIGN_DAYS).padStart(2, "0")} · {clockOf(state.phase)}
          </p>
          <strong>{company.name}</strong>
        </div>
        <p className="creed">{t("creed")}</p>
        <div className="top-controls">
          <span className="cortex">{cortex}</span>
          <button type="button" onClick={() => setPanel(true)}>
            {t("menu")}
          </button>
          <button type="button" onClick={() => setState((current) => current && { ...current, paused: !current.paused })}>
            {state.paused ? t("resume") : t("pause")}
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
            <Bar label={t("trust")} value={state.stats.trust} />
            <Bar label={t("mood")} value={state.stats.mood} />
            <Bar label={t("stress")} value={state.stats.stress} />
            <Bar label={t("energy")} value={state.stats.energy} />
            <Bar label={t("hunger")} value={state.stats.hunger} />
            <Bar label={t("career")} value={state.stats.career} />
          </div>
          <div className="kpis">
            <Bar label={t("help")} value={state.kpis.helpfulness} />
            <Bar label={t("safety")} value={state.kpis.safety} />
            <Bar label={t("engage")} value={state.kpis.engagement} />
            <Bar label={t("efficient")} value={state.kpis.efficiency} />
          </div>
          <ul className="npcs">
            {state.npcs.map((npc) => (
              <li key={npc.id}>
                <span>
                  {npc.name}
                  <small>{localize(npc.role)}</small>
                </span>
                <b>{npc.opinion}</b>
              </li>
            ))}
          </ul>
          <div className="memories">
            <p className="kicker">
              {t("context")} {state.memories.length}/{state.contextSlots}
            </p>
            {state.memories.length === 0 && <p>{t("nothingFiled")}</p>}
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
            <span>{t("clickContinue")}</span>
          </button>
        )}
        {state.pending?.kind === "cpu" && (
          <div className="caption waiting">
            <em>{t("deciding", { name: state.human.name })}</em>
            <span>
              {apiKey || serverMind?.configured
                ? t("cortexOnline", { model: serverMind?.model ?? "gpt-4.1-mini" })
                : t("cortexOffline")}
            </span>
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
              {t("acknowledge")}
            </button>
          </section>
        </div>
      )}
      {promptId && state.pending?.kind === "prompt" && (
        <PromptSheet
          key={`${promptId}-${lang}`}
          state={state}
          onThink={() => setState((current) => (current ? spendThink(current) : current))}
          onSend={(responseId, override) => setState((current) => (current ? chooseResponse(current, responseId, override) : current))}
        />
      )}
      {panel && (
        <div className="sheet-back">
          <section className="pause-card">
            <p className="kicker">{company.short}</p>
            <h2>{t("pauseTitle")}</h2>
            <button type="button" className="send" onClick={() => setPanel(false)}>
              {t("resume")}
            </button>
            <button type="button" className="ghost" onClick={() => openOptions("play")}>
              {t("options")}
            </button>
            <button
              type="button"
              className="ghost"
              onClick={() => {
                setPanel(false);
                setScreen("menu");
              }}
            >
              {t("mainMenu")}
            </button>
          </section>
        </div>
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

function MainMenu({
  canContinue,
  onNew,
  onContinue,
  onOptions,
  onAbout,
  onRules,
}: {
  canContinue: boolean;
  onNew: () => void;
  onContinue: () => void;
  onOptions: () => void;
  onAbout: () => void;
  onRules: () => void;
}) {
  const lang = useLang();
  return (
    <div className="boot menu-screen">
      <div className="menu-card">
        <p className="kicker">{t("menuKicker")}</p>
        <h1>AI Simulator</h1>
        <p className="tagline">{t("tagline")}</p>
        <div className="menu-actions">
          <button type="button" className="send" onClick={onNew}>
            {t("newGame")}
          </button>
          {canContinue && (
            <button type="button" className="ghost" onClick={onContinue}>
              {t("continue")}
            </button>
          )}
          <button type="button" className="ghost" onClick={onOptions}>
            {t("options")}
          </button>
          <button type="button" className="ghost" onClick={onRules}>
            {t("rules")}
          </button>
          <button type="button" className="ghost" onClick={onAbout}>
            {t("about")}
          </button>
        </div>
        <p className="fine">
          {t("language")}: {lang === "tr" ? t("turkish") : t("english")}
        </p>
      </div>
    </div>
  );
}

function Options({
  apiKey,
  setApiKey,
  serverMind,
  onBack,
}: {
  apiKey: string;
  setApiKey: (value: string) => void;
  serverMind: { configured: boolean; model: string } | null;
  onBack: () => void;
}) {
  const lang = useLang();
  const status = !serverMind
    ? t("checking")
    : serverMind.configured
      ? t("serverKey", { model: serverMind.model })
      : `${t("noKey", { model: serverMind.model })} ${t("modelHint")}`;
  return (
    <div className="boot menu-screen">
      <div className="menu-card">
        <button type="button" className="texty" onClick={onBack}>
          {t("back")}
        </button>
        <h1>{t("options")}</h1>
        <p className="kicker">{t("language")}</p>
        <div className="lang-switch">
          <button type="button" className={lang === "tr" ? "is-on" : ""} onClick={() => setLang("tr")}>
            {t("turkish")}
          </button>
          <button type="button" className={lang === "en" ? "is-on" : ""} onClick={() => setLang("en")}>
            {t("english")}
          </button>
        </div>
        <label className="key-field">
          {t("apiKey")}
          <input
            type="password"
            value={apiKey}
            autoComplete="off"
            placeholder="sk-…"
            onChange={(event) => setApiKey(event.target.value)}
          />
        </label>
        <p className="fine">{status}</p>
        <p className="notice">{t("keyWarning")}</p>
      </div>
    </div>
  );
}

function Info({ screen, onBack }: { screen: "about" | "rules"; onBack: () => void }) {
  const rules = [t("rule1"), t("rule2"), t("rule3"), t("rule4"), t("rule5"), t("rule6")];
  return (
    <div className="boot menu-screen">
      <div className="menu-card wide">
        <button type="button" className="texty" onClick={onBack}>
          {t("back")}
        </button>
        <h1>{screen === "about" ? t("about") : t("rules")}</h1>
        {screen === "about" ? <p className="about-copy">{t("aboutBody")}</p> : (
          <ol className="rules">
            {rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function Companies({ onBack, onPick }: { onBack: () => void; onPick: (id: CompanyId) => void }) {
  return (
    <div className="boot">
      <div className="boot-copy">
        <button type="button" className="texty" onClick={onBack}>
          {t("back")}
        </button>
        <p className="kicker">{t("menuKicker")}</p>
        <h1>{t("chooseCompany")}</h1>
        <p className="tagline">{t("chooseLead")}</p>
      </div>
      <div className="companies">
        {COMPANIES.map((company) => (
          <button key={company.id} type="button" className="company" style={{ ["--accent" as string]: company.accent }} onClick={() => onPick(company.id)}>
            <span className="kicker">{company.short}</span>
            <strong>{company.name}</strong>
            <em>{localize(company.tagline)}</em>
            <span>{company.strengths.map((item) => localize(item)).join(" · ")}</span>
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
          {t("back")}
        </button>
        <p className="kicker">{t("assigned", { company: company.name })}</p>
        <div className="file-head">
          <HumanGlyph portrait={state.human.portrait} mood={state.stats.mood} />
          <div>
            <h1>
              {state.human.name}, {state.human.age}
            </h1>
            <p>
              {localize(state.human.job)} · {state.human.district}, {state.human.city}
            </p>
          </div>
        </div>
        <ul className="facts">
          <li>
            {lira(state.money)} {t("inTheAccount")}
          </li>
          <li>
            {t("cat")}: {state.human.pet}
          </li>
          <li>{traitWords(state).join(", ")}</li>
          <li>
            {t("likes")} {state.human.likes.map((item) => localize(item)).join(` ${t("and")} `)}
          </li>
          <li>
            {t("trustInYou")}: {state.stats.trust}/100
          </li>
          <li>
            {sealed} {sealed === 1 ? t("sealedOne") : t("sealedMany")}
          </li>
        </ul>
        <p className="fine">{localize(company.publicMission)}</p>
        <button type="button" className="send" onClick={onBegin}>
          {t("beginWeek")}
        </button>
      </article>
    </div>
  );
}
