using System.Text.Json;
using KlettovisionApi.Models;

namespace KlettovisionApi.Services;

public static class ScoringService
{
    // Points by position index (0-based). Indices 9–11 score 0 (not yielded).
    private static readonly int[] PointsLadder = [12, 10, 8, 6, 5, 4, 3, 2, 1];

    /// Returns revealed scores for a single vote based on its RevealStage.
    /// Stage 0: nothing. Stage 1: positions 3–9 (8,6,5,4,3,2,1). Stage 2: +10. Stage 3: +12.
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
