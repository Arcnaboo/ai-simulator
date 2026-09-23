import { companyOf } from "@/lib/game/companies";
import { careerLabel, presentEnding, relationshipLine } from "@/lib/game/engine";
import { t } from "@/lib/game/locale";
import { lira, tok } from "@/lib/game/text";
import type { GameState } from "@/lib/game/types";

export function EndingScreen({ state, onReset }: { state: GameState; onReset: () => void }) {
  const ending = presentEnding(state);
  if (!ending) return null;
  const company = companyOf(state.companyId);
  const moneyDelta = state.money - state.origin.money;
  return (
    <div className="ending-back">
      <article className="ending">
        <p className="kicker">
          {company.name} · {t("dayWord")} {state.day}
        </p>
        <h2>{ending.title}</h2>
        <p className="ending-lead">{ending.text}</p>
        <p className={`verdict ${ending.pass ? "pass" : "fail"}`}>{ending.verdict}</p>
        <dl className="ending-stats">
          <div>
            <dt>{t("trust")}</dt>
            <dd>
              {state.origin.trust} → {state.stats.trust}
            </dd>
          </div>
          <div>
            <dt>{t("money")}</dt>
            <dd>
              {lira(state.origin.money)} → {lira(state.money)} ({moneyDelta >= 0 ? "+" : ""}
              {lira(moneyDelta)})
            </dd>
          </div>
          <div>
            <dt>{t("career")}</dt>
            <dd>
              {state.origin.career} → {state.stats.career} · {careerLabel(state)}
            </dd>
          </div>
          <div>
            <dt>{t("life")}</dt>
            <dd>{relationshipLine(state)}</dd>
          </div>
          <div>
            <dt>{t("advice")}</dt>
            <dd>
              {state.followed} {t("followed")} · {state.ignored} {t("ignored")} · {state.twisted} {t("sideways")}
            </dd>
          </div>
          <div>
            <dt>{t("prompts")}</dt>
            <dd>
              {state.promptsTotal} · {state.violations} {t("violations")} · {tok(state.tokensSpent)} {t("tok")}
            </dd>
          </div>
        </dl>
        <h3>{t("whatBecame")}</h3>
        {state.causal.length === 0 ? (
          <p>{t("besideYou")}</p>
        ) : (
          <ol className="chain">
            {state.causal.map((link, index) => (
              <li key={`${link.day}-${index}`}>
                <span>{t("chainDay", { day: link.day })}</span>
                {link.text}
              </li>
            ))}
          </ol>
        )}
        {state.viral.length > 0 && (
          <ul className="viral-list">
            {state.viral.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
        <button type="button" className="send" onClick={onReset}>
          {t("newHuman")}
        </button>
      </article>
    </div>
  );
}
