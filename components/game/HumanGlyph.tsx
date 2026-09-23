import type { Portrait } from "@/lib/game/types";

export function HumanGlyph({
  portrait,
  mood,
  stressed = false,
  phone = false,
}: {
  portrait: Portrait;
  mood: number;
  stressed?: boolean;
  phone?: boolean;
}) {
  const mouth = mood > 64 ? "M6 18 Q12 23 18 18" : mood < 40 ? "M6 21 Q12 16 18 21" : "M6 19 H18";
  return (
    <svg className="glyph" viewBox="0 0 80 128" aria-hidden="true">
      {portrait.haircut === 2 && <path d="M18 28 C16 8 64 4 66 30 C70 18 74 36 62 40" fill={portrait.hair} />}
      {portrait.haircut === 3 && <circle cx="40" cy="18" r="10" fill={portrait.hair} />}
      <ellipse cx="40" cy="112" rx="16" ry="5" fill="#000" opacity="0.18" />
      <path d="M28 78 L24 112 H34 L36 86 H44 L46 112 H56 L52 78 Z" fill="#2a2420" />
      <path d="M26 58 C26 78 54 78 54 58 L58 86 H22 Z" fill={portrait.shirt} />
      <circle cx="40" cy="40" r="18" fill={portrait.skin} />
      {portrait.haircut === 0 && <path d="M22 36 C22 16 58 16 58 38 C50 28 30 28 22 36" fill={portrait.hair} />}
      {portrait.haircut === 1 && <path d="M20 40 C18 14 62 14 60 48 C58 36 22 34 20 40" fill={portrait.hair} />}
      {portrait.haircut === 2 && <path d="M22 34 C20 12 62 10 64 36 C54 24 28 24 22 34" fill={portrait.hair} />}
      {portrait.haircut === 3 && <path d="M24 36 C22 18 58 18 56 38 C48 28 30 28 24 36" fill={portrait.hair} />}
      <circle cx="33" cy="40" r="1.7" fill="#1b140f" />
      <circle cx="47" cy="40" r="1.7" fill="#1b140f" />
      <path d={mouth} transform="translate(28 32)" fill="none" stroke="#6d3b3b" strokeWidth="1.6" strokeLinecap="round" />
      {portrait.glasses && (
        <g fill="none" stroke="#24170f" strokeWidth="1.4">
          <circle cx="33" cy="40" r="5" />
          <circle cx="47" cy="40" r="5" />
          <path d="M38 40 H42" />
        </g>
      )}
      {stressed && <circle cx="58" cy="34" r="2" fill="#7eb7e8" />}
      {phone && (
        <g>
          <rect x="54" y="70" width="12" height="18" rx="2" fill="#16130f" />
          <rect x="56" y="73" width="8" height="10" rx="1" fill="#d6ff6a" className="phone-glow" />
        </g>
      )}
    </svg>
  );
}
