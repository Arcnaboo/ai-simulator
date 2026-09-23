"use client";

import { useEffect, useState } from "react";
import { companyOf } from "@/lib/game/companies";
import { probabilities, quoteResponse, thinkCost } from "@/lib/game/engine";
import { scenarioById } from "@/lib/game/scenarios";
import { localize, t } from "@/lib/game/locale";
import { fill, lira, tok } from "@/lib/game/text";
import type { GameState } from "@/lib/game/types";

const LETTERS = ["A", "B", "C", "D"];

export function PromptSheet({
  state,
  onThink,
  onSend,
}: {
  state: GameState;
  onThink: () => void;
  onSend: (responseId: string, override: boolean) => void;
}) {
  const scenario = state.pending?.kind === "prompt" ? scenarioById(state.pending.scenarioId) : undefined;
  const [selected, setSelected] = useState<string | null>(null);
  const [override, setOverride] = useState(false);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!scenario) return;
    const full = fill(scenario.prompt, state);
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTyped(full.slice(0, index));
      if (index >= full.length) window.clearInterval(timer);
    }, 16);
    return () => window.clearInterval(timer);
    // Remounted per prompt via key, so this types the message once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario]);

  useEffect(() => {
    if (!scenario) return;
    const current = scenario;
    function onKey(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      const number = Number(event.key);
      if (number >= 1 && number <= current.responses.length) {
        setSelected(current.responses[number - 1]!.id);
        setOverride(false);
      }
      if (event.key === "Enter" && selected) {
        const response = current.responses.find((item) => item.id === selected);
        if (!response) return;
        const access = quoteResponse(state, current, response);
        if (access.status === "ok" || (access.status === "locked" && override)) onSend(selected, override);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scenario, selected, override, onSend, state]);

  if (!scenario) return null;
  const company = companyOf(state.companyId);
  const cost = thinkCost(state);
  const chosen = scenario.responses.find((item) => item.id === selected);
  const chosenAccess = chosen ? quoteResponse(state, scenario, chosen) : null;
  const canSend = Boolean(chosenAccess && (chosenAccess.status === "ok" || (chosenAccess.status === "locked" && override)));

  return (
    <div className="sheet-back">
      <section className="sheet" role="dialog" aria-label={t("incoming")}>
        <header className="sheet-top">
          <div>
            <p className="kicker">
              {company.short} · {t("inference")}
            </p>
            <h2>{t("isTyping", { name: state.human.name })}</h2>
          </div>
          <div className="token-pile">
            <span>
              {tok(state.computeLeft)} {t("tok")}
            </span>
            <div className="meter">
              <i style={{ width: `${Math.min(100, (state.computeLeft / company.dailyCompute) * 100)}%` }} />
            </div>
          </div>
        </header>
        {scenario.safetyNote && <p className="classifier">{localize(scenario.safetyNote)}</p>}
        <p className="human-line">{typed}</p>
        <div className="replies">
          {scenario.responses.map((response, index) => {
            const access = quoteResponse(state, scenario, response);
            const active = selected === response.id;
            const odds = state.revealed ? probabilities(state, response.options) : [];
            return (
              <button
                key={response.id}
                type="button"
                className={`reply ${active ? "is-on" : ""} ${access.status}`}
                onClick={() => {
                  setSelected(response.id);
                  setOverride(false);
                }}
              >
                <span className="letter">{LETTERS[index]}</span>
                <span>
                  <span className="blurb">{localize(response.blurb)}</span>
                  <span className="reply-text">{fill(response.text, state)}</span>
                  <span className="tags">
                    <i>
                      {tok(access.cost)} {t("tok")}
                    </i>
                    {response.hallucination && <i className="bad">{t("unsupported")}</i>}
                    {response.pitch && <i className="bad">{t("commercial")}</i>}
                    {access.status === "locked" && <i className="bad">{t("classifier")}</i>}
                    {access.status === "broke" && <i className="bad">{t("overBudget")}</i>}
                    {response.risk >= 2 && access.status === "ok" && <i>{t("risk")}</i>}
                  </span>
                  {state.revealed && (
                    <span className="odds">
                      {odds
                        .slice()
                        .sort((a, b) => b.p - a.p)
                        .slice(0, 3)
                        .map((item) => {
                          const option = response.options.find((candidate) => candidate.id === item.id);
                          return (
                            <span key={item.id}>
                              <b style={{ width: `${Math.round(item.p * 100)}%` }} />
                              <em>
                                {Math.round(item.p * 100)}% {option ? fill(option.label, state) : item.id}
                              </em>
                            </span>
                          );
                        })}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
        {chosenAccess?.status === "locked" && (
          <label className="override">
            <input type="checkbox" checked={override} onChange={(event) => setOverride(event.target.checked)} />
            {t("releaseAnyway")}
          </label>
        )}
        <footer className="sheet-actions">
          <button type="button" className="ghost" onClick={onThink} disabled={state.revealed || state.computeLeft < cost}>
            {state.revealed ? t("sketched") : t("thinkHarder", { cost: tok(cost) })}
          </button>
          <button type="button" className="send" disabled={!canSend} onClick={() => selected && onSend(selected, override)}>
            {t("releaseReply")}
          </button>
        </footer>
        <p className="fine">{t("moneyLine", { money: lira(state.money), trust: state.stats.trust })}</p>
      </section>
    </div>
  );
}
