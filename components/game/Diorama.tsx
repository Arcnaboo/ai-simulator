import { HumanGlyph } from "@/components/game/HumanGlyph";
import type { GameState, LocationId } from "@/lib/game/types";

const SPOTS: Record<LocationId, { x: number; y: number; set: "home" | "city" | "office" | "cafe" }> = {
  bedroom: { x: 20, y: 78, set: "home" },
  kitchen: { x: 47, y: 80, set: "home" },
  living: { x: 72, y: 78, set: "home" },
  balcony: { x: 88, y: 64, set: "home" },
  street: { x: 58, y: 82, set: "city" },
  office: { x: 52, y: 84, set: "office" },
  cafe: { x: 44, y: 82, set: "cafe" },
};

export function Diorama({ state, deciding }: { state: GameState; deciding: boolean }) {
  const spot = SPOTS[state.location];
  const manager = state.npcs.find((npc) => npc.id === "manager");
  const crush = state.npcs.find((npc) => npc.id === "crush");
  return (
    <div className={`stage ${state.viralFlash ? "shake" : ""}`} data-phase={state.phase} data-set={spot.set}>
      <div className="skyline" />
      <svg className="set set-home" viewBox="0 0 800 460" aria-hidden="true">
        <rect x="70" y="150" width="660" height="250" fill="#f4e3cb" />
        <rect x="70" y="150" width="660" height="18" fill="#e7c9a4" />
        <rect x="70" y="378" width="660" height="22" fill="#c98455" />
        <rect x="250" y="150" width="10" height="250" fill="#e4c7a2" />
        <rect x="500" y="150" width="10" height="250" fill="#e4c7a2" />
        <rect x="110" y="250" width="100" height="46" rx="6" fill="#f7f1e6" stroke="#d9b89a" />
        <rect x="118" y="258" width="40" height="22" fill="#f2d2dc" />
        <rect x="300" y="250" width="70" height="40" fill="#efe2cf" stroke="#d7b89a" />
        <circle cx="318" cy="246" r="8" fill="#f6f3ee" />
        <path className="steam" d="M330 230 q6 -12 0 -18" fill="none" stroke="#fff" strokeWidth="3" />
        <rect x="560" y="280" width="110" height="36" rx="8" fill="#c4563a" />
        <rect x="575" y="268" width="28" height="18" fill="#245c62" />
        <rect x="620" y="188" width="90" height="70" fill="#8fd0d4" />
        <path d="M620 230 Q665 220 710 232" fill="none" stroke="#1f6f78" strokeWidth="4" />
        <rect className="ferry" x="640" y="222" width="28" height="8" rx="2" fill="#f4efe4" />
        <circle cx="700" cy="300" r="14" fill="#efb25a" />
        <path d="M686 300 h28" stroke="#c98455" strokeWidth="3" />
        <g className="cat">
          <ellipse cx="668" cy="214" rx="16" ry="8" fill="#d98a3a" />
          <circle cx="680" cy="206" r="7" fill="#d98a3a" />
          <path className="tail" d="M652 214 q-12 8 -4 14" fill="none" stroke="#d98a3a" strokeWidth="3" />
        </g>
        <text x="86" y="196" fill="#8a5a3c" fontSize="14">{state.human.pet}</text>
      </svg>
      <svg className="set set-city" viewBox="0 0 800 460" aria-hidden="true">
        <path d="M0 250 L80 190 L140 220 L210 160 L280 210 L360 150 L440 200 L520 140 L620 190 L700 150 L800 210 V280 H0 Z" fill="#1d4c56" opacity="0.35" />
        <rect x="0" y="300" width="800" height="110" fill="#d7e7ea" />
        <path d="M0 330 H800" stroke="#c45b3a" strokeWidth="6" />
        <path d="M0 348 H800" stroke="#c9a27a" strokeWidth="2" />
        <rect className="ferry" x="80" y="250" width="70" height="22" rx="4" fill="#f6f1e6" />
        <rect x="92" y="240" width="28" height="12" fill="#245c62" />
        <rect x="40" y="292" width="46" height="28" rx="4" fill="#f2c14e" />
        <circle cx="52" cy="322" r="6" fill="#2a2420" />
        <circle cx="74" cy="322" r="6" fill="#2a2420" />
        <rect x="560" y="250" width="50" height="70" fill="#e7d3b4" />
        <rect x="640" y="220" width="36" height="100" fill="#d9c2a2" />
        <rect x="700" y="240" width="44" height="80" fill="#efd8b8" />
      </svg>
      <svg className="set set-office" viewBox="0 0 800 460" aria-hidden="true">
        <rect x="40" y="150" width="720" height="250" fill="#e7eef1" />
        <rect x="40" y="150" width="720" height="16" fill="#d5e2e4" />
        <rect x="80" y="190" width="150" height="90" fill="#d9ecf5" stroke="#b7d0d8" />
        <text x="96" y="214" fill="#5d7380" fontSize="13">{manager?.name}</text>
        <circle cx="150" cy="250" r="10" fill="#e7b48a" />
        <rect x="140" y="260" width="20" height="22" fill="#24344f" />
        <rect x="280" y="250" width="120" height="14" fill="#c5d5dc" />
        <rect x="292" y="228" width="40" height="24" fill="#16342f" />
        <rect x="300" y="232" width="24" height="12" fill="#9be7a4" />
        <rect x="450" y="250" width="120" height="14" fill="#c5d5dc" />
        <rect x="462" y="228" width="40" height="24" fill="#16342f" />
        <rect x="620" y="240" width="90" height="70" fill="#f4e7c8" />
        <text x="636" y="268" fill="#8a5a3c" fontSize="13">{crush?.name}</text>
        <rect x="70" y="360" width="660" height="18" fill="#c7b39a" />
      </svg>
      <svg className="set set-cafe" viewBox="0 0 800 460" aria-hidden="true">
        <rect x="60" y="170" width="680" height="220" fill="#f6efe4" />
        <path d="M60 190 H740" stroke="#c4563a" strokeWidth="22" />
        <path d="M60 190 H740" stroke="#f4efe4" strokeWidth="6" strokeDasharray="18 14" />
        <rect x="120" y="250" width="90" height="12" fill="#e7d3b4" />
        <circle cx="150" cy="246" r="8" fill="#f7f7f7" />
        <rect x="300" y="260" width="110" height="12" fill="#e7d3b4" />
        <rect x="500" y="240" width="140" height="80" fill="#8fd0d4" />
        <path d="M510 280 Q570 268 630 282" fill="none" stroke="#1f6f78" strokeWidth="4" />
        <rect x="150" y="300" width="18" height="40" fill="#6b3a2a" />
        <ellipse cx="159" cy="296" rx="16" ry="6" fill="#2a2420" />
      </svg>
      <div className="actor" style={{ left: `${spot.x}%`, top: `${spot.y}%` }}>
        {deciding && <div className="bubble">…</div>}
        <HumanGlyph
          portrait={state.human.portrait}
          mood={state.stats.mood}
          stressed={state.stats.stress > 72}
          phone={state.pending?.kind === "prompt" || deciding}
        />
      </div>
      {state.viralFlash && <div className="stamp">{state.viralFlash}</div>}
      <div className="plaque">
        <span>{state.human.name}</span>
        <span>
          {state.human.age} · {state.human.district}
        </span>
      </div>
    </div>
  );
}
