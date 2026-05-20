# Klettóvision Voting App — Design Spec

**Date:** 2026-05-17  
**Status:** Approved

---

## Overview

Klettóvision is a family song contest. This app supports the voting and live reveal experience for approximately 15 judges and 12 competing countries.

The app has three routes, all within a single Azure Static Web App:

| Route | Audience | Device |
|---|---|---|
| `/` | Judges voting | Mobile |
| `/scoreboard` | Audience watching the reveal | TV / large screen |
| `/admin` | Organiser running the reveal | Any |

---

## Language

All user-facing text is in **Icelandic**. This applies to all three routes: voter flow, scoreboard, and admin panel.

---

## Visual Design

**Style:** High-fidelity broadcast aesthetic. Dark Studio Dark base with glass-surface cards, gold and glacier-blue accents, and an animated audio-bar motif behind all screens.

**Brand palette (Klettóvision 2026 style guide):**

| Name | Hex | Use |
|---|---|---|
| Studio Dark | `#0A0A0A` | Background |
| Victory Gold | `#D4AF37` | #1 leader, 12-point reveal, logo "VISION" |
| Glacier Blue | `#5D9CEC` | #2 place, 10-point slot, audio bars |
| Midnight Rock | `#001F3F` | Mountain gradient in logo |
| White chalk | `#FFFFFF` | Primary text |

**Typography:**
- Headlines / scores / judge name: **Montserrat** (weight 700–800), fallback Helvetica Neue
- Body / labels / subtitles: **Open Sans** (weight 400–700)

**Logo:** SVG mark rendered in-component — mountain silhouette (Midnight Rock → Glacier gradient), star (gold gradient), flanking audio bars (Glacier Blue), wordmark "KLETTÓ" (white) + "VISION" (gold), "2026" subtext.

**Background motif:** 80 animated audio bars (`scaleY` CSS keyframe, 1.6–2.8s cycles staggered), Glacier Blue gradient, 50% opacity — visible on all screens.

