# Klettóvision 2026 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the Klettóvision 2026 voting app — frontend scaffolding + all Azure Functions backend endpoints — so it runs end-to-end on Azure Static Web Apps.

**Architecture:** React SPA (Vite) at the repo root, .NET 8 isolated Azure Functions in `api/`, both deployed as one Azure Static Web App. State is a single Azure Table Storage `Votes` table. Admin auth is PIN-only, validated server-side on every admin request via the `X-Admin-Pin` header. All user-facing text is in Icelandic.

**Tech Stack:** React 18, react-router-dom 6, @dnd-kit/core + @dnd-kit/sortable, Vite 5, .NET 8 isolated worker, Azure.Data.Tables 12, xUnit 2, Azure Static Web Apps

> **Note on subsystem split:** The frontend scaffolding (Tasks 1–2) and the backend (Tasks 3–13) are independent. The backend can be run locally with Azurite while the frontend dev server proxies `/api` calls to it.

---

## File Map

**Already exists — do not recreate:**
- `src/lib/brand.jsx` — shared tokens, flag SVGs, HiFiFlag, KlettovisionLogo
- `src/pages/Voting.jsx` — 4-screen voting flow (Icelandic UI)
- `src/pages/Scoreboard.jsx` — TV scoreboard (Icelandic UI)
- `src/pages/Admin.jsx` — PIN + reveal control (Icelandic UI)
- `public/logo.png`

**To create — frontend scaffolding:**
- `package.json`
- `index.html`
- `vite.config.js`
- `src/main.jsx`
- `src/App.jsx`
- `staticwebapp.config.json`
- `public/config.json`
- `.gitignore`

**To create — backend:**
- `api/KlettovisionApi.csproj`
- `api/host.json`
- `api/local.settings.json` ← gitignored, never committed
- `api/Program.cs`
- `api/Models/AppConfig.cs`
- `api/Models/VoteEntity.cs`
- `api/Models/Dtos.cs`
- `api/Services/ScoringService.cs`
- `api/Functions/ConfigFunction.cs`
- `api/Functions/VotesFunction.cs`
- `api/Functions/ScoreboardFunction.cs`
- `api/Functions/AdminFunction.cs`
- `api.tests/KlettovisionApi.Tests.csproj`
- `api.tests/ScoringServiceTests.cs`
- `api.tests/VoteValidationTests.cs`
- `api.tests/ScoreboardComputationTests.cs`

---

## Task 1: Frontend scaffolding

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.js`
- Create: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `.gitignore`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "klettovision",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.27.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^5.4.10"
  }
}
```

- [ ] **Step 2: Create `index.html`**

```html
<!doctype html>
<html lang="is">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Klettóvision 2026</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #0A0A0A; color: #fff; -webkit-font-smoothing: antialiased; }
      input, button { font-family: inherit; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Create `vite.config.js`**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:7071',
        changeOrigin: true,
      },
    },
  },
});
```

- [ ] **Step 4: Create `src/main.jsx`**

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 5: Create `src/App.jsx`**

```jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Voting from './pages/Voting.jsx';
import Scoreboard from './pages/Scoreboard.jsx';
import Admin from './pages/Admin.jsx';

const router = createBrowserRouter([
  { path: '/',           element: <Voting /> },
  { path: '/scoreboard', element: <Scoreboard /> },
  { path: '/admin',      element: <Admin /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
```

- [ ] **Step 6: Create `.gitignore`**

```
node_modules/
dist/
.env
api/local.settings.json
api/bin/
api/obj/
api.tests/bin/
api.tests/obj/
```

- [ ] **Step 7: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 8: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite reports `Local: http://localhost:5173`. Visiting `/` shows a loading state (API calls will 404 until backend is running — that's fine).

- [ ] **Step 9: Commit**

```bash
git init
git add package.json index.html vite.config.js src/main.jsx src/App.jsx .gitignore src/
git commit -m "feat: add frontend scaffold and React pages"
```

---

## Task 2: SWA config and competition config

**Files:**
- Create: `staticwebapp.config.json`
- Create: `public/config.json`

- [ ] **Step 1: Create `staticwebapp.config.json`**

This tells Azure SWA to let API calls through and serve the SPA for all other routes.

```json
{
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["anonymous"]
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/api/*", "*.{css,js,png,svg,ico,json,woff2}"]
  },
  "globalHeaders": {
    "Cache-Control": "no-store"
  }
}
```

- [ ] **Step 2: Create `public/config.json`**

Update each year before the event. Country `code` values must match `FLAG_COMPONENTS` keys in `src/lib/brand.jsx` (3-letter codes). Judge order defines the reveal sequence.

```json
{
  "year": "2026",
  "countries": [
    { "code": "ISL", "name": "Ísland" },
    { "code": "NOR", "name": "Noregur" },
    { "code": "SWE", "name": "Svíþjóð" },
    { "code": "DNK", "name": "Danmörk" },
    { "code": "FRO", "name": "Færeyjar" },
    { "code": "DEU", "name": "Þýskaland" },
    { "code": "FRA", "name": "Frakkland" },
    { "code": "IRL", "name": "Írland" },
    { "code": "ENG", "name": "England" },
    { "code": "SCO", "name": "Skotland" },
    { "code": "WLS", "name": "Wales" },
    { "code": "NIR", "name": "Norður-Írland" }
  ],
  "judges": [
    "Anna", "Björn", "Guðjón", "Sigríður", "Kristján",
    "Helga", "Óskar", "Margrét", "Gunnar", "Steinunn",
    "Páll", "Ragnheiður", "Árni", "Þóra", "Einar"
  ]
}
```

- [ ] **Step 3: Commit**

```bash
git add staticwebapp.config.json public/config.json
git commit -m "feat: add SWA config and 2026 competition config"
```

---

## Task 3: Backend project setup

**Files:**
- Create: `api/KlettovisionApi.csproj`
- Create: `api/host.json`
- Create: `api/local.settings.json`
- Create: `api/Program.cs`

- [ ] **Step 1: Create `api/KlettovisionApi.csproj`**

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <AzureFunctionsVersion>v4</AzureFunctionsVersion>
    <OutputType>Exe</OutputType>
    <RootNamespace>KlettovisionApi</RootNamespace>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.Azure.Functions.Worker" Version="1.22.0" />
    <PackageReference Include="Microsoft.Azure.Functions.Worker.Extensions.Http" Version="3.2.0" />
    <PackageReference Include="Microsoft.Azure.Functions.Worker.Sdk" Version="1.17.4" />
    <PackageReference Include="Azure.Data.Tables" Version="12.9.1" />
  </ItemGroup>
  <ItemGroup>
    <None Update="host.json">
      <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
    </None>
    <None Update="local.settings.json">
      <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
      <CopyToPublishDirectory>Never</CopyToPublishDirectory>
    </None>
    <None Update="../public/config.json">
      <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
      <Link>config.json</Link>
    </None>
  </ItemGroup>
</Project>
```

The `config.json` item links `public/config.json` into the build output so both frontend and backend share one file.

- [ ] **Step 2: Create `api/host.json`**

```json
{
  "version": "2.0",
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "excludedTypes": "Request"
      }
    }
  }
}
```

- [ ] **Step 3: Create `api/local.settings.json`** (gitignored)

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    "ADMIN_PIN": "1234"
  }
}
```

