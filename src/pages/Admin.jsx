import { useState, useEffect, useRef } from 'react';
import { HI, HiFiFlag, KlettovisionLogo } from '../lib/brand.jsx';

// ── Page background ───────────────────────────────────────────────────────────

function PageBg() {
  return (
    <>
      <div style={{
        position: 'fixed', inset: 0, background: HI.bgGrad, zIndex: 0, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(93,156,236,0.08) 0%, rgba(0,0,0,0) 50%)',
      }} />
    </>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────

function Button({ children, variant = 'primary', disabled, onClick }) {
  let bg, color, border, shadow;
  if (variant === 'primary') {
    bg = HI.goldGrad; color = HI.bg; border = 'none';
    shadow = `0 8px 24px ${HI.goldGlow}, inset 0 1px 0 rgba(255,255,255,0.35)`;
  } else if (variant === 'danger') {
    bg = 'rgba(224,130,120,0.15)'; color = '#e08278';
    border = '1px solid rgba(224,130,120,0.4)'; shadow = 'none';
  } else {
    bg = 'rgba(255,255,255,0.06)'; color = HI.ink;
    border = `1px solid ${HI.border2}`; shadow = 'none';
  }
  return (
    <button onClick={onClick} disabled={disabled} style={{
      appearance: 'none', WebkitAppearance: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      width: '100%', padding: '16px 20px', borderRadius: 12,
      background: bg, color, border, boxShadow: shadow,
      fontFamily: HI.font, fontWeight: 700, fontSize: 16,
      letterSpacing: 1, textTransform: 'uppercase',
      opacity: disabled ? 0.4 : 1, transition: 'opacity 120ms',
    }}>{children}</button>
  );
}

// ── SCREEN 1: PIN entry ───────────────────────────────────────────────────────

function PinScreen({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  async function handleUnlock() {
    if (pin.length < 4 || loading) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/manage/votes', {
        headers: { 'X-Admin-Pin': pin },
      });
      if (res.ok) {
        sessionStorage.setItem('admin_pin', pin);
        onUnlock(pin, await res.json());
      } else {
        setError(true);
        setPin('');
        inputRef.current?.focus();
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 28px', position: 'relative', zIndex: 1, cursor: 'pointer',
      }}
    >
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          <KlettovisionLogo height={100} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            fontFamily: HI.font, fontWeight: 700, fontSize: 11,
            letterSpacing: 3.5, textTransform: 'uppercase', color: HI.gold, marginBottom: 8,
          }}>Aðgangur stjórnanda</div>
          <div style={{
            fontFamily: HI.font, fontWeight: 800, fontSize: 36,
            color: HI.ink, letterSpacing: 0.2, lineHeight: 1,
          }}>Sláðu inn PIN</div>
        </div>

        {/* PIN dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
          {[0, 1, 2, 3].map(i => {
            const filled = i < pin.length;
            return (
              <div key={i} style={{
                width: 56, height: 72, borderRadius: 12,
                background: filled
                  ? (error ? 'rgba(224,130,120,0.15)' : HI.goldSoft)
                  : HI.surface,
                border: `1px solid ${error ? '#e08278' : filled ? HI.gold : HI.border2}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 200ms',
              }}>
                {filled && (
                  <div style={{
                    width: 14, height: 14, borderRadius: 7,
                    background: error ? '#e08278' : HI.gold,
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <div style={{
            textAlign: 'center', color: '#e08278',
            fontFamily: HI.body, fontSize: 14, marginBottom: 8,
          }}>Rangt PIN — reyndu aftur</div>
        )}

        {/* Hidden input that triggers the numeric keyboard */}
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          value={pin}
          onChange={e => {
            const v = e.target.value.replace(/\D/g, '').slice(0, 4);
            setPin(v);
            setError(false);
          }}
          onKeyDown={e => { if (e.key === 'Enter') handleUnlock(); }}
          autoComplete="off"
          style={{
            position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1,
          }}
        />

        <div style={{ marginTop: 24 }}>
          <div style={{
            textAlign: 'center', color: HI.inkDim,
            fontFamily: HI.body, fontSize: 13, letterSpacing: 1,
            marginBottom: 16,
          }}>
            Smelltu hér og sláðu inn PIN á lyklaborðinu
          </div>
          <Button
            variant="primary"
            disabled={pin.length < 4 || loading}
            onClick={handleUnlock}
          >
            {loading ? 'Opnar…' : 'Opna'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── SCREEN 2: Reveal control ──────────────────────────────────────────────────

// Build a merged judge+vote list in config order.
// votes: array of { id, judgeName, revealStage }
// judges: ordered array of judge names from config
function mergeJudgeData(judges, votes) {
  return judges.map(name => {
    const vote = votes.find(v => v.judgeName === name);
    return vote
      ? { name, id: vote.id, submitted: true, revealStage: vote.revealStage }
      : { name, id: null, submitted: false, revealStage: -1 };
  });
}

function statusOf(judge) {
  if (!judge.submitted) return 'not_submitted';
  if (judge.revealStage === 0) return 'ready';
  if (judge.revealStage === 1) return 'progress_14';
  if (judge.revealStage === 2) return 'progress_58';
  if (judge.revealStage === 3) return 'progress_10';
  return 'done';
}

function StatusBadge({ status }) {
  if (status === 'not_submitted') {
    return (
      <span style={{
        color: HI.inkDim, fontFamily: HI.body, fontSize: 12,
        letterSpacing: 1.5, textTransform: 'uppercase',
      }}>·· bíður ··</span>
    );
  }
  if (status === 'ready') {
    return (
      <span style={{
        color: HI.glow, fontFamily: HI.font, fontWeight: 700, fontSize: 11,
        padding: '3px 8px', border: `1px solid ${HI.glow}`,
        borderRadius: 4, letterSpacing: 2, textTransform: 'uppercase',
      }}>tilbúið</span>
    );
  }
  if (status === 'progress_14') {
    return (
      <span style={{
        color: HI.gold, fontFamily: HI.font, fontWeight: 700, fontSize: 11,
        padding: '3px 8px', border: `1px solid ${HI.gold}`,
        borderRadius: 4, letterSpacing: 2, textTransform: 'uppercase',
      }}>1–4 birt</span>
    );
  }
  if (status === 'progress_58') {
    return (
      <span style={{
        color: HI.gold, fontFamily: HI.font, fontWeight: 700, fontSize: 11,
        padding: '3px 8px', border: `1px solid ${HI.gold}`,
        borderRadius: 4, letterSpacing: 2, textTransform: 'uppercase',
      }}>5–8 birt</span>
    );
  }
  if (status === 'progress_10') {
    return (
      <span style={{
        color: HI.gold, fontFamily: HI.font, fontWeight: 700, fontSize: 11,
        padding: '3px 8px', border: `1px solid ${HI.gold}`,
        borderRadius: 4, letterSpacing: 2, textTransform: 'uppercase',
      }}>10 birt</span>
    );
  }
  return (
    <span style={{
      color: HI.inkMuted, fontFamily: HI.body, fontSize: 12,
      letterSpacing: 1.5, textTransform: 'uppercase',
    }}>✓ kláruð</span>
  );
}

function JudgeRow({ judge, position, isActive, onSelect }) {
  const status = statusOf(judge);
  const clickable = judge.submitted && judge.revealStage < 4 && !isActive;
  return (
    <div
      onClick={clickable ? onSelect : undefined}
      style={{
        display: 'grid', gridTemplateColumns: '28px 1fr auto',
        alignItems: 'center', gap: 12, padding: '8px 14px',
        borderLeft: isActive ? `3px solid ${HI.gold}` : '3px solid transparent',
        background: isActive ? 'rgba(212,175,55,0.05)' : 'transparent',
        opacity: status === 'not_submitted' ? 0.45 : 1,
        cursor: clickable ? 'pointer' : 'default',
      }}>
      <span style={{
        fontFamily: HI.font, fontSize: 14,
        color: HI.inkMuted, textAlign: 'center',
      }}>{position}</span>
      <span style={{
        fontFamily: HI.font, fontWeight: 700, fontSize: 17,
        color: status === 'not_submitted' ? HI.inkMuted : HI.ink, letterSpacing: 0.2,
      }}>{judge.name}</span>
      <StatusBadge status={status} />
    </div>
  );
}

// Stage progress pill — 4 segments
function StagePill({ stage }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[0, 1, 2, 3, 4].map(i => (
        <span key={i} style={{
          width: 22, height: 6, borderRadius: 3,
          background: i <= stage ? HI.gold : HI.border2,
          opacity: i <= stage ? 1 : 0.5,
          transition: 'background 300ms',
        }} />
      ))}
    </div>
  );
}

