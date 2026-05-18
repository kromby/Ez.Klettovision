// Shared brand tokens, flag SVGs and components for Klettóvision 2026

export const HI = {
  bg:          '#0A0A0A',
  bgGrad:      'radial-gradient(ellipse at 50% -10%, #16161D 0%, #0A0A0A 55%, #050507 100%)',
  surface:     'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
  surface2:    'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
  border:      'rgba(255,255,255,0.08)',
  border2:     'rgba(255,255,255,0.14)',
  ink:         '#FFFFFF',
  inkSoft:     'rgba(255,255,255,0.78)',
  inkMuted:    'rgba(255,255,255,0.50)',
  inkDim:      'rgba(255,255,255,0.30)',
  glow:        '#5D9CEC',
  glowSoft:    'rgba(93,156,236,0.18)',
  glowGlow:    'rgba(93,156,236,0.45)',
  gold:        '#D4AF37',
  goldSoft:    'rgba(212,175,55,0.16)',
  goldGlow:    'rgba(212,175,55,0.40)',
  goldGrad:    'linear-gradient(135deg, #F4D67A 0%, #D4AF37 45%, #A8821D 100%)',
  glacierGrad: 'linear-gradient(135deg, #8FBEEE 0%, #5D9CEC 45%, #2A6FBE 100%)',
  font:        '"Montserrat", "Metropolis", "Helvetica Neue", system-ui, sans-serif',
  body:        '"Open Sans", "Helvetica Neue", system-ui, sans-serif',
};

export const POINTS_LADDER = [12, 10, 8, 6, 5, 4, 3, 2, 1];

// ─── Flag SVG components ──────────────────────────────────────────────────────

export function FlagISL({ w, h }) {
  return (
    <svg viewBox="0 0 36 25" width={w} height={h}>
      <rect width="36" height="25" fill="#02529C" />
      <rect x="9" y="0" width="4" height="25" fill="#FFF" />
      <rect x="0" y="10.5" width="36" height="4" fill="#FFF" />
      <rect x="10" y="0" width="2" height="25" fill="#DC1E35" />
      <rect x="0" y="11.5" width="36" height="2" fill="#DC1E35" />
    </svg>
  );
}
export function FlagNOR({ w, h }) {
  return (
    <svg viewBox="0 0 22 16" width={w} height={h}>
      <rect width="22" height="16" fill="#BA0C2F" />
      <rect x="6" y="0" width="2" height="16" fill="#FFF" />
      <rect x="0" y="7" width="22" height="2" fill="#FFF" />
      <rect x="6.5" y="0" width="1" height="16" fill="#00205B" />
      <rect x="0" y="7.5" width="22" height="1" fill="#00205B" />
    </svg>
  );
}
export function FlagSWE({ w, h }) {
  return (
    <svg viewBox="0 0 16 10" width={w} height={h}>
      <rect width="16" height="10" fill="#006AA7" />
      <rect x="5" y="0" width="2" height="10" fill="#FECC00" />
      <rect x="0" y="4" width="16" height="2" fill="#FECC00" />
    </svg>
  );
}
export function FlagDNK({ w, h }) {
  return (
    <svg viewBox="0 0 37 28" width={w} height={h}>
      <rect width="37" height="28" fill="#C8102E" />
      <rect x="12" y="0" width="4" height="28" fill="#FFF" />
      <rect x="0" y="12" width="37" height="4" fill="#FFF" />
    </svg>
  );
}
export function FlagFRO({ w, h }) {
  return (
    <svg viewBox="0 0 22 16" width={w} height={h}>
      <rect width="22" height="16" fill="#FFF" />
      <rect x="6" y="0" width="2" height="16" fill="#0065BD" />
      <rect x="0" y="7" width="22" height="2" fill="#0065BD" />
      <rect x="6.5" y="0" width="1" height="16" fill="#D72828" />
      <rect x="0" y="7.5" width="22" height="1" fill="#D72828" />
    </svg>
  );
}
export function FlagDEU({ w, h }) {
  return (
    <svg viewBox="0 0 5 3" width={w} height={h}>
      <rect width="5" height="1" fill="#000" />
      <rect y="1" width="5" height="1" fill="#DD0000" />
      <rect y="2" width="5" height="1" fill="#FFCE00" />
    </svg>
  );
}
export function FlagFRA({ w, h }) {
  return (
    <svg viewBox="0 0 3 2" width={w} height={h}>
      <rect width="1" height="2" fill="#0055A4" />
      <rect x="1" width="1" height="2" fill="#FFF" />
      <rect x="2" width="1" height="2" fill="#EF4135" />
    </svg>
  );
}
export function FlagIRL({ w, h }) {
  return (
    <svg viewBox="0 0 3 2" width={w} height={h}>
      <rect width="1" height="2" fill="#169B62" />
      <rect x="1" width="1" height="2" fill="#FFF" />
      <rect x="2" width="1" height="2" fill="#FF883E" />
    </svg>
  );
}
export function FlagENG({ w, h }) {
  return (
    <svg viewBox="0 0 60 36" width={w} height={h}>
      <rect width="60" height="36" fill="#FFF" />
      <rect x="24" width="12" height="36" fill="#CE1124" />
      <rect y="12" width="60" height="12" fill="#CE1124" />
    </svg>
  );
}
export function FlagSCO({ w, h }) {
  return (
    <svg viewBox="0 0 60 36" width={w} height={h}>
      <rect width="60" height="36" fill="#0065BD" />
      <line x1="0" y1="0" x2="60" y2="36" stroke="#FFF" strokeWidth="6.5" />
      <line x1="60" y1="0" x2="0" y2="36" stroke="#FFF" strokeWidth="6.5" />
    </svg>
  );
}
export function FlagWLS({ w, h }) {
  return (
    <svg viewBox="0 0 60 36" width={w} height={h}>
      <rect width="60" height="18" fill="#FFF" />
      <rect y="18" width="60" height="18" fill="#00843D" />
      <g fill="#D00C27" transform="translate(14,8)">
        <path d="M2 12 Q4 4 12 6 Q18 7 22 12 Q26 10 30 13 Q28 17 22 17 Q18 16 14 18 Q8 18 4 16 Z" />
        <circle cx="28" cy="11.5" r="1.4" fill="#000" />
      </g>
    </svg>
  );
}
export function FlagNIR({ w, h }) {
  return (
    <svg viewBox="0 0 60 36" width={w} height={h}>
      <rect width="60" height="36" fill="#FFF" />
      <rect x="24" width="12" height="36" fill="#CE1124" />
      <rect y="12" width="60" height="12" fill="#CE1124" />
      <circle cx="30" cy="18" r="7" fill="#FFF" stroke="#000" strokeWidth="0.4" />
      <g transform="translate(30 18)" fill="#FFF" stroke="#000" strokeWidth="0.3">
        <polygon points="0,-6 1.5,-1.5 6,-1.5 2.4,1 4,5.5 0,2.6 -4,5.5 -2.4,1 -6,-1.5 -1.5,-1.5" />
      </g>
      <rect x="28.4" y="16.6" width="3.2" height="2.8" fill="#CE1124" rx="0.4" />
    </svg>
  );
}