`UseDevelopmentStorage=true` requires Azurite running locally. Install: `npm install -g azurite` then `azurite` in a terminal.

- [ ] **Step 4: Create `api/Program.cs`**

```csharp
using Azure.Data.Tables;
using KlettovisionApi.Models;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Text.Json;

var host = new HostBuilder()
    .ConfigureFunctionsWebApplication()
    .ConfigureServices(services =>
    {
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();

        services.AddSingleton(sp =>
        {
            var conn = Environment.GetEnvironmentVariable("AzureWebJobsStorage")!;
            return new TableServiceClient(conn);
        });

        services.AddSingleton<AppConfig>(sp =>
        {
            var path = Path.Combine(AppContext.BaseDirectory, "config.json");
            var json = File.ReadAllText(path);
            return JsonSerializer.Deserialize<AppConfig>(json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!;
        });
    })
    .Build();

await host.RunAsync();
```

- [ ] **Step 5: Verify project builds**

```bash
cd api && dotnet build
```

Expected: `Build succeeded. 0 Error(s)`.

- [ ] **Step 6: Commit**

```bash
git add api/
git commit -m "feat: add Azure Functions project scaffold"
```

---

## Task 4: Models

**Files:**
- Create: `api/Models/AppConfig.cs`
- Create: `api/Models/VoteEntity.cs`
- Create: `api/Models/Dtos.cs`

- [ ] **Step 1: Create `api/Models/AppConfig.cs`**

```csharp
namespace KlettovisionApi.Models;

public class AppConfig
{
    public string Year { get; set; } = "";
    public List<CountryConfig> Countries { get; set; } = [];
    public List<string> Judges { get; set; } = [];
}

public class CountryConfig
{
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
}
```

- [ ] **Step 2: Create `api/Models/VoteEntity.cs`**

```csharp
using Azure;
using Azure.Data.Tables;

namespace KlettovisionApi.Models;

public class VoteEntity : ITableEntity
{
    public string PartitionKey { get; set; } = "";   // year, e.g. "2026"
    public string RowKey { get; set; } = "";          // GUID
    public string JudgeName { get; set; } = "";
    public string Rankings { get; set; } = "[]";      // JSON array of country codes
    public int RevealStage { get; set; } = 0;         // 0=not revealed, 1=1–8 pts, 2=+10 pts, 3=all
    public string SubmittedAt { get; set; } = "";
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }
}
```

- [ ] **Step 3: Create `api/Models/Dtos.cs`**

```csharp
namespace KlettovisionApi.Models;

// POST /api/votes request body
public record SubmitVoteRequest(string JudgeName, List<string> Rankings);

// GET /api/scoreboard response
public class ScoreboardResponse
{
    public int TotalJudges { get; set; }
    public int SubmittedCount { get; set; }
    public bool RevealStarted { get; set; }
    public List<CountryScore> Countries { get; set; } = [];
    public CurrentJudgeInfo? CurrentJudge { get; set; }
    public string? NextJudge { get; set; }
}

public class CountryScore
{
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public int Points { get; set; }
}

public class CurrentJudgeInfo
{
    public string Name { get; set; } = "";
    public int RevealStage { get; set; }
    public List<RevealedScore> RevealedScores { get; set; } = [];
}

public record RevealedScore(string Code, string Name, int Points);

// GET /api/admin/votes response item
public record AdminVoteItem(string Id, string JudgeName, int RevealStage);
```

- [ ] **Step 4: Build to verify**

```bash
cd api && dotnet build
```

Expected: `Build succeeded. 0 Error(s)`.

- [ ] **Step 5: Commit**

```bash
git add api/Models/
git commit -m "feat: add data models and DTOs"
```

---

## Task 5: ScoringService (TDD)

The only stateful logic is isolated here. No I/O — pure functions, easy to test.

