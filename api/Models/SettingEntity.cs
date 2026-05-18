using Azure;
using Azure.Data.Tables;

namespace KlettovisionApi.Models;

public class SettingEntity : ITableEntity
{
    public string PartitionKey { get; set; } = "global";
    public string RowKey { get; set; } = "";
    public string Value { get; set; } = "";
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }
}