// Single reveal action button
function RevealButton({ label, enabled, done, climax, index, onClick }) {
  let bg, color, border, opacity;
  if (done) {
    bg = 'transparent'; color = HI.inkDim;
    border = `1px solid ${HI.border}`; opacity = 0.7;
  } else if (enabled) {
    bg = climax ? HI.goldGrad : 'rgba(255,255,255,0.06)';
    color = climax ? HI.bg : HI.ink;
    border = climax ? 'none' : `1px solid ${HI.border2}`;
    opacity = 1;
  } else {
    bg = 'transparent'; color = HI.inkMuted;
    border = `1px dashed ${HI.border2}`; opacity = 0.6;
  }

  return (
    <button
      onClick={enabled ? onClick : undefined}
      disabled={!enabled}
      style={{
        appearance: 'none', WebkitAppearance: 'none',
        width: '100%', minHeight: 60, padding: '14px 16px',
        borderRadius: 10, background: bg, border, opacity,
        cursor: enabled ? 'pointer' : 'not-allowed',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        boxShadow: enabled && climax ? `0 6px 20px ${HI.goldGlow}` : 'none',
        transition: 'opacity 120ms',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 26, height: 26, borderRadius: 13,
          border: `1.5px solid ${done ? HI.inkDim : enabled ? (climax ? HI.bg : HI.border2) : HI.border}`,
          color: done ? HI.inkDim : enabled ? (climax ? HI.bg : HI.inkMuted) : HI.inkDim,
          fontFamily: HI.font, fontWeight: 700, fontSize: 14,
          background: done ? HI.border : 'transparent',
          flexShrink: 0,
        }}>
          {done ? '✓' : index}
        </span>
        <span style={{
          fontFamily: HI.font, fontWeight: 700, fontSize: 18,
          letterSpacing: 0.5, color, textTransform: 'uppercase',
        }}>{label}</span>
      </div>
      {!enabled && !done && (
        <span style={{
          color: HI.inkDim, fontFamily: HI.body, fontSize: 12,
          letterSpacing: 2, textTransform: 'uppercase',
        }}>læst</span>
      )}
    </button>
  );
}