**Files:**
- Create: `api/Services/ScoringService.cs`
- Create: `api.tests/KlettovisionApi.Tests.csproj`
- Create: `api.tests/ScoringServiceTests.cs`

- [ ] **Step 1: Create `api.tests/KlettovisionApi.Tests.csproj`**

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.11.1" />
    <PackageReference Include="xunit" Version="2.9.2" />
    <PackageReference Include="xunit.runner.visualstudio" Version="2.8.2">
      <IncludeAssets>runtime; build; native; contentfiles; analyzers</IncludeAssets>
      <PrivateAssets>all</PrivateAssets>
    </PackageReference>
  </ItemGroup>
  <ItemGroup>
    <ProjectReference Include="../api/KlettovisionApi.csproj" />
  </ItemGroup>
</Project>
```

- [ ] **Step 2: Write failing tests in `api.tests/ScoringServiceTests.cs`**

```csharp
using KlettovisionApi.Models;
using KlettovisionApi.Services;
using Xunit;

namespace KlettovisionApi.Tests;

public class ScoringServiceTests
{
    private static VoteEntity MakeVote(int stage) => new()
    {
        PartitionKey = "2026",
        RowKey = Guid.NewGuid().ToString(),
        JudgeName = "Anna",
        Rankings = """["ISL","NOR","SWE","DNK","FRO","DEU","FRA","IRL","ENG","SCO","WLS","NIR"]""",
        RevealStage = stage,
        SubmittedAt = DateTime.UtcNow.ToString("o"),
    };

    [Fact]
    public void Stage0_ReturnsNoScores()
    {
        var scores = ScoringService.GetRevealedScores(MakeVote(0)).ToList();
        Assert.Empty(scores);
    }

    [Fact]
    public void Stage1_Returns7ScoresPositions3To9()
    {
        var scores = ScoringService.GetRevealedScores(MakeVote(1)).ToList();
        Assert.Equal(7, scores.Count);
        // index 2 = SWE → 8 pts; index 8 = ENG → 1 pt
        Assert.Contains(scores, s => s.Code == "SWE" && s.Points == 8);
        Assert.Contains(scores, s => s.Code == "DNK" && s.Points == 6);
        Assert.Contains(scores, s => s.Code == "FRO" && s.Points == 5);
        Assert.Contains(scores, s => s.Code == "DEU" && s.Points == 4);
        Assert.Contains(scores, s => s.Code == "FRA" && s.Points == 3);
        Assert.Contains(scores, s => s.Code == "IRL" && s.Points == 2);
        Assert.Contains(scores, s => s.Code == "ENG" && s.Points == 1);
        // 12 and 10 still hidden
        Assert.DoesNotContain(scores, s => s.Code == "ISL");
        Assert.DoesNotContain(scores, s => s.Code == "NOR");
    }

    [Fact]
    public void Stage2_Adds10PointsForIndex1()
    {
        var scores = ScoringService.GetRevealedScores(MakeVote(2)).ToList();
        Assert.Equal(8, scores.Count);
        Assert.Contains(scores, s => s.Code == "NOR" && s.Points == 10);
        Assert.DoesNotContain(scores, s => s.Code == "ISL");
    }

    [Fact]
    public void Stage3_Adds12PointsForIndex0()
    {
        var scores = ScoringService.GetRevealedScores(MakeVote(3)).ToList();
        Assert.Equal(9, scores.Count);
        Assert.Contains(scores, s => s.Code == "ISL" && s.Points == 12);
    }

    [Fact]
    public void ComputeTotals_SumsAcrossVotes()
    {
        var votes = new[]
        {
            MakeVote(3),  // ISL=12, NOR=10, SWE=8 ...
            MakeVote(3),  // same ranking, so ISL gets 24 total
        };
        var config = new AppConfig
        {
            Year = "2026",
            Countries =
            [
                new() { Code = "ISL", Name = "Ísland" },
                new() { Code = "NOR", Name = "Noregur" },
                new() { Code = "SWE", Name = "Svíþjóð" },
                new() { Code = "DNK", Name = "Danmörk" },
                new() { Code = "FRO", Name = "Færeyjar" },
                new() { Code = "DEU", Name = "Þýskaland" },
                new() { Code = "FRA", Name = "Frakkland" },
                new() { Code = "IRL", Name = "Írland" },
                new() { Code = "ENG", Name = "England" },
                new() { Code = "SCO", Name = "Skotland" },
                new() { Code = "WLS", Name = "Wales" },
                new() { Code = "NIR", Name = "Norður-Írland" },
            ],
            Judges = ["Anna"],
        };
        var totals = ScoringService.ComputeTotals(votes, config);
        Assert.Equal(24, totals["ISL"]);
        Assert.Equal(20, totals["NOR"]);
        Assert.Equal(16, totals["SWE"]);
    }

    [Fact]
    public void ValidateRankings_MissingCountry_ReturnsFalse()
    {
        var config = new AppConfig
        {
            Countries = [new() { Code = "ISL" }, new() { Code = "NOR" }],
            Judges = ["Anna"],
        };
        Assert.False(ScoringService.ValidateRankings(["ISL"], config));
    }

    [Fact]
    public void ValidateRankings_DuplicateCountry_ReturnsFalse()
    {
        var config = new AppConfig
        {
            Countries = [new() { Code = "ISL" }, new() { Code = "NOR" }],
            Judges = ["Anna"],
        };
        Assert.False(ScoringService.ValidateRankings(["ISL", "ISL"], config));
    }

