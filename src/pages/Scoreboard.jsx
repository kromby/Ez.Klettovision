import { useState, useEffect, useRef, useMemo } from 'react';

// ─── Brand palette ────────────────────────────────────────────────────────────
const HI = {
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

const POINTS_LADDER = [12, 10, 8, 6, 5, 4, 3, 2, 1];

// ─── Flag SVGs ────────────────────────────────────────────────────────────────
function FlagISL({ w, h }) {
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
function FlagNOR({ w, h }) {
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
function FlagSWE({ w, h }) {
  return (
    <svg viewBox="0 0 16 10" width={w} height={h}>
      <rect width="16" height="10" fill="#006AA7" />
      <rect x="5" y="0" width="2" height="10" fill="#FECC00" />
      <rect x="0" y="4" width="16" height="2" fill="#FECC00" />
    </svg>
  );
}
function FlagDNK({ w, h }) {
  return (
    <svg viewBox="0 0 37 28" width={w} height={h}>
      <rect width="37" height="28" fill="#C8102E" />
      <rect x="12" y="0" width="4" height="28" fill="#FFF" />
      <rect x="0" y="12" width="37" height="4" fill="#FFF" />
    </svg>
  );
}
function FlagFRO({ w, h }) {
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
function FlagDEU({ w, h }) {
  return (
    <svg viewBox="0 0 5 3" width={w} height={h}>
      <rect width="5" height="1" fill="#000" />
      <rect y="1" width="5" height="1" fill="#DD0000" />
      <rect y="2" width="5" height="1" fill="#FFCE00" />
    </svg>
  );
}
function FlagFRA({ w, h }) {
  return (
    <svg viewBox="0 0 3 2" width={w} height={h}>
      <rect width="1" height="2" fill="#0055A4" />
      <rect x="1" width="1" height="2" fill="#FFF" />
      <rect x="2" width="1" height="2" fill="#EF4135" />
    </svg>
  );
}
function FlagIRL({ w, h }) {
  return (
    <svg viewBox="0 0 3 2" width={w} height={h}>
      <rect width="1" height="2" fill="#169B62" />
      <rect x="1" width="1" height="2" fill="#FFF" />
      <rect x="2" width="1" height="2" fill="#FF883E" />
    </svg>
  );
}
function FlagENG({ w, h }) {
  return (
    <svg viewBox="0 0 60 36" width={w} height={h}>
      <rect width="60" height="36" fill="#FFF" />
      <rect x="24" width="12" height="36" fill="#CE1124" />
      <rect y="12" width="60" height="12" fill="#CE1124" />
    </svg>
  );
}
function FlagSCO({ w, h }) {
  return (
    <svg viewBox="0 0 60 36" width={w} height={h}>
      <rect width="60" height="36" fill="#0065BD" />
      <line x1="0" y1="0" x2="60" y2="36" stroke="#FFF" strokeWidth="6.5" />
      <line x1="60" y1="0" x2="0" y2="36" stroke="#FFF" strokeWidth="6.5" />
    </svg>
  );
}
function FlagWLS({ w, h }) {
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
function FlagNIR({ w, h }) {
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

const FLAG_COMPONENTS = {
  ISL: FlagISL, NOR: FlagNOR, SWE: FlagSWE, DNK: FlagDNK, FRO: FlagFRO,
  DEU: FlagDEU, FRA: FlagFRA, IRL: FlagIRL,
  ENG: FlagENG, SCO: FlagSCO, WLS: FlagWLS, NIR: FlagNIR,
};

function HiFiFlag({ code, w = 60, h = 40 }) {
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

// ─── Brand logo (SVG, scales cleanly) ────────────────────────────────────────
function KlettovisionLogo({ height = 120 }) {
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

// ─── Background (gradient + animated audio bars) ──────────────────────────────
function Background() {
  const bars = useMemo(() => Array.from({ length: 80 }, (_, i) => {
    const seed = ((Math.sin(i * 1.7) + Math.cos(i * 0.9)) / 2 + 1) / 2;
    return {
      baseH: seed * 0.7 + 0.15,
      dur:   1.6 + (i % 7) * 0.18,
      delay: (i % 13) * 0.07,
    };
  }), []);

  return (
    <>
      <style>{`
        @keyframes kv-bar { 0%,100% { transform: scaleY(var(--bh)) } 50% { transform: scaleY(calc(var(--bh) * 1.7)) } }
        @keyframes kv-pulse { 0%,100% { opacity:1; transform:scale(1) } 50% { opacity:0.55; transform:scale(0.75) } }
      `}</style>
      <div style={{ position: 'absolute', inset: 0, background: HI.bgGrad }} />
      {/* gold radial glow behind judge panel */}
      <div style={{
        position: 'absolute', right: -100, top: 200, width: 700, height: 700,
        background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 60%)',
        filter: 'blur(20px)', pointerEvents: 'none',
      }} />
      {/* animated audio bars */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: 380,
        opacity: 0.5, pointerEvents: 'none', overflow: 'hidden',
        display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
      }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 320 }}>
          {bars.map((b, i) => (
            <div key={i} style={{
              width: 7, height: 320, transformOrigin: 'bottom',
              '--bh': b.baseH,
              transform: `scaleY(${b.baseH})`,
              animation: `kv-bar ${b.dur}s ease-in-out ${b.delay}s infinite`,
              background: 'linear-gradient(180deg, rgba(93,156,236,0) 0%, rgba(93,156,236,0.28) 60%, rgba(93,156,236,0.6) 100%)',
              borderRadius: 2,
            }} />
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Rank delta indicator ─────────────────────────────────────────────────────
function RankDelta({ prev, now, compact }) {
  if (prev == null || now == null || prev === now) {
    return compact ? <span style={{ width: 24 }} /> : null;
  }
  const up = now < prev;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      color: up ? '#4ADE80' : '#F87171',
      fontFamily: HI.font, fontWeight: 700,
      fontSize: compact ? 16 : 20, letterSpacing: 0.5,
    }}>
      <span style={{ fontSize: compact ? 10 : 12 }}>{up ? '▲' : '▼'}</span>
      {Math.abs(now - prev)}
    </span>
  );
}

// ─── Scoreboard row components ────────────────────────────────────────────────
function LeaderCard({ country, prevRank }) {
  return (
    <div style={{
      position: 'relative',
      border: `1px solid ${HI.border2}`, borderRadius: 12,
      background: HI.surface2,
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 30px 60px rgba(0,0,0,0.45)`,
      overflow: 'hidden', flexShrink: 0,
    }}>
      {/* gold left accent */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 6,
        background: HI.goldGrad, boxShadow: `0 0 24px ${HI.goldGlow}`,
      }} />
      {/* gold wash */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, rgba(212,175,55,0.10) 0%, rgba(212,175,55,0.02) 35%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'relative',
        display: 'grid', gridTemplateColumns: '160px 1fr auto',
        alignItems: 'center', gap: 28, padding: 'clamp(16px,2vh,22px) 32px clamp(16px,2vh,22px) 44px',
      }}>
        <HiFiFlag code={country.code} w={144} h={96} />
        <div style={{
          fontFamily: HI.font, fontWeight: 800,
          fontSize: 'clamp(40px,5.5vw,78px)', color: HI.ink,
          lineHeight: 1, letterSpacing: 0.5,
        }}>{country.name}</div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: HI.font, fontWeight: 800,
            fontSize: 'clamp(60px,8vw,132px)', lineHeight: 0.95,
            background: HI.goldGrad,
            WebkitBackgroundClip: 'text', backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: `drop-shadow(0 0 24px ${HI.goldGlow})`,
            letterSpacing: 1,
          }}>{country.points}</div>
        </div>
      </div>
    </div>
  );
}

function SecondPlaceCard({ country, prevRank }) {
  return (
    <div style={{
      position: 'relative',
      border: `1px solid ${HI.border2}`, borderRadius: 12,
      background: HI.surface2,
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 18px 36px rgba(0,0,0,0.35)`,
      overflow: 'hidden', flexShrink: 0,
    }}>
      {/* glacier left accent */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 5,
        background: HI.glacierGrad, boxShadow: `0 0 18px ${HI.glowGlow}`,
      }} />
      <div style={{
        position: 'relative',
        display: 'grid', gridTemplateColumns: '108px 1fr auto auto',
        alignItems: 'center', gap: 22, padding: 'clamp(10px,1.3vh,14px) 24px clamp(10px,1.3vh,14px) 36px',
      }}>
        <HiFiFlag code={country.code} w={96} h={64} />
        <div style={{
          fontFamily: HI.font, fontWeight: 700,
          fontSize: 'clamp(24px,3.2vw,48px)', color: HI.ink, letterSpacing: 0.5, lineHeight: 1,
        }}>{country.name}</div>
        <RankDelta prev={prevRank} now={2} />
        <div style={{
          fontFamily: HI.font, fontWeight: 800,
          fontSize: 'clamp(36px,4.5vw,64px)', color: HI.glow,
          letterSpacing: 1, lineHeight: 1,
          textShadow: `0 0 18px ${HI.glowGlow}`,
        }}>{country.points}</div>
      </div>
    </div>
  );
}

function ChaserRow({ rank, country, prevRank, justScoredPts }) {
  return (
    <div style={{
      position: 'relative',
      border: `1px solid ${justScoredPts ? 'rgba(93,156,236,0.35)' : HI.border}`,
      borderRadius: 10,
      background: justScoredPts ? 'rgba(93,156,236,0.04)' : HI.surface,
      transition: 'background 600ms, border-color 600ms',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '34px 56px 1fr auto auto',
        alignItems: 'center', gap: 14, padding: 'clamp(4px,0.5vh,6px) 18px',
        minHeight: 'clamp(38px,4.5vh,46px)',
      }}>
        <div style={{
          fontFamily: HI.font, fontWeight: 700,
          fontSize: 'clamp(16px,1.8vw,28px)', color: HI.inkMuted,
          textAlign: 'center', lineHeight: 1,
        }}>{rank}</div>
        <HiFiFlag code={country.code} w={48} h={32} />
        <div style={{
          fontFamily: HI.font, fontWeight: 600,
          fontSize: 'clamp(14px,1.5vw,26px)', color: HI.ink, letterSpacing: 0.3,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{country.name}</div>
        <RankDelta prev={prevRank} now={rank} compact />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 56, justifyContent: 'flex-end' }}>
          {justScoredPts != null && (
            <span style={{
              fontFamily: HI.body, fontWeight: 700,
              fontSize: 'clamp(11px,1.2vw,14px)', color: HI.glow, letterSpacing: 0.5,
            }}>+{justScoredPts}</span>
          )}
          <span style={{
            fontFamily: HI.font, fontWeight: 800,
            fontSize: 'clamp(20px,2.2vw,36px)', color: HI.ink,
            lineHeight: 1, letterSpacing: 0.5,
          }}>{country.points}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Judge panel (right column) ───────────────────────────────────────────────
function JudgePanel({ currentJudge, countryMap }) {
  const revealedByPts = Object.fromEntries(
    (currentJudge.revealedScores ?? []).map(s => [s.points, s])
  );
  const latestPts = currentJudge.revealedScores?.at(-1)?.points;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, height: '100%', minHeight: 0 }}>
      <div style={{
        fontFamily: HI.font, fontWeight: 800,
        fontSize: 'clamp(32px,4.5vw,88px)', color: HI.ink,
        lineHeight: 0.95, letterSpacing: 0.5, flexShrink: 0,
      }}>{currentJudge.name}</div>

      {/* Points list card */}
      <div style={{
        flex: 1, minHeight: 0,
        border: `1px solid ${HI.border}`, borderRadius: 14,
        background: HI.surface,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 20px 40px rgba(0,0,0,0.3)',
        padding: 16, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        {[...POINTS_LADDER].map((pts, i, arr) => {
          const score    = revealedByPts[pts];
          const isRev    = !!score;
          const isLatest = pts === latestPts;
          const isBig    = pts === 12;
          const country  = isRev ? countryMap[score.code] : null;
          const accent   = isBig ? HI.gold : isLatest ? HI.glow : HI.ink;
          const wash     = isBig ? HI.goldSoft : isLatest ? HI.glowSoft : 'transparent';

          return (
            <div key={pts} style={{
              position: 'relative',
              display: 'grid', gridTemplateColumns: 'clamp(52px,4.5vw,64px) clamp(42px,3.5vw,56px) 1fr',
              alignItems: 'center', gap: 14,
              padding: 'clamp(5px,0.6vh,7px) 6px',
              borderBottom: i < arr.length - 1 ? `1px solid ${HI.border}` : 'none',
              opacity: isRev ? 1 : 0.42,
              transition: 'opacity 400ms',
              flex: 1,
            }}>
              {/* accent wash */}
              {(isBig || isLatest) && isRev && (
                <div style={{
                  position: 'absolute', inset: '0 -16px',
                  background: `linear-gradient(90deg, ${wash} 0%, transparent 80%)`,
                  pointerEvents: 'none',
                }} />
              )}
              {/* pts label */}
              <div style={{
                position: 'relative',
                fontFamily: HI.font, fontWeight: 800,
                fontSize: isBig ? 'clamp(22px,2.4vw,36px)' : 'clamp(18px,2vw,30px)',
                color: accent, textAlign: 'right', letterSpacing: 0.5,
                textShadow: isBig && isRev ? `0 0 16px ${HI.goldGlow}` : 'none',
              }}>
                {pts}
                <span style={{
                  fontFamily: HI.body, fontWeight: 600, fontSize: 'clamp(8px,0.9vw,12px)',
                  color: HI.inkMuted, marginLeft: 4, letterSpacing: 2,
                }}>PTS</span>
              </div>
              {/* flag or placeholder */}
              {isRev && country ? (
                <HiFiFlag code={score.code} w={48} h={32} />
              ) : (
                <div style={{
                  width: 48, height: 32, border: `1px dashed ${HI.inkDim}`,
                  borderRadius: 3,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: HI.inkDim, fontFamily: HI.font, fontSize: 18, fontWeight: 700,
                }}>?</div>
              )}
              {/* country name */}
              <div style={{
                position: 'relative',
                fontFamily: HI.font, fontWeight: isBig ? 800 : 600,
                fontSize: 'clamp(14px,1.5vw,26px)', color: accent, letterSpacing: 0.3,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {isRev && country ? country.name : (
                  <span style={{ color: HI.inkDim, fontWeight: 400, letterSpacing: 6 }}>— — —</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── State: waiting ────────────────────────────────────────────────────────────
function WaitingState({ submittedCount, totalJudges }) {
  return (
    <div style={{
      width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden',
      background: HI.bg, color: HI.ink, fontFamily: HI.body,
    }}>
      <Background />
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 'clamp(16px,2.5vh,32px)', paddingBottom: 60,
      }}>
        <KlettovisionLogo height={Math.min(260, window.innerHeight * 0.24)} />
        <div style={{ height: 12 }} />
        {/* big X / Y counter */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 32, lineHeight: 1 }}>
          <span style={{
            fontFamily: HI.font, fontWeight: 800,
            fontSize: 'clamp(100px,18vw,280px)',
            background: HI.goldGrad,
            WebkitBackgroundClip: 'text', backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: `drop-shadow(0 0 48px ${HI.goldGlow})`,
            letterSpacing: 1,
          }}>{submittedCount}</span>
          <span style={{ fontFamily: HI.font, fontWeight: 400, fontSize: 'clamp(70px,12vw,180px)', color: HI.inkDim }}>/</span>
          <span style={{
            fontFamily: HI.font, fontWeight: 800,
            fontSize: 'clamp(100px,18vw,280px)', color: HI.ink, letterSpacing: 1,
          }}>{totalJudges}</span>
        </div>
        <div style={{
          fontFamily: HI.body, fontWeight: 600,
          fontSize: 'clamp(16px,2.2vw,32px)', color: HI.inkSoft, letterSpacing: 1,
        }}>
          dómarar hafa sent inn atkvæði sín
        </div>
        {/* pulsing "waiting" pill */}
        <div style={{
          marginTop: 12,
          display: 'inline-flex', alignItems: 'center', gap: 14,
          padding: '10px 22px', border: `1px solid ${HI.border2}`,
          background: HI.surface, borderRadius: 100,
          fontFamily: HI.body, fontWeight: 700, fontSize: 14,
          color: HI.gold, letterSpacing: 4, textTransform: 'uppercase',
        }}>
          <span style={{
            display: 'inline-block', width: 10, height: 10, borderRadius: 5,
            background: HI.gold, boxShadow: `0 0 14px ${HI.goldGlow}`,
            animation: 'kv-pulse 1.6s ease-in-out infinite',
          }} />
          bíður
        </div>
      </div>
    </div>
  );
}

// ─── State: reveal (+ between judges + all done) ──────────────────────────────
function RevealState({ data, displayCountries, prevRanks }) {
  const { currentJudge, lastRevealedJudge, nextJudge, submittedCount, totalJudges } = data;
  const allDone = !currentJudge && !nextJudge;

  // Show last fully-revealed judge's panel while waiting for next judge's first reveal
  const judgeToShow = currentJudge ?? lastRevealedJudge;

  // Build code → country map (for flag lookup in judge panel)
  const countryMap = Object.fromEntries(data.countries.map(c => [c.code, c]));

  // Build code → pts awarded by active judge only (for +N badges; cleared between judges)
  const revealedPtsMap = Object.fromEntries(
    (currentJudge?.revealedScores ?? []).map(s => [s.code, s.points])
  );

  const leader  = displayCountries[0];
  const second  = displayCountries[1];
  const chasers = displayCountries.slice(2).map((c, i) => ({ ...c, rank: i + 3 }));

  return (
    <div style={{
      width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden',
      background: HI.bg, color: HI.ink, fontFamily: HI.body,
      display: 'flex', flexDirection: 'column',
    }}>
      <Background />

      {/* Header */}
      <div style={{
        position: 'relative', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 28, padding: 'clamp(10px,1.5vh,20px) 0',
      }}>
        <KlettovisionLogo height={Math.min(120, window.innerHeight * 0.11)} />
        {allDone && (
          <span style={{
            fontFamily: HI.font, fontWeight: 800,
            fontSize: 'clamp(20px,2.5vw,40px)', color: HI.gold,
            letterSpacing: 4, textTransform: 'uppercase',
          }}>Lokaúrslit</span>
        )}
      </div>

      {/* Main grid */}
      <div style={{
        flex: 1, minHeight: 0, position: 'relative',
        display: 'grid', gridTemplateColumns: '1.55fr 1fr',
        gap: 'clamp(24px,3vw,48px)',
        padding: '0 clamp(24px,3vw,56px) 0',
      }}>
        {/* LEFT: scoreboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(6px,0.8vh,14px)', minHeight: 0 }}>
          {leader && <LeaderCard country={leader} prevRank={prevRanks[leader.code]} />}
          {second && <SecondPlaceCard country={second} prevRank={prevRanks[second.code]} />}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            gap: 'clamp(3px,0.4vh,4px)', minHeight: 0,
          }}>
            {chasers.map(c => (
              <ChaserRow key={c.code}
                rank={c.rank} country={c}
                prevRank={prevRanks[c.code]}
                justScoredPts={revealedPtsMap[c.code]}
              />
            ))}
          </div>
        </div>

        {/* RIGHT: judge panel */}
        <div style={{ minHeight: 0, paddingBottom: 'clamp(8px,1vh,16px)' }}>
          {judgeToShow && !allDone ? (
            <JudgePanel currentJudge={judgeToShow} countryMap={countryMap} />
          ) : (
            <div style={{
              height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: HI.inkDim, fontFamily: HI.font,
              fontSize: 'clamp(20px,2.5vw,48px)', letterSpacing: 4,
              textTransform: 'uppercase', textAlign: 'center',
            }}>
              {allDone ? '🏆' : '· · ·'}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'relative', flexShrink: 0,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        gap: 32, padding: 'clamp(8px,1.2vh,18px)',
        fontFamily: HI.body, fontWeight: 600,
        borderTop: `1px solid ${HI.border}`,
      }}>
        <span style={{ color: HI.inkMuted, fontSize: 'clamp(12px,1.1vw,18px)', letterSpacing: 4, textTransform: 'uppercase' }}>
          eftir {submittedCount} af {totalJudges} dómurum
        </span>
        {nextJudge && (
          <>
            <span style={{ width: 4, height: 4, borderRadius: 2, background: HI.inkDim, display: 'inline-block' }} />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
              <span style={{ color: HI.inkMuted, fontSize: 'clamp(12px,1.1vw,18px)', letterSpacing: 4, textTransform: 'uppercase' }}>
                Næst
              </span>
              <span style={{ color: HI.gold, fontSize: 'clamp(14px,1.3vw,22px)', fontWeight: 700, letterSpacing: 1.5, fontFamily: HI.font }}>
                {nextJudge}
              </span>
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Root: polls /api/scoreboard every 10 s ───────────────────────────────────
export default function Scoreboard() {
  const [data, setData]                   = useState(null);
  const [displayCountries, setDisplay]    = useState([]);
  const [prevRanks, setPrevRanks]         = useState({});
  const prevDataRef                       = useRef(null);

  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch('/api/scoreboard');
        if (!res.ok) return;
        const d = await res.json();

        const prev = prevDataRef.current;

        // currentJudge is null once RevealStage hits 4 (fully done, excluded from "current"),
        // so detect completion by watching for currentJudge disappearing.
        const judgeJustCompleted = prev?.currentJudge != null && d.currentJudge == null;

        const shouldResort =
          !prev ||
          (!prev.revealStarted && d.revealStarted) ||
          judgeJustCompleted;

        if (shouldResort) {
          const snapshot = Object.fromEntries(
            (displayCountries.length ? displayCountries : d.countries).map((c, i) => [c.code, i + 1])
          );
          setPrevRanks(snapshot);
          setDisplay(d.countries);
        }

        prevDataRef.current = d;
        setData(d);
      } catch {
        // network error — retain current state
      }
    }

    poll();
    const id = setInterval(poll, 10_000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!data) {
    return (
      <div style={{
        width: '100vw', height: '100vh', background: HI.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <KlettovisionLogo height={160} />
      </div>
    );
  }

  if (!data.revealStarted) {
    return <WaitingState submittedCount={data.submittedCount} totalJudges={data.totalJudges} />;
  }

  return <RevealState data={data} displayCountries={displayCountries} prevRanks={prevRanks} />;
}