function ActiveJudgeCard({ judge, onReveal }) {
  const stage = judge.revealStage; // 0–3 active; 4 = done
  const buttons = [
    { label: 'Birta 1–4 stig',  enabled: stage === 0, done: stage > 0, climax: false },
    { label: 'Birta 5–8 stig',  enabled: stage === 1, done: stage > 1, climax: false },
    { label: 'Birta 10 stig',   enabled: stage === 2, done: stage > 2, climax: false },
    { label: 'Birta 12 stig',   enabled: stage === 3, done: stage > 3, climax: true  },
  ];

  return (
    <div style={{
      borderRadius: 14,
      border: `1px solid ${HI.gold}`,
      boxShadow: `0 0 0 1px ${HI.goldSoft}, 0 8px 32px rgba(0,0,0,0.5)`,
      background: 'rgba(212,175,55,0.04)',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          marginBottom: 4,
        }}>
          <span style={{
            fontFamily: HI.font, fontWeight: 700, fontSize: 11,
            letterSpacing: 3.5, textTransform: 'uppercase', color: HI.gold,
          }}>Er að birta</span>
          <StagePill stage={stage} />
        </div>

        <div style={{
          fontFamily: HI.font, fontWeight: 800, fontSize: 40,
          color: HI.ink, letterSpacing: 0.5, lineHeight: 1.05,
          marginBottom: 14,
        }}>{judge.name}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {buttons.map((b, i) => (
            <RevealButton
              key={b.label}
              index={i + 1}
              {...b}
              onClick={() => onReveal(judge.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function RevealScreen({ config, initialVotes, pin }) {
  const [votes, setVotes] = useState(initialVotes);
  const [revealing, setRevealing] = useState(false);
  const [selectedName, setSelectedName] = useState(null);

  const judges = mergeJudgeData(config.judges, votes);
  const autoJudge = judges.find(j => j.submitted && j.revealStage >= 0 && j.revealStage < 4);
  const activeJudge = selectedName
    ? judges.find(j => j.name === selectedName && j.submitted && j.revealStage < 4) ?? autoJudge
    : autoJudge;
  const doneCount = judges.filter(j => j.revealStage === 4).length;
  const submittedCount = judges.filter(j => j.submitted).length;
  const totalCount = judges.length;

  // Refresh votes from server
  async function refresh() {
    try {
      const res = await fetch('/api/manage/votes', { headers: { 'X-Admin-Pin': pin } });
      if (res.ok) setVotes(await res.json());
    } catch { /* ignore */ }
  }

  // Poll every 8 seconds in case another tab/device triggers changes
  useEffect(() => {
    const id = setInterval(refresh, 8000);
    return () => clearInterval(id);
  }, [pin]);

  async function handleReveal(voteId) {
    setRevealing(true);
    try {
      const res = await fetch(`/api/manage/votes/${voteId}/reveal`, {
        method: 'POST',
        headers: { 'X-Admin-Pin': pin },
      });
      if (res.ok) {
        const updated = await res.json();
        if (updated.revealStage >= 4) setSelectedName(null);
        await refresh();
      }
    } finally {
      setRevealing(false);
    }
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      padding: '0 16px', position: 'relative', zIndex: 1,
    }}>
      <div style={{ height: 'env(safe-area-inset-top, 44px)' }} />

      {/* Header */}
      <div style={{ padding: '4px 4px 8px' }}>
        <div style={{
          fontFamily: HI.font, fontWeight: 700, fontSize: 11,
          letterSpacing: 3.5, textTransform: 'uppercase', color: HI.gold,
        }}>Stjórnandi · birting</div>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          marginTop: 4,
        }}>
          <div style={{
            fontFamily: HI.font, fontWeight: 800, fontSize: 26,
            color: HI.ink, letterSpacing: 0.3, lineHeight: 1,
          }}>{doneCount} af {totalCount} kláruð</div>
          <div style={{
            color: HI.inkMuted, fontFamily: HI.body, fontSize: 14,
          }}>{submittedCount}/{totalCount} innsend</div>
        </div>
      </div>

      {/* Active judge */}
      {activeJudge ? (
        <div style={{ marginBottom: 8 }}>
          <ActiveJudgeCard
            judge={activeJudge}
            onReveal={revealing ? () => {} : handleReveal}
          />
        </div>
      ) : doneCount === submittedCount && submittedCount > 0 ? (
        <div style={{
          marginBottom: 8, padding: '20px', borderRadius: 14,
          border: `1px solid ${HI.border}`, textAlign: 'center',
          background: HI.surface,
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
          <div style={{
            fontFamily: HI.font, fontWeight: 800, fontSize: 22, color: HI.gold,
          }}>Lokaúrslit!</div>
          <div style={{
            marginTop: 4, fontFamily: HI.body, fontSize: 14, color: HI.inkMuted,
          }}>Öll atkvæði hafa verið birt.</div>
        </div>
      ) : (
        <div style={{
          marginBottom: 8, padding: '20px', borderRadius: 14,
          border: `1px solid ${HI.border}`, textAlign: 'center',
          background: HI.surface,
        }}>
          <div style={{
            fontFamily: HI.body, fontSize: 14, color: HI.inkMuted,
          }}>Bíður eftir fleiri atkvæðum…</div>
        </div>
      )}

      {/* Judge list */}
      <div style={{
        fontFamily: HI.font, fontWeight: 700, fontSize: 11,
        letterSpacing: 3.5, textTransform: 'uppercase',
        color: HI.inkMuted, padding: '4px 4px 6px',
      }}>Allir dómarar · forstillt röð</div>

      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {judges.map((judge, i) => (
          <JudgeRow
            key={judge.name}
            judge={judge}
            position={i + 1}
            isActive={activeJudge?.name === judge.name}
            onSelect={() => setSelectedName(judge.name)}
          />
        ))}
      </div>

      <div style={{ height: 'max(12px, env(safe-area-inset-bottom, 12px))' }} />
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function Admin() {
  const [pin, setPin] = useState(null);
  const [votes, setVotes] = useState(null);
  const [config, setConfig] = useState(null);
  const [autoChecking, setAutoChecking] = useState(true);

  // Try auto-login with stored session PIN
  useEffect(() => {
    const stored = sessionStorage.getItem('admin_pin');
    if (!stored) { setAutoChecking(false); return; }

    Promise.all([
      fetch('/api/manage/votes', { headers: { 'X-Admin-Pin': stored } }),
      fetch('/api/config'),
    ]).then(async ([vRes, cRes]) => {
      if (vRes.ok && cRes.ok) {
        setVotes(await vRes.json());
        setConfig(await cRes.json());
        setPin(stored);
      } else {
        sessionStorage.removeItem('admin_pin');
      }
    }).catch(() => {
      sessionStorage.removeItem('admin_pin');
    }).finally(() => {
      setAutoChecking(false);
    });
  }, []);

  async function handleUnlock(newPin, initialVotes) {
    try {
      const res = await fetch('/api/config');
      const cfg = res.ok ? await res.json() : null;
      setConfig(cfg);
    } catch { /* continue without config — will fail gracefully */ }
    setVotes(initialVotes);
    setPin(newPin);
  }

  if (autoChecking) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: HI.bg, color: HI.inkDim, fontFamily: HI.body, fontSize: 14,
      }}>Hleður…</div>
    );
  }

  return (
    <div style={{ background: HI.bg, color: HI.ink, minHeight: '100dvh', position: 'relative' }}>
      <PageBg />
      {!pin ? (
        <PinScreen onUnlock={handleUnlock} />
      ) : config ? (
        <RevealScreen config={config} initialVotes={votes ?? []} pin={pin} />
      ) : (
        <div style={{
          minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px', textAlign: 'center',
          color: HI.inkMuted, fontFamily: HI.body, fontSize: 14,
        }}>
          Villa við að hlaða stillingunum. Reyndu að endurhlaða síðuna.
        </div>
      )}
    </div>
  );
}