    [Fact]
    public void ValidateRankings_ExactMatch_ReturnsTrue()
    {
        var config = new AppConfig
        {
            Countries = [new() { Code = "ISL" }, new() { Code = "NOR" }],
            Judges = ["Anna"],
        };
        Assert.True(ScoringService.ValidateRankings(["ISL", "NOR"], config));
    }
}
```

- [ ] **Step 3: Run tests — they must fail (ScoringService doesn't exist yet)**

```bash
cd api.tests && dotnet test --no-build 2>&1 | head -20
```

Expected: build error — `ScoringService` not found.

- [ ] **Step 4: Create `api/Services/ScoringService.cs`**

```csharp
using System.Text.Json;
using KlettovisionApi.Models;

namespace KlettovisionApi.Services;

public static class ScoringService
{
    // Points awarded by position index (0-based). Indices 9-11 score 0.
    private static readonly int[] PointsLadder = [12, 10, 8, 6, 5, 4, 3, 2, 1];

    /// Returns revealed scores for a single vote based on its RevealStage.
    public static IEnumerable<RevealedScore> GetRevealedScores(VoteEntity vote)
    {
        var rankings = JsonSerializer.Deserialize<string[]>(vote.Rankings) ?? [];
        var stage = vote.RevealStage;

        if (stage >= 1)
            for (int i = 2; i <= 8 && i < rankings.Length; i++)
                yield return new RevealedScore(rankings[i], "", PointsLadder[i]);

        if (stage >= 2 && rankings.Length > 1)
            yield return new RevealedScore(rankings[1], "", 10);

        if (stage >= 3 && rankings.Length > 0)
            yield return new RevealedScore(rankings[0], "", 12);
    }

    /// Sums revealed points per country across all votes.
    public static Dictionary<string, int> ComputeTotals(IEnumerable<VoteEntity> votes, AppConfig config)
    {
        var totals = config.Countries.ToDictionary(c => c.Code, _ => 0);
        foreach (var vote in votes)
            foreach (var score in GetRevealedScores(vote))
                if (totals.ContainsKey(score.Code))
                    totals[score.Code] += score.Points;
        return totals;
    }

    /// Returns true if rankings contains exactly the set of country codes in config, each once.
    public static bool ValidateRankings(IEnumerable<string> rankings, AppConfig config)
    {
        var expected = config.Countries.Select(c => c.Code).ToHashSet();
        var actual = rankings.ToList();
        return actual.Count == expected.Count
            && actual.Distinct().Count() == actual.Count
            && actual.All(expected.Contains);
    }
}
```

- [ ] **Step 5: Run tests — all must pass**

```bash
cd api.tests && dotnet test -v normal
```

Expected: `Passed! - Failed: 0, Passed: 8, Skipped: 0`.

- [ ] **Step 6: Commit**

```bash
git add api/Services/ api.tests/
git commit -m "feat: add ScoringService with full unit test coverage"
```

---

## Task 6: GET /api/config

**Files:**
- Create: `api/Functions/ConfigFunction.cs`

- [ ] **Step 1: Create `api/Functions/ConfigFunction.cs`**

```csharp
using KlettovisionApi.Models;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using System.Net;

namespace KlettovisionApi.Functions;

public class ConfigFunction(AppConfig config)
{
    [Function("GetConfig")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "config")] HttpRequestData req)
    {
        var res = req.CreateResponse(HttpStatusCode.OK);
        await res.WriteAsJsonAsync(new
        {
            year = config.Year,
            countries = config.Countries,
            judges = config.Judges,
        });
        return res;
    }
}
```

- [ ] **Step 2: Build and verify**

```bash
cd api && dotnet build
```

Expected: `Build succeeded. 0 Error(s)`.

- [ ] **Step 3: Start Azurite and the functions host to manually verify**

In a separate terminal: `azurite`

Then: `cd api && func start`

```bash
curl http://localhost:7071/api/config
```

Expected: JSON with `year`, `countries` (12 entries), `judges` (15 entries).

- [ ] **Step 4: Commit**

```bash
git add api/Functions/ConfigFunction.cs
git commit -m "feat: add GET /api/config endpoint"
```

---

## Task 7: GET /api/judges/available and POST /api/votes

**Files:**
- Create: `api/Functions/VotesFunction.cs`
- Create: `api.tests/VoteValidationTests.cs`

- [ ] **Step 1: Write failing validation tests in `api.tests/VoteValidationTests.cs`**

```csharp
using KlettovisionApi.Models;
using KlettovisionApi.Services;
using Xunit;

namespace KlettovisionApi.Tests;

public class VoteValidationTests
{
    private static AppConfig MakeConfig() => new()
    {
        Year = "2026",
        Countries =
        [
            new() { Code = "ISL" }, new() { Code = "NOR" }, new() { Code = "SWE" },
            new() { Code = "DNK" }, new() { Code = "FRO" }, new() { Code = "DEU" },
            new() { Code = "FRA" }, new() { Code = "IRL" }, new() { Code = "ENG" },
            new() { Code = "SCO" }, new() { Code = "WLS" }, new() { Code = "NIR" },
        ],
        Judges = ["Anna", "Björn", "Guðjón"],
    };

    [Fact]
    public void ValidateRankings_AllTwelveCorrect_ReturnsTrue()
    {
        var cfg = MakeConfig();
        var rankings = cfg.Countries.Select(c => c.Code).ToList();
        Assert.True(ScoringService.ValidateRankings(rankings, cfg));
    }

    [Fact]
    public void ValidateRankings_OnlyEleven_ReturnsFalse()
    {
        var cfg = MakeConfig();
        var rankings = cfg.Countries.Take(11).Select(c => c.Code).ToList();
        Assert.False(ScoringService.ValidateRankings(rankings, cfg));
    }

