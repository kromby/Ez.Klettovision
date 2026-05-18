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
