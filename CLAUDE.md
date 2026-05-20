# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Klettóvision is a song contest voting and scoring system with a React frontend and C# Azure Functions backend. Judges submit ranked votes via drag-and-drop; an admin progressively reveals scores on a live scoreboard.

Live at: **https://klettovision.hress.org**

## Routes

| Route | Purpose | Intended device |
|---|---|---|
| `/` | Judges submit their rankings | Mobile |
| `/scoreboard` | Live score reveal display | TV / large screen |
| `/admin` | Organiser controls the reveal | Any |

## Commands

### Frontend
```bash
npm install
npm run dev      # Vite dev server on http://localhost:5173, proxies /api/* to :7071
npm run build
npm run preview
```

### Backend (Azure Functions)
```bash
cd api
dotnet build
dotnet watch run  # requires Azure Functions Core Tools and Azurite running
```

### Tests
```bash
cd api.tests
dotnet test
dotnet test --filter "FullyQualifiedName~ScoringService"  # run a single test class
```

Test classes: `ScoringServiceTests`, `ScoreboardComputationTests`, `VoteValidationTests`.

## Architecture

### Data Flow
```
Judge votes → POST /api/votes (Votes table, partitioned by year)
Admin advances reveal stage → POST /api/manage/votes/{id}/reveal (RevealStage 0→1→2→3→4)
Scoreboard polls GET /api/scoreboard every N seconds → shows cumulative scores
```

### Frontend Pages (`/src/pages/`)
- **Voting.jsx** — 4-screen judge flow: name selection → drag-and-drop ranking → review → thank you
- **Scoreboard.jsx** — public broadcast view; polls `/api/scoreboard` at a configurable interval; shows leader/runner-up/chaser cards and an animated judge panel
- **Admin.jsx** — PIN-protected control panel; advances reveal stages, adjusts poll rate

All API calls go through `apiFetch()` in `src/lib/api.js`, which injects the `X-Api-Key` header from `VITE_API_KEY`.

Design tokens, flag SVGs, and the Klettóvision logo are centralized in `/src/lib/brand.jsx`.

### Backend (`/api/`)
Four Azure Functions handle all routes:
- **VotesFunction** — `GET /api/judges/available`, `POST /api/votes`, `GET /api/votes/{judgeName}`
- **ScoreboardFunction** — `GET /api/scoreboard` (identifies current/next judge by RevealStage)
- **AdminFunction** — `GET/POST /api/manage/votes`, `POST /api/manage/votes/{id}/reveal`, `GET/POST /api/manage/settings`; protected via `X-Admin-Pin` header
- **ConfigFunction** — `GET /api/config` (returns year, countries, judges from `public/config.json`)

**ScoringService** (`/api/Services/ScoringService.cs`) is the core business logic: `GetRevealedScores()` yields points per reveal stage, `ComputeTotals()` sums across judges. The reveal stages expose points progressively: stage 1 = 1–4 pts, stage 2 = 5–8 pts, stage 3 = 10 pts, stage 4 = 12 pts (fully revealed).

**SettingsService** (`/api/Services/SettingsService.cs`) persists the poll interval to the `Settings` table; default is 10,000 ms.

**ApiKeyAuth** (`/api/ApiKeyAuth.cs`) validates `X-Api-Key` on all routes using the `API_KEY` env var. If `API_KEY` is unset, all requests return 401.

### RevealStage semantics
- Stage 0: vote submitted, not yet revealed
- Stages 1–3: actively being revealed (`currentJudge` in scoreboard response)
- Stage 4: fully revealed; judge moves to `lastRevealedJudge` (shown in panel between judges)

### Config & Data
- **`/public/config.json`** — competition year, 12 countries (code + Icelandic name), 15 judge names. Copied to the Functions output directory at build.
- **`/api/local.settings.json`** — dev secrets: `ADMIN_PIN` (default `"1234"`), `API_KEY`, `AzureWebJobsStorage` (Azurite). Never commit production values.
- Azure Table Storage tables: `Votes` (partitioned by year), `Settings` (poll interval in ms)
- `POINTS_LADDER` in `brand.jsx`: `[12, 10, 8, 6, 5, 4, 3, 2, 1]`; last 3 ranked countries score 0

### Serialization
All API responses use camelCase JSON serialization — configured in `Program.cs`. Keep all DTOs and new response objects consistent with this.

## Deployment
Deployed to **Azure Static Web Apps** (frontend + proxied Functions). Config in `staticwebapp.config.json`: JS/CSS assets are immutable-cached for 1 year; all other responses are `no-store`.

## Prerequisites
- Node.js 18+
- .NET 10 SDK
- Azure Functions Core Tools (`func`)
- Azurite (local Azure Storage emulator)
