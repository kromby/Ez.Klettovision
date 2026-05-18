using Azure.Data.Tables;
using KlettovisionApi.Models;

namespace KlettovisionApi.Services;

public static class SettingsService
{
    private const int DefaultPollIntervalMs = 10_000;

    public static async Task<int> GetPollIntervalAsync(TableServiceClient tableService)
    {
        var table = tableService.GetTableClient("Settings");
        await table.CreateIfNotExistsAsync();
        try
        {
            var entity = await table.GetEntityAsync<SettingEntity>("global", "pollInterval");
            if (int.TryParse(entity.Value.Value, out var ms) && ms >= 1_000)
                return ms;
        }
        catch { }
        return DefaultPollIntervalMs;
    }

    public static async Task SetPollIntervalAsync(TableServiceClient tableService, int ms)
    {
        var table = tableService.GetTableClient("Settings");
        await table.CreateIfNotExistsAsync();
        await table.UpsertEntityAsync(new SettingEntity
        {
            PartitionKey = "global",
            RowKey = "pollInterval",
            Value = ms.ToString(),
        });
    }
}