    [Fact]
    public void ValidateRankings_UnknownCode_ReturnsFalse()
    {
        var cfg = MakeConfig();
        var rankings = cfg.Countries.Take(11).Select(c => c.Code).Append("XXX").ToList();
        Assert.False(ScoringService.ValidateRankings(rankings, cfg));
    }

    [Fact]
    public void GetAvailableJudges_FiltersOutSubmitted()
    {
        var cfg = MakeConfig();
        var submitted = new[] { "Anna" };
        var available = cfg.Judges.Except(submitted).ToList();
        Assert.Equal(["Björn", "Guðjón"], available);
    }
}
```

- [ ] **Step 2: Run tests — they must pass (uses ScoringService already built)**

```bash
cd api.tests && dotnet test -v normal
```

Expected: All 12 tests pass.

- [ ] **Step 3: Create `api/Functions/VotesFunction.cs`**

```csharp
using Azure.Data.Tables;
using KlettovisionApi.Models;
using KlettovisionApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using System.Net;
using System.Text.Json;

namespace KlettovisionApi.Functions;

public class VotesFunction(TableServiceClient tableService, AppConfig config)
{
    private TableClient GetTable() =>
        tableService.GetTableClient("Votes");

    [Function("GetAvailableJudges")]
    public async Task<HttpResponseData> GetAvailable(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "judges/available")] HttpRequestData req)
    {
        await GetTable().CreateIfNotExistsAsync();
        var submittedNames = GetTable()
            .QueryAsync<VoteEntity>(e => e.PartitionKey == config.Year)
            .ToBlockingEnumerable()
            .Select(v => v.JudgeName)
            .ToHashSet();

        var available = config.Judges.Where(j => !submittedNames.Contains(j)).ToList();
        var res = req.CreateResponse(HttpStatusCode.OK);
        await res.WriteAsJsonAsync(available);
        return res;
    }

    [Function("SubmitVote")]
    public async Task<HttpResponseData> Submit(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "votes")] HttpRequestData req)
    {
        SubmitVoteRequest? body;
        try
        {
            body = await JsonSerializer.DeserializeAsync<SubmitVoteRequest>(req.Body,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }
        catch
        {
            return req.CreateResponse(HttpStatusCode.BadRequest);
        }

        if (body is null || string.IsNullOrWhiteSpace(body.JudgeName))
            return req.CreateResponse(HttpStatusCode.BadRequest);

        if (!config.Judges.Contains(body.JudgeName))
        {
            var r = req.CreateResponse(HttpStatusCode.BadRequest);
            await r.WriteStringAsync("Unknown judge name.");
            return r;
        }

        if (!ScoringService.ValidateRankings(body.Rankings, config))
        {
            var r = req.CreateResponse(HttpStatusCode.BadRequest);
            await r.WriteStringAsync("Rankings must contain exactly all country codes, each once.");
            return r;
        }

        await GetTable().CreateIfNotExistsAsync();

        // Check for duplicate
        var existing = GetTable()
            .QueryAsync<VoteEntity>(e => e.PartitionKey == config.Year && e.JudgeName == body.JudgeName)
            .ToBlockingEnumerable()
            .FirstOrDefault();

        if (existing is not null)
        {
            var r = req.CreateResponse(HttpStatusCode.Conflict);
            await r.WriteStringAsync("Vote already submitted.");
            return r;
        }

        var vote = new VoteEntity
        {
            PartitionKey = config.Year,
            RowKey = Guid.NewGuid().ToString(),
            JudgeName = body.JudgeName,
            Rankings = JsonSerializer.Serialize(body.Rankings),
            RevealStage = 0,
            SubmittedAt = DateTime.UtcNow.ToString("o"),
        };

        await GetTable().AddEntityAsync(vote);
        return req.CreateResponse(HttpStatusCode.Created);
    }

    [Function("GetVote")]
    public async Task<HttpResponseData> GetVote(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "votes/{judgeName}")] HttpRequestData req,
        string judgeName)
    {
        await GetTable().CreateIfNotExistsAsync();
        var vote = GetTable()
            .QueryAsync<VoteEntity>(e => e.PartitionKey == config.Year && e.JudgeName == judgeName)
            .ToBlockingEnumerable()
            .FirstOrDefault();

        if (vote is null)
            return req.CreateResponse(HttpStatusCode.NotFound);

        var rankings = JsonSerializer.Deserialize<string[]>(vote.Rankings) ?? [];
        var countryMap = config.Countries.ToDictionary(c => c.Code);

        var res = req.CreateResponse(HttpStatusCode.OK);
        await res.WriteAsJsonAsync(new
        {
            judgeName = vote.JudgeName,
            rankings = rankings.Select((code, i) => new
            {
                code,
                name = countryMap.TryGetValue(code, out var c) ? c.Name : code,
                points = i < 9 ? new[] { 12, 10, 8, 6, 5, 4, 3, 2, 1 }[i] : 0,
            }),
        });
        return res;
    }
}
```

- [ ] **Step 4: Build and verify**

```bash
cd api && dotnet build
```

Expected: `Build succeeded`.

- [ ] **Step 5: Manual smoke test (requires `func start` and Azurite running)**

```bash
# Available judges (all 15)
curl http://localhost:7071/api/judges/available

# Submit a vote
curl -X POST http://localhost:7071/api/votes \
  -H "Content-Type: application/json" \
  -d '{"judgeName":"Anna","rankings":["ISL","NOR","SWE","DNK","FRO","DEU","FRA","IRL","ENG","SCO","WLS","NIR"]}'

