# Klettóvision

Voting and live score reveal system for the Klettóvision family song contest.

Live at: **https://klettovision.hress.org**

## Routes

| Route | Purpose | Intended device |
|---|---|---|
| `/` | Judges submit their rankings | Mobile |
| `/scoreboard` | Live score reveal display | TV / large screen |
| `/admin` | Organiser controls the reveal | Any |

## Stack

- **Frontend:** React + Vite, deployed via Azure Static Web Apps
- **Backend:** C# Azure Functions (.NET 10) with Azure Table Storage

## Development

**Prerequisites:** Node.js 18+, .NET 10 SDK, Azure Functions Core Tools, Azurite

```bash
# Frontend (http://localhost:5173)
npm install
npm run dev

# Backend (http://localhost:7071)
cd api
dotnet watch run

# Tests
cd api.tests
dotnet test
```

The Vite dev server proxies `/api/*` to the local Functions runtime at `:7071`.

Competition config (year, countries, judges) lives in `public/config.json`.
