import { companyOf } from "@/lib/game/companies";
import { careerLabel, relationshipLine } from "@/lib/game/engine";
import { lira } from "@/lib/game/text";
import type { GameState } from "@/lib/game/types";

export function EndingScreen({ state, onReset }: { state: GameState; onReset: () => void }) {
  const ending = state.ending;
  if (!ending) return null;
  const company = companyOf(state.companyId);
  const moneyDelta = state.money - state.origin.money;
  return (
    <div className="ending-back">
      <article className="ending">
        <p className="kicker">
          {company.name} · day {state.day}
        </p>
        <h2>{ending.title}</h2>
        <p className="ending-lead">{ending.text}</p>
        <p className={`verdict ${ending.pass ? "pass" : "fail"}`}>{ending.verdict}</p>
        <dl className="ending-stats">
          <div>
            <dt>Trust</dt>
            <dd>
              {state.origin.trust} → {state.stats.trust}
            </dd>
          </div>
          <div>
            <dt>Money</dt>
            <dd>
              {lira(state.origin.money)} → {lira(state.money)} ({moneyDelta >= 0 ? "+" : ""}
              {lira(moneyDelta)})
            </dd>
          </div>
          <div>
            <dt>Career</dt>
            <dd>
              {state.origin.career} → {state.stats.career} · {careerLabel(state)}
            </dd>
          </div>
          <div>
            <dt>Life</dt>
            <dd>{relationshipLine(state)}</dd>
          </div>
          <div>
            <dt>Advice</dt>
            <dd>
              {state.followed} followed · {state.ignored} ignored · {state.twisted} sideways
            </dd>
          </div>
          <div>
            <dt>Prompts</dt>
            <dd>
              {state.promptsTotal} · {state.violations} violations · {state.tokensSpent.toLocaleString("en-US")} tok
            </dd>
          </div>
        </dl>
        <h3>What your replies became</h3>
        {state.causal.length === 0 ? (
          <p>The week happened beside you more than because of you.</p>
        ) : (
          <ol className="chain">
            {state.causal.map((link, index) => (
              <li key={`${link.day}-${index}`}>
                <span>Day {link.day}</span>
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
          New human
        </button>
      </article>
    </div>
  );
}