# Should now return 14 judges (Anna is gone)
curl http://localhost:7071/api/judges/available

# Should return 409 for duplicate
curl -X POST http://localhost:7071/api/votes \
  -H "Content-Type: application/json" \
  -d '{"judgeName":"Anna","rankings":["ISL","NOR","SWE","DNK","FRO","DEU","FRA","IRL","ENG","SCO","WLS","NIR"]}'

# Get Anna's vote
curl http://localhost:7071/api/votes/Anna
```

- [ ] **Step 6: Commit**

```bash
git add api/Functions/VotesFunction.cs api.tests/VoteValidationTests.cs
git commit -m "feat: add votes endpoints (available judges, submit, get)"
```

---

## Task 8: GET /api/scoreboard

**Files:**
- Create: `api/Functions/ScoreboardFunction.cs`
- Create: `api.tests/ScoreboardComputationTests.cs`

- [ ] **Step 1: Write failing tests in `api.tests/ScoreboardComputationTests.cs`**

```csharp
using KlettovisionApi.Models;
using KlettovisionApi.Services;
using System.Text.Json;
using Xunit;

namespace KlettovisionApi.Tests;

public class ScoreboardComputationTests
{
    private static readonly string[] Codes =
        ["ISL","NOR","SWE","DNK","FRO","DEU","FRA","IRL","ENG","SCO","WLS","NIR"];

    private static AppConfig MakeConfig() => new()
    {
        Year = "2026",
        Countries = Codes.Select(c => new CountryConfig { Code = c, Name = c }).ToList(),
        Judges = ["Anna", "Björn", "Guðjón"],
    };

    private static VoteEntity MakeVote(string judgeName, int stage) => new()
    {
        PartitionKey = "2026",
        RowKey = Guid.NewGuid().ToString(),
        JudgeName = judgeName,
        Rankings = JsonSerializer.Serialize(Codes),
        RevealStage = stage,
        SubmittedAt = DateTime.UtcNow.ToString("o"),
    };

    [Fact]
    public void NoVotes_AllCountriesZero_RevealNotStarted()
    {
        var config = MakeConfig();
        var totals = ScoringService.ComputeTotals([], config);
        Assert.All(totals.Values, v => Assert.Equal(0, v));
    }

    [Fact]
    public void RevealStarted_WhenAnyVoteHasStageAbove0()
    {
        var votes = new[] { MakeVote("Anna", 1) };
        Assert.True(votes.Any(v => v.RevealStage > 0));
    }

    [Fact]
    public void CurrentJudge_IsFirstWithStage1Or2InConfigOrder()
    {
        var config = MakeConfig();
        var votes = new[]
        {
            MakeVote("Björn", 3),   // done — skip
            MakeVote("Anna", 1),    // active — stage 1
            MakeVote("Guðjón", 0),  // ready — skip (stage 0 = not revealed yet)
        };
        var current = config.Judges
            .Select(j => votes.FirstOrDefault(v => v.JudgeName == j))
            .FirstOrDefault(v => v?.RevealStage is 1 or 2);
        Assert.Equal("Anna", current?.JudgeName);
    }

    [Fact]
    public void NextJudge_IsFirstSubmittedWithStage0AfterCurrent()
    {
        var config = MakeConfig();
        var votes = new[]
        {
            MakeVote("Anna", 1),    // current
            MakeVote("Guðjón", 0),  // next (Björn has no vote)
        };
        var voteMap = votes.ToDictionary(v => v.JudgeName);
        var next = config.Judges
            .SkipWhile(j => voteMap.TryGetValue(j, out var v) && v.RevealStage is 1 or 2)
            .Skip(1)
            .FirstOrDefault(j => voteMap.TryGetValue(j, out var v) && v.RevealStage == 0);
        Assert.Equal("Guðjón", next);
    }
}
```

- [ ] **Step 2: Run tests — all pass (pure logic, no new production code yet)**

```bash
cd api.tests && dotnet test -v normal
```

Expected: All 16 tests pass.

- [ ] **Step 3: Create `api/Functions/ScoreboardFunction.cs`**

```csharp
using Azure.Data.Tables;
using KlettovisionApi.Models;
using KlettovisionApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using System.Net;

namespace KlettovisionApi.Functions;

public class ScoreboardFunction(TableServiceClient tableService, AppConfig config)
{
    private TableClient GetTable() => tableService.GetTableClient("Votes");