**Card surfaces:**
- **Leader card (#1):** 6px gold left accent bar, gold gradient wash, `drop-shadow` gold glow on points
- **Second card (#2):** 5px glacier accent bar, glacier glow on points
- **Chaser rows (#3–12):** Subtle glass surface; glacier border + tint when a score is actively being revealed

**Flags:** Per-country SVG components — accurate proportions with subtle top-sheen overlay and drop shadow.

---

## Architecture

- **Frontend:** React (npm), single SPA with three routes
- **Backend:** .NET 8 isolated Azure Functions, managed within Azure SWA
- **Storage:** Azure Table Storage — one `Votes` table
- **Config:** `config.json` static file, committed to the repo and updated each year
- **Hosting:** Azure Static Web Apps (free tier)
- **Admin auth:** PIN stored as an Azure SWA application setting (environment variable), validated server-side on every admin API call
- **Scoreboard freshness:** Client polls `/api/scoreboard` every 10 seconds
- Display order is **frozen** between re-sort events; re-sorts only when a judge's RevealStage advances to 3
- `prevRanks` snapshot taken at each re-sort to power rank-delta indicators (▲▼)

Estimated hosting cost: effectively $0 at this scale.

---

## Config File

`config.json` is committed to the repo and redeployed each year before the event. It is the single source of truth for countries and judge order.

```json
{
  "year": "2026",
  "countries": [
    { "code": "IS", "name": "Iceland", "flag": "🇮🇸" }
  ],
  "judges": [
    "Anna",
    "Bjorn",
    "Gudjon"
  ]
}
```

- `countries` — competing nations, in any order (displayed randomly to voters)
- `judges` — ordered list of judge names; defines both the voting dropdown and the reveal sequence

The frontend loads `config.json` directly as a static asset. The backend functions embed or co-deploy `config.json` alongside the function app and read it from the file system.

---

## Data Model

### Table: `Votes`

| Field | Type | Notes |
|---|---|---|
| PartitionKey | string | Year, e.g. `"2026"` |
| RowKey | string | GUID, generated at submission |
| JudgeName | string | Must match a name in `config.json` |
| Rankings | string | JSON array of country codes — `index 0` = 1st place (12 pts), `index 1` = 2nd place (10 pts), etc. |
| RevealStage | int | `0` = not revealed, `1` = 1–8 pts shown, `2` = +10 pts shown, `3` = fully revealed |
| SubmittedAt | string | ISO 8601 datetime |

No other tables are needed. All derived data — scoreboard totals, current/next judge, available judge names — is computed at query time from the Votes table and `config.json`.

---

## Scoring

Points are awarded based on ranking position:

| Position | Points | Revealed at stage |
|---|---|---|
| 1st | 12 | Stage 3 |
| 2nd | 10 | Stage 2 |
| 3rd | 8 | Stage 1 |
| 4th | 6 | Stage 1 |
| 5th | 5 | Stage 1 |
| 6th | 4 | Stage 1 |
| 7th | 3 | Stage 1 |
| 8th | 2 | Stage 1 |
| 9th | 1 | Stage 1 |
| 10th–12th | 0 | — |

Scoring is computed at query time from the `Rankings` JSON array and `RevealStage`:

- `RevealStage >= 1` → include points for indices 2–8 (8, 6, 5, 4, 3, 2, 1)
- `RevealStage >= 2` → also include 10 pts for index 1
- `RevealStage >= 3` → also include 12 pts for index 0

---

## API Endpoints

All endpoints are Azure Functions. Admin endpoints require the PIN in the `X-Admin-Pin` request header; the function validates it against the environment variable `ADMIN_PIN`.

### Public

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/config` | Returns countries and judges from `config.json` |
| `GET` | `/api/judges/available` | Returns judge names with no submitted vote yet |
| `POST` | `/api/votes` | Submit a vote |
| `GET` | `/api/votes/{judgeName}` | Get a specific judge's own vote (for thank-you screen) |
| `GET` | `/api/scoreboard` | Returns submission count, reveal state, country totals, current/next judge |

### Admin

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/admin/votes` | List all votes with judge names and reveal stages, in config order |
| `POST` | `/api/admin/votes/{id}/reveal` | Advance a vote's `RevealStage` by 1 (max 3) |

### POST `/api/votes` request body

```json
{
  "judgeName": "Anna",
  "rankings": ["IS", "NO", "SE", "DK", "FI", "DE", "FR", "IT", "ES", "PT", "NL", "BE"]
}
```

Validation: `judgeName` must exist in config and have no existing vote. `rankings` must contain exactly all country codes from config, each appearing once.

### GET `/api/scoreboard` response shape

```json
{
  "totalJudges": 15,
  "submittedCount": 12,
  "revealStarted": true,
  "countries": [
    { "code": "IS", "name": "Iceland", "flag": "🇮🇸", "points": 47 }
  ],
  "currentJudge": {
    "name": "Anna",
    "revealStage": 1,
    "revealedScores": [
      { "code": "NO", "name": "Norway", "points": 8 }
    ]
  },
  "nextJudge": "Bjorn"
}
```

`revealStarted` is `true` if any vote has `RevealStage > 0`. `currentJudge` is the earliest judge in config order with `RevealStage` between 1 and 2 inclusive. `nextJudge` is the next judge in config order with `RevealStage == 0` who has submitted. Countries are sorted by points descending.

---

## Route: `/` — Voter Flow

**Screen 1 — Name selection**
- Dropdown populated from `/api/judges/available`
- "Start voting" button — disabled until a name is selected
- If all judges have voted, show a "All votes submitted" message instead

**Screen 2 — Ranking**
- All 12 countries displayed in random order as a drag-and-drop list
- Each row: flag, country name, and the fixed point value for that position (12, 10, 8, 6, 5, 4, 3, 2, 1, —, —, —)
- Point labels update as the judge drags rows
- Uses `dnd-kit` for drag-and-drop with touch support

**Screen 3 — Review & Confirm**
- Full ranked list showing country and points awarded
- "Confirm & Submit" button (calls `POST /api/votes`)
- "Go back" link to return to the ranking screen
- Prominent note that submission is final

**Screen 4 — Thank you**
- Judge's name and a confirmation message
- Their final ranking with points awarded to each country
- No further actions

---

## Route: `/scoreboard` — Scoreboard

Polls `GET /api/scoreboard` every 10 seconds and re-renders on change. Designed for TV landscape display. Implemented in `src/pages/Scoreboard.jsx`.

**Layout:** Full-viewport two-column grid — scoreboard left (1.55fr), judge panel right (1fr) — with the Klettóvision logo in a top header and footer bar.

**State 1 — Before reveal** (`revealStarted: false`)
- Full-screen: large logo, gold gradient "X / 15" counter, subtitle, pulsing gold "waiting" pill

**State 2 — Reveal in progress** (`revealStarted: true`, `currentJudge` not null)
- **Left — scoreboard:**
  - #1 leader: gold left-accent card (large flag, name, gold-gradient points number)
  - #2: glacier-blue left-accent card (medium size)
  - #3–12: two columns of compact rows with rank number, flag SVG, name, ▲▼ delta, score; glacier tint on a row that was just scored (+N badge)
- **Right — judge panel:**
  - Judge name (large, top)
  - Card with 9 point slots listed 12 → 1: each shows pts label, flag SVG (or `?` dashed placeholder), country name; unrevealed slots at 42% opacity; latest-revealed slot in glacier accent; 12-point slot in gold with glow
- **Footer:** "after X of Y judges · Next up → [name]"

**State 3 — Between judges** (`currentJudge` null, `nextJudge` not null)
- Scoreboard remains; right panel shows "· · ·"; footer shows next judge

**State 4 — All done** (`currentJudge` null, `nextJudge` null)
- "Final Results" label in header; right panel shows 🏆

**Sort order:** API returns countries sorted by points descending. Frontend freezes display order; re-sorts only when `currentJudge.revealStage` transitions to 3. `prevRanks` snapshot taken at each re-sort to drive ▲▼ delta indicators.

---

## Route: `/admin` — Admin Panel

**Screen 1 — PIN entry**
- Password input and submit button
- PIN is validated by calling any admin endpoint; a 401 response means wrong PIN
- PIN is stored in `sessionStorage` for the session and sent with every admin request

**Screen 2 — Reveal control**
- List of all judges in config order, each showing:
  - Name
  - Status badge: *Not submitted* / *Submitted* / *Revealing* / *Done*
- The active judge — the first in config order with `RevealStage < 3` and a submitted vote — is highlighted
- Active judge has three sequential buttons:
  - **Reveal 1–8 points** — calls `POST /api/admin/votes/{id}/reveal`; visible when `RevealStage == 0`
  - **Reveal 10 points** — visible when `RevealStage == 1`
  - **Reveal 12 points** — visible when `RevealStage == 2`
- Judges with no submitted vote are shown greyed out; they are skipped automatically when determining the active judge
- No navigation away from this screen once in reveal mode

---

## Deployment

- Azure SWA with managed functions
- `ADMIN_PIN` set as an Azure SWA application setting
- `config.json` committed to the repo root and updated each year before the event
- No CI/CD required — manual deploy via Azure SWA CLI or GitHub Actions
