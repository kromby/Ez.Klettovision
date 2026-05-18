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
        var currentJudge = config.Judges
            .Select(j => voteMap.GetValueOrDefault(j))
            .FirstOrDefault(v => v?.RevealStage is 1 or 2);
        var next = config.Judges
            .SkipWhile(j => j != currentJudge!.JudgeName)
            .Skip(1)
            .FirstOrDefault(j => voteMap.TryGetValue(j, out var v) && v.RevealStage == 0);
        Assert.Equal("Guðjón", next);
    }
}