    [Function("GetScoreboard")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "scoreboard")] HttpRequestData req)
    {
        await GetTable().CreateIfNotExistsAsync();
        var votes = GetTable()
            .QueryAsync<VoteEntity>(e => e.PartitionKey == config.Year)
            .ToBlockingEnumerable()
            .ToList();

        var voteMap = votes.ToDictionary(v => v.JudgeName);
        var totals  = ScoringService.ComputeTotals(votes, config);

        // Current judge: first in config order with RevealStage 1 or 2
        var currentVote = config.Judges
            .Select(j => voteMap.GetValueOrDefault(j))
            .FirstOrDefault(v => v?.RevealStage is 1 or 2);

        // Next judge: first in config order with RevealStage 0, appearing after the current judge
        string? nextJudge = null;
        if (currentVote is not null)
        {
            var afterCurrent = config.Judges
                .SkipWhile(j => j != currentVote.JudgeName)
                .Skip(1);
            nextJudge = afterCurrent
                .FirstOrDefault(j => voteMap.TryGetValue(j, out var v) && v.RevealStage == 0);
        }
        else
        {
            // Between judges or all done — next is first with stage 0
            nextJudge = config.Judges
                .FirstOrDefault(j => voteMap.TryGetValue(j, out var v) && v.RevealStage == 0);
        }

        CurrentJudgeInfo? currentInfo = null;
        if (currentVote is not null)
        {
            var countryMap = config.Countries.ToDictionary(c => c.Code);
            var revealedScores = ScoringService.GetRevealedScores(currentVote)
                .Select(s => new RevealedScore(
                    s.Code,
                    countryMap.TryGetValue(s.Code, out var c) ? c.Name : s.Code,
                    s.Points))
                .ToList();

            currentInfo = new CurrentJudgeInfo
            {
                Name = currentVote.JudgeName,
                RevealStage = currentVote.RevealStage,
                RevealedScores = revealedScores,
            };
        }

        var countries = config.Countries
            .Select(c => new CountryScore
            {
                Code = c.Code,
                Name = c.Name,
                Points = totals.GetValueOrDefault(c.Code),
            })
            .OrderByDescending(c => c.Points)
            .ToList();

        var response = new ScoreboardResponse
        {
            TotalJudges    = config.Judges.Count,
            SubmittedCount = votes.Count,
            RevealStarted  = votes.Any(v => v.RevealStage > 0),
            Countries      = countries,
            CurrentJudge   = currentInfo,
            NextJudge      = nextJudge,
        };

        var res = req.CreateResponse(HttpStatusCode.OK);
        await res.WriteAsJsonAsync(response);
        return res;
    }
}
```

- [ ] **Step 4: Build and smoke test**

```bash
cd api && dotnet build
curl http://localhost:7071/api/scoreboard
```

Expected: JSON with `totalJudges:15`, `submittedCount` matching submitted votes, countries sorted by points.

- [ ] **Step 5: Commit**

```bash
git add api/Functions/ScoreboardFunction.cs api.tests/ScoreboardComputationTests.cs
git commit -m "feat: add GET /api/scoreboard endpoint"
```

---

## Task 9: Admin endpoints

**Files:**
- Create: `api/Functions/AdminFunction.cs`

- [ ] **Step 1: Create `api/Functions/AdminFunction.cs`**

```csharp
using Azure.Data.Tables;
using KlettovisionApi.Models;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using System.Net;

namespace KlettovisionApi.Functions;

public class AdminFunction(TableServiceClient tableService, AppConfig config)
{
    private static readonly string AdminPin =
        Environment.GetEnvironmentVariable("ADMIN_PIN") ?? "";

    private bool IsAuthorized(HttpRequestData req) =>
        req.Headers.TryGetValues("X-Admin-Pin", out var values)
        && values.FirstOrDefault() == AdminPin
        && !string.IsNullOrEmpty(AdminPin);

    private TableClient GetTable() => tableService.GetTableClient("Votes");

    [Function("AdminGetVotes")]
    public async Task<HttpResponseData> GetVotes(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "admin/votes")] HttpRequestData req)
    {
        if (!IsAuthorized(req))
            return req.CreateResponse(HttpStatusCode.Unauthorized);

        await GetTable().CreateIfNotExistsAsync();
        var votes = GetTable()
            .QueryAsync<VoteEntity>(e => e.PartitionKey == config.Year)
            .ToBlockingEnumerable()
            .ToList();

        // Return in config order (only submitted votes; Admin.jsx merges with config for full list)
        var voteMap = votes.ToDictionary(v => v.JudgeName);
        var result = config.Judges
            .Where(j => voteMap.ContainsKey(j))
            .Select(j => new AdminVoteItem(voteMap[j].RowKey, j, voteMap[j].RevealStage))
            .ToList();

        var res = req.CreateResponse(HttpStatusCode.OK);
        await res.WriteAsJsonAsync(result);
        return res;
    }

    [Function("AdminRevealVote")]
    public async Task<HttpResponseData> RevealVote(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "admin/votes/{id}/reveal")] HttpRequestData req,
        string id)
    {
        if (!IsAuthorized(req))
            return req.CreateResponse(HttpStatusCode.Unauthorized);

        await GetTable().CreateIfNotExistsAsync();

        // Find vote by RowKey (PartitionKey is the year)
        var vote = GetTable()
            .QueryAsync<VoteEntity>(e => e.PartitionKey == config.Year && e.RowKey == id)
            .ToBlockingEnumerable()
            .FirstOrDefault();

        if (vote is null)
            return req.CreateResponse(HttpStatusCode.NotFound);

        if (vote.RevealStage >= 3)
            return req.CreateResponse(HttpStatusCode.OK); // idempotent — already done

        vote.RevealStage++;
        await GetTable().UpdateEntityAsync(vote, vote.ETag);

        var res = req.CreateResponse(HttpStatusCode.OK);
        await res.WriteAsJsonAsync(new AdminVoteItem(vote.RowKey, vote.JudgeName, vote.RevealStage));
        return res;
    }
}
```

- [ ] **Step 2: Build**

```bash
cd api && dotnet build
```

Expected: `Build succeeded`.

- [ ] **Step 3: Smoke test admin endpoints**

```bash
# Should return 401 with no pin
curl http://localhost:7071/api/admin/votes

# Should return 401 with wrong pin
curl -H "X-Admin-Pin: wrong" http://localhost:7071/api/admin/votes

# Should return vote list with correct pin (set in local.settings.json as "1234")
curl -H "X-Admin-Pin: 1234" http://localhost:7071/api/admin/votes

# Reveal stage for Anna's vote (replace {id} with Anna's RowKey GUID from above)
curl -X POST -H "X-Admin-Pin: 1234" http://localhost:7071/api/admin/votes/{id}/reveal