export const FLAG_COMPONENTS = {
  ISL: FlagISL, NOR: FlagNOR, SWE: FlagSWE, DNK: FlagDNK, FRO: FlagFRO,
  DEU: FlagDEU, FRA: FlagFRA, IRL: FlagIRL,
  ENG: FlagENG, SCO: FlagSCO, WLS: FlagWLS, NIR: FlagNIR,
};

export function HiFiFlag({ code, w = 60, h = 40 }) {
  const Flag = FLAG_COMPONENTS[code];
  if (!Flag) return (
    <div style={{
      width: w, height: h, borderRadius: 3, background: 'rgba(255,255,255,0.1)',
      border: `1px solid ${HI.border}`, flexShrink: 0,
    }} />
  );
  return (
    <div style={{
      width: w, height: h, borderRadius: 3, overflow: 'hidden', flexShrink: 0,
      boxShadow: '0 1px 0 rgba(255,255,255,0.06), 0 4px 12px rgba(0,0,0,0.4)',
      border: '1px solid rgba(255,255,255,0.08)', position: 'relative',
    }}>
      <Flag w={w} h={h} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, transparent 28%, transparent 70%, rgba(0,0,0,0.12) 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}

export function KlettovisionLogo({ height = 120 }) {
  const w = height * 2.0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg viewBox="0 0 200 110" width={w} height={height} aria-label="Klettóvision logo">
        <defs>
          <linearGradient id="kv-goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#F4D67A" />
            <stop offset="45%"  stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#A8821D" />
          </linearGradient>
          <linearGradient id="kv-mtnGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#4A89C4" />
            <stop offset="100%" stopColor="#001F3F" />
          </linearGradient>
          <radialGradient id="kv-starGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(244,214,122,0.55)" />
            <stop offset="100%" stopColor="rgba(244,214,122,0)" />
          </radialGradient>
        </defs>
        <g opacity="0.7">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <rect key={`l${i}`} x={30 + i * 7} y={35 + (i % 2) * 6} width="2.4" height={45 - i * 6} fill="#5D9CEC" />
          ))}
          {[0, 1, 2, 3, 4, 5].map(i => (
            <rect key={`r${i}`} x={138 + i * 7} y={35 + ((i + 1) % 2) * 6} width="2.4" height={45 - i * 6} fill="#5D9CEC" />
          ))}
        </g>
        <circle cx="100" cy="22" r="22" fill="url(#kv-starGlow)" />
        <path d="M 50 92 L 80 38 L 100 60 L 122 30 L 158 92 Z" fill="url(#kv-mtnGrad)" />
        <path d="M 78 50 L 80 38 L 88 50 M 116 46 L 122 30 L 130 46" fill="#FFF" opacity="0.55" />
        <path d="M 100 6 L 104.3 17 L 116 17 L 106.5 24 L 110 35 L 100 28 L 90 35 L 93.5 24 L 84 17 L 95.7 17 Z"
              fill="url(#kv-goldGrad)" />
      </svg>
      <div style={{
        fontFamily: HI.font, fontWeight: 800, letterSpacing: 6,
        fontSize: height * 0.18, lineHeight: 1, display: 'flex',
      }}>
        <span style={{ color: HI.ink }}>KLETTÓ</span>
        <span style={{ color: HI.gold }}>VISION</span>
      </div>
      <div style={{
        fontFamily: HI.font, fontWeight: 600, letterSpacing: 10,
        fontSize: height * 0.08, color: HI.gold, opacity: 0.85,
      }}>2026</div>
    </div>
  );
}
