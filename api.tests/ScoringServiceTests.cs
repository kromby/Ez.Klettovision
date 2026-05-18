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
    // Rankings: ISL=1st(12), NOR=2nd(10), SWE=3rd(8), DNK=4th(6), FRO=5th(5),
    //           DEU=6th(4), FRA=7th(3), IRL=8th(2), ENG=9th(1), SCO/WLS/NIR=0

    [Fact]
    public void Stage0_ReturnsNoScores()
    {
        var scores = ScoringService.GetRevealedScores(MakeVote(0)).ToList();
        Assert.Empty(scores);
    }

    [Fact]
    public void Stage1_Returns4ScoresFor1To4Pts()
    {
        var scores = ScoringService.GetRevealedScores(MakeVote(1)).ToList();
        Assert.Equal(4, scores.Count);
        // indices 5–8: DEU=4, FRA=3, IRL=2, ENG=1
        Assert.Contains(scores, s => s.Code == "DEU" && s.Points == 4);
        Assert.Contains(scores, s => s.Code == "FRA" && s.Points == 3);
        Assert.Contains(scores, s => s.Code == "IRL" && s.Points == 2);
        Assert.Contains(scores, s => s.Code == "ENG" && s.Points == 1);
        // 5–12 pts still hidden
        Assert.DoesNotContain(scores, s => s.Code == "ISL");
        Assert.DoesNotContain(scores, s => s.Code == "NOR");
        Assert.DoesNotContain(scores, s => s.Code == "SWE");
        Assert.DoesNotContain(scores, s => s.Code == "FRO");
    }

    [Fact]
    public void Stage2_Adds3ScoresFor5To8Pts()
    {
        var scores = ScoringService.GetRevealedScores(MakeVote(2)).ToList();
        Assert.Equal(7, scores.Count);
        // indices 2–4: SWE=8, DNK=6, FRO=5
        Assert.Contains(scores, s => s.Code == "SWE" && s.Points == 8);
        Assert.Contains(scores, s => s.Code == "DNK" && s.Points == 6);
        Assert.Contains(scores, s => s.Code == "FRO" && s.Points == 5);
        // 1–4 pts still present from stage 1
        Assert.Contains(scores, s => s.Code == "DEU" && s.Points == 4);
        // 10 and 12 still hidden
        Assert.DoesNotContain(scores, s => s.Code == "ISL");
        Assert.DoesNotContain(scores, s => s.Code == "NOR");
    }

    [Fact]
    public void Stage3_Adds10PtsForIndex1()
    {
        var scores = ScoringService.GetRevealedScores(MakeVote(3)).ToList();
        Assert.Equal(8, scores.Count);
        Assert.Contains(scores, s => s.Code == "NOR" && s.Points == 10);
        Assert.DoesNotContain(scores, s => s.Code == "ISL");
    }

    [Fact]
    public void Stage4_Adds12PtsForIndex0()
    {
        var scores = ScoringService.GetRevealedScores(MakeVote(4)).ToList();
        Assert.Equal(9, scores.Count);
        Assert.Contains(scores, s => s.Code == "ISL" && s.Points == 12);
    }

    [Fact]
    public void ComputeTotals_SumsAcrossVotes()
    {
        var votes = new[] { MakeVote(4), MakeVote(4) };
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
