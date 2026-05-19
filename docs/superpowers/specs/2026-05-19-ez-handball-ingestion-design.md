# Ez.Handball Ingestion — Design Spec

**Date:** 2026-05-19
**Project:** Ez.Handball.Backend (new repo, separate from Klettóvision)
**Scope:** Data ingestion layer — fetches match and player data from hsi.is API, archives raw JSON to Blob Storage, parses into Azure Table Storage.

---

## Overview

A C# Azure Functions project that pulls handball data from the hsi.is public API for 6 competitions, stores raw responses in Blob Storage, and processes them into normalized Table Storage entities. The data will later serve a fantasy league or handball manager game via a separate API project (`Ez.Handball.Api`).

---

## Competitions in Scope

- Olís deildin karla
- Olís deildin kvenna
- Grill 66 deildin karla
- Grill 66 deildin kvenna
- Powerade bikar karla
- Powerade bikar kvenna

Tournament IDs are managed in the `Tournaments` table (seeded once per season). No redeployment needed to update IDs.

---

## Repository Structure

```
Ez.Handball.Backend/
  Ez.Handball.sln
  Ez.Handball.Shared/              ← class library (future Domain layer)
    Entities/
      TournamentEntity.cs
      TeamEntity.cs
      MatchEntity.cs
      PlayerEntity.cs
      PlayerStatEntity.cs
  Ez.Handball.Ingestion/           ← Azure Functions project
    Functions/
      FetchMatchListFunction.cs
      FetchMatchDetailsFunction.cs
      ParseMatchFunction.cs
      ParsePlayersFunction.cs
    Services/
      HsiApiClient.cs
      BlobArchiver.cs
      TableWriter.cs
    Models/
      MatchListResponse.cs
      MatchDetailsResponse.cs
      PlayerStatsResponse.cs
    Program.cs
    local.settings.json
  Ez.Handball.Tests/
    (integration and unit tests)
```

`Ez.Handball.Shared` is a class library referenced by `Ez.Handball.Ingestion` today. When `Ez.Handball.Api` is built (Clean Architecture), it will reference the same project as its Domain layer.

---

## hsi.is API Endpoints

| Purpose | Endpoint |
|---|---|
| Tournament match list | `GET /api/hsi/tournaments/{tournamentId}/matches` |
| Match details | `GET /api/hsi/match/{matchId}` |
| Team player stats | `GET /api/hsi/match/{matchId}/{teamId}/players` |

No authentication required. All responses are JSON.

---

## Pipeline Architecture

The pipeline is fully event-driven via blob triggers. Each function has a single responsibility.

```
FetchMatchListFunction (HTTP trigger)
  → for each tournament in Tournaments table:
      fetch /tournaments/{id}/matches
      → BlobArchiver: raw/tournaments/{id}/matches.json

Blob trigger: raw/tournaments/*/matches.json
  → FetchMatchDetailsFunction:
      for each match in the blob:
        skip if raw/matches/{id}/details.json exists AND match is Finished
        fetch /match/{id}                          → raw/matches/{id}/details.json
        fetch /match/{id}/{homeTeamId}/players     → raw/matches/{id}/players-{homeTeamId}.json
        fetch /match/{id}/{awayTeamId}/players     → raw/matches/{id}/players-{awayTeamId}.json

Blob trigger: raw/matches/*/details.json
  → ParseMatchFunction:
      read blob → upsert Teams table + Matches table

Blob trigger: raw/matches/*/players-*.json
  → ParsePlayersFunction:
      read blob → upsert Players table + PlayerStats table
```

**Triggering a sync:** `POST /api/sync` — syncs all tournaments. A scheduled trigger can be wired to the same entry point later with no structural changes.

---

## Blob Storage Layout

```
raw/
  tournaments/{tournamentId}/matches.json
  matches/{matchId}/details.json
  matches/{matchId}/players-{teamId}.json
```

Raw responses are archived before any table writes. The blob archive is the source of truth — table data can always be re-derived from blobs.

---

## Table Storage Schema

| Table | PartitionKey | RowKey | Key fields |
|---|---|---|---|
| `Tournaments` | `season` (e.g. `2025`) | `tournamentId` | name, gender, division |
| `Teams` | `season` | `teamId` | name, shortName |
| `Matches` | `tournamentId` | `matchId` | homeTeamId, awayTeamId, homeScore, awayScore, date, status |
| `Players` | `teamId` | `playerId` | name, position |
| `PlayerStats` | `matchId` | `playerId` | goals, yellowCards, redCards, minutesPlayed |

All writes are upserts — syncing is always idempotent.

---

## Skip Logic (Avoiding Redundant Fetches)

`FetchMatchDetailsFunction` checks before hitting the hsi.is API:

1. Does `raw/matches/{matchId}/details.json` exist?
2. Is the match status `Finished`?

If both are true: skip. Finished matches are immutable. Upcoming and in-progress matches are always re-fetched.

---

## Error Handling

- **Single match fetch failure** — log the error, continue with remaining matches. Sync returns a summary: `{ synced: N, failed: [matchId, ...] }`.
- **Blob write failure** — skip the corresponding table write. Blob and table stay in sync.
- **Table write failure** — retry once with exponential backoff (Azure SDK built-in). Log and continue on second failure.
- **Tournament match list fetch failure** — log and move to next tournament.
- **Re-sync is always safe** — all writes are upserts.

---

## Azure Infrastructure

| Resource | Purpose | Notes |
|---|---|---|
| Azure Functions (Consumption plan) | Hosting | Pay-per-execution, cheapest option |
| Azure Blob Storage | Raw JSON archive | ~$0.018/GB/month |
| Azure Table Storage | Normalized entities | ~$0.045/GB/month |
| Azurite | Local dev emulator | Same as Klettóvision setup |

---

## Future Considerations

- **Scheduled trigger** — `FetchMatchListFunction` accepts a timer trigger alongside the HTTP trigger. No structural change needed.
- **Re-parse endpoint** — HTTP trigger on `ParseMatchFunction`/`ParsePlayersFunction` to re-process existing blobs without re-fetching from hsi.is.
- **Ez.Handball.Api** — new project in the same solution, Clean Architecture (Domain → Application → Infrastructure → Api), references `Ez.Handball.Shared` as Domain.
- **Ez.Handball.Web** — separate repo for the fantasy/manager game UI.