# Verify RevealStage incremented
curl -H "X-Admin-Pin: 1234" http://localhost:7071/api/admin/votes
```

- [ ] **Step 4: Commit**

```bash
git add api/Functions/AdminFunction.cs
git commit -m "feat: add admin endpoints (list votes, advance reveal stage)"
```

---

## Task 10: End-to-end local test

A quick sanity check of the full flow before deployment.

- [ ] **Step 1: Start Azurite (separate terminal)**

```bash
azurite
```

- [ ] **Step 2: Start functions (separate terminal)**

```bash
cd api && func start
```

- [ ] **Step 3: Start Vite dev server**

```bash
npm run dev
```

- [ ] **Step 4: Verify full voter flow**

Open `http://localhost:5173` in a mobile-sized browser window.

1. Dropdown shows all 15 judges from config.json
2. Select a judge → "Byrja atkvæðagreiðslu" becomes active
3. Drag countries → points update correctly (#1 = 12 stig)
4. Click "Yfirfara röðun þína" → review screen with warning
5. Click "Staðfesta og senda inn" → thank-you screen with "Takk fyrir, [name]!"
6. Return to `/` in a new tab → judge name no longer appears in dropdown

- [ ] **Step 5: Verify admin flow**

Open `http://localhost:5173/admin`.

1. Click PIN area → numeric keyboard appears
2. Enter wrong PIN → error message "Rangt PIN — reyndu aftur"
3. Enter correct PIN (`1234` from local.settings.json) → reveal control screen
4. Anna's card shows status "tilbúið" (RevealStage 0)
5. Click "Birta 1–8 stig" → stage pill advances, button shows ✓
6. Open `http://localhost:5173/scoreboard` → countries updated with 1–8 points
7. Click "Birta 10 stig" → 10-point country appears on scoreboard
8. Click "Birta 12 stig" → 12-point country appears; Anna marked "✓ kláruð"

- [ ] **Step 6: Verify scoreboard states**

1. Before any submissions → big counter "0/15", pulsing "bíður" pill
2. After reveal starts → two-column layout with live scores
3. After all done → "Lokaúrslit" header, 🏆 in judge panel

- [ ] **Step 7: Run all tests**

```bash
cd api.tests && dotnet test -v normal
```

Expected: All tests pass.

---

## Task 11: Deployment setup

- [ ] **Step 1: Create Azure resources**

In Azure Portal or CLI:

```bash
# Create Resource Group
az group create --name klettovision-rg --location northeurope

# Create Storage Account (for Table Storage)
az storage account create \
  --name klettovision2026 \
  --resource-group klettovision-rg \
  --location northeurope \
  --sku Standard_LRS

# Create Static Web App (link to GitHub repo)
az staticwebapp create \
  --name klettovision \
  --resource-group klettovision-rg \
  --source https://github.com/<your-org>/<your-repo> \
  --branch main \
  --app-location "/" \
  --api-location "api" \
  --output-location "dist" \
  --login-with-github
```

- [ ] **Step 2: Set application settings in Azure**

```bash
# Get storage connection string
CONN=$(az storage account show-connection-string \
  --name klettovision2026 \
  --resource-group klettovision-rg \
  --query connectionString -o tsv)

# Set on the SWA
az staticwebapp appsettings set \
  --name klettovision \
  --resource-group klettovision-rg \
  --setting-names \
    AzureWebJobsStorage="$CONN" \
    ADMIN_PIN="<choose-a-pin>"
```

- [ ] **Step 3: Add GitHub Actions workflow (auto-generated by SWA)**

SWA CLI adds a file at `.github/workflows/azure-static-web-apps-*.yml` automatically. Verify it sets `app_location: "/"`, `api_location: "api"`, `output_location: "dist"`.

- [ ] **Step 4: Push and verify deployment**

```bash
git push origin main
```

Watch GitHub Actions → deployment completes in ~3 minutes. Visit the SWA URL from the Azure Portal.

- [ ] **Step 5: Verify production**

1. `https://<swa-url>/` → voting flow loads
2. `https://<swa-url>/scoreboard` → scoreboard loads
3. `https://<swa-url>/admin` → PIN entry (use the real PIN set above)
4. Submit a test vote and verify it disappears from the available judges list
5. Reveal it in admin and verify the scoreboard updates

---

## Self-Review Notes

**Spec coverage check:**
- ✅ `/api/config` — Task 6
- ✅ `/api/judges/available` — Task 7
- ✅ `POST /api/votes` (validation: judgeName in config, no duplicate, all countries) — Task 7
- ✅ `GET /api/votes/{judgeName}` — Task 7
- ✅ `/api/scoreboard` (all 4 states, currentJudge, nextJudge, sorted countries) — Task 8
- ✅ `/api/admin/votes` (config order, only submitted) — Task 9
- ✅ `/api/admin/votes/{id}/reveal` (advances stage, max 3, idempotent) — Task 9
- ✅ Scoring logic (stages 1/2/3, points ladder) — Task 5
- ✅ Frontend routing (`/`, `/scoreboard`, `/admin`) — Task 1
- ✅ SWA config (SPA fallback, API passthrough) — Task 2
- ✅ config.json (countries + judges, 3-letter codes) — Task 2
- ✅ Admin auth (PIN in X-Admin-Pin header, server-side validation, 401 on failure) — Task 9
- ✅ sessionStorage for PIN — already in Admin.jsx
- ✅ 10-second scoreboard polling — already in Scoreboard.jsx
- ✅ Icelandic UI — all pages use Icelandic text
