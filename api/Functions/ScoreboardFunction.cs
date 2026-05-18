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
        var pollIntervalMs = await SettingsService.GetPollIntervalAsync(tableService);
        var votes = GetTable()
            .QueryAsync<VoteEntity>(e => e.PartitionKey == config.Year)
            .ToBlockingEnumerable()
            .ToList();

        var voteMap = votes.ToDictionary(v => v.JudgeName);
        var totals  = ScoringService.ComputeTotals(votes, config);
        var countryMap = config.Countries.ToDictionary(c => c.Code);

        // Current judge: first in config order with RevealStage 1–3 (actively being revealed)
        var currentVote = config.Judges
            .Select(j => voteMap.GetValueOrDefault(j))
            .FirstOrDefault(v => v?.RevealStage is >= 1 and <= 3);

        // Next judge: first submitted with stage 0 after the current judge
        string? nextJudge = null;
        if (currentVote is not null)
        {
            nextJudge = config.Judges
                .SkipWhile(j => j != currentVote.JudgeName)
                .Skip(1)
                .FirstOrDefault(j => voteMap.TryGetValue(j, out var v) && v.RevealStage == 0);
        }
        else
        {
            nextJudge = config.Judges
                .FirstOrDefault(j => voteMap.TryGetValue(j, out var v) && v.RevealStage == 0);
        }

        CurrentJudgeInfo? BuildJudgeInfo(VoteEntity vote) =>
            new()
            {
                Name = vote.JudgeName,
                RevealStage = vote.RevealStage,
                RevealedScores = ScoringService.GetRevealedScores(vote)
                    .Select(s => new RevealedScore(
                        s.Code,
                        countryMap.TryGetValue(s.Code, out var c) ? c.Name : s.Code,
                        s.Points))
                    .ToList(),
            };

        // Last fully revealed judge (stage 4) — shown in panel between judges
        var lastRevealedVote = config.Judges
            .Select(j => voteMap.GetValueOrDefault(j))
            .LastOrDefault(v => v?.RevealStage >= 4);

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
            TotalJudges        = config.Judges.Count,
            SubmittedCount     = votes.Count,
            RevealStarted      = votes.Any(v => v.RevealStage > 0),
            PollIntervalMs     = pollIntervalMs,
            Countries          = countries,
            CurrentJudge       = currentVote is not null ? BuildJudgeInfo(currentVote) : null,
            LastRevealedJudge  = lastRevealedVote is not null ? BuildJudgeInfo(lastRevealedVote) : null,
            NextJudge          = nextJudge,
        };

        var res = req.CreateResponse(HttpStatusCode.OK);
        await res.WriteAsJsonAsync(response);
        return res;
    }
}
