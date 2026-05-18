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
