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
