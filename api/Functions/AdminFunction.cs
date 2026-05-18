using Azure.Data.Tables;
using KlettovisionApi.Models;
using KlettovisionApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using System.Net;

namespace KlettovisionApi.Functions;

public class AdminFunction(TableServiceClient tableService, AppConfig config)
{
    private static readonly string AdminPin =
        Environment.GetEnvironmentVariable("ADMIN_PIN") ?? "";

    private bool IsAuthorized(HttpRequestData req) =>
        req.Headers.TryGetValues("X-Admin-Pin", out var values)
        && values.FirstOrDefault() == AdminPin
        && !string.IsNullOrEmpty(AdminPin);

    private TableClient GetTable() => tableService.GetTableClient("Votes");

    [Function("AdminGetVotes")]
    public async Task<HttpResponseData> GetVotes(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "manage/votes")] HttpRequestData req)
    {
        if (!IsAuthorized(req))
            return req.CreateResponse(HttpStatusCode.Unauthorized);

        await GetTable().CreateIfNotExistsAsync();
        var votes = GetTable()
            .QueryAsync<VoteEntity>(e => e.PartitionKey == config.Year)
            .ToBlockingEnumerable()
            .ToList();

        var voteMap = votes.ToDictionary(v => v.JudgeName);
        var result = config.Judges
            .Where(j => voteMap.ContainsKey(j))
            .Select(j => new AdminVoteItem(voteMap[j].RowKey, j, voteMap[j].RevealStage))
            .ToList();

        var res = req.CreateResponse(HttpStatusCode.OK);
        await res.WriteAsJsonAsync(result);
        return res;
    }

    [Function("AdminRevealVote")]
    public async Task<HttpResponseData> RevealVote(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "manage/votes/{id}/reveal")] HttpRequestData req,
        string id)
    {
        if (!IsAuthorized(req))
            return req.CreateResponse(HttpStatusCode.Unauthorized);

        await GetTable().CreateIfNotExistsAsync();

        var vote = GetTable()
            .QueryAsync<VoteEntity>(e => e.PartitionKey == config.Year && e.RowKey == id)
            .ToBlockingEnumerable()
            .FirstOrDefault();

        if (vote is null)
            return req.CreateResponse(HttpStatusCode.NotFound);

        if (vote.RevealStage >= 4)
            return req.CreateResponse(HttpStatusCode.OK); // idempotent — already done

        vote.RevealStage++;
        await GetTable().UpdateEntityAsync(vote, vote.ETag);

        var res = req.CreateResponse(HttpStatusCode.OK);
        await res.WriteAsJsonAsync(new AdminVoteItem(vote.RowKey, vote.JudgeName, vote.RevealStage));
        return res;
    }

    [Function("AdminGetSettings")]
    public async Task<HttpResponseData> GetSettings(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "manage/settings")] HttpRequestData req)
    {
        if (!IsAuthorized(req))
            return req.CreateResponse(HttpStatusCode.Unauthorized);

        var ms = await SettingsService.GetPollIntervalAsync(tableService);
        var res = req.CreateResponse(HttpStatusCode.OK);
        await res.WriteAsJsonAsync(new AdminSettings(ms));
        return res;
    }

    [Function("AdminUpdateSettings")]
    public async Task<HttpResponseData> UpdateSettings(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "manage/settings")] HttpRequestData req)
    {
        if (!IsAuthorized(req))
            return req.CreateResponse(HttpStatusCode.Unauthorized);

        var body = await req.ReadFromJsonAsync<AdminSettings>();
        if (body is null || body.PollIntervalMs < 1_000 || body.PollIntervalMs > 60_000)
            return req.CreateResponse(HttpStatusCode.BadRequest);

        await SettingsService.SetPollIntervalAsync(tableService, body.PollIntervalMs);
        var res = req.CreateResponse(HttpStatusCode.OK);
        await res.WriteAsJsonAsync(new AdminSettings(body.PollIntervalMs));
        return res;
    }
}
