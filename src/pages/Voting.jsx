import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { HI, POINTS_LADDER, HiFiFlag, KlettovisionLogo } from '../lib/brand.jsx';

const SCREEN = { NAME: 'name', RANK: 'rank', REVIEW: 'review', DONE: 'done' };

function ptsForPos(i) {
  return i < POINTS_LADDER.length ? POINTS_LADDER[i] : null;
}

// ── Page background ───────────────────────────────────────────────────────────

function PageBg() {
  return (
    <>
      <div style={{
        position: 'fixed', inset: 0, background: HI.bgGrad, zIndex: 0, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(93,156,236,0.10) 0%, rgba(0,0,0,0) 50%)',
      }} />
    </>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────

function HVButton({ children, variant = 'primary', disabled, onClick, style: extraStyle = {} }) {
  let bg, color, border, shadow;
  if (variant === 'primary') {
    bg = HI.goldGrad; color = HI.bg; border = 'none';
    shadow = `0 8px 24px ${HI.goldGlow}, inset 0 1px 0 rgba(255,255,255,0.35)`;
  } else if (variant === 'secondary') {
    bg = 'rgba(255,255,255,0.06)'; color = HI.ink;
    border = `1px solid ${HI.border2}`; shadow = 'inset 0 1px 0 rgba(255,255,255,0.05)';
  } else {
    bg = 'transparent'; color = HI.inkMuted; border = 'none'; shadow = 'none';
  }
  return (
    <button onClick={onClick} disabled={disabled} style={{
      appearance: 'none', WebkitAppearance: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      width: '100%',
      padding: variant === 'ghost' ? '12px 16px' : '18px 20px',
      borderRadius: variant === 'ghost' ? 8 : 14,
      background: bg, color, border, boxShadow: shadow,
      fontFamily: HI.font, fontWeight: 700,
      fontSize: variant === 'ghost' ? 15 : 18,
      letterSpacing: variant === 'ghost' ? 0.3 : 1.5,
      textTransform: variant === 'ghost' ? 'none' : 'uppercase',
      opacity: disabled ? 0.4 : 1,
      transition: 'opacity 120ms',
      ...extraStyle,
    }}>{children}</button>
  );
}

// ── Small label ───────────────────────────────────────────────────────────────

function HVLabel({ children, color = HI.gold }) {
  return (
    <div style={{
      fontFamily: HI.font, fontWeight: 700, fontSize: 11,
      letterSpacing: 3.5, textTransform: 'uppercase', color,
    }}>{children}</div>
  );
}

// ── SCREEN 1: Name selection ──────────────────────────────────────────────────

function NameScreen({ availableJudges, onStart }) {
  const [selected, setSelected] = useState('');
  const [open, setOpen] = useState(false);
  const allGone = availableJudges.length === 0;

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      padding: '0 28px', position: 'relative', zIndex: 1,
    }}>
      <div style={{ height: 'env(safe-area-inset-top, 44px)' }} />

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24, marginBottom: 32 }}>
        <KlettovisionLogo height={120} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: HI.font, fontWeight: 800, fontSize: 30,
          color: HI.ink, lineHeight: 1.1, letterSpacing: 0.2,
        }}>
          {allGone ? 'Atkvæðagreiðslu lokið.' : 'Velkomin/n, dómari.'}
        </div>
        <div style={{
          marginTop: 8, fontFamily: HI.body, fontWeight: 400, fontSize: 15,
          color: HI.inkMuted, lineHeight: 1.5, padding: '0 8px',
        }}>
          {allGone
            ? 'Öll atkvæði hafa borist. Takk kærlega!'
            : 'Veldu nafn þitt til að greiða atkvæði.'}
        </div>
      </div>

      {!allGone && (
        <div style={{ marginTop: 28, position: 'relative' }}>
          <HVLabel color={HI.inkMuted}>Nafn þitt</HVLabel>
          <div style={{ height: 8 }} />

          <div
            onClick={() => setOpen(o => !o)}
            style={{
              background: HI.surface, cursor: 'pointer',
              border: `1px solid ${open ? HI.gold : HI.border2}`,
              borderRadius: 14, padding: '16px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              transition: 'border-color 200ms, box-shadow 200ms',
              boxShadow: open ? `0 0 0 4px ${HI.goldSoft}` : 'none',
            }}
          >
            <span style={{
              fontFamily: HI.font, fontWeight: 700, fontSize: 22,
              color: selected ? HI.ink : HI.inkDim,
            }}>{selected || 'Veldu nafn…'}</span>
            <svg width="16" height="10" viewBox="0 0 16 10"
                 style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms', flexShrink: 0 }}>
              <path d="M2 2 L8 8 L14 2"
                    stroke={open ? HI.gold : HI.inkSoft}
                    strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {open && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 10,
              background: 'rgba(20,20,25,0.96)',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid ${HI.border2}`, borderRadius: 14,
              boxShadow: '0 24px 48px rgba(0,0,0,0.6)', overflow: 'hidden',
            }}>
              {availableJudges.map((name, i) => (
                <div
                  key={name}
                  onClick={() => { setSelected(name); setOpen(false); }}
                  style={{
                    padding: '12px 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    fontFamily: HI.font, fontWeight: 600, fontSize: 18, cursor: 'pointer',
                    color: name === selected ? HI.gold : HI.ink,
                    background: name === selected ? 'rgba(212,175,55,0.08)' : 'transparent',
                    borderBottom: i < availableJudges.length - 1 ? `1px solid ${HI.border}` : 'none',
                  }}
                >
                  {name}
                  {name === selected && (
                    <svg width="16" height="12" viewBox="0 0 16 12">
                      <path d="M2 6 L6 10 L14 2" stroke={HI.gold} strokeWidth="2.4"
                            fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ flex: 1 }} />

      {!allGone && (
        <div style={{ marginBottom: 'max(40px, env(safe-area-inset-bottom, 40px))' }}>
          <HVButton
            variant="primary"
            disabled={!selected}
            onClick={() => onStart(selected)}
          >
            Byrja atkvæðagreiðslu
          </HVButton>
        </div>
      )}
    </div>
  );
}

// ── SCREEN 2: Ranking (drag & drop) ──────────────────────────────────────────

function SortableRow({ country, pts }) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: country.code });

  const isBig = pts === 12;
  const accent = isBig ? HI.gold : pts != null ? HI.glow : HI.inkDim;
  const combinedTransform = [
    CSS.Transform.toString(transform),
    isDragging ? 'scale(1.015)' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: combinedTransform, transition,
        position: 'relative', zIndex: isDragging ? 10 : 1,
        background: isDragging
          ? 'rgba(212,175,55,0.10)'
          : isBig ? 'rgba(212,175,55,0.06)' : HI.surface,
        border: `1px solid ${isDragging ? HI.gold : isBig ? 'rgba(212,175,55,0.3)' : HI.border}`,
        borderRadius: 12,
        boxShadow: isDragging
          ? `0 14px 28px rgba(0,0,0,0.6), 0 0 0 4px ${HI.goldSoft}`
          : 'inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      <div style={{
        display: 'grid', gridTemplateColumns: '44px 52px 1fr auto',
        alignItems: 'center', gap: 10, padding: '9px 14px', minHeight: 56,
      }}>
        <div style={{
          fontFamily: HI.font, fontWeight: 800, fontSize: isBig ? 24 : 22,
          color: accent, textAlign: 'center', letterSpacing: 0.5, lineHeight: 1,
        }}>
          {pts != null ? pts : <span style={{ color: HI.inkDim, fontSize: 18 }}>—</span>}
        </div>
        <HiFiFlag code={country.code} w={44} h={30} />
        <div style={{
          fontFamily: HI.font, fontWeight: 600, fontSize: 18,
          color: HI.ink, letterSpacing: 0.2,
        }}>{country.name}</div>
        <div
          {...attributes}
          {...listeners}
          style={{
            width: 32, height: 32, cursor: isDragging ? 'grabbing' : 'grab',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            touchAction: 'none',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20">
            <g fill={HI.inkSoft}>
              <circle cx="7"  cy="5"  r="1.4" />
              <circle cx="13" cy="5"  r="1.4" />
              <circle cx="7"  cy="10" r="1.4" />
              <circle cx="13" cy="10" r="1.4" />
              <circle cx="7"  cy="15" r="1.4" />
              <circle cx="13" cy="15" r="1.4" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

function RankScreen({ judgeName, countries, onCountriesChange, onReview }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd({ active, over }) {
    if (over && active.id !== over.id) {
      const oldIdx = countries.findIndex(c => c.code === active.id);
      const newIdx = countries.findIndex(c => c.code === over.id);
      onCountriesChange(arrayMove(countries, oldIdx, newIdx));
    }
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      padding: '0 16px', position: 'relative', zIndex: 1,
    }}>
      <div style={{ height: 'env(safe-area-inset-top, 44px)' }} />

      <div style={{ padding: '4px 6px 12px' }}>
        <HVLabel>Skref 1 af 2 · {judgeName}</HVLabel>
        <div style={{
          marginTop: 4, fontFamily: HI.font, fontWeight: 800, fontSize: 28,
          color: HI.ink, lineHeight: 1.1, letterSpacing: 0.2,
        }}>Dragðu til að raða<br />löndunum</div>
        <div style={{
          marginTop: 6, fontFamily: HI.body, fontWeight: 400, fontSize: 13,
          color: HI.inkMuted,
        }}>#1 fær 12 stig · síðustu 3 fá engin stig</div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={countries.map(c => c.code)} strategy={verticalListSortingStrategy}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {countries.map((country, i) => (
              <SortableRow key={country.code} country={country} pts={ptsForPos(i)} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div style={{
        padding: '12px 0',
        marginBottom: 'max(30px, env(safe-area-inset-bottom, 30px))',
      }}>
        <HVButton variant="primary" onClick={onReview}>
          Yfirfara röðun þína
        </HVButton>
      </div>
    </div>
  );
}

// ── SCREEN 3: Review & Confirm ────────────────────────────────────────────────

function ReviewRow({ country, pts }) {
  const isBig = pts === 12;
  const accent = isBig ? HI.gold : pts != null ? HI.glow : HI.inkDim;
  return (
    <div style={{
      background: isBig ? 'rgba(212,175,55,0.06)' : HI.surface,
      border: `1px solid ${isBig ? 'rgba(212,175,55,0.3)' : HI.border}`,
      borderRadius: 12,
    }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '44px 52px 1fr',
        alignItems: 'center', gap: 10, padding: '7px 12px', minHeight: 44,
      }}>
        <div style={{
          fontFamily: HI.font, fontWeight: 800, fontSize: isBig ? 22 : 20,
          color: accent, textAlign: 'center',
        }}>
          {pts != null ? pts : <span style={{ color: HI.inkDim, fontSize: 17 }}>—</span>}
        </div>
        <HiFiFlag code={country.code} w={44} h={30} />
        <div style={{
          fontFamily: HI.font, fontWeight: 600, fontSize: 17,
          color: HI.ink, letterSpacing: 0.2,
        }}>{country.name}</div>
      </div>
    </div>
  );
}

function ReviewScreen({ judgeName, countries, onSubmit, onBack, submitting }) {
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      padding: '0 16px', position: 'relative', zIndex: 1,
    }}>
      <div style={{ height: 'env(safe-area-inset-top, 44px)' }} />

      <div style={{ padding: '4px 6px 10px' }}>
        <HVLabel>Skref 2 af 2 · {judgeName}</HVLabel>
        <div style={{
          marginTop: 4, fontFamily: HI.font, fontWeight: 800, fontSize: 28,
          color: HI.ink, lineHeight: 1.1, letterSpacing: 0.2,
        }}>Atkvæði þitt</div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, overflow: 'hidden' }}>
        {countries.map((country, i) => (
          <ReviewRow key={country.code} country={country} pts={ptsForPos(i)} />
        ))}
      </div>

      <div style={{
        margin: '12px 0 10px',
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 14px',
        background: 'rgba(212,175,55,0.10)',
        border: '1px solid rgba(212,175,55,0.35)',
        borderRadius: 10,
      }}>
        <svg width="22" height="22" viewBox="0 0 22 22" style={{ flexShrink: 0 }}>
          <path d="M11 2 L20 18 L2 18 Z" stroke={HI.gold} strokeWidth="1.6"
                fill="rgba(212,175,55,0.12)" strokeLinejoin="round" />
          <rect x="10.2" y="8" width="1.6" height="6" fill={HI.gold} />
          <circle cx="11" cy="15.6" r="1" fill={HI.gold} />
        </svg>
        <span style={{
          fontFamily: HI.body, fontWeight: 600, fontSize: 13,
          color: HI.gold, lineHeight: 1.4,
        }}>
          Þegar atkvæðið hefur verið sent inn er það óafturkræft.
        </span>
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', gap: 6,
        marginBottom: 'max(26px, env(safe-area-inset-bottom, 26px))',
      }}>
        <HVButton variant="primary" onClick={onSubmit} disabled={submitting}>
          {submitting ? 'Sendir inn…' : 'Staðfesta og senda inn'}
        </HVButton>
        <HVButton variant="ghost" onClick={onBack} disabled={submitting}>
          ← Fara til baka og breyta
        </HVButton>
      </div>
    </div>
  );
}

// ── SCREEN 4: Thank you ───────────────────────────────────────────────────────

function DoneScreen({ judgeName, countries }) {
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      padding: '0 24px', position: 'relative', zIndex: 1,
    }}>
      <div style={{ height: 'env(safe-area-inset-top, 44px)' }} />

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 104, height: 104, borderRadius: 52,
          background: HI.goldGrad,
          boxShadow: `0 12px 36px ${HI.goldGlow}, inset 0 1px 0 rgba(255,255,255,0.35)`,
        }}>
          <svg width="56" height="56" viewBox="0 0 56 56">
            <path d="M14 28 L24 38 L42 18" stroke={HI.bg} strokeWidth="5.5"
                  fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div style={{
          marginTop: 18, fontFamily: HI.font, fontWeight: 800, fontSize: 32,
          color: HI.ink, lineHeight: 1.05, letterSpacing: 0.2,
        }}>Takk fyrir, {judgeName}!</div>
        <div style={{
          marginTop: 6, fontFamily: HI.body, fontWeight: 400, fontSize: 15,
          color: HI.inkMuted, lineHeight: 1.5,
        }}>Atkvæðið þitt hefur borist.</div>
      </div>

      <div style={{ marginTop: 22 }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <HVLabel color={HI.inkMuted}>Endanleg röðun þín</HVLabel>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {countries.map((country, i) => {
            const pts = ptsForPos(i);
            const isBig = pts === 12;
            return (
              <div key={country.code} style={{
                display: 'grid', gridTemplateColumns: '24px 36px 1fr auto',
                alignItems: 'center', gap: 10, padding: '4px 6px',
                borderBottom: i < countries.length - 1 ? `1px solid ${HI.border}` : 'none',
              }}>
                <span style={{
                  fontFamily: HI.font, fontWeight: 700, fontSize: 14, textAlign: 'center',
                  color: isBig ? HI.gold : pts != null ? HI.inkSoft : HI.inkDim,
                }}>{i + 1}</span>
                <HiFiFlag code={country.code} w={32} h={22} />
                <span style={{ fontFamily: HI.font, fontWeight: 600, fontSize: 15, color: HI.ink }}>
                  {country.name}
                </span>
                <span style={{
                  fontFamily: HI.font, fontWeight: 700, fontSize: 15, letterSpacing: 0.5,
                  color: isBig ? HI.gold : pts != null ? HI.glow : HI.inkDim,
                }}>{pts != null ? `${pts} stig` : '—'}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{
        marginTop: 'auto',
        marginBottom: 'max(28px, env(safe-area-inset-bottom, 28px))',
        textAlign: 'center',
        fontFamily: HI.body, fontWeight: 600, fontSize: 11,
        color: HI.inkDim, letterSpacing: 4, textTransform: 'uppercase',
      }}>Klettóvision 2026</div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function Voting() {
  const [availableJudges, setAvailableJudges] = useState(null);
  const [allCountries, setAllCountries] = useState([]);
  const [screen, setScreen] = useState(SCREEN.NAME);
  const [judgeName, setJudgeName] = useState('');
  const [countries, setCountries] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/config').then(r => { if (!r.ok) throw r; return r.json(); }),
      fetch('/api/judges/available').then(r => { if (!r.ok) throw r; return r.json(); }),
    ]).then(([cfg, judges]) => {
      setAvailableJudges(judges);
      setAllCountries(cfg.countries);
    }).catch(() => setError('Villa við að hlaða gögnum. Endurhlaðaðu síðuna.'));
  }, []);

  function handleStart(name) {
    setJudgeName(name);
    // Shuffle countries for the ranking screen
    const shuffled = [...allCountries].sort(() => Math.random() - 0.5);
    setCountries(shuffled);
    setScreen(SCREEN.RANK);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judgeName,
          rankings: countries.map(c => c.code),
        }),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(msg || res.statusText);
      }
      setScreen(SCREEN.DONE);
    } catch {
      setError('Villa við innsendingu. Reyndu aftur.');
      setSubmitting(false);
    }
  }

  if (error && screen !== SCREEN.REVIEW) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
        padding: '24px', background: HI.bg, color: HI.inkMuted,
        fontFamily: HI.body, fontSize: 16, textAlign: 'center',
      }}>
        <div>{error}</div>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: 'transparent', border: `1px solid ${HI.border2}`,
            color: HI.inkSoft, borderRadius: 8, padding: '10px 20px',
            fontFamily: HI.font, fontSize: 14, cursor: 'pointer',
          }}
        >Endurhlaða</button>
      </div>
    );
  }

  if (availableJudges === null) {
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

      {screen === SCREEN.NAME && (
        <NameScreen availableJudges={availableJudges} onStart={handleStart} />
      )}
      {screen === SCREEN.RANK && (
        <RankScreen
          judgeName={judgeName}
          countries={countries}
          onCountriesChange={setCountries}
          onReview={() => setScreen(SCREEN.REVIEW)}
        />
      )}
      {screen === SCREEN.REVIEW && (
        <ReviewScreen
          judgeName={judgeName}
          countries={countries}
          onSubmit={handleSubmit}
          onBack={() => { setError(null); setScreen(SCREEN.RANK); }}
          submitting={submitting}
          error={error}
        />
      )}
      {screen === SCREEN.DONE && (
        <DoneScreen judgeName={judgeName} countries={countries} />
      )}
    </div>
  );
}
