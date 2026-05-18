using Azure;
using Azure.Data.Tables;

namespace KlettovisionApi.Models;

public class VoteEntity : ITableEntity
{
    public string PartitionKey { get; set; } = "";   // year, e.g. "2026"
    public string RowKey { get; set; } = "";          // GUID
    public string JudgeName { get; set; } = "";
    public string Rankings { get; set; } = "[]";      // JSON array of country codes, index 0 = 1st place
    public int RevealStage { get; set; } = 0;         // 0=not revealed, 1=1–8 pts, 2=+10 pts, 3=all
    public string SubmittedAt { get; set; } = "";
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }
}
